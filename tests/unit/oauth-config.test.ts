import { describe, expect, spyOn, test } from "bun:test";
import { getAuthConfigIds, normalizeSystemConfigRows, resolveAuthRuntimeConfig, resolveOAuthConfig } from "@/lib/auth/oauth-config";

describe("auth runtime config", () => {
  test("uses Google OAuth config from system config before env", () => {
    const config = resolveOAuthConfig(
      "google",
      [
        { id: "google_oauth_client_id", value: "db-client-id", is_encrypted: false },
        { id: "google_oauth_client_secret", value: "db-client-secret", is_encrypted: true },
      ],
      {
        GOOGLE_CLIENT_ID: "env-client-id",
        GOOGLE_CLIENT_SECRET: "env-client-secret",
      },
    );

    expect(config.clientId).toBe("db-client-id");
    expect(config.clientSecret).toBe("db-client-secret");
  });

  test("falls back to OAuth env values when system config is empty", () => {
    const config = resolveOAuthConfig("line", [], {
      LINE_CLIENT_ID: "env-client-id",
      LINE_CLIENT_SECRET: "env-client-secret",
    });

    expect(config.clientId).toBe("env-client-id");
    expect(config.clientSecret).toBe("env-client-secret");
  });

  test("resolves Auth and all OAuth providers from system config", () => {
    const config = resolveAuthRuntimeConfig(
      [
        { id: "auth_url", value: "https://db.example.com", is_encrypted: false },
        { id: "auth_secret", value: "db-auth-secret", is_encrypted: true },
        { id: "facebook_oauth_client_id", value: "fb-id", is_encrypted: false },
        { id: "facebook_oauth_client_secret", value: "fb-secret", is_encrypted: true },
        { id: "github_oauth_client_id", value: "gh-id", is_encrypted: false },
        { id: "github_oauth_client_secret", value: "gh-secret", is_encrypted: true },
        { id: "google_oauth_client_id", value: "google-id", is_encrypted: false },
        { id: "google_oauth_client_secret", value: "google-secret", is_encrypted: true },
        { id: "line_oauth_client_id", value: "line-id", is_encrypted: false },
        { id: "line_oauth_client_secret", value: "line-secret", is_encrypted: true },
      ],
      {},
    );

    expect(config.authUrl).toBe("https://db.example.com");
    expect(config.authSecret).toBe("db-auth-secret");
    expect(config.providers.facebook.clientId).toBe("fb-id");
    expect(config.providers.github.clientSecret).toBe("gh-secret");
    expect(config.providers.google.clientId).toBe("google-id");
    expect(config.providers.line.clientSecret).toBe("line-secret");
  });

  test("skips encrypted config values that cannot be decrypted", () => {
    const consoleError = spyOn(console, "error").mockImplementation(() => {});

    try {
      const rows = normalizeSystemConfigRows(
        [
          { id: "auth_secret", value: "broken-encrypted-value", is_encrypted: true },
          { id: "auth_url", value: "https://db.example.com", is_encrypted: false },
        ],
        () => {
          throw new Error("bad decrypt");
        },
      );

      const config = resolveAuthRuntimeConfig(rows, {
        AUTH_SECRET: "env-auth-secret",
      });

      expect(config.authUrl).toBe("https://db.example.com");
      expect(config.authSecret).toBe("env-auth-secret");
      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  test("lists all auth config ids needed from system_config", () => {
    expect(getAuthConfigIds().sort()).toEqual([
      "auth_secret",
      "auth_url",
      "encryption_secret_fingerprint",
      "facebook_oauth_client_id",
      "facebook_oauth_client_secret",
      "github_oauth_client_id",
      "github_oauth_client_secret",
      "google_oauth_client_id",
      "google_oauth_client_secret",
      "line_oauth_client_id",
      "line_oauth_client_secret",
    ]);
  });
});
