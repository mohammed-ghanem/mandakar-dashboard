"use client";

import { Activity, CircleDashed, CircleCheckBig } from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  emptyStatistics,
  useGetStatisticsQuery,
} from "@/store/statistics/statisticsApi";

function HealthSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm">
        <Skeleton className="h-40 w-40 rounded-full" />
        <Skeleton className="mt-4 h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl sm:col-span-2 lg:col-span-1" />
      </div>
    </div>
  );
}

export default function PublishingHealth() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { data, isLoading } = useGetStatisticsQuery();

  const { active, inactive, addedThisWeek, activePercentage } =
    data?.publishingHealth ?? emptyStatistics.publishingHealth;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[#e4d3b4]/80 p-6 md:p-8",
        "bg-linear-to-br from-[#f8f3ea]/80 via-white to-lime-50/40",
        "shadow-md shadow-[#9f8452]/8 ring-1 ring-[#9f8452]/8",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-e-10 top-0 h-40 w-40 rounded-full bg-[#9f8452]/10 blur-3xl"
      />

      <header className="relative mb-6 flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee3] text-[#9f8452] shadow-sm ring-1 ring-[#e4d3b4]">
          <Activity className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">{t?.healthTitle}</h2>
          <p className="text-sm text-slate-600">{t?.healthDescription}</p>
        </div>
      </header>

      {isLoading ? (
        <HealthSkeleton />
      ) : (
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e4d3b4]/60 bg-white/90 p-6 shadow-sm">
            <div
              className="relative flex h-40 w-40 items-center justify-center rounded-full shadow-inner"
              style={{
                background: `conic-gradient(#9f8452 ${activePercentage}%, #efe6d6 0)`,
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e4d3b4]/70">
                <span className="text-3xl font-bold tabular-nums text-[#9f8452]">
                  {activePercentage}%
                </span>
                <span className="text-xs text-slate-500">{t?.active}</span>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-slate-600">
              {t?.healthRingHint}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-lime-100 bg-linear-to-br from-lime-50/80 to-white p-4 shadow-sm ring-1 ring-lime-100">
              <div className="mb-2 flex items-center gap-2 text-lime-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-100">
                  <CircleCheckBig className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">{t?.active}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-lime-900">
                {active.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="mb-2 flex items-center gap-2 text-slate-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                  <CircleDashed className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">{t?.inactive}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-slate-800">
                {inactive.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e4d3b4]/80 bg-linear-to-br from-[#f8f3ea] to-white p-4 shadow-sm ring-1 ring-[#e4d3b4]/60 sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-slate-600">{t?.publishedThisWeek}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[#9f8452]">
                {addedThisWeek.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
