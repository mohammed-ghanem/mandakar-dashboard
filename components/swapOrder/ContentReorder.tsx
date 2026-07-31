"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, FolderTree } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import IndexListPage from "@/components/shared/IndexListPage";
import SwapOrderList from "@/components/swapOrder/SwapOrderList";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetCategoriesTreeQuery } from "@/store/categories/categoriesApi";
import { cn } from "@/lib/utils";
import type { ContentReorderConfig } from "@/constants/reorderResources";
import type { IContentItem } from "@/types/contentResource";
import type { SwapOrderItem } from "@/types/swapOrder";

type TabKey = "items" | "categories";

type Props = {
  config: ContentReorderConfig;
};

function toOrderedContentItems(
  list: IContentItem[],
  lang: "ar" | "en",
): SwapOrderItem[] {
  const hasOrder = list.some((item) => (item.sort_order ?? 0) > 0);
  const sorted = hasOrder
    ? [...list].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
      )
    : [...list];

  return sorted.map((item) => ({
    id: item.id,
    label:
      item._title ||
      item.title?.[lang] ||
      item.title?.ar ||
      item.title?.en ||
      `#${item.id}`,
  }));
}

export default function ContentReorder({ config }: Props) {
  const { contentType, icon: ItemsIcon, moduleLabelKey, useGetListQuery } =
    config;

  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.swapOrder;
  const dashboard = translate?.pages?.dashboard;
  const sessionReady = useSessionReady();
  const [tab, setTab] = useState<TabKey>("items");

  const { data: contentList = [], isLoading: contentLoading } = useGetListQuery(
    undefined,
    { skip: !sessionReady },
  );

  const { data: categoryTree = [], isLoading: categoriesLoading } =
    useGetCategoriesTreeQuery({ type: contentType }, { skip: !sessionReady });

  const contentItems = useMemo(
    () => toOrderedContentItems(contentList as IContentItem[], lang),
    [contentList, lang],
  );

  const categoryItems: SwapOrderItem[] = useMemo(() => {
    const hasOrder = categoryTree.some((item) => (item.sort_order ?? 0) > 0);
    const roots = hasOrder
      ? [...categoryTree].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
        )
      : [...categoryTree];

    return roots.map((item) => ({
      id: item.id,
      label:
        item._name ||
        item.name?.[lang] ||
        item.name?.ar ||
        item.name?.en ||
        `#${item.id}`,
    }));
  }, [categoryTree, lang]);

  const itemsTabLabel = dashboard?.[moduleLabelKey] ?? t?.tabItems;

  const tabs = [
    { key: "items" as const, label: itemsTabLabel, icon: ItemsIcon },
    {
      key: "categories" as const,
      label: t?.tabRootCategories,
      icon: FolderTree,
    },
  ];

  return (
    <IndexListPage
      icon={ArrowUpDown}
      title={t?.title ?? ""}
      description={t?.description}
      createHref=""
      createLabel=""
      showCreate={false}
      showSkeleton={!sessionReady}
    >
      <div className="space-y-5 px-2 md:px-4">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50/80 p-1.5 ring-1 ring-slate-200/80">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                  active
                    ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200/70"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-slate-600">
          {tab === "items" ? t?.itemsHint : t?.categoriesHint}
        </p>

        {tab === "items" ? (
          <SwapOrderList
            type={contentType}
            items={contentItems}
            isLoading={contentLoading}
            emptyLabel={t?.emptyItems ?? ""}
            positionLabel={t?.position ?? ""}
            titleLabel={t?.itemTitle ?? ""}
            actionsLabel={t?.actions ?? ""}
            moveUpLabel={t?.moveUp ?? ""}
            moveDownLabel={t?.moveDown ?? ""}
            goToLabel={t?.goTo ?? ""}
          />
        ) : (
          <SwapOrderList
            type="categories"
            items={categoryItems}
            isLoading={categoriesLoading}
            emptyLabel={t?.emptyCategories ?? ""}
            positionLabel={t?.position ?? ""}
            titleLabel={t?.itemTitle ?? ""}
            actionsLabel={t?.actions ?? ""}
            moveUpLabel={t?.moveUp ?? ""}
            moveDownLabel={t?.moveDown ?? ""}
            goToLabel={t?.goTo ?? ""}
          />
        )}
      </div>
    </IndexListPage>
  );
}
