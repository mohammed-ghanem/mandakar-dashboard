"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  FolderTree,
  GitBranch,
  Search,
} from "lucide-react";

import { ICategory } from "@/types/categories";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function categoryName(category: ICategory, lang: "ar" | "en") {
  return lang === "ar"
    ? category.name?.ar || category._name || ""
    : category.name?.en || category._name || "";
}

function filterExcluded(
  nodes: ICategory[],
  excludeId?: number,
): ICategory[] {
  if (!excludeId) return nodes;

  const walk = (list: ICategory[]): ICategory[] =>
    list
      .filter((n) => n.id !== excludeId)
      .map((n) => ({
        ...n,
        children: walk(n.children ?? []),
      }));

  return walk(nodes);
}

function filterTreeByQuery(
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

function findCategoryName(
  nodes: ICategory[],
  id: number,
  lang: "ar" | "en",
): string | null {
  for (const node of nodes) {
    if (node.id === id) return categoryName(node, lang);
    const nested = findCategoryName(node.children ?? [], id, lang);
    if (nested) return nested;
  }
  return null;
}

function countDescendants(node: ICategory): number {
  return (node.children ?? []).reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0,
  );
}

export type CategoryTreeSelectProps = {
  tree: ICategory[];
  lang: "ar" | "en";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  excludeId?: number;
  searchPlaceholder?: string;
  emptyLabel?: string;
  selectedLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  defaultOpen?: boolean;
};

type NodeRowProps = {
  category: ICategory;
  lang: "ar" | "en";
  depth: number;
  selectedId: number | null;
  disabled?: boolean;
  onSelect: (id: number) => void;
};

function CategoryNodeRow({
  category,
  lang,
  depth,
  selectedId,
  disabled,
  onSelect,
}: NodeRowProps) {
  const checked = selectedId === category.id;
  const children = category.children ?? [];
  const name = categoryName(category, lang);

  return (
    <div className="space-y-1.5">
      <label
        className={cn(
          "group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
          checked
            ? "border-emerald-400 bg-emerald-50/90 shadow-sm ring-1 ring-emerald-500/20"
            : "border-transparent bg-white/80 hover:border-emerald-200 hover:bg-emerald-50/40",
          disabled && "pointer-events-none opacity-50",
        )}
        style={{ marginInlineStart: `${Math.max(0, depth - 1) * 16}px` }}
      >
        <Checkbox
          checked={checked}
          disabled={disabled}
          onCheckedChange={() => onSelect(category.id)}
          className="data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
        />
        <span
          className={cn(
            "min-w-0 flex-1 text-sm font-medium",
            checked ? "text-emerald-950" : "text-slate-800",
          )}
        >
          {name}
        </span>
        {checked ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </label>

      {children.length > 0 ? (
        <div className="relative space-y-1.5 border-s border-emerald-100 ms-4 ps-1">
          {children.map((child) => (
            <CategoryNodeRow
              key={child.id}
              category={child}
              lang={lang}
              depth={depth + 1}
              selectedId={selectedId}
              disabled={disabled}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CategoryTreeSelect({
  tree,
  lang,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  excludeId,
  searchPlaceholder,
  emptyLabel,
  selectedLabel,
  collapseLabel,
  expandLabel,
  defaultOpen = false,
}: CategoryTreeSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const roots = useMemo(() => {
    const base = filterExcluded(tree, excludeId);
    return filterTreeByQuery(base, search, lang);
  }, [tree, excludeId, search, lang]);

  const selectedId = value ? Number(value) : null;
  const selectedName =
    selectedId != null ? findCategoryName(tree, selectedId, lang) : null;

  const handleSelect = (id: number) => {
    if (disabled) return;
    if (selectedId === id) {
      onChange("");
      return;
    }
    onChange(String(id));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={cn(
            "inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm",
            selectedName
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80"
              : "bg-slate-50 text-slate-500 ring-1 ring-slate-200/80",
          )}
        >
          <Check className="h-4 w-4 shrink-0 opacity-80" />
          <span className="truncate">
            {selectedName
              ? `${selectedLabel ? `${selectedLabel} ` : ""}${selectedName}`
              : placeholder}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 rounded-xl border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {collapseLabel ?? (lang === "ar" ? "إغلاق" : "Collapse")}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {expandLabel ?? (lang === "ar" ? "فتح" : "Expand")}
            </>
          )}
        </Button>
      </div>

      {isOpen ? (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute top-1/2 inset-s-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder || placeholder}
              disabled={disabled}
              className="h-10 rounded-xl border-slate-200 bg-white ps-9 shadow-sm"
            />
          </div>

          {roots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-500">
              {emptyLabel || placeholder}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {roots.map((root) => {
                const childCount = countDescendants(root);
                const branchSelected =
                  selectedId != null &&
                  (root.id === selectedId ||
                    findCategoryName([root], selectedId, lang) != null);

                return (
                  <article
                    key={root.id}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-linear-to-br from-white via-slate-50/40 to-emerald-50/30 shadow-sm transition-all",
                      branchSelected
                        ? "border-emerald-300 ring-2 ring-emerald-500/15 shadow-emerald-900/5"
                        : "border-slate-200/90 ring-1 ring-slate-900/4",
                    )}
                  >
                    <header className="flex items-center justify-between gap-3 border-b border-emerald-100/80 bg-linear-to-r from-emerald-700 to-teal-700 px-4 py-3 text-white">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                          <FolderTree className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <h4 className="truncate font-bold leading-tight">
                            {categoryName(root, lang)}
                          </h4>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
                            <GitBranch className="h-3 w-3" />
                            {childCount}
                          </p>
                        </div>
                      </div>
                    </header>

                    <div className="space-y-1.5 p-3 md:p-4">
                      <CategoryNodeRow
                        category={root}
                        lang={lang}
                        depth={1}
                        selectedId={selectedId}
                        disabled={disabled}
                        onSelect={handleSelect}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
