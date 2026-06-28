"use client";

import { useMemo, useState } from "react";

type DestinationOption = {
  value: string;
  label: string;
  meta: string;
  typeLabel: "คลังฝึกกลาง" | "ชุดจำลองสนาม";
};

type QuestionDestinationExportSelectProps = {
  name?: string;
  options: DestinationOption[];
  defaultValue: string;
};

export function QuestionDestinationExportSelect({
  name = "destination",
  options,
  defaultValue,
}: QuestionDestinationExportSelectProps) {
  const [value, setValue] = useState(defaultValue);
  const exportHref = useMemo(
    () => (value ? `/api/admin/exams/questions/export?destination=${encodeURIComponent(value)}` : "#"),
    [value],
  );

  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        name={name}
        value={value}
        required
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-lg border border-[#cfe5ff] bg-[#f7fbff] px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]"
      >
        <optgroup label="คลังฝึกกลาง">
          {options
            .filter((option) => option.typeLabel === "คลังฝึกกลาง")
            .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.meta})
              </option>
            ))}
        </optgroup>
        <optgroup label="ชุดจำลองสนาม">
          {options
            .filter((option) => option.typeLabel === "ชุดจำลองสนาม")
            .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.meta})
              </option>
            ))}
        </optgroup>
      </select>
      <a
        href={exportHref}
        className="shrink-0 rounded-xl border border-[#0b66c3] bg-white px-4 py-3 text-center text-sm font-black text-[#0b66c3] transition hover:bg-[#eaf4ff]"
      >
        ดาวน์โหลด JSON
      </a>
    </div>
  );
}
