const whitespacePattern = /\s+/g;

export function normalizeNewsSearchQuery(query: string): string {
  return query.trim().replace(whitespacePattern, " ");
}

export function getNewsSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeNewsSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const terms = new Set([normalizedQuery]);

  for (const term of normalizedQuery.split(" ")) {
    if (term.length >= 2) {
      terms.add(term);
    }
  }

  if (normalizedQuery.includes("สมัคร")) {
    terms.add("รับสมัคร");
    terms.add("เปิดรับสมัคร");
  }

  if (normalizedQuery.includes("ครู")) {
    terms.add("ครูผู้ช่วย");
    terms.add("ครูอัตราจ้าง");
  }

  if (normalizedQuery.includes("กคศ") || normalizedQuery.includes("ก.ค.ศ")) {
    terms.add("ก.ค.ศ.");
    terms.add("otepc");
  }

  return Array.from(terms);
}
