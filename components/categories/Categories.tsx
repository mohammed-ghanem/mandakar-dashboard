/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Folder,
  FolderOpen,
  FolderTree,
  GitBranch,
  Search,
} from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import {
  useGetCategoriesTreeQuery,
  useToggleCategoryStatusMutation,
  useDeleteCategoryMutation,
} from "@/store/categories/categoriesApi";
import { ICategory } from "@/types/categories";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import IndexListPage from "@/components/shared/IndexListPage";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

function categoryName(category: ICategory, lang: "ar" | "en") {
  return lang === "ar"
    ? category.name?.ar || category._name || ""
    : category.name?.en || category._name || "";
}

function countDescendants(category: ICategory): number {
  return (category.children ?? []).reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0,
  );
}

function filterTree(
  nodes: ICategory[],
  query: string,
  lang: "ar" | "en",
): ICategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const walk = (list: ICategory[]): ICategory[] => {
    const result: ICategory[] = [];
    for (const node of list) {
      const selfMatch = categoryName(node, lang).toLowerCase().includes(q);
      const kids = walk(node.children ?? []);
      if (selfMatch) {
        result.push(node);
      } else if (kids.length > 0) {
        result.push({ ...node, children: kids });
      }
    }
    return result;
  };

  return walk(nodes);
}

type ActionsProps = {
  category: ICategory;
  lang: "ar" | "en";
  activeLabel?: string;
  inactiveLabel?: string;
  deleteTitle: string;
  deleteMessage: string;
  deleteBtn: string;
  cancelBtn: string;
  getOptimisticStatus: (c: ICategory) => boolean;
  isPending: (c: ICategory) => boolean;
  onToggle: (category: ICategory, checked: boolean) => void;
  onDelete: (id: number) => void;
  compact?: boolean;
};

function CategoryActions({
  category,
  lang,
  activeLabel,
  inactiveLabel,
  deleteTitle,
  deleteMessage,
  deleteBtn,
  cancelBtn,
  getOptimisticStatus,
  isPending,
  onToggle,
  onDelete,
  compact,
}: ActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-2",
          compact &&
            "rounded-lg bg-white/90 px-2 py-1 ring-1 ring-slate-200/70",
        )}
        dir="ltr"
      >
        <Switch
          className={dash.statusSwitch}
          checked={getOptimisticStatus(category)}
          disabled={isPending(category)}
          onCheckedChange={(checked) => onToggle(category, checked)}
        />
        <span className="text-xs text-slate-600 whitespace-nowrap">
          {getOptimisticStatus(category) ? activeLabel : inactiveLabel}
        </span>
      </div>

      <Link href={`/${lang}/categories/edit/${category.id}`}>
        <Button type="button" size="sm" className={dash.tableEdit}>
          <Edit3 className="h-4 w-4" />
        </Button>
      </Link>

      <DeleteConfirmDialog
        title={deleteTitle}
        description={deleteMessage}
        confirmText={deleteBtn}
        cancelText={cancelBtn}
        onConfirm={() => onDelete(category.id)}
      />
    </div>
  );
}

type BranchProps = {
  category: ICategory;
  lang: "ar" | "en";
  isLast: boolean;
  depthLabel: (depth: number) => string | undefined;
  actions: Omit<ActionsProps, "category" | "compact">;
};

function CategoryBranch({
  category,
  lang,
  isLast,
  depthLabel,
  actions,
}: BranchProps) {
  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const name = categoryName(category, lang);

  return (
    <li className="relative">
      {!isLast ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 inset-s-3 w-px bg-emerald-200/90"
        />
      ) : null}

      <div className="relative flex gap-3 pb-3">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-s-3 top-0 h-5 w-4 border-emerald-200/90",
            "border-s border-b rounded-es-lg",
          )}
        />

        <div className="ms-7 min-w-0 flex-1">
          <div
            className={cn(
              "flex flex-col gap-3 rounded-xl border bg-white/95 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
              category.depth === 2
                ? "border-teal-200/80 ring-1 ring-teal-900/4"
                : "border-slate-200/80 ring-1 ring-slate-900/3",
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  hasChildren
                    ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200/70"
                    : "bg-slate-50 text-slate-600 ring-1 ring-slate-200/80",
                )}
              >
                {hasChildren ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 space-y-1">
                <p className="truncate font-semibold text-slate-900">{name}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-md text-[11px]",
                      category.depth === 2
                        ? "bg-teal-50 text-teal-900 ring-1 ring-teal-200/70"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80",
                    )}
                  >
                    {depthLabel(category.depth)}
                  </Badge>
                  {hasChildren ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <GitBranch className="h-3 w-3" />
                      {children.length}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <CategoryActions category={category} {...actions} compact />
          </div>

          {hasChildren ? (
            <ul className="mt-2 space-y-0 ps-1">
              {children.map((child, index) => (
                <CategoryBranch
                  key={child.id}
                  category={child}
                  lang={lang}
                  isLast={index === children.length - 1}
                  depthLabel={depthLabel}
                  actions={actions}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}

type TreeCardProps = {
  root: ICategory;
  lang: "ar" | "en";
  depthLabel: (depth: number) => string | undefined;
  childrenLabel?: string;
  emptyChildren?: string;
  actions: Omit<ActionsProps, "category" | "compact">;
};

function CategoryTreeCard({
  root,
  lang,
  depthLabel,
  childrenLabel,
  emptyChildren,
  actions,
}: TreeCardProps) {
  const [expanded, setExpanded] = useState(true);
  const children = root.children ?? [];
  const total = countDescendants(root);
  const name = categoryName(root, lang);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-emerald-200/80",
        "bg-linear-to-br from-white via-emerald-50/25 to-teal-50/30",
        "shadow-md shadow-emerald-950/5 ring-1 ring-emerald-900/5",
      )}
    >
      <div
        className="flex flex-col gap-4 border-b border-emerald-100/90
      bg-[#00796b] px-4 py-4 text-white md:flex-row md:items-center md:justify-between
       md:px-5"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <FolderTree className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <h3 className="truncate text-lg font-bold leading-tight">{name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-md border-0 bg-white/20 text-white hover:bg-white/25">
                {depthLabel(root.depth)}
              </Badge>
              <span className="inline-flex items-center gap-1 rounded-md bg-black/15 px-2 py-0.5 text-xs">
                <GitBranch className="h-3 w-3 opacity-90" />
                {total} {childrenLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-1.5 ring-1 ring-white/20"
            dir="ltr"
          >
            <Switch
              className="data-[state=checked]:bg-emerald-300 data-[state=unchecked]:bg-white/40"
              checked={actions.getOptimisticStatus(root)}
              disabled={actions.isPending(root)}
              onCheckedChange={(checked) => actions.onToggle(root, checked)}
            />
            <span className="text-xs text-white/90">
              {actions.getOptimisticStatus(root)
                ? actions.activeLabel
                : actions.inactiveLabel}
            </span>
          </div>

          <Link href={`/${lang}/categories/edit/${root.id}`}>
            <Button
              type="button"
              size="sm"
              className="rounded-xl bg-white text-emerald-800 hover:bg-emerald-50"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <div className="[&_button]:rounded-xl [&_button]:border-white/25 [&_button]:bg-white/15 [&_button]:text-white [&_button]:hover:bg-white/25">
            <DeleteConfirmDialog
              title={actions.deleteTitle}
              description={actions.deleteMessage}
              confirmText={actions.deleteBtn}
              cancelText={actions.cancelBtn}
              onConfirm={() => actions.onDelete(root.id)}
            />
          </div>

          {children.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-xl text-white hover:bg-white/15 hover:text-white"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="px-3 py-4 md:px-5 md:py-5">
          {children.length === 0 ? (
            <p className="rounded-xl border border-dashed border-emerald-200/80 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
              {emptyChildren}
            </p>
          ) : (
            <ul className="space-y-0">
              {children.map((child, index) => (
                <CategoryBranch
                  key={child.id}
                  category={child}
                  lang={lang}
                  isLast={index === children.length - 1}
                  depthLabel={depthLabel}
                  actions={actions}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function Categories() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const pg = translate?.pages.categories;

  const [search, setSearch] = useState("");

  const { data: tree = [], isLoading } = useGetCategoriesTreeQuery(undefined, {
    skip: !sessionReady,
  });

  const filteredTree = useMemo(
    () => filterTree(tree, search, lang),
    [tree, search, lang],
  );

  const [toggleStatus] = useToggleCategoryStatusMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ICategory>({
      getId: (category) => category.id,
      getStatus: (category) => category.is_active,
      onToggle: async (category) => {
        await toggleStatus(category.id).unwrap();
      },
    });

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteCategory(id).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;

      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }

      if (errorData?.message) {
        toast.error(errorData.message);
      }
    }
  };

  const depthLabel = (depth: number) => {
    if (depth <= 1) return pg?.rootLevel;
    if (depth === 2) return pg?.subLevel;
    return pg?.subSubLevel;
  };

  const actions: Omit<ActionsProps, "category" | "compact"> = {
    lang,
    activeLabel: pg?.active,
    inactiveLabel: pg?.inactive,
    deleteTitle: pg?.deleteTitle ?? "",
    deleteMessage: pg?.deleteMessage ?? "",
    deleteBtn: pg?.deleteBtn ?? "",
    cancelBtn: pg?.cancelBtn ?? "",
    getOptimisticStatus,
    isPending,
    onToggle: (category, checked) => {
      void toggle(category, checked);
    },
    onDelete: handleDelete,
  };

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={FolderTree}
      title={pg?.categoriesTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/categories/create`}
      createLabel={pg?.createCategory?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <div className="space-y-5 px-2 md:px-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 inset-s-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={pg?.searchPlaceholder}
            className={cn("h-11 ps-9", dash.input)}
          />
        </div>

        {showSkeleton ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-12 text-center text-sm text-slate-500">
            {pg?.emptyTree}
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredTree.map((root) => (
              <CategoryTreeCard
                key={root.id}
                root={root}
                lang={lang}
                depthLabel={depthLabel}
                childrenLabel={pg?.childrenCount}
                emptyChildren={pg?.noChildren}
                actions={actions}
              />
            ))}
          </div>
        )}
      </div>
    </IndexListPage>
  );
}
