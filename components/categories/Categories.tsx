/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";

import {
  flattenCategories,
  useGetCategoriesTreeQuery,
  useToggleCategoryStatusMutation,
  useDeleteCategoryMutation,
} from "@/store/categories/categoriesApi";
import { ICategoryFlat } from "@/types/categories";

import { Column, DataTable } from "../datatable/DataTable";
import { toast } from "sonner";
import { Edit3, FolderTree } from "lucide-react";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

export default function Categories() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang].categories;
  const pg = translate?.pages.categories;

  const {
    data: tree = [],
    isLoading,
  } = useGetCategoriesTreeQuery(undefined, {
    skip: !sessionReady,
  });

  const categories = flattenCategories(tree, lang);

  const [toggleStatus] = useToggleCategoryStatusMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ICategoryFlat>({
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
        return;
      }
    }
  };

  const depthLabel = (depth: number) => {
    if (depth <= 1) return pg?.rootLevel;
    if (depth === 2) return pg?.subLevel;
    return pg?.subSubLevel;
  };

  const columns: Column<ICategoryFlat>[] = [
    {
      key: lang === "ar" ? "name_ar" : "name_en",
      header: headers.name,
      render: (_, category) => (
        <div
          className="flex items-center gap-2"
          style={{
            paddingInlineStart: `${Math.max(0, (category.depth - 1) * 16)}px`,
          }}
        >
          <span className="font-medium">
            {lang === "ar" ? category.name_ar : category.name_en}
          </span>
        </div>
      ),
    },
    {
      key: "depth",
      header: headers.level,
      render: (_, category) => (
        <Badge
          variant="secondary"
          className="rounded-lg bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
        >
          {depthLabel(category.depth)}
        </Badge>
      ),
    },
    {
      key: "parent_name",
      header: headers.parent,
      render: (value) => value || "—",
    },
    {
      key: "is_active",
      header: headers.status,
      align: "center",
      render: (_, category) => (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <Switch
            className={dash.statusSwitch}
            checked={getOptimisticStatus(category)}
            disabled={isPending(category)}
            onCheckedChange={(checked) => {
              void toggle(category, checked);
            }}
          />
          <span className="text-sm text-slate-600">
            {getOptimisticStatus(category) ? pg?.active : pg?.inactive}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, category) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href={`/${lang}/categories/edit/${category.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <DeleteConfirmDialog
            title={pg?.deleteTitle ?? ""}
            description={pg?.deleteMessage ?? ""}
            confirmText={pg?.deleteBtn ?? ""}
            cancelText={pg?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(category.id)}
          />
        </div>
      ),
    },
  ];

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
      <DataTable
        data={categories}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${pg?.searchPlaceholder}`}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
