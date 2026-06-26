"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { newsViewClickEventName, type NewsViewClickEventDetail } from "./news-view-events";

type NewsTrackedLinkProps = ComponentProps<typeof Link> & {
  articleId: string;
};

export function NewsTrackedLink({ articleId, children, onAuxClick, onClick, ...props }: NewsTrackedLinkProps) {
  function dispatchNewsViewClick() {
    window.dispatchEvent(
      new CustomEvent<NewsViewClickEventDetail>(newsViewClickEventName, {
        detail: { articleId },
      }),
    );
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    dispatchNewsViewClick();
  }

  function handleAuxClick(event: MouseEvent<HTMLAnchorElement>) {
    onAuxClick?.(event);

    if (event.defaultPrevented || event.button !== 1) {
      return;
    }

    dispatchNewsViewClick();
  }

  return (
    <Link {...props} onAuxClick={handleAuxClick} onClick={handleClick}>
      {children}
    </Link>
  );
}
