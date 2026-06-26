function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="p-6 lg:p-10">
          <div className="flex gap-3">
            <SkeletonLine className="h-6 w-24" />
            <SkeletonLine className="h-6 w-20" />
            <SkeletonLine className="h-6 w-28" />
          </div>
          <SkeletonLine className="mt-5 h-8 w-11/12" />
          <SkeletonLine className="mt-3 h-8 w-8/12" />
          <SkeletonLine className="mt-5 h-4 w-full" />
          <SkeletonLine className="mt-3 h-4 w-10/12" />
          <SkeletonLine className="mt-3 h-4 w-7/12" />
        </div>
        <SkeletonLine className="h-72 rounded-none sm:h-80 lg:h-full lg:min-h-96" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <SkeletonLine className="h-52 rounded-none sm:h-56" />
      <div className="p-5">
        <div className="flex gap-2">
          <SkeletonLine className="h-6 w-24" />
          <SkeletonLine className="h-6 w-20" />
        </div>
        <SkeletonLine className="mt-4 h-5 w-full" />
        <SkeletonLine className="mt-3 h-5 w-9/12" />
        <SkeletonLine className="mt-5 h-4 w-full" />
        <SkeletonLine className="mt-3 h-4 w-8/12" />
      </div>
    </div>
  );
}

export default function NewsLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="bg-[#071f4a] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <SkeletonLine className="h-4 w-80 bg-white/20" />
          <SkeletonLine className="hidden h-4 w-32 bg-white/20 sm:block" />
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <SkeletonLine className="h-11 w-11 rounded-xl bg-[#ffd35a]/70" />
          <div>
            <SkeletonLine className="h-6 w-28" />
            <SkeletonLine className="mt-2 h-3 w-36" />
          </div>
          <div className="ml-auto hidden gap-6 xl:flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLine key={index} className="h-4 w-20" />
            ))}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#071f4a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f4a] via-[#071f4a]/90 to-[#071f4a]/50" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SkeletonLine className="h-9 w-24 rounded-full bg-[#ffd35a]/80" />
          <SkeletonLine className="mt-6 h-12 w-full max-w-2xl bg-white/25" />
          <SkeletonLine className="mt-4 h-5 w-full max-w-3xl bg-white/20" />
          <SkeletonLine className="mt-3 h-5 w-full max-w-2xl bg-white/20" />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="relative flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0b66c3]/25 border-t-[#0b66c3]" />
            <span className="text-sm font-black text-[#071f4a]">กำลังโหลดข่าว...</span>
          </div>
          <div className="mt-4 flex gap-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, index) => (
              <SkeletonLine key={index} className="h-9 w-32 shrink-0 rounded-lg" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="mt-3 h-8 w-28" />
            </div>
            <SkeletonLine className="hidden h-4 w-52 sm:block" />
          </div>
          <SkeletonCard featured />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
