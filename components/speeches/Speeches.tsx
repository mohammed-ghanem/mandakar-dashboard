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
  useGetSpeechesQuery,
  useToggleSpeechStatusMutation,
  useDeleteSpeechMutation,
} from "@/store/speeches/speechesApi";
import { ISpeechListItem } from "@/types/speeches";

import { Column, DataTable } from "../datatable/DataTable";
import { toast } from "sonner";
import { Edit3, Megaphone } from "lucide-react";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

export default function Speeches() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang].speeches;
  const pg = translate?.pages.speeches;

  const { data: speechesData = [], isLoading } = useGetSpeechesQuery(
    undefined,
    { skip: !sessionReady },
  );

  const speeches: ISpeechListItem[] = speechesData.map((speech) => ({
    id: speech.id,
    title_ar: speech.title?.ar ?? "",
    title_en: speech.title?.en ?? "",
    category_name:
      speech.category?._name ??
      speech.category?.name?.[lang] ??
      speech.category?.name?.ar ??
      speech.category?.name?.en ??
      "—",
    youtube_url: speech.youtube_url ?? "",
    is_active: Boolean(speech.is_active),
  }));

  const [toggleStatus] = useToggleSpeechStatusMutation();
  const [deleteSpeech] = useDeleteSpeechMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ISpeechListItem>({
      getId: (speech) => speech.id,
      getStatus: (speech) => speech.is_active,
      onToggle: async (speech) => {
        await toggleStatus(speech.id).unwrap();
      },
    });

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteSpeech(id).unwrap();
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

  const columns: Column<ISpeechListItem>[] = [
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
      render: (_, speech) => (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <Switch
            className={dash.statusSwitch}
            checked={getOptimisticStatus(speech)}
            disabled={isPending(speech)}
            onCheckedChange={(checked) => {
              void toggle(speech, checked);
            }}
          />
          <span className="text-sm text-slate-600">
            {getOptimisticStatus(speech) ? pg?.active : pg?.inactive}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, speech) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href={`/${lang}/speeches/edit/${speech.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <DeleteConfirmDialog
            title={pg?.deleteTitle ?? ""}
            description={pg?.deleteMessage ?? ""}
            confirmText={pg?.deleteBtn ?? ""}
            cancelText={pg?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(speech.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={Megaphone}
      title={pg?.speechesTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/speeches/create`}
      createLabel={pg?.createSpeech?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={speeches}
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
