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

  test("normalizes a Facebook profile with email", () => {
    const facebookProfile = {
      id: "fb_12345",
      name: "Facebook Learner",
      email: "LEARNER@EXAMPLE.COM",
      picture: {
        data: {
          url: "https://graph.facebook.com/fb_12345/picture",
        },
      },
    } as unknown as OAuthProfile;

    const profile = normalizeOAuthProfile(SocialProvider.FACEBOOK, facebookProfile);

    expect(profile.providerAccountId).toBe("fb_12345");
    expect(profile.email).toBe("learner@example.com");
    expect(profile.providerEmail).toBe("learner@example.com");
    expect(profile.displayName).toBe("Facebook Learner");
    expect(profile.remoteAvatarUrl).toBe("https://graph.facebook.com/fb_12345/picture");
  });

  test("uses a synthetic Facebook email when profile email is missing", () => {
    const facebookProfile = {
      id: "fb_private",
      name: null,
      email: null,
      picture: {
        data: {
          url: "https://graph.facebook.com/fb_private/picture",
        },
      },
    } as unknown as OAuthProfile;

    const profile = normalizeOAuthProfile(SocialProvider.FACEBOOK, facebookProfile);

    expect(profile.email).toBe("fb_private@facebook.learnova.local");
    expect(profile.providerEmail).toBe(null);
    expect(profile.displayName).toBe("Facebook User");
  });
});


