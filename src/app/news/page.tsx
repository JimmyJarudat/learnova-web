import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";
import {
  formatNewsDate,
  getNewsCategoryColor,
  getNewsImageUrl,
  getNewsSummary,
  getSafeNewsPage,
  getVisibleNewsStatuses,
} from "@/lib/news-display";

const heroImage = "/images/news-hero-teacher-officials.png";
const pageSize = 10;

export const dynamic = "force-dynamic";

type NewsSearchParams = {
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
};

type ArticleWhere = Prisma.NewsArticleWhereInput;

function getSingleParam(value?: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildNewsHref({
  categorySlug,
  page,
  query,
}: {
  categorySlug?: string;
  page?: number;
  query: string;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `/news?${search}` : "/news";
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

async function getNewsData(query: string, categorySlug: string, requestedPage: string) {
  const searchWhere = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { excerpt: { contains: query, mode: "insensitive" as const } },
          { summary: { contains: query, mode: "insensitive" as const } },
          { sourceName: { contains: query, mode: "insensitive" as const } },
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
  const articleWhere = { ...where, status: { in: visibleStatuses } } satisfies ArticleWhere;
  const [categories, totalCount] = await Promise.all([
    prisma.newsCategory.findMany({
      where: {
        isActive: true,
        articles: {
          some: {
            status: { in: visibleStatuses },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { nameTh: "asc" }],
      select: {
        nameTh: true,
        slug: true,
        _count: {
          select: {
            articles: {
              where: {
                status: { in: visibleStatuses },
              },
            },
          },
        },
      },
    }),
    prisma.newsArticle.count({ where: articleWhere }),
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
    totalCount,
  };
}

function getPaginationPages(currentPage: number, pageCount: number) {
  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);
}

function Pagination({
  categorySlug,
  currentPage,
  pageCount,
  query,
}: {
  categorySlug: string;
  currentPage: number;
  pageCount: number;
  query: string;
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
        href={buildNewsHref({ categorySlug, page: previousPage, query })}
        aria-disabled={currentPage === 1}
        className={`flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-black transition ${
          currentPage === 1
            ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        ก่อนหน้า
      </Link>

      {pages.map((page, index) => (
        <div key={page} className="flex items-center gap-2">
          {index > 0 && page - pages[index - 1] > 1 ? (
            <span className="px-1 text-sm font-black text-slate-400">...</span>
          ) : null}
          <Link
            href={buildNewsHref({ categorySlug, page, query })}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition ${
              page === currentPage
                ? "bg-[#071f4a] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {page}
          </Link>
        </div>
      ))}

      <Link
        href={buildNewsHref({ categorySlug, page: nextPage, query })}
        aria-disabled={currentPage === pageCount}
        className={`flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-black transition ${
          currentPage === pageCount
            ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
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
  const query = getSingleParam(params.q).trim();
  const selectedCategory = getSingleParam(params.category).trim();
  const requestedPage = getSingleParam(params.page).trim();
  const { articles, categories, currentPage, pageCount, totalCount } = await getNewsData(query, selectedCategory, requestedPage);
  const featuredNews = articles.find((article) => article.isFeatured) ?? articles[0];
  const newsItems = featuredNews ? articles.filter((article) => article.id !== featuredNews.id) : articles;

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
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
            ข่าวสารและประกาศ
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/80">
            ติดตามกำหนดการสอบ ประกาศจากหน่วยงานต้นสังกัด และอัปเดตคลังข้อสอบล่าสุด เพื่อให้วางแผนอ่านหนังสือได้ทันทุกสนาม
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-4">
            <form className="flex min-h-12 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <label htmlFor="news-search" className="sr-only">
                ค้นหาข่าว
              </label>
              <input
                id="news-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="ค้นหาข่าว ประกาศ หรือหน่วยงาน"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
              {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
              <button
                type="submit"
                className="bg-[#0b66c3] px-5 text-sm font-black text-white transition hover:bg-[#0856a6]"
              >
                ค้นหา
              </button>
            </form>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              <Link
                href={buildNewsHref({ query })}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-black transition ${
                  selectedCategory === ""
                    ? "bg-[#071f4a] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={buildNewsHref({ categorySlug: category.slug, query })}
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

      <section className="bg-[#f7f8fc]">
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
            <Link
              href={featuredNews.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]"
            >
              <div className="flex flex-col justify-center p-6 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-md ${getNewsCategoryColor(featuredNews.category?.slug)} px-3 py-1 text-xs font-black text-white`}
                  >
                    {featuredNews.category?.nameTh ?? featuredNews.source?.type ?? "ข่าวสาร"}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {formatNewsDate(featuredNews.publishedAt ?? featuredNews.sourcePublishedAt ?? featuredNews.fetchedAt)}
                  </span>
                  {featuredNews.sourceName ? (
                    <span className="text-sm font-bold text-slate-400">จาก {featuredNews.sourceName}</span>
                  ) : null}
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
            </Link>
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
              <Link
                key={item.id}
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
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
                    <span className="text-xs font-bold text-slate-500">
                      {formatNewsDate(item.publishedAt ?? item.sourcePublishedAt ?? item.fetchedAt)}
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
              </Link>
            ))}
          </div> : null}

          <Pagination
            categorySlug={selectedCategory}
            currentPage={currentPage}
            pageCount={pageCount}
            query={query}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
