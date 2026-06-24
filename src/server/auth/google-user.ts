import crypto from "node:crypto";
import type { Account } from "next-auth";
import { SocialProvider } from "@/generated/prisma/enums";
import type { SocialProvider as SocialProviderType } from "@/generated/prisma/enums";
import prisma from "@/lib/db/postgres";
import { cacheRemoteAvatar } from "./avatar-cache";
import { canUseLocalAvatarCache, isLocalCachedAvatarUrl } from "./avatar-url";
import type { NormalizedProfile, OAuthProfile } from "./oauth-profile";
import { normalizeOAuthProfile } from "./oauth-profile";
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
  profile: OAuthProfile;
  provider: SocialProviderType;
};

const authUserSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  avatarUrl: true,
} as const;

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

async function findUserBySocialAccount(provider: SocialProviderType, providerAccountId: string) {
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

async function createUser(input: NormalizedProfile) {
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

async function touchUser(userId: string, input: NormalizedProfile) {
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
  if (user.avatarUrl && (!isLocalCachedAvatarUrl(user.avatarUrl) || canUseLocalAvatarCache())) {
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
  const normalizedProfile = normalizeOAuthProfile(input.provider, input.profile);
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

export async function findOrCreateGitHubUser(input: Omit<OAuthAccountInput, "provider">) {
  return findOrCreateOAuthUser({ ...input, provider: SocialProvider.GITHUB });
}

