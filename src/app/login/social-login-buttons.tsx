"use client";

import { signIn } from "next-auth/react";

const socialProviders = [
  {
    id: "google",
    name: "Google",
    icon: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
    enabled: true,
    className: "bg-white hover:border-slate-300",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "https://cdn.simpleicons.org/facebook/1877F2",
    enabled: true,
    className: "bg-white hover:border-[#1877f2]/45",
  },
  {
    id: "line",
    name: "LINE",
    icon: "https://cdn.simpleicons.org/line/06C755",
    enabled: true,
    className: "bg-white hover:border-[#06c755]/45",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "https://cdn.simpleicons.org/github/181717",
    enabled: true,
    className: "bg-white hover:border-slate-500/35",
  },
];

export function SocialLoginButtons() {
  return (
    <div className="flex items-center justify-center gap-3">
      {socialProviders.map((provider) => (
        <button
          key={provider.id}
          type="button"
          aria-label={provider.enabled ? `เข้าสู่ระบบด้วย ${provider.name}` : `${provider.name} ยังไม่เปิดใช้งาน`}
          title={provider.enabled ? provider.name : `${provider.name} เร็วๆ นี้`}
          disabled={!provider.enabled}
          onClick={() => {
            if (provider.enabled) {
              void signIn(provider.id, { callbackUrl: "/" });
            }
          }}
          className={`grid h-10 w-10 place-items-center rounded-full border border-slate-200 shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-not-allowed ${provider.className}`}
        >
          <img src={provider.icon} alt="" className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}



