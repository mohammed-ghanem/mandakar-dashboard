"use client";

import {
  FolderTree,
  Library,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  emptyStatistics,
  useGetStatisticsQuery,
} from "@/store/statistics/statisticsApi";
import { getAccent, kpiAccents, type AccentKey } from "@/constants/navAccents";

type KpiKey = keyof typeof emptyStatistics.quickStats;

type KpiConfig = {
  key: KpiKey;
  icon: LucideIcon;
  accent: AccentKey;
};

const kpiConfig: KpiConfig[] = [
  { key: "content", icon: Library, accent: kpiAccents.content },
  { key: "categories", icon: FolderTree, accent: kpiAccents.categories },
  { key: "admins", icon: Users, accent: kpiAccents.admins },
  { key: "roles", icon: ShieldCheck, accent: kpiAccents.roles },
];

function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={index}
          className="relative overflow-hidden rounded-2xl border border-[#e4d3b4]/70 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Statistics() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { data, isLoading, isError } = useGetStatisticsQuery();

  const totals = data?.quickStats ?? emptyStatistics.quickStats;

  const labels: Record<KpiKey, string | undefined> = {
    content: t?.kpiContent,
    categories: t?.kpiCategories,
    admins: t?.kpiAdmins,
    roles: t?.kpiRoles,
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.kpiTitle}</h2>
        <p className="text-sm text-slate-600">{t?.kpiDescription}</p>
      </header>

      {isLoading ? (
        <StatisticsSkeleton />
      ) : (
        <>
          {isError && (
            <p className="text-sm text-red-600">{t?.statisticsError}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiConfig.map((item) => {
              const tone = getAccent(item.accent);

              return (
                <article
                  key={item.key}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-[#e4d3b4]/60 p-5",
                    "bg-linear-to-br shadow-md ring-1 transition duration-300",
                    "hover:-translate-y-0.5 hover:shadow-lg",
                    tone.wash,
                    tone.ring,
                    tone.glow,
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-1 opacity-90",
                      tone.bar,
                    )}
                  />
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -inset-e-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl transition group-hover:opacity-50",
                      tone.bar,
                    )}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">
                        {labels[item.key]}
                      </p>
                      <p
                        className={cn(
                          "text-3xl font-bold tabular-nums tracking-tight",
                          tone.ink,
                        )}
                      >
                        {totals[item.key].toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 transition duration-300 group-hover:scale-105",
                        tone.chip,
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
