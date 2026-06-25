export const fallbackNewsImage = "/images/teacher-card-general.png";

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
  return nodeEnv === "production" ? ["published"] : ["published", "draft"];
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
