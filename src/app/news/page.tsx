import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/config/site";
import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";
import {
  formatNewsDate,
  getNewsCategoryColor,
  getNewsImageUrl,
  getNewsStatusColor,
  getNewsStatusLabel,
  getNewsSummary,
  getSafeNewsPage,
  getSafeNewsStatus,
  getVisibleNewsStatuses,
  newsStatusOptions,
} from "@/lib/news-display";
import { getNewsSearchTerms, normalizeNewsSearchQuery } from "@/lib/news-search";
import { getNewsCanonicalPath, getNewsSeoFilterLabel, shouldIndexNewsPage } from "@/lib/news-seo";
import { getNewsReadHref } from "@/lib/news-view";
import { NewsLinkProgress } from "./news-link-progress";
import { NewsSearchForm } from "./news-search-form";
import { NewsTrackedLink } from "./news-tracked-link";
import { NewsViewCount } from "./news-view-count";

const heroImage = "/images/news-hero-teacher-officials.png";
const pageSize = 10;
const newsPath = "/news";
const newsResultsId = "news-results";
const newsTitle = "ข่าวรับสมัครครู สอบครูผู้ช่วย และประกาศการศึกษา";
const newsDescription =
  "ศูนย์รวมข่าวรับสมัครครู สอบครูผู้ช่วย พนักงานราชการครู และประกาศสำคัญจากหน่วยงานการศึกษา พร้อมค้นหาตามหมวด หน่วยงาน แท็ก และสถานะรับสมัคร";
const newsKeywords = [
  "ข่าวรับสมัครครู",
  "ข่าวสอบครูผู้ช่วย",
  "สอบครูผู้ช่วย",
  "สมัครครู",
  "รับสมัครครูอัตราจ้าง",
  "พนักงานราชการครู",
  "ข่าวการศึกษา",
  "ประกาศ ก.ค.ศ.",
  "ข่าว สพฐ",
  "ข่าว สอศ",
  "Learnova ข่าวครู",
];

export const dynamic = "force-dynamic";

type NewsSearchParams = {
  q?: string | string[];
  category?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

type ArticleWhere = Prisma.NewsArticleWhereInput;
type NewsArticleItem = Awaited<ReturnType<typeof getNewsData>>["articles"][number];

function getSingleParam(value?: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function sanitizeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function getAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildNewsHref({
  categorySlug,
  page,
  query,
  status,
}: {
  categorySlug?: string;
  page?: number;
  query: string;
  status?: string;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (status) {
    params.set("status", status);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `/news?${search}` : "/news";
}

function buildNewsResultsHref({
  categorySlug,
  query,
  status,
}: {
  categorySlug?: string;
  query: string;
  status?: string;
}) {
  return `${buildNewsHref({ categorySlug, query, status })}#${newsResultsId}`;
}

function getNewsMetadataUrl({
  categorySlug,
  page,
  query,
  status,
}: {
  categorySlug: string;
  page: string;
  query: string;
  status: string;
}) {
  return buildNewsHref({
    categorySlug,
    page: Number(page) > 1 ? Number(page) : undefined,
    query,
    status,
  });
}

function getNewsRobots(query: string, status: string) {
  const shouldIndex = shouldIndexNewsPage(query, status);

  return {
    index: shouldIndex,
    follow: true,
    googleBot: {
      index: shouldIndex,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

async function getCategoryName(categorySlug: string) {
  if (!categorySlug) {
    return "";
  }

  const category = await prisma.newsCategory.findUnique({
    where: { slug: categorySlug },
    select: { nameTh: true },
  });

  return category?.nameTh ?? "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<NewsSearchParams>;
}): Promise<Metadata> {
  const params = (await searchParams) ?? {};
  const query = normalizeNewsSearchQuery(getSingleParam(params.q));
  const categorySlug = getSingleParam(params.category).trim();
  const requestedStatus = getSingleParam(params.status).trim();
  const requestedPage = getSingleParam(params.page).trim();
  const visibleStatuses = getVisibleNewsStatuses();
  const selectedStatus = getSafeNewsStatus(requestedStatus, visibleStatuses);
  const categoryName = await getCategoryName(categorySlug);
  const pageLabel = Number(requestedPage) > 1 ? ` หน้า ${Number(requestedPage)}` : "";
  const filterLabel = getNewsSeoFilterLabel({
    categoryName,
    query,
    statusLabel: selectedStatus ? getNewsStatusLabel(selectedStatus) : "",
  });
  const title = filterLabel ? `${filterLabel}${pageLabel} - ข่าวครู` : newsTitle;
  const description = filterLabel
    ? `รวมข่าวครูและประกาศการศึกษาตามตัวกรอง ${filterLabel}${pageLabel} จาก Learnova พร้อมค้นหาข่าวรับสมัครครู สอบครูผู้ช่วย และพนักงานราชการครู`
    : newsDescription;
  const currentPath = getNewsMetadataUrl({
    categorySlug,
    page: requestedPage,
    query,
    status: selectedStatus,
  });
  const canonicalPath = getNewsCanonicalPath({
    cleanPath: buildNewsHref({ categorySlug, query: "", status: "" }),
    currentPath,
    query,
    status: selectedStatus,
  });

  return {
    title,
    description,
    keywords: newsKeywords,
    alternates: {
      canonical: canonicalPath,
    },
    robots: getNewsRobots(query, selectedStatus),
    openGraph: {
      title,
      description,
      url: currentPath,
      siteName: siteConfig.name,
      locale: "th_TH",
      type: "website",
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: "ข่าวรับสมัครครูและประกาศการศึกษา Learnova",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage],
    },
    category: "Education",
  };
}

function NewsImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
}) {
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
  }

  return <img src={src} alt={alt} className={`h-full w-full ${className}`} loading="lazy" />;
}

async function getNewsData(query: string, categorySlug: string, status: string, requestedPage: string) {
  const searchTerms = getNewsSearchTerms(query);
  const searchWhere = query
    ? {
        OR: [
          ...searchTerms.flatMap((term) => [
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
      }
    : {};
  const categoryWhere = categorySlug ? { category: { slug: categorySlug } } : {};
  const where = {
    ...searchWhere,
    ...categoryWhere,
  } satisfies ArticleWhere;
  const orderBy = [
    { isFeatured: "desc" as const },
    { publishedAt: "desc" as const },
    { sourcePublishedAt: "desc" as const },
    { fetchedAt: "desc" as const },
  ];

  const visibleStatuses = getVisibleNewsStatuses();
  const selectedStatus = getSafeNewsStatus(status, visibleStatuses);
  const statusWhere = selectedStatus ? { status: selectedStatus } : { status: { in: visibleStatuses } };
  const articleWhere = { ...where, ...statusWhere } satisfies ArticleWhere;
  const baseVisibilityWhere = {
    ...searchWhere,
    status: { in: visibleStatuses },
  } satisfies ArticleWhere;
  const categoryCountWhere = {
    ...baseVisibilityWhere,
    ...(selectedStatus ? { status: selectedStatus } : {}),
  } satisfies ArticleWhere;
  const [categories, statusCounts, totalCount, allCategoriesCount] = await Promise.all([
    prisma.newsCategory.findMany({
      where: {
        isActive: true,
        articles: {
          some: categoryCountWhere,
        },
      },
      orderBy: [{ sortOrder: "asc" }, { nameTh: "asc" }],
      select: {
        nameTh: true,
        slug: true,
        _count: {
          select: {
            articles: {
              where: categoryCountWhere,
            },
          },
        },
      },
    }),
    Promise.all(
      newsStatusOptions
        .filter((option) => visibleStatuses.includes(option.slug))
        .map(async (option) => ({
          ...option,
          count: await prisma.newsArticle.count({
            where: {
              ...where,
              status: option.slug,
            },
          }),
        })),
    ),
    prisma.newsArticle.count({ where: articleWhere }),
    prisma.newsArticle.count({ where: categoryCountWhere }),
  ]);
  const { currentPage, pageCount } = getSafeNewsPage(requestedPage, totalCount, pageSize);
  const articles = await prisma.newsArticle.findMany({
    where: articleWhere,
    include: { category: true, source: true },
    orderBy,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return {
    articles,
    categories,
    currentPage,
    pageCount,
    selectedStatus,
    statusCounts: statusCounts.filter((option) => option.count > 0),
    allCategoriesCount,
    totalCount,
  };
}

function getPaginationPages(currentPage: number, pageCount: number) {
  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);
}

function buildNewsJsonLd({
  articles,
  categoryName,
  currentPath,
  description,
  title,
}: {
  articles: NewsArticleItem[];
  categoryName: string;
  currentPath: string;
  description: string;
  title: string;
}) {
  const pageUrl = getAbsoluteUrl(currentPath);

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: "th-TH",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteConfig.url}#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteConfig.url}${newsPath}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      about: categoryName || "ข่าวครู ข่าวรับสมัครครู และประกาศการศึกษา",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: article.sourceUrl,
          item: {
            "@type": "NewsArticle",
            headline: article.title,
            description: getNewsSummary(article),
            url: article.sourceUrl,
            image: getAbsoluteUrl(getNewsImageUrl(article.imageUrl)),
            datePublished: (article.publishedAt ?? article.sourcePublishedAt ?? article.fetchedAt).toISOString(),
            dateModified: article.updatedAt.toISOString(),
            articleSection: article.category?.nameTh ?? article.source?.type ?? "ข่าวสาร",
            keywords: article.tags,
            publisher: {
              "@type": "Organization",
              name: article.sourceName ?? article.source?.name ?? "Learnova",
            },
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/ReadAction",
              userInteractionCount: article.viewCount,
            },
          },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: siteConfig.name,
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: categoryName || "ข่าวสาร",
          item: pageUrl,
        },
      ],
    },
  ];
}

function Pagination({
  categorySlug,
  currentPage,
  pageCount,
  query,
  status,
}: {
  categorySlug: string;
  currentPage: number;
  pageCount: number;
  query: string;
  status: string;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = getPaginationPages(currentPage, pageCount);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(pageCount, currentPage + 1);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="pagination">
      <Link
        href={buildNewsHref({ categorySlug, page: previousPage, query, status })}
        prefetch={false}
        aria-disabled={currentPage === 1}
        className={`flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-black transition ${
          currentPage === 1
            ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <NewsLinkProgress />
        ก่อนหน้า
      </Link>

      {pages.map((page, index) => (
        <div key={page} className="flex items-center gap-2">
          {index > 0 && page - pages[index - 1] > 1 ? (
            <span className="px-1 text-sm font-black text-slate-400">...</span>
          ) : null}
          <Link
            href={buildNewsHref({ categorySlug, page, query, status })}
            prefetch={false}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition ${
              page === currentPage
                ? "bg-[#071f4a] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <NewsLinkProgress />
            {page}
          </Link>
        </div>
      ))}

      <Link
        href={buildNewsHref({ categorySlug, page: nextPage, query, status })}
        prefetch={false}
        aria-disabled={currentPage === pageCount}
        className={`flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-black transition ${
          currentPage === pageCount
            ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <NewsLinkProgress />
        ถัดไป
      </Link>
    </nav>
  );
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<NewsSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const query = normalizeNewsSearchQuery(getSingleParam(params.q));
  const selectedCategory = getSingleParam(params.category).trim();
  const requestedStatus = getSingleParam(params.status).trim();
  const requestedPage = getSingleParam(params.page).trim();
  const {
    articles,
    categories,
    currentPage,
    pageCount,
    selectedStatus,
    statusCounts,
    allCategoriesCount,
    totalCount,
  } = await getNewsData(query, selectedCategory, requestedStatus, requestedPage);
  const featuredNews = articles.find((article) => article.isFeatured) ?? articles[0];
  const newsItems = featuredNews ? articles.filter((article) => article.id !== featuredNews.id) : articles;
  const categoryName = categories.find((category) => category.slug === selectedCategory)?.nameTh ?? "";
  const currentPath = getNewsMetadataUrl({
    categorySlug: selectedCategory,
    page: requestedPage,
    query,
    status: selectedStatus,
  });
  const jsonLd = buildNewsJsonLd({
    articles,
    categoryName,
    currentPath,
    description: newsDescription,
    title: categoryName ? `${categoryName} - ข่าวครู Learnova` : newsTitle,
  });

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: sanitizeJsonLd(jsonLd),
        }}
      />
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#071f4a]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f4a] via-[#071f4a]/85 to-[#071f4a]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071f4a]/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <span className="rounded-full bg-[#ffd35a] px-4 py-2 text-sm font-black text-[#071f4a] shadow-sm">
            ข่าวสาร
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl">
            ศูนย์รวมข่าวสารและประกาศสำหรับครู
          </h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/85">
            รวมข่าวรับสมัครครู สอบครูผู้ช่วย พนักงานราชการครู และประกาศสำคัญจากหน่วยงานการศึกษาไว้ในที่เดียว
            ค้นหาได้จากชื่อข่าว หมวด หน่วยงาน แท็ก และสถานะรับสมัคร เพื่อให้ติดตามกำหนดการสำคัญได้ทันและวางแผนเตรียมตัวได้มั่นใจกว่าเดิม
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/news/calendar"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#ffd35a] px-5 text-sm font-black text-[#071f4a] shadow-sm transition hover:bg-white"
            >
              ดูปฏิทินรับสมัครสอบ
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-4">
            <NewsSearchForm
              categorySlug={selectedCategory}
              initialQuery={query}
              selectedStatus={selectedStatus}
              statusCounts={statusCounts}
            />

            <form className="flex gap-2 sm:hidden">
              {query ? <input type="hidden" name="q" value={query} /> : null}
              {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
              <label htmlFor="news-status-mobile" className="sr-only">
                สถานะข่าว
              </label>
              <select
                id="news-status-mobile"
                name="status"
                defaultValue={selectedStatus}
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm outline-none"
              >
                <option value="">ทุกสถานะ</option>
                {statusCounts.map((status) => (
                  <option key={status.slug} value={status.slug}>
                    {status.label} ({status.count})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="min-h-11 shrink-0 rounded-lg bg-[#071f4a] px-4 text-sm font-black text-white shadow-sm"
              >
                ใช้
              </button>
            </form>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              <Link
                href={buildNewsResultsHref({ query, status: selectedStatus })}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-black transition ${
                  selectedCategory === ""
                    ? "bg-[#071f4a] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด
                <span className="ml-1 text-xs opacity-70">({allCategoriesCount})</span>
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={buildNewsResultsHref({ categorySlug: category.slug, query, status: selectedStatus })}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-black transition ${
                    selectedCategory === category.slug
                      ? "bg-[#071f4a] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {category.nameTh}
                  <span className="ml-1 text-xs opacity-70">({category._count.articles})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id={newsResultsId} className="scroll-mt-4 bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#0b66c3]">ข่าวที่ควรติดตาม</p>
              <h2 className="mt-1 text-2xl font-black text-[#071f4a]">ข่าวล่าสุด</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              ข่าวทั้งหมด {totalCount} รายการ · หน้า {currentPage} จาก {pageCount}
            </p>
          </div>

          {featuredNews ? (
            <NewsTrackedLink
              articleId={featuredNews.id}
              href={getNewsReadHref(featuredNews.id)}
              target="_blank"
              rel="noreferrer"
              prefetch={false}
              className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]"
            >
              <div className="flex flex-col justify-center p-6 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-md ${getNewsCategoryColor(featuredNews.category?.slug)} px-3 py-1 text-xs font-black text-white`}
                  >
                    {featuredNews.category?.nameTh ?? featuredNews.source?.type ?? "ข่าวสาร"}
                  </span>
                  <span className={`rounded-md ${getNewsStatusColor(featuredNews.status)} px-3 py-1 text-xs font-black text-white`}>
                    {getNewsStatusLabel(featuredNews.status)}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {formatNewsDate(featuredNews.publishedAt ?? featuredNews.sourcePublishedAt ?? featuredNews.fetchedAt)}
                  </span>
                  {featuredNews.sourceName ? (
                    <span className="text-sm font-bold text-slate-400">จาก {featuredNews.sourceName}</span>
                  ) : null}
                  <NewsViewCount
                    articleId={featuredNews.id}
                    initialViewCount={featuredNews.viewCount}
                    className="text-sm font-bold text-slate-400"
                  />
                </div>
                <h3 className="mt-4 text-2xl font-black leading-tight text-[#071f4a] group-hover:text-[#0b66c3] sm:text-3xl">
                  {featuredNews.title}
                </h3>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                  {getNewsSummary(featuredNews)}
                </p>
                <span className="mt-6 text-sm font-black text-[#0b66c3]">อ่านจากแหล่งข่าว →</span>
              </div>
              <div className="relative h-72 border-t border-slate-100 sm:h-80 lg:h-full lg:min-h-96 lg:border-l lg:border-t-0">
                <NewsImage
                  src={getNewsImageUrl(featuredNews.imageUrl)}
                  alt=""
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            </NewsTrackedLink>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-xl font-black text-[#071f4a]">ยังไม่พบข่าว</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                ลองเปลี่ยนคำค้นหา หรือรอ n8n ดึงข่าวเข้ามาเพิ่มเติม
              </p>
            </div>
          )}

          {newsItems.length > 0 ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <NewsTrackedLink
                key={item.id}
                articleId={item.id}
                href={getNewsReadHref(item.id)}
                target="_blank"
                rel="noreferrer"
                prefetch={false}
                className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-52 bg-slate-50 sm:h-56">
                  <NewsImage
                    src={getNewsImageUrl(item.imageUrl)}
                    alt=""
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md ${getNewsCategoryColor(item.category?.slug)} px-2.5 py-1 text-xs font-black text-white`}>
                      {item.category?.nameTh ?? item.source?.type ?? "ข่าวสาร"}
                    </span>
                    <span className={`rounded-md ${getNewsStatusColor(item.status)} px-2.5 py-1 text-xs font-black text-white`}>
                      {getNewsStatusLabel(item.status)}
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-2 text-right">
                      <span className="text-xs font-bold text-slate-500">
                        {formatNewsDate(item.publishedAt ?? item.sourcePublishedAt ?? item.fetchedAt)}
                      </span>
                      <NewsViewCount
                        articleId={item.id}
                        initialViewCount={item.viewCount}
                        suffix=""
                        className="rounded-full bg-[#fff2c2] px-2 py-0.5 text-xs font-black text-[#9a5b00]"
                      />
                    </span>
                  </div>
                  <h3 className="mt-3 min-h-14 text-lg font-black leading-7 text-[#071f4a] group-hover:text-[#0b66c3]">
                    {item.title}
                  </h3>
                  <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-slate-600">
                    {getNewsSummary(item)}
                  </p>
                  <span className="mt-4 inline-block text-sm font-black text-[#0b66c3]">อ่านจากแหล่งข่าว →</span>
                </div>
              </NewsTrackedLink>
            ))}
          </div> : null}

          <Pagination
            categorySlug={selectedCategory}
            currentPage={currentPage}
            pageCount={pageCount}
            query={query}
            status={selectedStatus}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
