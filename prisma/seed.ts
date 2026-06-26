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
  category?: "GENERAL" | "SMTP" | "REGIONAL" | "OAUTH" | "AUTH";
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

const authConfigs: SystemConfigSeed[] = [
  {
    id: "auth_url",
    value: "",
    description: "Application auth base URL",
    category: "AUTH",
    display_name: "Auth URL",
  },
  {
    id: "auth_secret",
    value: "",
    description: "NextAuth secret",
    category: "AUTH",
    is_encrypted: true,
    display_name: "Auth Secret",
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
  {
    id: "line_oauth_client_id",
    value: "",
    description: "LINE OAuth client ID",
    category: "OAUTH",
    display_name: "LINE Client ID",
  },
  {
    id: "line_oauth_client_secret",
    value: "",
    description: "LINE OAuth client secret",
    category: "OAUTH",
    is_encrypted: true,
    display_name: "LINE Client Secret",
  },
  {
    id: "github_oauth_client_id",
    value: "",
    description: "GitHub OAuth client ID",
    category: "OAUTH",
    display_name: "GitHub Client ID",
  },
  {
    id: "github_oauth_client_secret",
    value: "",
    description: "GitHub OAuth client secret",
    category: "OAUTH",
    is_encrypted: true,
    display_name: "GitHub Client Secret",
  },
  {
    id: "facebook_oauth_client_id",
    value: "",
    description: "Facebook OAuth client ID",
    category: "OAUTH",
    display_name: "Facebook Client ID",
  },
  {
    id: "facebook_oauth_client_secret",
    value: "",
    description: "Facebook OAuth client secret",
    category: "OAUTH",
    is_encrypted: true,
    display_name: "Facebook Client Secret",
  },
];

const examAffiliationSeeds = [
  {
    slug: "obec",
    label: "สพฐ.",
    name: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    description: "สนามครูผู้ช่วยสายสามัญ แยกเส้นทางตามเอกและชุดปีสอบ",
    imageUrl: "/images/teacher-card-general.png",
    colorClass: "bg-[#0b66c3]",
    sortOrder: 10,
  },
  {
    slug: "ovec",
    label: "สอศ.",
    name: "สำนักงานคณะกรรมการการอาชีวศึกษา",
    description: "สนามครูอาชีวะ แยกเอกและบริบทงานอาชีวศึกษา",
    imageUrl: "/images/teacher-card-ovec.png",
    colorClass: "bg-[#e94b7b]",
    sortOrder: 20,
  },
  {
    slug: "dole",
    label: "สกร.",
    name: "กรมส่งเสริมการเรียนรู้",
    description: "สนามงานส่งเสริมการเรียนรู้และการศึกษาตลอดชีวิต",
    imageUrl: "/images/teacher-card-law.png",
    colorClass: "bg-[#00a86b]",
    sortOrder: 30,
  },
  {
    slug: "dla",
    label: "อปท.",
    name: "องค์กรปกครองส่วนท้องถิ่น",
    description: "สนามครูท้องถิ่นและงานการศึกษาในพื้นที่",
    imageUrl: "/images/teacher-card-cutout.png",
    colorClass: "bg-[#f6b21a]",
    sortOrder: 40,
  },
  {
    slug: "bma",
    label: "กทม.",
    name: "กรุงเทพมหานคร",
    description: "สนามโรงเรียนสังกัดกรุงเทพมหานคร",
    imageUrl: "/images/teacher-card-general.png",
    colorClass: "bg-[#7c3aed]",
    sortOrder: 50,
  },
];

const examMajorSeeds = [
  {
    slug: "major-computer",
    name: "เอกคอมพิวเตอร์",
    shortName: "เอกคอม",
    description: "ระบบคอมพิวเตอร์ เครือข่าย ฐานข้อมูล การเขียนโปรแกรม และเทคโนโลยีการศึกษา",
    sortOrder: 10,
  },
  {
    slug: "major-math",
    name: "เอกคณิตศาสตร์",
    shortName: "เอกคณิต",
    description: "จำนวนและพีชคณิต เรขาคณิต สถิติ ความน่าจะเป็น และโจทย์ประยุกต์",
    sortOrder: 20,
  },
  {
    slug: "major-english",
    name: "เอกภาษาอังกฤษ",
    shortName: "เอกอังกฤษ",
    description: "Grammar, vocabulary, reading, classroom English และการสอนภาษาอังกฤษ",
    sortOrder: 30,
  },
  {
    slug: "major-early-childhood",
    name: "เอกปฐมวัย",
    shortName: "เอกปฐมวัย",
    description: "พัฒนาการเด็กปฐมวัย การจัดประสบการณ์ การประเมินเด็กเล็ก และสื่อการเรียนรู้",
    sortOrder: 40,
  },
];

const practiceCategorySeeds = [
  {
    slug: "part-a",
    title: "ภาค ก รวมทุกสังกัด",
    shortTitle: "ภาค ก",
    description: "ฝึกความสามารถทั่วไป ภาษาไทย คณิต เหตุผล และความรู้รอบตัวจากหลายแนวสนาม",
    colorClass: "bg-[#0b66c3]",
    sortOrder: 10,
  },
  {
    slug: "teaching-profession",
    title: "วิชาชีพครู รวมทุกสังกัด",
    shortTitle: "วิชาชีพครู",
    description: "ฝึกหลักสูตร การสอน จิตวิทยา การวัดผล และจรรยาบรรณวิชาชีพครู",
    colorClass: "bg-[#00a86b]",
    sortOrder: 20,
  },
  {
    slug: "education-law",
    title: "กฎหมายการศึกษา",
    shortTitle: "กฎหมาย",
    description: "รวมข้อสอบกฎหมายและระเบียบที่ใช้ได้หลายสนาม พร้อมชุดสั้นและชุดจับเวลา",
    colorClass: "bg-[#f6b21a]",
    sortOrder: 30,
  },
  {
    slug: "reasoning",
    title: "คณิตและเหตุผล",
    shortTitle: "เหตุผล",
    description: "เน้นโจทย์คำนวณ อนุกรม ตาราง เงื่อนไข และการวิเคราะห์เชิงเหตุผล",
    colorClass: "bg-[#e94b7b]",
    sortOrder: 40,
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

async function seedSystemConfigs(configs: SystemConfigSeed[], fallbackCategory: "SMTP" | "REGIONAL" | "OAUTH" | "AUTH") {
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

async function seedExamMasterData() {
  let affiliationCount = 0;
  let majorCount = 0;
  let trackCount = 0;
  let practiceCategoryCount = 0;

  for (const affiliation of examAffiliationSeeds) {
    await prisma.examAffiliation.upsert({
      where: { slug: affiliation.slug },
      create: affiliation,
      update: {
        label: affiliation.label,
        name: affiliation.name,
        description: affiliation.description,
        imageUrl: affiliation.imageUrl,
        colorClass: affiliation.colorClass,
        sortOrder: affiliation.sortOrder,
        isActive: true,
      },
    });
    affiliationCount += 1;
  }

  for (const major of examMajorSeeds) {
    await prisma.examMajor.upsert({
      where: { slug: major.slug },
      create: major,
      update: {
        name: major.name,
        shortName: major.shortName,
        description: major.description,
        sortOrder: major.sortOrder,
        isActive: true,
      },
    });
    majorCount += 1;
  }

  for (const affiliationSeed of examAffiliationSeeds) {
    const affiliation = await prisma.examAffiliation.findUniqueOrThrow({
      where: { slug: affiliationSeed.slug },
      select: { id: true, label: true, slug: true },
    });

    for (const majorSeed of examMajorSeeds) {
      const major = await prisma.examMajor.findUniqueOrThrow({
        where: { slug: majorSeed.slug },
        select: { id: true, name: true, slug: true },
      });

      await prisma.examTrack.upsert({
        where: {
          affiliationId_majorId: {
            affiliationId: affiliation.id,
            majorId: major.id,
          },
        },
        create: {
          affiliationId: affiliation.id,
          majorId: major.id,
          slug: major.slug,
          title: `${affiliation.label} ${major.name}`,
          description: `เส้นทางข้อสอบสำหรับผู้สมัครสอบ ${affiliation.label} ${major.name}`,
          sortOrder: majorSeed.sortOrder,
        },
        update: {
          slug: major.slug,
          title: `${affiliation.label} ${major.name}`,
          description: `เส้นทางข้อสอบสำหรับผู้สมัครสอบ ${affiliation.label} ${major.name}`,
          sortOrder: majorSeed.sortOrder,
          isActive: true,
        },
      });
      trackCount += 1;
    }
  }

  for (const category of practiceCategorySeeds) {
    await prisma.practiceCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: {
        title: category.title,
        shortTitle: category.shortTitle,
        description: category.description,
        colorClass: category.colorClass,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
    practiceCategoryCount += 1;
  }

  console.log(
    `Seeded exam master data: ${affiliationCount} affiliations, ${majorCount} majors, ${trackCount} tracks, ${practiceCategoryCount} practice categories`,
  );
}

async function main() {
  await seedTestUser();
  await seedSystemConfigs(regionalConfigs, "REGIONAL");
  await seedSystemConfigs(smtpConfigs, "SMTP");
  await seedSystemConfigs(authConfigs, "AUTH");
  await seedSystemConfigs(oauthConfigs, "OAUTH");
  await seedExamMasterData();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
