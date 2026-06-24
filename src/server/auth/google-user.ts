import crypto from "node:crypto";
import type { Account, Profile } from "next-auth";
import type { GoogleProfile } from "next-auth/providers/google";
import { SocialProvider } from "@/generated/prisma/enums";
import prisma from "@/lib/db/postgres";
import { cacheRemoteAvatar } from "./avatar-cache";

type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type GoogleAccountInput = {
  account: Account;
  profile: Profile | GoogleProfile;
};

const authUserSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  avatarUrl: true,
} as const;

function getGoogleProfile(profile: Profile | GoogleProfile) {
  const googleProfile = profile as GoogleProfile;
  const email = googleProfile.email?.toLowerCase();
  const providerAccountId = googleProfile.sub;

  if (!email) {
    throw new Error("Google profile did not include an email address.");
  }

  if (!providerAccountId) {
    throw new Error("Google profile did not include a subject identifier.");
  }

  return {
    email,
    providerAccountId,
    displayName: googleProfile.name ?? email,
    remoteAvatarUrl: googleProfile.picture ?? null,
    emailVerifiedAt: googleProfile.email_verified ? new Date() : null,
  };
}

function baseUsernameFromEmail(email: string) {
  const [localPart] = email.split("@");
  const username = localPart
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return username || "user";
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

async function findUserBySocialAccount(providerAccountId: string) {
  const socialAccount = await prisma.socialAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: SocialProvider.GOOGLE,
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

async function upsertGoogleSocialAccount(userId: string, input: GoogleAccountInput) {
  const googleProfile = getGoogleProfile(input.profile);
  const expiresAt = input.account.expires_at ? new Date(input.account.expires_at * 1000) : null;

  await prisma.socialAccount.upsert({
    where: {
      userId_provider: {
        userId,
        provider: SocialProvider.GOOGLE,
      },
    },
    create: {
      userId,
      provider: SocialProvider.GOOGLE,
      providerAccountId: googleProfile.providerAccountId,
      providerEmail: googleProfile.email,
      accessToken: input.account.access_token ?? null,
      refreshToken: input.account.refresh_token ?? null,
      expiresAt,
      tokenType: input.account.token_type ?? null,
      scope: input.account.scope ?? null,
      idToken: input.account.id_token ?? null,
    },
    update: {
      providerAccountId: googleProfile.providerAccountId,
      providerEmail: googleProfile.email,
      accessToken: input.account.access_token ?? null,
      refreshToken: input.account.refresh_token ?? undefined,
      expiresAt,
      tokenType: input.account.token_type ?? null,
      scope: input.account.scope ?? null,
      idToken: input.account.id_token ?? null,
    },
  });
}

export async function findOrCreateGoogleUser(input: GoogleAccountInput): Promise<AuthUser> {
  const googleProfile = getGoogleProfile(input.profile);
  const socialUser = await findUserBySocialAccount(googleProfile.providerAccountId);

  if (socialUser) {
    const user = await touchUser(socialUser.id, googleProfile);
    const userWithAvatar = await cacheUserAvatar(user, googleProfile.remoteAvatarUrl);
    await upsertGoogleSocialAccount(userWithAvatar.id, input);
    return userWithAvatar;
  }

  const existingUser = await findUserByEmail(googleProfile.email);
  const user = existingUser
    ? await touchUser(existingUser.id, googleProfile)
    : await createUser(googleProfile);

  const userWithAvatar = await cacheUserAvatar(user, googleProfile.remoteAvatarUrl);
  await upsertGoogleSocialAccount(userWithAvatar.id, input);
  return userWithAvatar;
}
