import { describe, expect, test } from "bun:test";
import { resolveOAuthConfig } from "@/lib/auth/oauth-config";

describe("resolveOAuthConfig", () => {
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

  test("falls back to Google OAuth env values when system config is empty", () => {
    const config = resolveOAuthConfig("google", [], {
      GOOGLE_CLIENT_ID: "env-client-id",
      GOOGLE_CLIENT_SECRET: "env-client-secret",
    });

    expect(config.clientId).toBe("env-client-id");
    expect(config.clientSecret).toBe("env-client-secret");
  });
});

