import { NextResponse } from "next/server";
import prisma from "@/lib/db/postgres";
import { getVisibleNewsStatuses } from "@/lib/news/news-display";
import { isNewsArticleId } from "@/lib/news/news-view";

export const dynamic = "force-dynamic";

function redirectToNews(request: Request) {
  return NextResponse.redirect(new URL("/news", request.url), { status: 302 });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isNewsArticleId(id)) {
    return redirectToNews(request);
  }

  const article = await prisma.newsArticle.findFirst({
    where: {
      id,
      status: { in: getVisibleNewsStatuses() },
    },
    select: {
      id: true,
      sourceUrl: true,
    },
  });

  if (!article) {
    return redirectToNews(request);
  }

  const updated = await prisma.newsArticle.updateMany({
    where: {
      id: article.id,
      status: { in: getVisibleNewsStatuses() },
    },
    data: { viewCount: { increment: 1 } },
  });

  if (updated.count === 0) {
    return redirectToNews(request);
  }

  return NextResponse.redirect(article.sourceUrl, { status: 302 });
}
