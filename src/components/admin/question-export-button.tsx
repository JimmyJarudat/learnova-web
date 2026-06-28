"use client";

import { useEffect, useRef, useState } from "react";

type QuestionExportButtonProps = {
  defaultValue: string;
};

export function QuestionExportButton({ defaultValue }: QuestionExportButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [destination, setDestination] = useState(defaultValue);

  useEffect(() => {
    const form = buttonRef.current?.closest("form");
    const select = form?.querySelector<HTMLSelectElement>('select[name="destination"]');

    if (!select) {
      return;
    }

    const updateDestination = () => setDestination(select.value);
    updateDestination();
    select.addEventListener("change", updateDestination);

    return () => select.removeEventListener("change", updateDestination);
  }, []);

  const href = destination
    ? `/api/admin/exams/questions/export?destination=${encodeURIComponent(destination)}`
    : "#";

  return (
    <a
      ref={buttonRef}
      href={href}
      className="rounded-xl border border-[#0b66c3] bg-white px-5 py-2.5 text-sm font-black text-[#0b66c3] transition hover:bg-[#eaf4ff]"
    >
      ดาวน์โหลด JSON
    </a>
  );
}
