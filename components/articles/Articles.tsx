/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";

import {
  useGetArticlesQuery,
  useToggleArticleStatusMutation,
  useDeleteArticleMutation,
} from "@/store/articles/articlesApi";
import { IArticleListItem } from "@/types/articles";

import { Column, DataTable } from "../datatable/DataTable";
import { toast } from "sonner";
import { Edit3, Newspaper } from "lucide-react";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

export default function Articles() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang].articles;
  const pg = translate?.pages.articles;

  const { data: articlesData = [], isLoading } = useGetArticlesQuery(
    undefined,
    { skip: !sessionReady },
  );

  const articles: IArticleListItem[] = articlesData.map((article) => ({
    id: article.id,
    title_ar: article.title?.ar ?? "",
    title_en: article.title?.en ?? "",
    category_name:
      article.category?._name ??
      article.category?.name?.[lang] ??
      article.category?.name?.ar ??
      article.category?.name?.en ??
      "—",
    youtube_url: article.youtube_url ?? "",
    is_active: Boolean(article.is_active),
  }));

  const [toggleStatus] = useToggleArticleStatusMutation();
  const [deleteArticle] = useDeleteArticleMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IArticleListItem>({
      getId: (article) => article.id,
      getStatus: (article) => article.is_active,
      onToggle: async (article) => {
        await toggleStatus(article.id).unwrap();
      },
    });

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteArticle(id).unwrap();
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

  const columns: Column<IArticleListItem>[] = [
    {
      key: lang === "ar" ? "title_ar" : "title_en",
      header: headers.title,
    },
    {
      key: "category_name",
      header: headers.category,
    },
    {
      key: "is_active",
      header: headers.status,
      align: "center",
      render: (_, article) => (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <Switch
            className={dash.statusSwitch}
            checked={getOptimisticStatus(article)}
            disabled={isPending(article)}
            onCheckedChange={(checked) => {
              void toggle(article, checked);
            }}
          />
          <span className="text-sm text-slate-600">
            {getOptimisticStatus(article) ? pg?.active : pg?.inactive}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, article) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href={`/${lang}/articles/edit/${article.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <DeleteConfirmDialog
            title={pg?.deleteTitle ?? ""}
            description={pg?.deleteMessage ?? ""}
            confirmText={pg?.deleteBtn ?? ""}
            cancelText={pg?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(article.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={Newspaper}
      title={pg?.articlesTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/articles/create`}
      createLabel={pg?.createArticle?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={articles}
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
