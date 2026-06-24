export type OAuthProviderKey = "google";

type OAuthConfigValue = {
  id: string;
  value: string;
  is_encrypted: boolean;
};

type OAuthConfigEnv = Record<string, string | undefined>;

const oauthConfigIds = {
  google: {
    clientId: "google_oauth_client_id",
    clientSecret: "google_oauth_client_secret",
    envClientId: "GOOGLE_CLIENT_ID",
    envClientSecret: "GOOGLE_CLIENT_SECRET",
  },
} as const;

export function resolveOAuthConfig(
  provider: OAuthProviderKey,
  configs: OAuthConfigValue[],
  env: OAuthConfigEnv = process.env,
) {
  const ids = oauthConfigIds[provider];
  const configMap = new Map(configs.map((config) => [config.id, config.value]));

  return {
    clientId: configMap.get(ids.clientId) || env[ids.envClientId] || "",
    clientSecret: configMap.get(ids.clientSecret) || env[ids.envClientSecret] || "",
  };
}

export async function getOAuthProviderConfig(provider: OAuthProviderKey) {
  const [{ default: prisma }, { decryptText }] = await Promise.all([
    import("@/lib/db/postgres"),
    import("@/utils/encryption"),
  ]);
  const ids = oauthConfigIds[provider];
  const rows = await prisma.system_config.findMany({
    where: {
      id: { in: [ids.clientId, ids.clientSecret] },
      is_active: true,
    },
    select: {
      id: true,
      value: true,
      is_encrypted: true,
    },
  });

  const configs = rows.map((row) => ({
    id: row.id,
    value: row.is_encrypted && row.value ? decryptText(row.value) : row.value,
    is_encrypted: row.is_encrypted,
  }));

  return resolveOAuthConfig(provider, configs);
}

