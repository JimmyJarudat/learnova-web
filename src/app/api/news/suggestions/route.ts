import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";
import { getSafeNewsStatus, getVisibleNewsStatuses } from "@/lib/news-display";
import { getNewsSearchTerms, normalizeNewsSearchQuery } from "@/lib/news-search";

export const dynamic = "force-dynamic";

type Suggestion = {
  label: string;
  type: string;
  meta?: string;
};

function uniqueSuggestions(suggestions: Suggestion[]) {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.type}:${suggestion.label}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = normalizeNewsSearchQuery(url.searchParams.get("q") ?? "");

  if (query.length < 2) {
    return Response.json({ suggestions: [] });
  }

  const categorySlug = url.searchParams.get("category")?.trim() ?? "";
  const requestedStatus = url.searchParams.get("status")?.trim() ?? "";
  const visibleStatuses = getVisibleNewsStatuses();
  const selectedStatus = getSafeNewsStatus(requestedStatus, visibleStatuses);
  const terms = getNewsSearchTerms(query);
  const statusWhere = selectedStatus ? { status: selectedStatus } : { status: { in: visibleStatuses } };
  const categoryWhere = categorySlug ? { category: { slug: categorySlug } } : {};
  const textWhere = {
    OR: [
      ...terms.flatMap((term) => [
        { title: { contains: term, mode: "insensitive" as const } },
        { excerpt: { contains: term, mode: "insensitive" as const } },
        { summary: { contains: term, mode: "insensitive" as const } },
        { content: { contains: term, mode: "insensitive" as const } },
        { sourceName: { contains: term, mode: "insensitive" as const } },
        { tags: { has: term } },
      ]),
      { category: { nameTh: { contains: query, mode: "insensitive" as const } } },
      { category: { slug: { contains: query, mode: "insensitive" as const } } },
      { source: { name: { contains: query, mode: "insensitive" as const } } },
      { source: { type: { contains: query, mode: "insensitive" as const } } },
    ],
  } satisfies Prisma.NewsArticleWhereInput;
  const articleWhere = {
    ...categoryWhere,
    ...statusWhere,
    ...textWhere,
  } satisfies Prisma.NewsArticleWhereInput;

  const [articles, tagArticles, categories, sources] = await Promise.all([
    prisma.newsArticle.findMany({
      where: articleWhere,
      orderBy: [{ isFeatured: "desc" }, { fetchedAt: "desc" }],
      take: 8,
      select: {
        title: true,
        sourceName: true,
        tags: true,
        category: {
          select: {
            nameTh: true,
          },
        },
      },
    }),
    prisma.newsArticle.findMany({
      where: {
        ...categoryWhere,
        ...statusWhere,
      },
      orderBy: [{ fetchedAt: "desc" }],
      take: 80,
      select: {
        tags: true,
      },
    }),
    prisma.newsCategory.findMany({
      where: {
        isActive: true,
        OR: [
          { nameTh: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
        articles: {
          some: {
            ...statusWhere,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { nameTh: "asc" }],
      take: 4,
      select: { nameTh: true },
    }),
    prisma.newsSource.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { type: { contains: query, mode: "insensitive" } },
        ],
        articles: {
          some: {
            ...statusWhere,
          },
        },
      },
      orderBy: { name: "asc" },
      take: 4,
      select: { name: true, type: true },
    }),
  ]);

  const lowerQuery = query.toLocaleLowerCase("th-TH");
  const tagSuggestions = tagArticles
    .flatMap((article) => article.tags)
    .filter((tag) => tag.toLocaleLowerCase("th-TH").includes(lowerQuery))
    .slice(0, 4)
    .map((tag) => ({ label: tag, type: "tag", meta: "แท็ก" }));
  const suggestions = uniqueSuggestions([
    ...categories.map((category) => ({ label: category.nameTh, type: "category", meta: "หมวดข่าว" })),
    ...sources.map((source) => ({ label: source.name, type: "source", meta: source.type })),
    ...tagSuggestions,
    ...articles.map((article) => ({
      label: article.title,
      type: "article",
      meta: article.category?.nameTh ?? article.sourceName ?? "ข่าว",
    })),
  ]).slice(0, 10);

  return Response.json({ suggestions });
}
