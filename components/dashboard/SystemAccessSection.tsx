"use client";

import { Settings2, ShieldCheck, Users } from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { dashboardMock } from "./mockData";

function Meter({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-900">
          {value}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SystemAccessSection() {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const s = dashboardMock.system;

  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8",
        "shadow-md shadow-slate-900/5 ring-1 ring-slate-900/4",
      )}
    >
      <header className="mb-6 flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-50 text-slate-800 ring-1 ring-slate-200/80">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">{t?.systemTitle}</h2>
          <p className="text-sm text-slate-600">{t?.systemDescription}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">{t?.kpiAdmins}</span>
          </div>
          <Meter
            label={t?.active ?? ""}
            value={s.adminsActive}
            total={s.adminsActive + s.adminsInactive}
            tone="bg-emerald-600"
          />
          <div className="mt-3">
            <Meter
              label={t?.inactive ?? ""}
              value={s.adminsInactive}
              total={s.adminsActive + s.adminsInactive}
              tone="bg-slate-400"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">{t?.kpiRoles}</span>
          </div>
          <Meter
            label={t?.active ?? ""}
            value={s.rolesActive}
            total={s.rolesActive + s.rolesInactive}
            tone="bg-teal-600"
          />
          <div className="mt-3">
            <Meter
              label={t?.inactive ?? ""}
              value={s.rolesInactive}
              total={s.rolesActive + s.rolesInactive}
              tone="bg-slate-400"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4">
          <div className="mb-4 flex items-center gap-2 text-amber-950">
            <Settings2 className="h-4 w-4" />
            <span className="text-sm font-semibold">{t?.settingsReady}</span>
          </div>
          <p className="text-3xl font-bold tabular-nums text-slate-900">
            {s.settingsReady}
            <span className="text-base font-medium text-slate-500">
              /{s.settingsTotal}
            </span>
          </p>
          <p className="mt-2 text-xs text-slate-600">{t?.settingsHint}</p>
        </article>
      </div>
    </section>
  );
}
