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
  useGetLecturesQuery,
  useToggleLectureStatusMutation,
  useDeleteLectureMutation,
} from "@/store/lectures/lecturesApi";
import { ILectureListItem } from "@/types/lectures";

import { Column, DataTable } from "../datatable/DataTable";
import { toast } from "sonner";
import { Edit3, Mic2 } from "lucide-react";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

export default function Lectures() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang].lectures;
  const pg = translate?.pages.lectures;

  const { data: lecturesData = [], isLoading } = useGetLecturesQuery(
    undefined,
    { skip: !sessionReady },
  );

  const lectures: ILectureListItem[] = lecturesData.map((lecture) => ({
    id: lecture.id,
    title_ar: lecture.title?.ar ?? "",
    title_en: lecture.title?.en ?? "",
    category_name:
      lecture.category?._name ??
      lecture.category?.name?.[lang] ??
      lecture.category?.name?.ar ??
      lecture.category?.name?.en ??
      "—",
    youtube_url: lecture.youtube_url ?? "",
    is_active: Boolean(lecture.is_active),
  }));

  const [toggleStatus] = useToggleLectureStatusMutation();
  const [deleteLecture] = useDeleteLectureMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ILectureListItem>({
      getId: (lecture) => lecture.id,
      getStatus: (lecture) => lecture.is_active,
      onToggle: async (lecture) => {
        await toggleStatus(lecture.id).unwrap();
      },
    });

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteLecture(id).unwrap();
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

  const columns: Column<ILectureListItem>[] = [
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
      render: (_, lecture) => (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <Switch
            className={dash.statusSwitch}
            checked={getOptimisticStatus(lecture)}
            disabled={isPending(lecture)}
            onCheckedChange={(checked) => {
              void toggle(lecture, checked);
            }}
          />
          <span className="text-sm text-slate-600">
            {getOptimisticStatus(lecture) ? pg?.active : pg?.inactive}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, lecture) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href={`/${lang}/lectures/edit/${lecture.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <DeleteConfirmDialog
            title={pg?.deleteTitle ?? ""}
            description={pg?.deleteMessage ?? ""}
            confirmText={pg?.deleteBtn ?? ""}
            cancelText={pg?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(lecture.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={Mic2}
      title={pg?.lecturesTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/lectures/create`}
      createLabel={pg?.createLecture?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={lectures}
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
