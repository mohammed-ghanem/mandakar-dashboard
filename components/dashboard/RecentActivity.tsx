"use client";

import {
  BookMarked,
  BookOpen,
  FileText,
  Mic,
  PencilLine,
  PlusCircle,
  Scale,
  ToggleLeft,
  TvMinimalPlay,
  type LucideIcon,
} from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { dashboardMock } from "./mockData";

const moduleIcons: Record<string, LucideIcon> = {
  lectures: TvMinimalPlay,
  speeches: Mic,
  articles: FileText,
  explanations: BookOpen,
  fatwas: Scale,
  books: BookMarked,
};

const actionIcons: Record<string, LucideIcon> = {
  create: PlusCircle,
  update: PencilLine,
  toggle: ToggleLeft,
};

export default function RecentActivity() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;

  const moduleLabels: Record<string, string | undefined> = {
    lectures: t?.moduleLectures,
    speeches: t?.moduleSpeeches,
    articles: t?.moduleArticles,
    explanations: t?.moduleExplanations,
    fatwas: t?.moduleFatwas,
    books: t?.moduleBooks,
  };

  const actionLabels: Record<string, string | undefined> = {
    create: t?.actionCreate,
    update: t?.actionUpdate,
    toggle: t?.actionToggle,
  };

  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8",
        "shadow-md shadow-slate-900/5 ring-1 ring-slate-900/4",
      )}
    >
      <header className="mb-6 space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.recentTitle}</h2>
        <p className="text-sm text-slate-600">{t?.recentDescription}</p>
      </header>

      <ol className="relative space-y-0">
        {dashboardMock.recent.map((item, index) => {
          const ModuleIcon = moduleIcons[item.key] ?? FileText;
          const ActionIcon = actionIcons[item.action] ?? PlusCircle;
          const isLast = index === dashboardMock.recent.length - 1;

          return (
            <li key={`${item.key}-${index}`} className="relative flex gap-4 pb-6">
              {!isLast ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-s-5 top-10 bottom-0 w-px bg-emerald-100"
                />
              ) : null}

              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-100 to-teal-50 text-emerald-800 ring-1 ring-emerald-200/70">
                <ModuleIcon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-slate-50/40 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.title}
                  </p>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {item.when}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="rounded-md bg-white px-2 py-0.5 ring-1 ring-slate-200/80">
                    {moduleLabels[item.key]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-800">
                    <ActionIcon className="h-3.5 w-3.5" />
                    {actionLabels[item.action]}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
