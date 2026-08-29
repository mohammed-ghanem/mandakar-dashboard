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

const barTone: Record<string, string> = {
  lectures: "bg-emerald-600",
  speeches: "bg-teal-600",
  articles: "bg-cyan-600",
  explanations: "bg-sky-600",
  fatwas: "bg-amber-500",
  books: "bg-lime-600",
};

const softTone: Record<string, string> = {
  lectures: "from-emerald-50/80 to-white ring-emerald-100",
  speeches: "from-teal-50/80 to-white ring-teal-100",
  articles: "from-cyan-50/80 to-white ring-cyan-100",
  explanations: "from-sky-50/80 to-white ring-sky-100",
  fatwas: "from-amber-50/80 to-white ring-amber-100",
  books: "from-lime-50/80 to-white ring-lime-100",
};

function ModulesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={index}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-200/80"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
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
            const activePct = mod.total
              ? Math.round((mod.active / mod.total) * 100)
              : 0;

            return (
              <article
                key={key}
                className={cn(
                  "rounded-2xl border border-slate-200/90 bg-linear-to-br p-5 shadow-sm ring-1",
                  softTone[key],
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="font-semibold text-slate-900">
                      {moduleLabels[key]}
                    </p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-slate-900">
                    {mod.total}
                  </p>
                </div>

                <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200/60">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      barTone[key],
                    )}
                    style={{ width: `${activePct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    {t?.active}:{" "}
                    <strong className="text-emerald-700">{mod.active}</strong>
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
