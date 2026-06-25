import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { encryptText } from "../../src/utils/encryption";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SmtpConfigInput = {
  id: string;
  envName: string;
  description: string;
  displayName: string;
  dataType: "STRING" | "NUMBER";
  isEncrypted: boolean;
};

const smtpConfigs: SmtpConfigInput[] = [
  {
    id: "smtp_host",
    envName: "SMTP_HOST",
    description: "SMTP host",
    displayName: "SMTP Host",
    dataType: "STRING",
    isEncrypted: false,
  },
  {
    id: "smtp_port",
    envName: "SMTP_PORT",
    description: "SMTP port",
    displayName: "SMTP Port",
    dataType: "NUMBER",
    isEncrypted: false,
  },
  {
    id: "smtp_user",
    envName: "SMTP_USER",
    description: "SMTP username",
    displayName: "SMTP User",
    dataType: "STRING",
    isEncrypted: false,
  },
  {
    id: "smtp_password",
    envName: "SMTP_PASSWORD",
    description: "SMTP password",
    displayName: "SMTP Password",
    dataType: "STRING",
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

  const missing = smtpConfigs
    .filter((config) => !process.env[config.envName])
    .map((config) => config.envName);

  if (missing.length > 0) {
    throw new Error(`Missing env values: ${missing.join(", ")}`);
  }

  for (const config of smtpConfigs) {
    const rawValue = requireEnv(config.envName);
    const value = config.isEncrypted ? encryptText(rawValue) : rawValue;

    await prisma.system_config.upsert({
      where: { id: config.id },
      create: {
        id: config.id,
        value,
        description: config.description,
        category: "SMTP",
        data_type: config.dataType,
        is_active: true,
        is_encrypted: config.isEncrypted,
        display_name: config.displayName,
      },
      update: {
        value,
        description: config.description,
        category: "SMTP",
        data_type: config.dataType,
        is_active: true,
        is_encrypted: config.isEncrypted,
        display_name: config.displayName,
        updated_at: new Date(),
      },
    });
  }

  console.log(`Synced SMTP config: ${smtpConfigs.length} updated, ${smtpConfigs.filter((config) => config.isEncrypted).length} encrypted`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
