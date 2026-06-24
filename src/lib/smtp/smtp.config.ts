import nodemailer from "nodemailer";
import prisma from "@/lib/db/postgres";
import { decryptText } from "@/utils/encryption";

interface SmtpConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  requireTLS: boolean;
}

let transporter: nodemailer.Transporter | null = null;
let isSmtpAvailable = false;

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const configs = await prisma.system_config.findMany({
    where: { category: "SMTP", is_active: true },
  });

  if (configs.length === 0) return null;

  const raw = new Map(
    configs.map((c) => {
      let value: string | boolean | number = c.value;

      switch (c.data_type) {
        case "BOOLEAN":
          value = c.value.toLowerCase() === "true";
          break;
        case "NUMBER":
          value = parseInt(c.value, 10) || 0;
          break;
        default:
          if (c.is_encrypted && c.value) {
            try {
              value = decryptText(c.value);
            } catch {
              value = c.value;
            }
          }
      }

      return [c.id, value];
    }),
  );

  const config: SmtpConfig = {
    enabled: (raw.get("smtp_enabled") as boolean) ?? false,
    host: (raw.get("smtp_host") as string) ?? "",
    port: (raw.get("smtp_port") as number) ?? 587,
    secure: (raw.get("smtp_secure") as boolean) ?? false,
    user: (raw.get("smtp_user") as string) ?? "",
    password: (raw.get("smtp_password") as string) ?? "",
    fromName: (raw.get("smtp_from_name") as string) ?? "System",
    fromEmail: (raw.get("smtp_from_email") as string) ?? "",
    requireTLS: (raw.get("smtp_require_tls") as boolean) ?? true,
  };

  if (!config.host || !config.port || !config.user) return null;

  return config;
}

async function initializeSmtp(): Promise<void> {
  try {
    const config = await getSmtpConfig();

    if (!config || !config.enabled) {
      isSmtpAvailable = false;
      return;
    }

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
      requireTLS: config.requireTLS,
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();
    isSmtpAvailable = true;
  } catch (error) {
    isSmtpAvailable = false;
    transporter = null;
  }
}

export async function reloadSmtp(): Promise<void> {
  if (transporter) {
    try { transporter.close(); } catch { /* ignore */ }
    transporter = null;
    isSmtpAvailable = false;
  }

  await initializeSmtp();
}

export async function pingSmtp(): Promise<{ connected: boolean; error?: string }> {
  if (!isSmtpAvailable || !transporter) {
    return { connected: false, error: "SMTP not initialized" };
  }
  try {
    await transporter.verify();
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export class EmailManager {
  static async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<boolean> {
    if (!isSmtpAvailable || !transporter) {
      return false;
    }

    try {
      const config = await getSmtpConfig();
      if (!mailOptions.from && config) {
        mailOptions.from = `"${config.fromName}" <${config.fromEmail}>`;
      }
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export function getSmtpStatus() {
  return { isAvailable: isSmtpAvailable, hasTransporter: !!transporter };
}

// Initialize on startup
initializeSmtp();