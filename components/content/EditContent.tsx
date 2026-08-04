/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  Trash2,
  Link2,
  Youtube,
  FolderTree,
  Type,
  ImageIcon,
  FileText,
} from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetCategoriesTreeQuery } from "@/store/categories/categoriesApi";
import type { ContentCategoryType } from "@/constants/categoryTypes";
import {
  IContentAttachment,
  IContentLink,
} from "@/types/contentResource";

import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AdminFormSkeleton from "@/components/skeleton/AdminFormSkeleton";
import ImageDropzone from "@/components/shared/ImageDropzone";
import AudioDropzone from "@/components/shared/AudioDropzone";
import FileDropzone from "@/components/shared/FileDropzone";
import CategoryTreeSelect from "@/components/shared/CategoryTreeSelect";

const CkEditor = dynamic(() => import("@/components/ckEditor/CKEditor"), {
  ssr: false,
});

type AttachmentRow = { key: string; title: string; file: File | null };

type FormState = {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  category_id: string;
  youtube_url: string;
  is_active: boolean;
  image: File | null;
  audio: File | null;
  attachmentRows: AttachmentRow[];
  links: IContentLink[];
  seo_description: string;
  seo_keywords: string;
};

const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export type EditContentConfig = {
  icon: LucideIcon;
  basePath: ContentCategoryType;
  pagesKey: string;
  editKey: string;
  failMessage: { ar: string; en: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useGetByIdQuery: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useUpdateMutation: any;
};

type Props = {
  config: EditContentConfig;
};

export default function EditContent({ config }: Props) {
  const {
    icon: Icon,
    basePath,
    pagesKey,
    editKey,
    failMessage,
    useGetByIdQuery,
    useUpdateMutation,
  } = config;

  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.[pagesKey]?.[editKey];

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const {
    data: item,
    isLoading,
    isError,
  } = useGetByIdQuery(idNum, {
    skip: !sessionReady || invalidId,
  });

  const { data: tree = [], isLoading: treeLoading } = useGetCategoriesTreeQuery(
    { type: basePath },
    { skip: !sessionReady },
  );

  const [updateItem, { isLoading: isUpdating }] = useUpdateMutation();

  const [form, setForm] = useState<FormState>({
    title_ar: "",
    title_en: "",
    content_ar: "",
    content_en: "",
    category_id: "",
    youtube_url: "",
    is_active: true,
    image: null,
    audio: null,
    attachmentRows: [{ key: newKey(), title: "", file: null }],
    links: [{ title: "", url: "" }],
    seo_description: "",
    seo_keywords: "",
  });

  const [editorsReady, setEditorsReady] = useState(false);

  useEffect(() => {
    if (!item) return;

    setForm({
      title_ar: item.title?.ar ?? "",
      title_en: item.title?.en ?? "",
      content_ar: item.content?.ar ?? "",
      content_en: item.content?.en ?? "",
      category_id: item.category_id != null ? String(item.category_id) : "",
      youtube_url: item.youtube_url ?? "",
      is_active: Boolean(item.is_active),
      image: null,
      audio: null,
      attachmentRows: [{ key: newKey(), title: "", file: null }],
      links:
        item.links && item.links.length > 0
          ? item.links
          : [{ title: "", url: "" }],
      seo_description: item.seo?.description ?? "",
      seo_keywords: (item.seo?.keywords ?? []).join(", "),
    });
    setEditorsReady(true);
  }, [item]);

  const updateLink = (
    index: number,
    field: keyof IContentLink,
    value: string,
  ) => {
    setForm((prev) => {
      const links = [...prev.links];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, links };
    });
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { title: "", url: "" }],
    }));
  };

  const removeLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const addAttachmentRow = () => {
    setForm((prev) => ({
      ...prev,
      attachmentRows: [
        ...prev.attachmentRows,
        { key: newKey(), title: "", file: null },
      ],
    }));
  };

  const removeAttachmentRow = (key: string) => {
    setForm((prev) => ({
      ...prev,
      attachmentRows:
        prev.attachmentRows.length <= 1
          ? prev.attachmentRows
          : prev.attachmentRows.filter((r) => r.key !== key),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.category_id) {
      toast.error(t?.categoryRequired ?? "");
      return;
    }

    const toastId = toast.loading(`${t?.processing}...`);

    try {
      const attachments = form.attachmentRows
        .filter((r): r is AttachmentRow & { file: File } => r.file !== null)
        .map((r) => ({
          title: r.title.trim(),
          file: r.file,
        }));

      const res = await updateItem({
        id: idNum,
        data: {
          title_ar: form.title_ar,
          title_en: form.title_en,
          content_ar: form.content_ar,
          content_en: form.content_en,
          category_id: Number(form.category_id),
          youtube_url: form.youtube_url || undefined,
          is_active: form.is_active,
          image: form.image,
          audio: form.audio,
          attachments,
          links: form.links,
          seo_description: form.seo_description || undefined,
          seo_keywords: form.seo_keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
      }).unwrap();

      toast.success(res?.message, { id: toastId });
      router.push(`/${lang}/${basePath}`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        toast.dismiss(toastId);
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
      toast.error(errorData?.message || failMessage[lang], { id: toastId });
    }
  };

  if (!sessionReady || isLoading || treeLoading || !editorsReady) {
    return <AdminFormSkeleton />;
  }

  if (invalidId || isError || !item) {
    return (
      <div className={dash.formPage}>
        <Card className={dash.formCard}>
          <CardContent className="py-10 text-center text-slate-600">
            {t?.notFound}
          </CardContent>
        </Card>
      </div>
    );
  }

  const existingAttachments = item.attachments ?? [];

  return (
    <div className={dash.formPageWide}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Icon className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className={cn(dash.cohortSectionHeadingBadge, "mb-5")}>
                <Type className="h-4 w-4" />
                {t?.titlesBox}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                    )}
                  >
                    {t?.titleAr}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.title_ar}
                    onChange={(e) =>
                      setForm({ ...form, title_ar: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                    )}
                  >
                    {t?.titleEn}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.title_en}
                    onChange={(e) =>
                      setForm({ ...form, title_en: e.target.value })
                    }
                  />
                  <span className="text-sm text-red-600 leading-relaxed">
                    {t?.titleEnFallbackHint}
                  </span>
                </div>
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <div className={cn(dash.cohortSectionHeadingBadge, "mb-5")}>
                <FolderTree className="h-4 w-4" />
                {t?.categoryBox}
              </div>
              <div className="space-y-3">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                  )}
                >
                  {t?.category}
                </Label>
                <CategoryTreeSelect
                  tree={tree}
                  lang={lang}
                  value={form.category_id}
                  onChange={(value) =>
                    setForm({ ...form, category_id: value })
                  }
                  placeholder={t?.categoryPlaceholder}
                  searchPlaceholder={t?.categorySearch}
                  emptyLabel={t?.categoryEmpty}
                  selectedLabel={t?.categorySelected}
                  collapseLabel={t?.categoryCollapse}
                  expandLabel={t?.categoryExpand}
                />
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <div className={cn(dash.cohortSectionHeadingBadge, "mb-5")}>
                <Youtube className="h-4 w-4" />
                {t?.youtubeBox}
              </div>
              <div className="space-y-2 max-w-2xl">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                  )}
                >
                  {t?.youtubeUrl}
                </Label>
                <Input
                  className={cn("h-11", dash.input)}
                  value={form.youtube_url}
                  onChange={(e) =>
                    setForm({ ...form, youtube_url: e.target.value })
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <div className={cn(dash.cohortSectionHeadingBadge, "mb-5")}>
                <ImageIcon className="h-4 w-4" />
                {t?.coverImage}
              </div>
              <ImageDropzone
                file={form.image}
                existingImageUrl={item.image || undefined}
                onFileChange={(file) => setForm({ ...form, image: file })}
                labels={{
                  hint: t?.coverDropHint,
                  browse: t?.coverBrowse,
                  currentImage: t?.coverCurrent,
                  noNewUpload: t?.coverNoNew,
                  loading: t?.coverLoading,
                }}
              />
            </section>

            <section className={dash.sectionRichContent}>
              <Label className="mb-3 block font-semibold text-slate-800">
                {t?.contentAr}
              </Label>
              <CkEditor
                key={`${basePath}-edit-ar-${item.id}`}
                editorData={form.content_ar}
                handleOnUpdate={(value) =>
                  setForm((prev) => ({ ...prev, content_ar: value }))
                }
                config={{ language: "ar", direction: "rtl" }}
              />
            </section>

            <section className={dash.sectionRichContent}>
              <Label className="mb-3 block font-semibold text-slate-800">
                {t?.contentEn}
              </Label>
              <span className="text-sm text-red-600 leading-relaxed">
                {t?.titleEnFallbackHint}
              </span>
              <CkEditor
                key={`${basePath}-edit-en-${item.id}`}
                editorData={form.content_en}
                handleOnUpdate={(value) =>
                  setForm((prev) => ({ ...prev, content_en: value }))
                }
                config={{ language: "en", direction: "ltr" }}
              />
            </section>

            <section className={dash.sectionNeutral}>
              <div className={cn(dash.cohortSectionHeadingBadge, "mb-5")}>
                {t?.audio}
              </div>
              <AudioDropzone
                file={form.audio}
                existingAudioUrl={item.audio || undefined}
                onFileChange={(file) => setForm({ ...form, audio: file })}
                labels={{
                  hint: t?.audioDropHint,
                  browse: t?.audioBrowse,
                  currentAudio: t?.audioCurrent,
                  noNewUpload: t?.audioNoNew,
                  loading: t?.audioLoading,
                  formatsNote: t?.audioFormats,
                }}
              />
            </section>

            <section className={dash.sectionPdf}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Label className="text-base font-semibold text-slate-900">
                  {t?.attachments}
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(dash.pdfAddBtnOutline, "gap-2")}
                  onClick={addAttachmentRow}
                >
                  <Plus className="h-4 w-4" />
                  {t?.addAttachment}
                </Button>
              </div>

              {existingAttachments.length > 0 ? (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-medium text-slate-600">
                    {t?.existingAttachments}
                  </p>
                  {existingAttachments.map(
                    (att: string | IContentAttachment, idx: number) => {
                    const title =
                      typeof att === "string"
                        ? ""
                        : (att.title || att.name || "").trim();
                    const href =
                      typeof att === "string"
                        ? att
                        : att.url || att.file || "";
                    const fileName =
                      typeof att === "string"
                        ? att.split("/").pop() || String(idx + 1)
                        : att.name ||
                          (href ? href.split("/").pop() : "") ||
                          String(idx + 1);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-amber-200/60 bg-white/95 px-3 py-2.5 text-sm"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-amber-700" />
                        <div className="min-w-0 flex-1">
                          {title ? (
                            <p className="truncate font-medium text-slate-900">
                              {title}
                            </p>
                          ) : null}
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-emerald-700 hover:underline"
                            >
                              {fileName}
                            </a>
                          ) : (
                            <span className="truncate text-slate-600">
                              {fileName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="space-y-4">
                {form.attachmentRows.map((row) => (
                  <div
                    key={row.key}
                    className="space-y-3 rounded-xl border border-amber-200/50 bg-white/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <Label className="text-sm font-semibold text-slate-800">
                          {t?.attachmentTitle}
                        </Label>
                        <Input
                          className={cn("h-11", dash.input)}
                          value={row.title}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              attachmentRows: prev.attachmentRows.map((r) =>
                                r.key === row.key
                                  ? { ...r, title: e.target.value }
                                  : r,
                              ),
                            }))
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="mt-7 shrink-0 text-red-600"
                        disabled={form.attachmentRows.length === 1}
                        onClick={() => removeAttachmentRow(row.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FileDropzone
                      file={row.file}
                      onFileChange={(file) =>
                        setForm((prev) => ({
                          ...prev,
                          attachmentRows: prev.attachmentRows.map((r) =>
                            r.key === row.key ? { ...r, file } : r,
                          ),
                        }))
                      }
                      labels={{
                        hint: t?.attachmentDropHint,
                        browse: t?.attachmentBrowse,
                        formatsNote: t?.attachmentFormats,
                        invalidType: t?.attachmentInvalid,
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Label className="flex items-center gap-2 font-semibold text-slate-900">
                  <Link2 className="h-4 w-4" />
                  {t?.externalLinks}
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-xl"
                  onClick={addLink}
                >
                  <Plus className="h-4 w-4" />
                  {t?.addLink}
                </Button>
              </div>

              <div className="space-y-3">
                {form.links.map((link, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3"
                  >
                    <Input
                      className={cn("h-11", dash.input)}
                      placeholder={t?.linkTitle}
                      value={link.title}
                      onChange={(e) =>
                        updateLink(index, "title", e.target.value)
                      }
                    />
                    <Input
                      className={cn("h-11", dash.input)}
                      placeholder={t?.linkUrl}
                      value={link.url}
                      onChange={(e) =>
                        updateLink(index, "url", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600"
                      disabled={form.links.length === 1}
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                    )}
                  >
                    {t?.seoDescription}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.seo_description}
                    onChange={(e) =>
                      setForm({ ...form, seo_description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                    )}
                  >
                    {t?.seoKeywords}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.seo_keywords}
                    onChange={(e) =>
                      setForm({ ...form, seo_keywords: e.target.value })
                    }
                    placeholder={t?.seoKeywordsPlaceholder}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(v) =>
                    setForm({ ...form, is_active: Boolean(v) })
                  }
                />
                <span className="text-sm text-slate-700">{t?.isActive}</span>
              </div>

              <Button
                type="submit"
                disabled={isUpdating}
                className={dash.formSubmit}
              >
                {isUpdating ? `${t?.processing}...` : `${t?.editBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
