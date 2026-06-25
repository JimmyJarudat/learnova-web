export type OAuthProviderKey = "facebook" | "github" | "google" | "line";

type SystemConfigValue = {
  id: string;
  value: string;
  is_encrypted: boolean;
};

type AuthConfigEnv = Record<string, string | undefined>;

type OAuthProviderIds = {
  clientId: string;
  clientSecret: string;
  envClientId: string;
  envClientSecret: string;
};

type DecryptConfigValue = (value: string) => string;

const oauthConfigIds: Record<OAuthProviderKey, OAuthProviderIds> = {
  facebook: {
    clientId: "facebook_oauth_client_id",
    clientSecret: "facebook_oauth_client_secret",
    envClientId: "FACEBOOK_CLIENT_ID",
    envClientSecret: "FACEBOOK_CLIENT_SECRET",
  },
  github: {
    clientId: "github_oauth_client_id",
    clientSecret: "github_oauth_client_secret",
    envClientId: "GITHUB_CLIENT_ID",
    envClientSecret: "GITHUB_CLIENT_SECRET",
  },
  google: {
    clientId: "google_oauth_client_id",
    clientSecret: "google_oauth_client_secret",
    envClientId: "GOOGLE_CLIENT_ID",
    envClientSecret: "GOOGLE_CLIENT_SECRET",
  },
  line: {
    clientId: "line_oauth_client_id",
    clientSecret: "line_oauth_client_secret",
    envClientId: "LINE_CLIENT_ID",
    envClientSecret: "LINE_CLIENT_SECRET",
  },
};

const authConfigIds = {
  authUrl: "auth_url",
  authSecret: "auth_secret",
} as const;

const oauthProviders = Object.keys(oauthConfigIds) as OAuthProviderKey[];

function configMapFrom(configs: SystemConfigValue[]) {
  return new Map(configs.map((config) => [config.id, config.value]));
}

export function resolveOAuthConfig(
  provider: OAuthProviderKey,
  configs: SystemConfigValue[],
  env: AuthConfigEnv = process.env,
) {
  const ids = oauthConfigIds[provider];
  const configMap = configMapFrom(configs);

  return {
    clientId: configMap.get(ids.clientId) || env[ids.envClientId] || "",
    clientSecret: configMap.get(ids.clientSecret) || env[ids.envClientSecret] || "",
  };
}

export function resolveAuthRuntimeConfig(configs: SystemConfigValue[], env: AuthConfigEnv = process.env) {
  const configMap = configMapFrom(configs);

  return {
    authUrl: configMap.get(authConfigIds.authUrl) || env.AUTH_URL || env.NEXTAUTH_URL || "",
    authSecret: configMap.get(authConfigIds.authSecret) || env.AUTH_SECRET || env.NEXTAUTH_SECRET || env.ENCRYPTION_SECRET || "",
    providers: {
      facebook: resolveOAuthConfig("facebook", configs, env),
      github: resolveOAuthConfig("github", configs, env),
      google: resolveOAuthConfig("google", configs, env),
      line: resolveOAuthConfig("line", configs, env),
    },
  };
}

export function getAuthConfigIds() {
  return [
    authConfigIds.authUrl,
    authConfigIds.authSecret,
    ...oauthProviders.flatMap((provider) => {
      const ids = oauthConfigIds[provider];

      return [ids.clientId, ids.clientSecret];
    }),
  ];
}

export function normalizeSystemConfigRows(rows: SystemConfigValue[], decryptValue: DecryptConfigValue) {
  return rows.flatMap((row) => {
    if (!row.is_encrypted || !row.value) {
      return [row];
    }

    try {
      return [{ ...row, value: decryptValue(row.value) }];
    } catch (error) {
      console.error(`[auth-config] Cannot decrypt ${row.id}. Falling back to env value.`, error);
      return [];
    }
  });
}

export async function getAuthRuntimeConfig() {
  try {
    const [{ default: prisma }, { decryptText }] = await Promise.all([
      import("@/lib/db/postgres"),
      import("@/utils/encryption"),
    ]);
    const rows = await prisma.system_config.findMany({
      where: {
        id: { in: getAuthConfigIds() },
        is_active: true,
      },
      select: {
        id: true,
        value: true,
        is_encrypted: true,
      },
    });

    return resolveAuthRuntimeConfig(normalizeSystemConfigRows(rows, decryptText));
  } catch (error) {
    console.error("[auth-config] Cannot load auth config from database. Falling back to env values.", error);
    return resolveAuthRuntimeConfig([]);
  }
}

