"use client";

import { useLinkStatus } from "next/link";

export function NewsLinkProgress() {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <>
      <span className="fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-red-100" aria-hidden="true">
        <span className="news-link-progress-bar absolute top-0 h-full w-1/3 bg-red-600 shadow-[0_0_14px_rgba(220,38,38,0.8)]" />
      </span>
      <span className="sr-only" aria-live="polite">
        กำลังโหลดหน้าใหม่
      </span>
      <style>{`
        @keyframes news-link-progress {
          0% {
            transform: translateX(-120%);
          }
          55% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(330%);
          }
        }

        .news-link-progress-bar {
          animation: news-link-progress 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
