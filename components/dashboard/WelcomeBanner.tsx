"use client";

import { LayoutDashboard, Sparkles } from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { useGetStatisticsQuery } from "@/store/statistics/statisticsApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function WelcomeBanner() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { data, isLoading } = useGetStatisticsQuery();

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[#e4d3b4]/80",
        "bg-linear-to-br from-[#f8f3ea] via-white to-[#efe6d6]/70",
        "shadow-xl shadow-[#9f8452]/10 ring-1 ring-[#9f8452]/8",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-s-10 top-0 h-40 w-40 rounded-full bg-[#9f8452]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-e-8 bottom-0 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              "bg-linear-to-br from-[#f3eee3] to-[#e4d3b4] text-[#9f8452]",
              "shadow-inner ring-1 ring-[#9f8452]/25",
            )}
          >
            <LayoutDashboard className="h-6 w-6" />
          </span>
          <div className="min-w-0 space-y-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {t?.welcomeTitle}
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              {t?.welcomeDescription}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-3 rounded-2xl px-4 py-3",
            "bg-linear-to-r from-[#9f8452] to-[#7a6540] text-white",
            "shadow-lg shadow-[#9f8452]/30",
          )}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-5 w-5 shrink-0" />
          </span>
          <div className="leading-tight">
            <p className="text-xs text-white/80">{t?.totalContentLabel}</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-8 w-20 bg-white/20" />
            ) : (
              <p className="text-2xl font-bold tabular-nums">
                {(data?.totalVisits ?? 0).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
