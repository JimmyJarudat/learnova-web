export function shouldIndexNewsPage(query: string, status: string): boolean {
  return !query && !status;
}

export function getNewsCanonicalPath({
  cleanPath,
  currentPath,
  query,
  status,
}: {
  cleanPath: string;
  currentPath: string;
  query: string;
  status: string;
}) {
  return shouldIndexNewsPage(query, status) ? currentPath : cleanPath;
}

export function getNewsSeoFilterLabel({
  categoryName,
  query,
  statusLabel,
}: {
  categoryName: string;
  query: string;
  statusLabel: string;
}) {
  return [
    categoryName,
    statusLabel,
    query ? `ค้นหา "${query}"` : "",
  ].filter(Boolean).join(" | ");
}
