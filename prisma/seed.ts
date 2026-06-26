import { PrismaPg } from "@prisma/adapter-pg";
import { ExamPartKind, PrismaClient } from "../src/generated/prisma/client";
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
];

const desiredExamPackageSeed = {
  slug: "part-a-2568-set-1",
  title: "สอศ. เอกคอมพิวเตอร์ ภาค ก ปี 2568 ชุดที่ 1",
  year: "2568",
  label: "ภาค ก",
  description: "โครงชุดข้อสอบจริงชุดแรกสำหรับ สอศ. เอกคอมพิวเตอร์ ภาค ก",
  sortOrder: 10,
};

const desiredExamPartSeed = {
  slug: "part-a-general",
  kind: ExamPartKind.PART_A_GENERAL,
  title: "ภาค ก ความรู้ความสามารถทั่วไป",
  shortTitle: "ภาค ก",
  audienceLabel: "สอศ. เอกคอม",
  description: "ความสามารถทั่วไป ภาษาไทย คณิต เหตุผล และความรู้รอบตัว",
  durationMinutes: 60,
  totalQuestions: 60,
  totalScore: 60,
  difficulty: "กลาง",
  sortOrder: 10,
};

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
  let deletedPracticeSetLinks = 0;
  let deletedPracticeSets = 0;
  let deletedPracticeCategories = 0;
  let deletedPackages = 0;
  let deletedTracks = 0;
  let deletedMajors = 0;

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

  const desiredMajor = examMajorSeeds[0];

  const major = await prisma.examMajor.upsert({
    where: { slug: desiredMajor.slug },
    create: desiredMajor,
    update: {
      name: desiredMajor.name,
      shortName: desiredMajor.shortName,
      description: desiredMajor.description,
      sortOrder: desiredMajor.sortOrder,
      isActive: true,
    },
  });
  majorCount += 1;

  const ovec = await prisma.examAffiliation.findUniqueOrThrow({
    where: { slug: "ovec" },
    select: { id: true, label: true },
  });

  const cleanupResult = await prisma.$transaction(async (tx) => {
    const practiceSetLinks = await tx.practiceSetAffiliation.deleteMany({});
    const practiceSets = await tx.practiceSet.deleteMany({});
    const practiceCategories = await tx.practiceCategory.deleteMany({});
    const packages = await tx.examPackage.deleteMany({
      where: {
        OR: [
          { slug: { not: desiredExamPackageSeed.slug } },
          {
            track: {
              OR: [
                { affiliationId: { not: ovec.id } },
                { majorId: { not: major.id } },
              ],
            },
          },
        ],
      },
    });
    const tracks = await tx.examTrack.deleteMany({
      where: {
        OR: [
          { affiliationId: { not: ovec.id } },
          { majorId: { not: major.id } },
        ],
      },
    });
    const majors = await tx.examMajor.deleteMany({
      where: {
        id: { not: major.id },
      },
    });

    return {
      practiceSetLinks: practiceSetLinks.count,
      practiceSets: practiceSets.count,
      practiceCategories: practiceCategories.count,
      packages: packages.count,
      tracks: tracks.count,
      majors: majors.count,
    };
  });

  deletedPracticeSetLinks = cleanupResult.practiceSetLinks;
  deletedPracticeSets = cleanupResult.practiceSets;
  deletedPracticeCategories = cleanupResult.practiceCategories;
  deletedPackages = cleanupResult.packages;
  deletedTracks = cleanupResult.tracks;
  deletedMajors = cleanupResult.majors;

  const track = await prisma.examTrack.upsert({
    where: {
      affiliationId_majorId: {
        affiliationId: ovec.id,
        majorId: major.id,
      },
    },
    create: {
      affiliationId: ovec.id,
      majorId: major.id,
      slug: major.slug,
      title: `${ovec.label} ${major.name}`,
      description: `เส้นทางข้อสอบสำหรับผู้สมัครสอบ ${ovec.label} ${major.name}`,
      sortOrder: 10,
    },
    update: {
      slug: major.slug,
      title: `${ovec.label} ${major.name}`,
      description: `เส้นทางข้อสอบสำหรับผู้สมัครสอบ ${ovec.label} ${major.name}`,
      sortOrder: 10,
      isActive: true,
    },
  });

  const examPackage = await prisma.examPackage.upsert({
    where: {
      trackId_slug: {
        trackId: track.id,
        slug: desiredExamPackageSeed.slug,
      },
    },
    create: {
      trackId: track.id,
      ...desiredExamPackageSeed,
    },
    update: {
      ...desiredExamPackageSeed,
      isActive: true,
    },
  });

  await prisma.examPackagePart.upsert({
    where: {
      packageId_slug: {
        packageId: examPackage.id,
        slug: desiredExamPartSeed.slug,
      },
    },
    create: {
      packageId: examPackage.id,
      ...desiredExamPartSeed,
    },
    update: {
      ...desiredExamPartSeed,
      isActive: true,
    },
  });

  await prisma.examPackagePart.deleteMany({
    where: {
      packageId: examPackage.id,
      slug: { not: desiredExamPartSeed.slug },
    },
  });

  console.log(
    [
      `Seeded exam data: ${affiliationCount} affiliations`,
      `${majorCount} major`,
      "1 track",
      "1 package",
      "1 part",
      `cleanup deleted ${deletedMajors} majors, ${deletedTracks} tracks, ${deletedPackages} packages, ${deletedPracticeCategories} practice categories, ${deletedPracticeSets} practice sets, ${deletedPracticeSetLinks} practice links`,
    ].join(", "),
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
