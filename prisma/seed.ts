import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/server/auth/password";
import { encryptText } from "../src/utils/encryption";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SystemConfigSeed = {
  id: string;
  value: string;
  description: string;
  data_type?: "BOOLEAN" | "NUMBER" | "STRING";
  is_encrypted?: boolean;
  display_name?: string;
  category?: "GENERAL" | "SMTP" | "REGIONAL" | "OAUTH";
};

const regionalConfigs: SystemConfigSeed[] = [
  {
    id: "date_format",
    value: "DD/MM/YYYY",
    description: "System date display format",
    category: "REGIONAL",
    display_name: "Date Format",
  },
  {
    id: "time_format",
    value: "24h",
    description: "System time display format (24h or 12h)",
    category: "REGIONAL",
    display_name: "Time Format",
  },
  {
    id: "timezone",
    value: "Asia/Bangkok",
    description: "System timezone",
    category: "REGIONAL",
    display_name: "Timezone",
  },
  {
    id: "year_era",
    value: "BE",
    description: "Year era: CE (Christian/ค.ศ.) or BE (Buddhist/พ.ศ.)",
    category: "REGIONAL",
    display_name: "Year Era",
  },
];
const smtpConfigs: SystemConfigSeed[] = [
  {
    id: "smtp_enabled",
    value: "true",
    description: "Enable SMTP email sending",
    data_type: "BOOLEAN",
    display_name: "SMTP Enabled",
  },
  {
    id: "smtp_encryption",
    value: "starttls",
    description: "SMTP encryption mode",
    display_name: "SMTP Encryption",
  },
  {
    id: "smtp_from_email",
    value: "noreply@jarudat.com",
    description: "SMTP sender email address",
    display_name: "SMTP From Email",
  },
  {
    id: "smtp_from_name",
    value: "Learnova",
    description: "SMTP sender display name",
    display_name: "SMTP From Name",
  },
  {
    id: "smtp_host",
    value: "smtp.gmail.com",
    description: "SMTP host",
    display_name: "SMTP Host",
  },
  {
    id: "smtp_password",
    value: "",
    description: "SMTP password",
    is_encrypted: true,
    display_name: "SMTP Password",
  },
  {
    id: "smtp_port",
    value: "587",
    description: "SMTP port",
    data_type: "NUMBER",
    display_name: "SMTP Port",
  },
  {
    id: "smtp_require_tls",
    value: "true",
    description: "Require TLS for SMTP connection",
    data_type: "BOOLEAN",
    display_name: "SMTP Require TLS",
  },
  {
    id: "smtp_secure",
    value: "false",
    description: "Use secure SMTP connection",
    data_type: "BOOLEAN",
    display_name: "SMTP Secure",
  },
  {
    id: "smtp_user",
    value: "jarudat.jc@gmail.com",
    description: "SMTP username",
    display_name: "SMTP User",
  },
];

const oauthConfigs: SystemConfigSeed[] = [
  {
    id: "google_oauth_client_id",
    value: "",
    description: "Google OAuth client ID",
    category: "OAUTH",
    display_name: "Google Client ID",
  },
  {
    id: "google_oauth_client_secret",
    value: "",
    description: "Google OAuth client secret",
    category: "OAUTH",
    is_encrypted: true,
    display_name: "Google Client Secret",
  },
];
function encryptConfigValue(value: string) {
  if (!value) {
    return "";
  }

  return encryptText(value);
}

async function seedTestUser() {
  const passwordHash = await hashPassword("12345678");

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    create: {
      username: "testuser",
      email: "test@example.com",
      displayName: "Test User",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
    update: {
      username: "testuser",
      displayName: "Test User",
      passwordHash,
      deletedAt: null,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  console.log(`Seeded test user: ${user.email} (${user.username})`);
}

async function seedSystemConfigs(configs: SystemConfigSeed[], fallbackCategory: "SMTP" | "REGIONAL" | "OAUTH") {
  let createdCount = 0;
  let skippedCount = 0;

  for (const config of configs) {
    const existingConfig = await prisma.system_config.findUnique({
      where: { id: config.id },
      select: { id: true },
    });

    if (existingConfig) {
      skippedCount += 1;
      continue;
    }

    const value = config.is_encrypted ? encryptConfigValue(config.value) : config.value;

    await prisma.system_config.create({
      data: {
        id: config.id,
        value,
        description: config.description,
        category: config.category ?? fallbackCategory,
        data_type: config.data_type ?? "STRING",
        is_active: true,
        is_encrypted: config.is_encrypted ?? false,
        display_name: config.display_name ?? config.id,
      },
    });

    createdCount += 1;
  }

  console.log(`Seeded ${fallbackCategory} config: ${createdCount} created, ${skippedCount} skipped`);
}

async function main() {
  await seedTestUser();
  await seedSystemConfigs(regionalConfigs, "REGIONAL");
  await seedSystemConfigs(smtpConfigs, "SMTP");
  await seedSystemConfigs(oauthConfigs, "OAUTH");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

