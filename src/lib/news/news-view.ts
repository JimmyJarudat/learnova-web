const newsArticleUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isNewsArticleId(value: string): boolean {
  return newsArticleUuidPattern.test(value);
}

export function getNewsReadHref(articleId: string): string {
  return `/api/news/articles/${articleId}/view`;
}
