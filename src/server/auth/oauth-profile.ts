import type { Profile } from "next-auth";
import type { GithubProfile } from "next-auth/providers/github";
import type { GoogleProfile } from "next-auth/providers/google";
import type { LineProfile } from "next-auth/providers/line";
import { SocialProvider } from "@/generated/prisma/enums";
import type { SocialProvider as SocialProviderType } from "@/generated/prisma/enums";

export type OAuthProfile = Profile | GoogleProfile | LineProfile | GithubProfile;

export type NormalizedProfile = {
  email: string;
  providerAccountId: string;
  providerEmail: string | null;
  displayName: string;
  remoteAvatarUrl: string | null;
  emailVerifiedAt: Date | null;
};

function normalizeGoogleProfile(profile: OAuthProfile): NormalizedProfile {
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

function normalizeLineProfile(profile: OAuthProfile): NormalizedProfile {
  const lineProfile = profile as LineProfile & { email?: string };
  const providerAccountId = lineProfile.sub;
  const providerEmail = lineProfile.email?.toLowerCase() ?? null;

  if (!providerAccountId) {
    throw new Error("LINE profile did not include a subject identifier.");
  }

  return {
    email: providerEmail ?? `${providerAccountId}@line.learnova.local`,
    providerAccountId,
    providerEmail,
    displayName: lineProfile.name ?? "LINE User",
    remoteAvatarUrl: lineProfile.picture ?? null,
    emailVerifiedAt: providerEmail ? new Date() : null,
  };
}

function normalizeGitHubProfile(profile: OAuthProfile): NormalizedProfile {
  const githubProfile = profile as GithubProfile;
  const providerAccountId = githubProfile.id ? String(githubProfile.id) : null;
  const providerEmail = githubProfile.email?.toLowerCase() ?? null;

  if (!providerAccountId) {
    throw new Error("GitHub profile did not include a user identifier.");
  }

  return {
    email: providerEmail ?? `${providerAccountId}@github.learnova.local`,
    providerAccountId,
    providerEmail,
    displayName: githubProfile.name ?? githubProfile.login ?? "GitHub User",
    remoteAvatarUrl: githubProfile.avatar_url ?? null,
    emailVerifiedAt: providerEmail ? new Date() : null,
  };
}

export function normalizeOAuthProfile(provider: SocialProviderType, profile: OAuthProfile): NormalizedProfile {
  if (provider === SocialProvider.GOOGLE) {
    return normalizeGoogleProfile(profile);
  }

  if (provider === SocialProvider.LINE) {
    return normalizeLineProfile(profile);
  }

  if (provider === SocialProvider.GITHUB) {
    return normalizeGitHubProfile(profile);
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}
