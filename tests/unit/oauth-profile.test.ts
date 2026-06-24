import { describe, expect, test } from "bun:test";
import { SocialProvider } from "@/generated/prisma/enums";
import { normalizeOAuthProfile } from "@/server/auth/oauth-profile";
import type { OAuthProfile } from "@/server/auth/oauth-profile";

describe("normalizeOAuthProfile", () => {
  test("normalizes a GitHub profile with public email", () => {
    const githubProfile = {
      id: 12345,
      login: "learnova-dev",
      name: "Learnova Dev",
      email: "DEV@EXAMPLE.COM",
      avatar_url: "https://avatars.githubusercontent.com/u/12345",
    } as unknown as OAuthProfile;

    const profile = normalizeOAuthProfile(SocialProvider.GITHUB, githubProfile);

    expect(profile.providerAccountId).toBe("12345");
    expect(profile.email).toBe("dev@example.com");
    expect(profile.providerEmail).toBe("dev@example.com");
    expect(profile.displayName).toBe("Learnova Dev");
    expect(profile.remoteAvatarUrl).toBe("https://avatars.githubusercontent.com/u/12345");
  });

  test("uses a synthetic GitHub email when profile email is private", () => {
    const githubProfile = {
      id: 67890,
      login: "private-user",
      name: null,
      email: null,
      avatar_url: null,
    } as unknown as OAuthProfile;

    const profile = normalizeOAuthProfile(SocialProvider.GITHUB, githubProfile);

    expect(profile.email).toBe("67890@github.learnova.local");
    expect(profile.providerEmail).toBe(null);
    expect(profile.displayName).toBe("private-user");
  });
});

