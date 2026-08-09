/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetCategoriesTreeQuery } from "@/store/categories/categoriesApi";
import type { ContentCategoryType } from "@/constants/categoryTypes";
import {
  IContentLink,
} from "@/types/contentResource";

import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { normalizeKeywordsInput } from "@/lib/normalizeKeywordsInput";
import { showApiError } from "@/lib/showApiError";
import { setUploadProgressListener } from "@/lib/uploadProgressBus";
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

const emptyForm: FormState = {
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
};

export type CreateContentConfig = {
  icon: LucideIcon;
  basePath: ContentCategoryType;
  pagesKey: string;
  createKey: string;
  failMessage: { ar: string; en: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useCreateMutation: any;
};

type Props = {
  config: CreateContentConfig;
};

export default function CreateContent({ config }: Props) {
  const {
    icon: Icon,
    basePath,
    pagesKey,
    createKey,
    failMessage,
    useCreateMutation,
  } = config;

  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.[pagesKey]?.[createKey];

  const { data: tree = [], isLoading: treeLoading } = useGetCategoriesTreeQuery(
    { type: basePath },
    { skip: !sessionReady },
  );

  const [createItem, { isLoading: isCreating }] = useCreateMutation();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploadProgress, setUploadProgress] = useState(0);

  const attachmentReadyLabel =
    t?.attachmentReady ??
    (lang === "ar"
      ? "تم اختيار الملف — الرفع يتم عند الإنشاء"
      : "File selected — uploads when you save");
  const uploadingLabel =
    t?.uploadingFiles ??
    (lang === "ar" ? "جاري رفع الملفات..." : "Uploading files...");

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
    setUploadProgress(0);
    setUploadProgressListener((percent) => {
      setUploadProgress(percent);
      toast.loading(`${uploadingLabel} ${percent}%`, { id: toastId });
    });

    try {
      const attachments = form.attachmentRows
        .filter((r): r is AttachmentRow & { file: File } => r.file !== null)
        .map((r) => ({
          title: r.title.trim(),
          file: r.file,
        }));

      const res = await createItem({
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
      }).unwrap();

      toast.success(res?.message, { id: toastId });
      router.push(`/${lang}/${basePath}`);
    } catch (err: unknown) {
      showApiError(err, {
        toastId,
        fallback: failMessage[lang],
        lang,
      });
    } finally {
      setUploadProgressListener(null);
      setUploadProgress(0);
    }
  };

  if (!sessionReady || treeLoading) {
    return <AdminFormSkeleton />;
  }

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
            {t?.titleDescription}
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
                    placeholder={t?.titleArPlaceholder}
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
                    placeholder={t?.titleEnPlaceholder}
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
                key={`${basePath}-create-ar`}
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
                key={`${basePath}-create-en`}
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
                        ready: attachmentReadyLabel,
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
                      setForm({
                        ...form,
                        seo_keywords: normalizeKeywordsInput(e.target.value),
                      })
                    }
                    placeholder={t?.seoKeywordsPlaceholder}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {isCreating && uploadProgress > 0 ? (
              <div className="space-y-2 rounded-xl border border-amber-200/70 bg-amber-50/40 px-3 py-3">
                <div className="flex items-center justify-between text-xs text-amber-950">
                  <span>{uploadingLabel}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

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
                disabled={isCreating}
                className={dash.formSubmit}
              >
                {isCreating
                  ? uploadProgress > 0
                    ? `${uploadingLabel} ${uploadProgress}%`
                    : `${t?.processing}...`
                  : `${t?.createBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
