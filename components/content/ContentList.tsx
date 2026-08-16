/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Edit3, Eye } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";

import { IContentItem, IContentListItem } from "@/types/contentResource";
import type { ContentCategoryType } from "@/constants/categoryTypes";
import {
  TABLE_TITLE_MAX_CHARS,
  truncateTableText,
} from "@/constants/tableText";

import { Column, DataTable } from "../datatable/DataTable";
import { toast } from "sonner";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

export type ContentListConfig = {
  icon: LucideIcon;
  basePath: ContentCategoryType;
  pagesKey: string;
  titleKey: string;
  createKey: string;
  tableHeadersKey: keyof (typeof TABLE_HEADERS)["en"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useGetListQuery: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useToggleStatusMutation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useDeleteMutation: any;
};

type Props = {
  config: ContentListConfig;
};

export default function ContentList({ config }: Props) {
  const {
    icon: Icon,
    basePath,
    pagesKey,
    titleKey,
    createKey,
    tableHeadersKey,
    useGetListQuery,
    useToggleStatusMutation,
    useDeleteMutation,
  } = config;

  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();

  const headers = TABLE_HEADERS[lang][tableHeadersKey] as {
    title: string;
    category: string;
    status: string;
    actions: string;
  };
  const pg = translate?.pages?.[pagesKey];

  const { data: listData = [], isLoading } = useGetListQuery(undefined, {
    skip: !sessionReady,
  });

  const items: IContentListItem[] = listData.map((item: IContentItem) => ({
    id: item.id,
    title_ar: item.title?.ar ?? "",
    title_en: item.title?.en ?? "",
    category_name:
      item.category?._name ??
      item.category?.name?.[lang] ??
      item.category?.name?.ar ??
      item.category?.name?.en ??
      "—",
    youtube_url: item.youtube_url ?? "",
    is_active: Boolean(item.is_active),
  }));

  const [toggleStatus] = useToggleStatusMutation();
  const [deleteItem] = useDeleteMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IContentListItem>({
      getId: (item) => item.id,
      getStatus: (item) => item.is_active,
      onToggle: async (item) => {
        await toggleStatus(item.id).unwrap();
      },
    });

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteItem(id).unwrap();
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

  const columns: Column<IContentListItem>[] = [
    {
      key: lang === "ar" ? "title_ar" : "title_en",
      header: headers.title,
      render: (value) => {
        const full = String(value ?? "");
        return (
          <span title={full} className="block max-w-[28rem]">
            {truncateTableText(full, TABLE_TITLE_MAX_CHARS)}
          </span>
        );
      },
    },
    {
      key: "category_name",
      header: headers.category,
    },    {
      key: "is_active",
      header: headers.status,
      align: "center",
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <Switch
            className={dash.statusSwitch}
            checked={getOptimisticStatus(item)}
            disabled={isPending(item)}
            onCheckedChange={(checked) => {
              void toggle(item, checked);
            }}
          />
          <span className="text-sm text-slate-600">
            {getOptimisticStatus(item) ? pg?.active : pg?.inactive}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, item) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href={`/${lang}/${basePath}/view/${item.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <Link href={`/${lang}/${basePath}/edit/${item.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <DeleteConfirmDialog
            title={pg?.deleteTitle ?? ""}
            description={pg?.deleteMessage ?? ""}
            confirmText={pg?.deleteBtn ?? ""}
            cancelText={pg?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(item.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={Icon}
      title={pg?.[titleKey] ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/${basePath}/create`}
      createLabel={pg?.[createKey]?.title ?? ""}
      showSkeleton={showSkeleton}
    >
      <DataTable
        data={items}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${pg?.searchPlaceholder}`}
        statusFilter={{
          key: "is_active",
          labels: {
            title: lang === "ar" ? "البحث بالحالة" : "Filter by status",
            all: lang === "ar" ? "الكل" : "All",
            active: pg?.active ?? (lang === "ar" ? "نشط" : "Active"),
            inactive: pg?.inactive ?? (lang === "ar" ? "غير نشط" : "Inactive"),
          },
        }}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
