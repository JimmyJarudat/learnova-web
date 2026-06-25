import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { encryptText } from "../../src/utils/encryption";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type AuthConfigInput = {
  id: string;
  envName: string;
  description: string;
  category: "AUTH" | "OAUTH";
  displayName: string;
  isEncrypted: boolean;
};

const authConfigs: AuthConfigInput[] = [
  {
    id: "auth_url",
    envName: "AUTH_URL",
    description: "Application auth base URL",
    category: "AUTH",
    displayName: "Auth URL",
    isEncrypted: false,
  },
  {
    id: "auth_secret",
    envName: "AUTH_SECRET",
    description: "NextAuth secret",
    category: "AUTH",
    displayName: "Auth Secret",
    isEncrypted: true,
  },
  {
    id: "google_oauth_client_id",
    envName: "GOOGLE_CLIENT_ID",
    description: "Google OAuth client ID",
    category: "OAUTH",
    displayName: "Google Client ID",
    isEncrypted: false,
  },
  {
    id: "google_oauth_client_secret",
    envName: "GOOGLE_CLIENT_SECRET",
    description: "Google OAuth client secret",
    category: "OAUTH",
    displayName: "Google Client Secret",
    isEncrypted: true,
  },
  {
    id: "line_oauth_client_id",
    envName: "LINE_CLIENT_ID",
    description: "LINE OAuth client ID",
    category: "OAUTH",
    displayName: "LINE Client ID",
    isEncrypted: false,
  },
  {
    id: "line_oauth_client_secret",
    envName: "LINE_CLIENT_SECRET",
    description: "LINE OAuth client secret",
    category: "OAUTH",
    displayName: "LINE Client Secret",
    isEncrypted: true,
  },
  {
    id: "github_oauth_client_id",
    envName: "GITHUB_CLIENT_ID",
    description: "GitHub OAuth client ID",
    category: "OAUTH",
    displayName: "GitHub Client ID",
    isEncrypted: false,
  },
  {
    id: "github_oauth_client_secret",
    envName: "GITHUB_CLIENT_SECRET",
    description: "GitHub OAuth client secret",
    category: "OAUTH",
    displayName: "GitHub Client Secret",
    isEncrypted: true,
  },
  {
    id: "facebook_oauth_client_id",
    envName: "FACEBOOK_CLIENT_ID",
    description: "Facebook OAuth client ID",
    category: "OAUTH",
    displayName: "Facebook Client ID",
    isEncrypted: false,
  },
  {
    id: "facebook_oauth_client_secret",
    envName: "FACEBOOK_CLIENT_SECRET",
    description: "Facebook OAuth client secret",
    category: "OAUTH",
    displayName: "Facebook Client Secret",
    isEncrypted: true,
  },
];

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function main() {
  requireEnv("DATABASE_URL");
  requireEnv("ENCRYPTION_SECRET");

  const missing = authConfigs
    .filter((config) => !process.env[config.envName])
    .map((config) => config.envName);

  if (missing.length > 0) {
    throw new Error(`Missing env values: ${missing.join(", ")}`);
  }

  for (const config of authConfigs) {
    const rawValue = requireEnv(config.envName);
    const value = config.isEncrypted ? encryptText(rawValue) : rawValue;

    await prisma.system_config.upsert({
      where: { id: config.id },
      create: {
        id: config.id,
        value,
        description: config.description,
        category: config.category,
        data_type: "STRING",
        is_active: true,
        is_encrypted: config.isEncrypted,
        display_name: config.displayName,
      },
      update: {
        value,
        description: config.description,
        category: config.category,
        data_type: "STRING",
        is_active: true,
        is_encrypted: config.isEncrypted,
        display_name: config.displayName,
        updated_at: new Date(),
      },
    });
  }

  console.log(`Synced auth config: ${authConfigs.length} updated, ${authConfigs.filter((config) => config.isEncrypted).length} encrypted`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
