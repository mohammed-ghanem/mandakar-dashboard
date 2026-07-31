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
import { dashboardMock } from "./mockData";

const icons: Record<string, LucideIcon> = {
  lectures: TvMinimalPlay,
  speeches: Mic,
  articles: FileText,
  explanations: BookOpen,
  fatwas: Scale,
  books: BookMarked,
};

const barTone: Record<string, string> = {
  emerald: "bg-emerald-600",
  teal: "bg-teal-600",
  cyan: "bg-cyan-600",
  sky: "bg-sky-600",
  amber: "bg-amber-500",
  lime: "bg-lime-600",
};

const softTone: Record<string, string> = {
  emerald: "from-emerald-50/80 to-white ring-emerald-100",
  teal: "from-teal-50/80 to-white ring-teal-100",
  cyan: "from-cyan-50/80 to-white ring-cyan-100",
  sky: "from-sky-50/80 to-white ring-sky-100",
  amber: "from-amber-50/80 to-white ring-amber-100",
  lime: "from-lime-50/80 to-white ring-lime-100",
};

export default function ContentModulesSection() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const total = dashboardMock.totals.content || 1;

  const moduleLabels: Record<string, string | undefined> = {
    lectures: t?.moduleLectures,
    speeches: t?.moduleSpeeches,
    articles: t?.moduleArticles,
    explanations: t?.moduleExplanations,
    fatwas: t?.moduleFatwas,
    books: t?.moduleBooks,
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.modulesTitle}</h2>
        <p className="text-sm text-slate-600">{t?.modulesDescription}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardMock.modules.map((mod) => {
          const Icon = icons[mod.key] ?? FileText;
          const pct = Math.round((mod.count / total) * 100);

          return (
            <article
              key={mod.key}
              className={cn(
                "rounded-2xl border border-slate-200/90 bg-linear-to-br p-5 shadow-sm ring-1",
                softTone[mod.color],
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {moduleLabels[mod.key]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t?.shareOfContent}: {pct}%
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {mod.count}
                </p>
              </div>

              <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200/60">
                <div
                  className={cn("h-full rounded-full transition-all", barTone[mod.color])}
                  style={{ width: `${pct}%` }}
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
    </section>
  );
}
