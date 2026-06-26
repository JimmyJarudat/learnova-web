export const fallbackNewsImage = "/images/teacher-card-general.png";
export const hiddenNewsStatuses = ["closed", "cancelled", "archived"] as const;
export const newsStatusOptions = [
  { slug: "upcoming", label: "ยังไม่เปิดรับสมัคร", color: "bg-[#7c3aed]" },
  { slug: "open", label: "เปิดรับสมัคร", color: "bg-[#00a86b]" },
  { slug: "closing_soon", label: "ใกล้หมดเขต", color: "bg-[#f6b21a]" },
  { slug: "published", label: "ข่าวทั่วไป", color: "bg-[#0b66c3]" },
  { slug: "draft", label: "ร่าง", color: "bg-slate-500" },
] as const;

const categoryColors: Record<string, string> = {
  "teacher-assistant": "bg-[#e94b7b]",
  "teacher-exam": "bg-[#e94b7b]",
  "teacher-recruitment": "bg-[#0b66c3]",
  "teacher-contract": "bg-[#0b66c3]",
  "teacher-government-employee": "bg-[#0b66c3]",
  obec: "bg-[#00a86b]",
  ksp: "bg-[#f6b21a]",
  otep: "bg-[#f6b21a]",
  otepC: "bg-[#f6b21a]",
  license: "bg-[#00a86b]",
  "education-news": "bg-[#071f4a]",
};

export function getNewsCategoryColor(slug?: string | null): string {
  if (!slug) {
    return "bg-[#071f4a]";
  }

  return categoryColors[slug] ?? "bg-[#071f4a]";
}

export function getNewsImageUrl(imageUrl?: string | null): string {
  return imageUrl?.trim() || fallbackNewsImage;
}

export function getVisibleNewsStatuses(nodeEnv = process.env.NODE_ENV): string[] {
  const publishedStatuses = newsStatusOptions
    .map((status) => status.slug)
    .filter((status) => status !== "draft");

  return nodeEnv === "production" ? publishedStatuses : [...publishedStatuses, "draft"];
}

export function getNewsStatusLabel(status?: string | null): string {
  return newsStatusOptions.find((option) => option.slug === status)?.label ?? "ข่าวสาร";
}

export function getNewsStatusColor(status?: string | null): string {
  return newsStatusOptions.find((option) => option.slug === status)?.color ?? "bg-[#071f4a]";
}

export function getSafeNewsStatus(status: string, visibleStatuses: string[]): string {
  return visibleStatuses.includes(status) ? status : "";
}

export function getSafeNewsPage(pageValue: string | number | null | undefined, totalCount: number, pageSize: number) {
  const parsedPage = typeof pageValue === "number" ? pageValue : Number.parseInt(pageValue ?? "", 10);
  const pageCount = Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));
  const currentPage = Number.isFinite(parsedPage) ? Math.min(Math.max(1, parsedPage), pageCount) : 1;

  return { currentPage, pageCount };
}

export function getNewsSummary(article: {
  excerpt?: string | null;
  summary?: string | null;
  content?: string | null;
}): string {
  const text = article.excerpt?.trim() || article.summary?.trim() || article.content?.trim() || "";

  if (text.length <= 150) {
    return text;
  }

  return `${text.slice(0, 147).trimEnd()}...`;
}

export function formatNewsDate(date?: Date | null): string {
  if (!date) {
    return "ยังไม่ระบุวันที่";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

export function formatNewsViewCount(viewCount?: number | null): string {
  const safeViewCount = Math.max(0, Math.floor(viewCount ?? 0));

  if (safeViewCount >= 1_000_000) {
    return `${(safeViewCount / 1_000_000).toFixed(safeViewCount >= 10_000_000 ? 0 : 1).replace(".0", "")}M`;
  }

  if (safeViewCount >= 1_000) {
    return `${(safeViewCount / 1_000).toFixed(safeViewCount >= 10_000 ? 0 : 1).replace(".0", "")}K`;
  }

  return String(safeViewCount);
}
