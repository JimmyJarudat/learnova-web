"use client";

import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
};

export function AdminSubmitButton({ children, pendingText = "กำลังบันทึก...", className }: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}>
      {pending ? pendingText : children}
    </button>
  );
}
