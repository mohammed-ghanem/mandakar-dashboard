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
import { toast } from "sonner";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { getAccent, type AccentKey } from "@/constants/navAccents";

type QuickItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  accent: AccentKey;
  module: string;
};

export default function QuickLinks() {
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { canAccessHref, isReady } = useUserPermissions();

  const deniedMessage =
    t?.noPermission ?? "You do not have permission to access this page.";

  const items: QuickItem[] = [
    {
      href: `/${lang}/lectures/create`,
      icon: TvMinimalPlay,
      labelKey: "quickLecture",
      accent: "olive",
      module: "lectures",
    },
    {
      href: `/${lang}/speeches/create`,
      icon: Mic,
      labelKey: "quickSpeech",
      accent: "copper",
      module: "speeches",
    },
    {
      href: `/${lang}/articles/create`,
      icon: FileText,
      labelKey: "quickArticle",
      accent: "sapphire",
      module: "articles",
    },
    {
      href: `/${lang}/explanations/create`,
      icon: BookOpen,
      labelKey: "quickExplanation",
      accent: "teal",
      module: "explanations",
    },
    {
      href: `/${lang}/fatwas/create`,
      icon: Scale,
      labelKey: "quickFatwa",
      accent: "ochre",
      module: "fatwas",
    },
    {
      href: `/${lang}/books/create`,
      icon: BookMarked,
      labelKey: "quickBook",
      accent: "wine",
      module: "books",
    },
    {
      href: `/${lang}/lectures/categories/create`,
      icon: FolderPlus,
      labelKey: "quickCategory",
      accent: "bronze",
      module: "lectures",
    },
    {
      href: `/${lang}/admins/create`,
      icon: UserPlus,
      labelKey: "quickAdmin",
      accent: "slate",
      module: "admins",
    },
  ];

  const visibleItems = isReady
    ? items.filter((item) => canAccessHref(item.href, lang))
    : [];

  if (!isReady || visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.quickTitle}</h2>
        <p className="text-sm text-slate-600">{t?.quickDescription}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {visibleItems.map((item) => {
          const tone = getAccent(item.accent);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (!canAccessHref(item.href, lang)) {
                  event.preventDefault();
                  toast.error(deniedMessage);
                }
              }}
              className={cn(
                "group flex flex-col items-start gap-3 rounded-2xl border border-[#e4d3b4]/60 p-4",
                "bg-linear-to-br shadow-sm ring-1 transition duration-300",
                "hover:-translate-y-0.5 hover:shadow-md",
                tone.wash,
                tone.ring,
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5 transition group-hover:scale-105",
                  tone.chip,
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-slate-800 leading-snug">
                {t?.[item.labelKey]}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
