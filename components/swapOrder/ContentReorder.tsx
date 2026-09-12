"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, FolderTree, Layers2, Network } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import IndexListPage from "@/components/shared/IndexListPage";
import ContentGroupPicker from "@/components/swapOrder/ContentGroupPicker";
import SwapOrderList from "@/components/swapOrder/SwapOrderList";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetCategoriesTreeQuery } from "@/store/categories/categoriesApi";
import { cn } from "@/lib/utils";
import type { ContentReorderConfig } from "@/constants/reorderResources";
import type { ICategory } from "@/types/categories";
import type { IContentItem } from "@/types/contentResource";
import type { SwapOrderItem, SwapOrderType } from "@/types/swapOrder";

type MainTabKey = "items" | "categories";
type CategoryLevelKey = "root" | "sub" | "subSub";

type ReorderGroup = {
  key: string;
  parentLabel?: string;
  type: SwapOrderType;
  items: SwapOrderItem[];
};

type Props = {
  config: ContentReorderConfig;
};

function sortByOrder<T extends { id: number; sort_order?: number }>(list: T[]) {
  const hasOrder = list.some((item) => (item.sort_order ?? 0) > 0);
  if (!hasOrder) return [...list];
  return [...list].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
  );
}

function categoryLabel(item: ICategory, lang: "ar" | "en") {
  return (
    item._name ||
    item.name?.[lang] ||
    item.name?.ar ||
    item.name?.en ||
    `#${item.id}`
  );
}

function toSwapItems(list: ICategory[], lang: "ar" | "en"): SwapOrderItem[] {
  return sortByOrder(list).map((item) => ({
    id: item.id,
    label: categoryLabel(item, lang),
  }));
}

function toContentItemLabel(item: IContentItem, lang: "ar" | "en") {
  return (
    item._title ||
    item.title?.[lang] ||
    item.title?.ar ||
    item.title?.en ||
    `#${item.id}`
  );
}

function contentCategoryLabel(item: IContentItem, lang: "ar" | "en") {
  const category = item.category;
  if (!category) return null;
  return (
    category._name ||
    category.name?.[lang] ||
    category.name?.ar ||
    category.name?.en ||
    null
  );
}

/** Group content by category so swaps stay within the same backend scope. */
function buildContentGroups(
  list: IContentItem[],
  contentType: SwapOrderType,
  lang: "ar" | "en",
  uncategorizedLabel: string,
): ReorderGroup[] {
  const buckets = new Map<
    string,
    { categoryId: number | null; parentLabel: string; items: IContentItem[] }
  >();

  for (const item of list) {
    const categoryId =
      item.category_id != null && Number.isFinite(Number(item.category_id))
        ? Number(item.category_id)
        : item.category?.id != null
          ? Number(item.category.id)
          : null;

    const key = categoryId == null ? "none" : String(categoryId);
    const existing = buckets.get(key);
    if (existing) {
      existing.items.push(item);
      continue;
    }

    buckets.set(key, {
      categoryId,
      parentLabel:
        contentCategoryLabel(item, lang) ||
        (categoryId == null ? uncategorizedLabel : `#${categoryId}`),
      items: [item],
    });
  }

  return [...buckets.values()]
    .sort((a, b) => {
      if (a.categoryId == null) return 1;
      if (b.categoryId == null) return -1;
      return a.parentLabel.localeCompare(b.parentLabel, lang);
    })
    .map((bucket) => ({
      key: `content-${bucket.categoryId ?? "none"}`,
      parentLabel: bucket.parentLabel,
      type: contentType,
      items: sortByOrder(bucket.items).map((item) => ({
        id: item.id,
        label: toContentItemLabel(item, lang),
      })),
    }));
}

function buildRootGroups(
  tree: ICategory[],
  lang: "ar" | "en",
): ReorderGroup[] {
  const items = toSwapItems(tree, lang);
  if (!items.length) return [];
  return [
    {
      key: "root",
      type: "categories",
      items,
    },
  ];
}

function buildSubGroups(
  tree: ICategory[],
  lang: "ar" | "en",
): ReorderGroup[] {
  return tree.flatMap((root) => {
    const children = root.children ?? [];
    if (!children.length) return [];
    return [
      {
        key: `sub-${root.id}`,
        parentLabel: categoryLabel(root, lang),
        type: "sub_categories" as const,
        items: toSwapItems(children, lang),
      },
    ];
  });
}

function buildSubSubGroups(
  tree: ICategory[],
  lang: "ar" | "en",
): ReorderGroup[] {
  return tree.flatMap((root) =>
    (root.children ?? []).flatMap((sub) => {
      const children = sub.children ?? [];
      if (!children.length) return [];
      return [
        {
          key: `subsub-${sub.id}`,
          parentLabel: `${categoryLabel(root, lang)} › ${categoryLabel(sub, lang)}`,
          type: "sub_sub_categories" as const,
          items: toSwapItems(children, lang),
        },
      ];
    }),
  );
}

export default function ContentReorder({ config }: Props) {
  const { contentType, icon: ItemsIcon, moduleLabelKey, useGetListQuery } =
    config;

  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.swapOrder;
  const dashboard = translate?.pages?.dashboard;
  const sessionReady = useSessionReady();
  const [mainTab, setMainTab] = useState<MainTabKey>("items");
  const [categoryLevel, setCategoryLevel] =
    useState<CategoryLevelKey>("root");
  const [contentGroupKey, setContentGroupKey] = useState<string>("");

  const { data: contentList = [], isLoading: contentLoading } = useGetListQuery(
    undefined,
    { skip: !sessionReady },
  );

  const { data: categoryTree = [], isLoading: categoriesLoading } =
    useGetCategoriesTreeQuery({ type: contentType }, { skip: !sessionReady });

  const contentGroups = useMemo(
    () =>
      buildContentGroups(
        contentList as IContentItem[],
        contentType,
        lang,
        t?.uncategorized ?? (lang === "ar" ? "بدون قسم" : "Uncategorized"),
      ),
    [contentList, contentType, lang, t?.uncategorized],
  );

  useEffect(() => {
    if (!contentGroups.length) {
      setContentGroupKey("");
      return;
    }
    const stillValid = contentGroups.some(
      (group) => group.key === contentGroupKey,
    );
    if (!stillValid) {
      setContentGroupKey(contentGroups[0].key);
    }
  }, [contentGroups, contentGroupKey]);

  const activeContentGroup =
    contentGroups.find((group) => group.key === contentGroupKey) ??
    contentGroups[0];

  const categoryGroups = useMemo(() => {
    if (categoryLevel === "root") return buildRootGroups(categoryTree, lang);
    if (categoryLevel === "sub") return buildSubGroups(categoryTree, lang);
    return buildSubSubGroups(categoryTree, lang);
  }, [categoryTree, categoryLevel, lang]);

  const itemsTabLabel = dashboard?.[moduleLabelKey] ?? t?.tabItems;

  const mainTabs = [
    { key: "items" as const, label: itemsTabLabel, icon: ItemsIcon },
    {
      key: "categories" as const,
      label: t?.tabCategories ?? t?.tabRootCategories,
      icon: FolderTree,
    },
  ];

  const categoryLevels = [
    {
      key: "root" as const,
      label: t?.levelRoot ?? t?.tabRootCategories,
      icon: FolderTree,
      hint: t?.rootCategoriesHint ?? t?.categoriesHint,
      empty: t?.emptyRootCategories ?? t?.emptyCategories,
    },
    {
      key: "sub" as const,
      label: t?.levelSub,
      icon: Layers2,
      hint: t?.subCategoriesHint,
      empty: t?.emptySubCategories,
    },
    {
      key: "subSub" as const,
      label: t?.levelSubSub,
      icon: Network,
      hint: t?.subSubCategoriesHint,
      empty: t?.emptySubSubCategories,
    },
  ];

  const activeLevelMeta =
    categoryLevels.find((level) => level.key === categoryLevel) ??
    categoryLevels[0];

  const listLabels = {
    positionLabel: t?.position ?? "",
    titleLabel: t?.itemTitle ?? "",
    actionsLabel: t?.actions ?? "",
    moveUpLabel: t?.moveUp ?? "",
    moveDownLabel: t?.moveDown ?? "",
    goToLabel: t?.goTo ?? "",
  };

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
          {mainTabs.map(({ key, label, icon: Icon }) => {
            const active = mainTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMainTab(key)}
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

        {mainTab === "items" ? (
          <>
            {contentLoading ? (
              <SwapOrderList
                type={contentType}
                items={[]}
                isLoading
                emptyLabel={t?.emptyItems ?? ""}
                {...listLabels}
              />
            ) : contentGroups.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                {t?.emptyItems}
              </p>
            ) : (
              <>
                <ContentGroupPicker
                  groups={contentGroups}
                  activeKey={activeContentGroup?.key}
                  onChange={setContentGroupKey}
                />

                <p className="text-sm text-slate-600">{t?.itemsHint}</p>

                {activeContentGroup ? (
                  <SwapOrderList
                    type={activeContentGroup.type}
                    items={activeContentGroup.items}
                    emptyLabel={t?.emptyItems ?? ""}
                    {...listLabels}
                  />
                ) : null}
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-slate-200/80">
              {categoryLevels.map(({ key, label, icon: Icon }) => {
                const active = categoryLevel === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategoryLevel(key)}
                    className={cn(
                      "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors sm:flex-none",
                      active
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-slate-600">{activeLevelMeta.hint}</p>

            {categoriesLoading ? (
              <SwapOrderList
                type="categories"
                items={[]}
                isLoading
                emptyLabel={activeLevelMeta.empty ?? ""}
                {...listLabels}
              />
            ) : categoryGroups.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                {activeLevelMeta.empty}
              </p>
            ) : (
              <div className="space-y-6">
                {categoryGroups.map((group) => (
                  <section
                    key={group.key}
                    className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-3 md:p-4"
                  >
                    {group.parentLabel ? (
                      <header className="flex flex-wrap items-center gap-2 px-1">
                        <span className="inline-flex h-7 items-center rounded-lg bg-white px-2.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                          {t?.underParent ?? "تحت"}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {group.parentLabel}
                        </h3>
                      </header>
                    ) : null}

                    <SwapOrderList
                      type={group.type}
                      items={group.items}
                      emptyLabel={activeLevelMeta.empty ?? ""}
                      {...listLabels}
                    />
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </IndexListPage>
  );
}
