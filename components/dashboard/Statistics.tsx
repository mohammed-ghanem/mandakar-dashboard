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
import { dashboardMock } from "./mockData";

type Kpi = {
  key: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  ring: string;
};

const kpis: Kpi[] = [
  {
    key: "content",
    value: dashboardMock.totals.content,
    icon: Library,
    accent: "from-emerald-100 to-teal-50 text-emerald-800",
    ring: "ring-emerald-200/70",
  },
  {
    key: "categories",
    value: dashboardMock.totals.categories,
    icon: FolderTree,
    accent: "from-teal-100 to-cyan-50 text-teal-800",
    ring: "ring-teal-200/70",
  },
  {
    key: "admins",
    value: dashboardMock.totals.admins,
    icon: Users,
    accent: "from-amber-100 to-orange-50 text-amber-900",
    ring: "ring-amber-200/70",
  },
  {
    key: "roles",
    value: dashboardMock.totals.roles,
    icon: ShieldCheck,
    accent: "from-slate-100 to-slate-50 text-slate-800",
    ring: "ring-slate-200/80",
  },
];

export default function Statistics() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;

  const labels: Record<string, string | undefined> = {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <article
            key={item.key}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5",
              "shadow-sm ring-1 ring-slate-900/3",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-s-0 top-0 h-full w-1.5 bg-linear-to-b from-emerald-500 to-teal-600 opacity-80"
            />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">
                  {labels[item.key]}
                </p>
                <p className="text-3xl font-bold tabular-nums text-slate-900">
                  {item.value}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br shadow-inner ring-1",
                  item.accent,
                  item.ring,
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
