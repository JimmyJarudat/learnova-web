import "server-only";
import prisma from "@/lib/db/postgres";

const affiliationThemeBySlug: Record<string, string> = {
  obec: "bg-[#0b66c3]",
  ovec: "bg-[#e94b7b]",
  dole: "bg-[#00a86b]",
  dla: "bg-[#f6b21a]",
  bma: "bg-[#7c3aed]",
};

function getAffiliationTheme(slug: string, colorClass: string | null) {
  return affiliationThemeBySlug[slug] ?? colorClass ?? "bg-[#0b66c3]";
}

function toNumber(value: number | { toString(): string } | null | undefined) {
  if (value == null) {
    return 0;
  }

  return Number(value.toString());
}

export async function getExamOverview() {
  const [affiliations, practiceCategories, popularPackages, totals] = await Promise.all([
    prisma.examAffiliation.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      include: {
        tracks: {
          where: { isActive: true },
          include: {
            packages: {
              where: { isActive: true },
              select: { id: true },
            },
          },
        },
      },
    }),
    prisma.practiceCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        sets: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    }),
    prisma.examPackage.findMany({
      where: { isActive: true, slug: "full-mock-1" },
      take: 4,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        parts: { where: { isActive: true }, select: { id: true } },
        track: {
          include: {
            affiliation: true,
            major: true,
          },
        },
      },
    }),
    Promise.all([
      prisma.examAffiliation.count({ where: { isActive: true } }),
      prisma.examPackage.count({ where: { isActive: true } }),
      prisma.examQuestion.count({ where: { isActive: true } }),
    ]),
  ]);

  return {
    affiliations: affiliations.map((affiliation) => ({
      slug: affiliation.slug,
      label: affiliation.label,
      name: affiliation.name,
      description: affiliation.description,
      imageUrl: affiliation.imageUrl,
      colorClass: getAffiliationTheme(affiliation.slug, affiliation.colorClass),
      trackCount: affiliation.tracks.length,
      packageCount: affiliation.tracks.reduce((sum, track) => sum + track.packages.length, 0),
    })),
    practiceCategories: practiceCategories.map((category) => ({
      slug: category.slug,
      title: category.title,
      shortTitle: category.shortTitle,
      description: category.description,
      colorClass: category.colorClass ?? "bg-[#0b66c3]",
      setCount: category.sets.length,
    })),
    popularPackages: popularPackages.map((pack) => ({
      slug: pack.slug,
      title: pack.title,
      year: pack.year,
      label: pack.label,
      affiliationSlug: pack.track.affiliation.slug,
      affiliationLabel: pack.track.affiliation.label,
      majorSlug: pack.track.major.slug,
      majorName: pack.track.major.name,
      majorShortName: pack.track.major.shortName ?? pack.track.major.name,
      partCount: pack.parts.length,
    })),
    totals: {
      affiliations: totals[0],
      sets: totals[1],
      questions: totals[2],
    },
  };
}

export async function getAllExamPackages() {
  const [packages, affiliations] = await Promise.all([
    prisma.examPackage.findMany({
      where: { isActive: true },
      orderBy: [{ year: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
      include: {
        parts: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true },
        },
        track: {
          include: {
            affiliation: true,
            major: true,
          },
        },
      },
    }),
    prisma.examAffiliation.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: { label: true },
    }),
  ]);

  return {
    affiliations,
    totals: {
      affiliations: affiliations.length,
      sets: packages.length,
      questions: await prisma.examQuestion.count({ where: { isActive: true } }),
    },
    packages: packages.map((pack) => ({
      slug: pack.slug,
      title: pack.title,
      year: pack.year,
      label: pack.label,
      description: pack.description,
      partCount: pack.parts.length,
      affiliationSlug: pack.track.affiliation.slug,
      affiliationLabel: pack.track.affiliation.label,
      majorSlug: pack.track.major.slug,
      majorName: pack.track.major.name,
      majorShortName: pack.track.major.shortName ?? pack.track.major.name,
    })),
  };
}

export async function getAffiliationWithTracks(slug: string) {
  const affiliation = await prisma.examAffiliation.findFirst({
    where: { slug, isActive: true },
    include: {
      tracks: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: {
          major: true,
          packages: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!affiliation) {
    return null;
  }

  return {
    slug: affiliation.slug,
    label: affiliation.label,
    name: affiliation.name,
    description: affiliation.description,
    imageUrl: affiliation.imageUrl,
    colorClass: getAffiliationTheme(affiliation.slug, affiliation.colorClass),
    tracks: affiliation.tracks.map((track) => ({
      slug: track.slug,
      title: track.title,
      description: track.description,
      packageCount: track.packages.length,
      major: {
        slug: track.major.slug,
        name: track.major.name,
        shortName: track.major.shortName ?? track.major.name,
        description: track.major.description,
      },
    })),
  };
}

export async function getExamTrack(affiliationSlug: string, majorSlug: string) {
  const track = await prisma.examTrack.findFirst({
    where: {
      isActive: true,
      affiliation: { slug: affiliationSlug, isActive: true },
      major: { slug: majorSlug, isActive: true },
    },
    include: {
      affiliation: true,
      major: true,
      packages: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { year: "desc" }],
        include: {
          parts: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!track) {
    return null;
  }

  return {
    slug: track.slug,
    title: track.title,
    description: track.description,
    affiliation: {
      slug: track.affiliation.slug,
      label: track.affiliation.label,
      name: track.affiliation.name,
    },
    major: {
      slug: track.major.slug,
      name: track.major.name,
      shortName: track.major.shortName ?? track.major.name,
    },
    packages: track.packages.map((pack) => ({
      slug: pack.slug,
      title: pack.title,
      year: pack.year,
      label: pack.label,
      description: pack.description,
      partCount: pack.parts.length,
    })),
  };
}

export async function getExamPackage(affiliationSlug: string, majorSlug: string, packageSlug: string) {
  const pack = await prisma.examPackage.findFirst({
    where: {
      slug: packageSlug,
      isActive: true,
      track: {
        isActive: true,
        affiliation: { slug: affiliationSlug, isActive: true },
        major: { slug: majorSlug, isActive: true },
      },
    },
    include: {
      track: {
        include: {
          affiliation: true,
          major: true,
        },
      },
      parts: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      },
    },
  });

  if (!pack) {
    return null;
  }

  return {
    slug: pack.slug,
    title: pack.title,
    year: pack.year,
    label: pack.label,
    description: pack.description,
    affiliation: {
      slug: pack.track.affiliation.slug,
      label: pack.track.affiliation.label,
      name: pack.track.affiliation.name,
    },
    major: {
      slug: pack.track.major.slug,
      name: pack.track.major.name,
      shortName: pack.track.major.shortName ?? pack.track.major.name,
    },
    parts: pack.parts.map((part) => ({
      slug: part.slug,
      title: part.title,
      shortTitle: part.shortTitle ?? part.title,
      audienceLabel: part.audienceLabel,
      description: part.description,
      durationMinutes: part.durationMinutes,
      totalQuestions: part.totalQuestions,
      totalScore: toNumber(part.totalScore),
      difficulty: part.difficulty,
    })),
  };
}

export async function getExamPackagePart(
  affiliationSlug: string,
  majorSlug: string,
  packageSlug: string,
  partSlug: string,
) {
  const part = await prisma.examPackagePart.findFirst({
    where: {
      slug: partSlug,
      isActive: true,
      package: {
        slug: packageSlug,
        isActive: true,
        track: {
          isActive: true,
          affiliation: { slug: affiliationSlug, isActive: true },
          major: { slug: majorSlug, isActive: true },
        },
      },
    },
    include: {
      package: {
        include: {
          track: {
            include: {
              affiliation: true,
              major: true,
            },
          },
        },
      },
      items: {
        orderBy: { position: "asc" },
        include: {
          question: {
            include: {
              choices: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!part) {
    return null;
  }

  return {
    slug: part.slug,
    title: part.title,
    shortTitle: part.shortTitle ?? part.title,
    durationMinutes: part.durationMinutes,
    totalQuestions: part.totalQuestions,
    totalScore: toNumber(part.totalScore),
    difficulty: part.difficulty,
    affiliation: {
      slug: part.package.track.affiliation.slug,
      label: part.package.track.affiliation.label,
    },
    major: {
      slug: part.package.track.major.slug,
      name: part.package.track.major.name,
      shortName: part.package.track.major.shortName ?? part.package.track.major.name,
    },
    package: {
      slug: part.package.slug,
      title: part.package.title,
      year: part.package.year,
      label: part.package.label,
    },
    questions: part.items.map((item) => ({
      id: item.question.id,
      no: item.position,
      score: toNumber(item.score),
      stem: item.question.stem,
      choices: item.question.choices.map((choice) => ({
        id: choice.id,
        label: choice.label,
        text: choice.text,
      })),
    })),
  };
}

export async function getPracticeCategory(slug: string) {
  const category = await prisma.practiceCategory.findFirst({
    where: { slug, isActive: true },
    include: {
      sets: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: {
          affiliations: {
            include: {
              affiliation: { select: { label: true } },
            },
          },
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  return {
    slug: category.slug,
    title: category.title,
    shortTitle: category.shortTitle ?? category.title,
    description: category.description,
    sets: category.sets.map((set) => ({
      slug: set.slug,
      title: set.title,
      scopeLabel: set.scopeLabel,
      yearLabel: set.yearLabel,
      description: set.description,
      durationMinutes: set.durationMinutes,
      totalQuestions: set.totalQuestions,
      totalScore: toNumber(set.totalScore),
      difficulty: set.difficulty,
      affiliationLabels: set.affiliations.map((item) => item.affiliation.label),
    })),
  };
}

export async function getPracticeSet(categorySlug: string, setSlug: string) {
  const practiceSet = await prisma.practiceSet.findFirst({
    where: {
      slug: setSlug,
      isActive: true,
      category: { slug: categorySlug, isActive: true },
    },
    include: {
      category: true,
      items: {
        orderBy: { position: "asc" },
        include: {
          question: {
            include: {
              choices: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!practiceSet) {
    return null;
  }

  return {
    slug: practiceSet.slug,
    title: practiceSet.title,
    scopeLabel: practiceSet.scopeLabel,
    yearLabel: practiceSet.yearLabel,
    durationMinutes: practiceSet.durationMinutes,
    totalQuestions: practiceSet.totalQuestions,
    totalScore: toNumber(practiceSet.totalScore),
    difficulty: practiceSet.difficulty,
    category: {
      slug: practiceSet.category.slug,
      title: practiceSet.category.title,
      shortTitle: practiceSet.category.shortTitle ?? practiceSet.category.title,
    },
    questions: practiceSet.items.map((item) => ({
      id: item.question.id,
      no: item.position,
      score: toNumber(item.score),
      stem: item.question.stem,
      choices: item.question.choices.map((choice) => ({
        id: choice.id,
        label: choice.label,
        text: choice.text,
      })),
    })),
  };
}
