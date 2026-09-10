"use client";

import {
  BookMarked,
  BookOpen,
  FileText,
  Mic,
  Scale,
  TvMinimalPlay,
  type LucideIcon,
} from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStatisticsQuery } from "@/store/statistics/statisticsApi";
import { getAccent, moduleAccents } from "@/constants/navAccents";

const moduleOrder = [
  "lectures",
  "speeches",
  "articles",
  "explanations",
  "fatwas",
  "books",
] as const;

const icons: Record<string, LucideIcon> = {
  lectures: TvMinimalPlay,
  speeches: Mic,
  articles: FileText,
  explanations: BookOpen,
  fatwas: Scale,
  books: BookMarked,
};

function ModulesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={index}
          className="rounded-2xl border border-[#e4d3b4]/70 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-2xl" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="mb-3 h-2.5 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ContentModulesSection() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { data, isLoading } = useGetStatisticsQuery();

  const moduleLabels: Record<string, string | undefined> = {
    lectures: t?.moduleLectures,
    speeches: t?.moduleSpeeches,
    articles: t?.moduleArticles,
    explanations: t?.moduleExplanations,
    fatwas: t?.moduleFatwas,
    books: t?.moduleBooks,
  };

  const distribution = data?.contentDistribution ?? {};

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.modulesTitle}</h2>
        <p className="text-sm text-slate-600">{t?.modulesDescription}</p>
      </header>

      {isLoading ? (
        <ModulesSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {moduleOrder.map((key) => {
            const mod = distribution[key] ?? {
              total: 0,
              active: 0,
              inactive: 0,
            };
            const Icon = icons[key] ?? FileText;
            const tone = getAccent(moduleAccents[key]);
            const activePct = mod.total
              ? Math.round((mod.active / mod.total) * 100)
              : 0;

            return (
              <article
                key={key}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-[#e4d3b4]/55 p-5",
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
                    "pointer-events-none absolute -inset-e-8 -top-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition group-hover:opacity-40",
                    tone.bar,
                  )}
                />

                <div className="relative mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 transition group-hover:scale-105",
                        tone.chip,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="font-semibold text-slate-900">
                      {moduleLabels[key]}
                    </p>
                  </div>
                  <p className={cn("text-2xl font-bold tabular-nums", tone.ink)}>
                    {mod.total.toLocaleString()}
                  </p>
                </div>

                <div className="relative mb-3 h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-black/5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      tone.bar,
                    )}
                    style={{ width: `${activePct}%` }}
                  />
                </div>

                <div className="relative flex items-center justify-between text-xs text-slate-600">
                  <span>
                    {t?.active}:{" "}
                    <strong className={tone.ink}>{mod.active}</strong>
                  </span>
                  <span>
                    {t?.inactive}:{" "}
                    <strong className="text-slate-700">{mod.inactive}</strong>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
