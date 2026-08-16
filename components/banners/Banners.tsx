/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Edit3, Eye, PanelsTopLeft } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { Column, DataTable } from "@/components/datatable/DataTable";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";
import {
  useDeleteBannerMutation,
  useGetBannersQuery,
  useToggleBannerStatusMutation,
} from "@/store/banners/bannersApi";
import type { IBanner, IBannerListItem } from "@/types/banners";

export default function Banners() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const pg = translate?.pages?.banners;
  const headers = TABLE_HEADERS[lang].banners;

  const { data: listData = [], isLoading } = useGetBannersQuery(undefined, {
    skip: !sessionReady,
  });

  const items: IBannerListItem[] = listData.map((item: IBanner) => ({
    id: item.id,
    title_ar: item.title?.ar ?? "",
    title_en: item.title?.en ?? "",
    category: item.category ?? "—",
    url: item.url ?? "",
    image: item.image ?? "",
    is_active: Boolean(item.is_active),
  }));

  const [toggleStatus] = useToggleBannerStatusMutation();
  const [deleteItem] = useDeleteBannerMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IBannerListItem>({
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
      if (errorData?.message) toast.error(errorData.message);
    }
  };

  const categoryLabel = (value: string) => {
    const map = pg?.categories as Record<string, string> | undefined;
    return map?.[value] ?? value;
  };

  const columns: Column<IBannerListItem>[] = [
    {
      key: lang === "ar" ? "title_ar" : "title_en",
      header: headers.title,
    },
    {
      key: "category",
      header: headers.category,
      render: (value) => categoryLabel(String(value)),
    },
    {
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
          <Link href={`/${lang}/banners/view/${item.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/${lang}/banners/edit/${item.id}`}>
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
      icon={PanelsTopLeft}
      title={pg?.bannersTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/banners/create`}
      createLabel={pg?.createBanner?.title ?? ""}
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
