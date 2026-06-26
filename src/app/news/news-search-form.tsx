"use client";

import { useEffect, useId, useRef, useState } from "react";

type StatusOption = {
  slug: string;
  label: string;
  count: number;
};

type Suggestion = {
  label: string;
  type: string;
  meta?: string;
};

export function NewsSearchForm({
  categorySlug,
  initialQuery,
  selectedStatus,
  statusCounts,
}: {
  categorySlug: string;
  initialQuery: string;
  selectedStatus: string;
  statusCounts: StatusOption[];
}) {
  const listboxId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);
  const requestIdRef = useRef(0);
  const showSuggestionPanel = isFocused && query.trim().length >= 2 && (isSuggesting || suggestions.length > 0);
  const showSuggestions = isFocused && query.trim().length >= 2 && suggestions.length > 0;

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setSuggestions([]);
    setIsSuggesting(true);

    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ q: trimmedQuery });

      if (categorySlug) {
        params.set("category", categorySlug);
      }

      if (selectedStatus) {
        params.set("status", selectedStatus);
      }

      try {
        const response = await fetch(`/api/news/suggestions?${params.toString()}`);

        if (!response.ok || requestIdRef.current !== requestId) {
          return;
        }

        const data = (await response.json()) as { suggestions?: Suggestion[] };
        setSuggestions(data.suggestions ?? []);
        setActiveIndex(-1);
      } catch {
        if (requestIdRef.current === requestId) {
          setSuggestions([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsSuggesting(false);
        }
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [categorySlug, query, selectedStatus]);

  const applySuggestion = (suggestion: Suggestion) => {
    const searchInput = formRef.current?.elements.namedItem("q");

    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = suggestion.label;
    }

    setQuery(suggestion.label);
    setSuggestions([]);
    setActiveIndex(-1);
    window.requestAnimationFrame(() => formRef.current?.requestSubmit());
  };

  return (
    <form ref={formRef} action="/news" className="relative">
      <div className="flex min-h-12 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <label htmlFor="news-search" className="sr-only">
          ค้นหาข่าว
        </label>
        <input
          id="news-search"
          name="q"
          type="search"
          value={query}
          placeholder="ค้นหาข่าว ประกาศ หน่วยงาน หมวด หรือแท็ก"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(event) => {
            if (!showSuggestions) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % suggestions.length);
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
            }

            if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              applySuggestion(suggestions[activeIndex]);
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
        {categorySlug ? <input type="hidden" name="category" value={categorySlug} /> : null}
        <label htmlFor="news-status" className="sr-only">
          สถานะข่าว
        </label>
        <select
          id="news-status"
          name="status"
          defaultValue={selectedStatus}
          className="hidden border-l border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none sm:block"
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
          className="bg-[#0b66c3] px-5 text-sm font-black text-white transition hover:bg-[#0856a6]"
        >
          ค้นหา
        </button>
      </div>

      {showSuggestionPanel ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        >
          {isSuggesting ? (
            <div className="flex items-center gap-3 px-4 py-3 text-sm font-black text-[#071f4a]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0b66c3]/25 border-t-[#0b66c3]" />
              กำลังค้นหาข่าว...
            </div>
          ) : null}
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.label}-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={() => applySuggestion(suggestion)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                activeIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <span className="min-w-0 truncate text-sm font-black text-[#071f4a]">{suggestion.label}</span>
              <span className="shrink-0 text-xs font-bold text-slate-400">{suggestion.meta ?? suggestion.type}</span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
