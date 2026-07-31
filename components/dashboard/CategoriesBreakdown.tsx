"use client";

import { FolderTree, GitBranch } from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { dashboardMock } from "./mockData";

export default function CategoriesBreakdown() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;

  const maxTotal = Math.max(
    ...dashboardMock.categoriesByType.map((c) => c.roots + c.children),
    1,
  );

  const labels: Record<string, string | undefined> = {
    lectures: t?.moduleLectures,
    speeches: t?.moduleSpeeches,
    articles: t?.moduleArticles,
    explanations: t?.moduleExplanations,
    fatwas: t?.moduleFatwas,
    books: t?.moduleBooks,
  };

  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8",
        "shadow-md shadow-slate-900/5 ring-1 ring-slate-900/4",
      )}
    >
      <header className="mb-6 flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-teal-50 text-emerald-800 ring-1 ring-emerald-200/60">
          <FolderTree className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            {t?.categoriesTitle}
          </h2>
          <p className="text-sm text-slate-600">{t?.categoriesDescription}</p>
        </div>
      </header>

      <ul className="space-y-5">
        {dashboardMock.categoriesByType.map((row) => {
          const total = row.roots + row.children;
          const rootsPct = (row.roots / maxTotal) * 100;
          const childrenPct = (row.children / maxTotal) * 100;

          return (
            <li key={row.key} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {labels[row.key]}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <GitBranch className="h-3.5 w-3.5" />
                  {total} {t?.categoriesTotal}
                </p>
              </div>

              <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${rootsPct}%` }}
                  title={t?.rootCategories}
                />
                <div
                  className="h-full bg-teal-400"
                  style={{ width: `${childrenPct}%` }}
                  title={t?.subCategories}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  {t?.rootCategories}: {row.roots}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-400" />
                  {t?.subCategories}: {row.children}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
