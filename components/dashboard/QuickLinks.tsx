"use client";

import Link from "next/link";
import {
  BookMarked,
  BookOpen,
  FileText,
  FolderPlus,
  Mic,
  Scale,
  TvMinimalPlay,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";

type QuickItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  tone: string;
};

export default function QuickLinks() {
  const lang = LangUseParams();
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;

  const items: QuickItem[] = [
    {
      href: `/${lang}/lectures/create`,
      icon: TvMinimalPlay,
      labelKey: "quickLecture",
      tone: "hover:border-emerald-300 hover:bg-emerald-50/50",
    },
    {
      href: `/${lang}/speeches/create`,
      icon: Mic,
      labelKey: "quickSpeech",
      tone: "hover:border-teal-300 hover:bg-teal-50/50",
    },
    {
      href: `/${lang}/articles/create`,
      icon: FileText,
      labelKey: "quickArticle",
      tone: "hover:border-cyan-300 hover:bg-cyan-50/40",
    },
    {
      href: `/${lang}/explanations/create`,
      icon: BookOpen,
      labelKey: "quickExplanation",
      tone: "hover:border-sky-300 hover:bg-sky-50/40",
    },
    {
      href: `/${lang}/fatwas/create`,
      icon: Scale,
      labelKey: "quickFatwa",
      tone: "hover:border-amber-300 hover:bg-amber-50/40",
    },
    {
      href: `/${lang}/books/create`,
      icon: BookMarked,
      labelKey: "quickBook",
      tone: "hover:border-lime-300 hover:bg-lime-50/40",
    },
    {
      href: `/${lang}/lectures/categories/create`,
      icon: FolderPlus,
      labelKey: "quickCategory",
      tone: "hover:border-emerald-300 hover:bg-emerald-50/40",
    },
    {
      href: `/${lang}/admins/create`,
      icon: UserPlus,
      labelKey: "quickAdmin",
      tone: "hover:border-slate-300 hover:bg-slate-50",
    },
  ];

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.quickTitle}</h2>
        <p className="text-sm text-slate-600">{t?.quickDescription}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex flex-col items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4",
              "shadow-sm ring-1 ring-slate-900/3 transition",
              item.tone,
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200/80 transition group-hover:bg-white">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 leading-snug">
              {t?.[item.labelKey]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
