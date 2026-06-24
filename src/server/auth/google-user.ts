import crypto from "node:crypto";
import type { Account, Profile } from "next-auth";
import type { GoogleProfile } from "next-auth/providers/google";
import type { LineProfile } from "next-auth/providers/line";
import { SocialProvider } from "@/generated/prisma/enums";
import type { SocialProvider as SocialProviderType } from "@/generated/prisma/enums";
import prisma from "@/lib/db/postgres";
import { cacheRemoteAvatar } from "./avatar-cache";
import { baseUsernameFromEmail } from "./username";

type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type OAuthAccountInput = {
  account: Account;
  profile: Profile | GoogleProfile | LineProfile;
  provider: SocialProviderType;
};

type NormalizedProfile = {
  email: string;
  providerAccountId: string;
  providerEmail: string | null;
  displayName: string;
  remoteAvatarUrl: string | null;
  emailVerifiedAt: Date | null;
};

const authUserSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  avatarUrl: true,
} as const;

function normalizeGoogleProfile(profile: Profile | GoogleProfile): NormalizedProfile {
  const googleProfile = profile as GoogleProfile;
  const providerAccountId = googleProfile.sub;
  const email = googleProfile.email?.toLowerCase();

  if (!providerAccountId) {
    throw new Error("Google profile did not include a subject identifier.");
  }

  if (!email) {
    throw new Error("Google profile did not include an email address.");
  }

  return {
    email,
    providerAccountId,
    providerEmail: email,
    displayName: googleProfile.name ?? email,
    remoteAvatarUrl: googleProfile.picture ?? null,
    emailVerifiedAt: googleProfile.email_verified ? new Date() : null,
  };
}

function normalizeLineProfile(profile: Profile | LineProfile): NormalizedProfile {
  const lineProfile = profile as LineProfile & { email?: string };
  const providerAccountId = lineProfile.sub;
  const providerEmail = lineProfile.email?.toLowerCase() ?? null;
  const email = providerEmail ?? `${providerAccountId}@line.learnova.local`;

  if (!providerAccountId) {
    throw new Error("LINE profile did not include a subject identifier.");
  }

  return {
    email,
    providerAccountId,
    providerEmail,
    displayName: lineProfile.name ?? "LINE User",
    remoteAvatarUrl: lineProfile.picture ?? null,
    emailVerifiedAt: providerEmail ? new Date() : null,
  };
}

function normalizeProfile(input: OAuthAccountInput) {
  if (input.provider === SocialProvider.GOOGLE) {
    return normalizeGoogleProfile(input.profile);
  }

  return normalizeLineProfile(input.profile);
}


async function createAvailableUsername(email: string) {
  const baseUsername = baseUsernameFromEmail(email).slice(0, 24);
  let username = baseUsername;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existing) {
      return username;
    }

    username = `${baseUsername}_${crypto.randomInt(1000, 9999)}`;
  }

  return `${baseUsername}_${crypto.randomUUID().slice(0, 8)}`;
}

async function findUserBySocialAccount(provider: SocialProvider, providerAccountId: string) {
  const socialAccount = await prisma.socialAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    select: {
      user: {
        select: {
          ...authUserSelect,
          deletedAt: true,
        },
      },
    },
  });

  if (!socialAccount?.user || socialAccount.user.deletedAt) {
    return null;
  }

  return socialAccount.user;
}

async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    select: authUserSelect,
  });
}

async function createUser(input: {
  email: string;
  displayName: string;
  emailVerifiedAt: Date | null;
}) {
  return prisma.user.create({
    data: {
      username: await createAvailableUsername(input.email),
      email: input.email,
      displayName: input.displayName,
      avatarUrl: null,
      emailVerifiedAt: input.emailVerifiedAt,
      lastLoginAt: new Date(),
    },
    select: authUserSelect,
  });
}

async function touchUser(userId: string, input: { displayName: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      displayName: input.displayName,
      lastLoginAt: new Date(),
    },
    select: authUserSelect,
  });
}

async function cacheUserAvatar(user: AuthUser, remoteAvatarUrl: string | null) {
  if (user.avatarUrl?.startsWith("/uploads/avatars/")) {
    return user;
  }

  const cachedAvatarUrl = await cacheRemoteAvatar(user.id, remoteAvatarUrl);

  if (!cachedAvatarUrl) {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: cachedAvatarUrl },
    select: authUserSelect,
  });
}

async function upsertSocialAccount(userId: string, input: OAuthAccountInput, normalizedProfile: NormalizedProfile) {
  const expiresAt = input.account.expires_at ? new Date(input.account.expires_at * 1000) : null;

  await prisma.socialAccount.upsert({
    where: {
      userId_provider: {
        userId,
        provider: input.provider,
      },
    },
    create: {
      userId,
      provider: input.provider,
      providerAccountId: normalizedProfile.providerAccountId,
      providerEmail: normalizedProfile.providerEmail,
      accessToken: input.account.access_token ?? null,
      refreshToken: input.account.refresh_token ?? null,
      expiresAt,
      tokenType: input.account.token_type ?? null,
      scope: input.account.scope ?? null,
      idToken: input.account.id_token ?? null,
    },
    update: {
      providerAccountId: normalizedProfile.providerAccountId,
      providerEmail: normalizedProfile.providerEmail,
      accessToken: input.account.access_token ?? null,
      refreshToken: input.account.refresh_token ?? undefined,
      expiresAt,
      tokenType: input.account.token_type ?? null,
      scope: input.account.scope ?? null,
      idToken: input.account.id_token ?? null,
    },
  });
}

async function findOrCreateOAuthUser(input: OAuthAccountInput): Promise<AuthUser> {
  const normalizedProfile = normalizeProfile(input);
  const socialUser = await findUserBySocialAccount(input.provider, normalizedProfile.providerAccountId);

  if (socialUser) {
    const user = await touchUser(socialUser.id, normalizedProfile);
    const userWithAvatar = await cacheUserAvatar(user, normalizedProfile.remoteAvatarUrl);
    await upsertSocialAccount(userWithAvatar.id, input, normalizedProfile);
    return userWithAvatar;
  }

  const existingUser = await findUserByEmail(normalizedProfile.email);
  const user = existingUser
    ? await touchUser(existingUser.id, normalizedProfile)
    : await createUser(normalizedProfile);

  const userWithAvatar = await cacheUserAvatar(user, normalizedProfile.remoteAvatarUrl);
  await upsertSocialAccount(userWithAvatar.id, input, normalizedProfile);
  return userWithAvatar;
}

export async function findOrCreateGoogleUser(input: Omit<OAuthAccountInput, "provider">) {
  return findOrCreateOAuthUser({ ...input, provider: SocialProvider.GOOGLE });
}

export async function findOrCreateLineUser(input: Omit<OAuthAccountInput, "provider">) {
  return findOrCreateOAuthUser({ ...input, provider: SocialProvider.LINE });
}

