"use client";

import { useEffect, useState } from "react";
import { formatNewsViewCount } from "@/lib/news-display";
import { newsViewClickEventName, type NewsViewClickEventDetail } from "./news-view-events";

type NewsViewCountProps = {
  articleId: string;
  className: string;
  initialViewCount: number;
  suffix?: string;
};

function isNewsViewClickEvent(event: Event): event is CustomEvent<NewsViewClickEventDetail> {
  return event instanceof CustomEvent && typeof event.detail?.articleId === "string";
}

export function NewsViewCount({ articleId, className, initialViewCount, suffix = " ครั้ง" }: NewsViewCountProps) {
  const [viewCount, setViewCount] = useState(initialViewCount);

  useEffect(() => {
    function handleNewsViewClick(event: Event) {
      if (!isNewsViewClickEvent(event) || event.detail.articleId !== articleId) {
        return;
      }

      setViewCount((current) => current + 1);
    }

    window.addEventListener(newsViewClickEventName, handleNewsViewClick);

    return () => {
      window.removeEventListener(newsViewClickEventName, handleNewsViewClick);
    };
  }, [articleId]);

  return (
    <span aria-live="polite" className={className}>
      ดู {formatNewsViewCount(viewCount)}
      {suffix}
    </span>
  );
}
