/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Link2, PanelsTopLeft, Type } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import {
  useGetBannerByIdQuery,
  useUpdateBannerMutation,
} from "@/store/banners/bannersApi";
import { BANNER_CATEGORIES } from "@/constants/bannerCategories";
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
import { Textarea } from "@/components/ui/textarea";
import AdminFormSkeleton from "@/components/skeleton/AdminFormSkeleton";
import ImageDropzone from "@/components/shared/ImageDropzone";

type FormState = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  category: string;
  url: string;
  is_active: boolean;
  image: File | null;
};

export default function EditBanner() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.banners?.editBanner;
  const categories = translate?.pages?.banners?.categories;

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const {
    data: item,
    isLoading,
    isError,
  } = useGetBannerByIdQuery(idNum, {
    skip: !sessionReady || invalidId,
  });

  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<FormState>({
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    category: "speech",
    url: "",
    is_active: true,
    image: null,
  });

  useEffect(() => {
    if (!item) return;
    setForm({
      title_ar: item.title?.ar ?? "",
      title_en: item.title?.en ?? "",
      description_ar: item.description?.ar ?? "",
      description_en: item.description?.en ?? "",
      category: item.category || "speech",
      url: item.url ?? "",
      is_active: Boolean(item.is_active),
      image: null,
    });
    setReady(true);
  }, [item]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.category) {
      toast.error(t?.categoryRequired ?? "");
      return;
    }

    const toastId = toast.loading(`${t?.processing}...`);

    try {
      const res = await updateBanner({
        id: idNum,
        data: {
          title_ar: form.title_ar,
          title_en: form.title_en,
          description_ar: form.description_ar,
          description_en: form.description_en,
          category: form.category,
          url: form.url || undefined,
          is_active: form.is_active,
          image: form.image,
        },
      }).unwrap();

      toast.success(res?.message, { id: toastId });
      router.push(`/${lang}/banners`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        toast.dismiss(toastId);
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
      toast.error(errorData?.message || t?.failMessage, { id: toastId });
    }
  };

  if (!sessionReady || isLoading || !ready) return <AdminFormSkeleton />;

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

  return (
    <div className={dash.formPage}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <PanelsTopLeft className="w-6 h-6" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {t?.titleAr}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.title_ar}
                    onChange={(e) =>
                      setForm({ ...form, title_ar: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {t?.descriptionAr}
                  </Label>
                  <Textarea
                    className={dash.input}
                    value={form.description_ar}
                    onChange={(e) =>
                      setForm({ ...form, description_ar: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {t?.descriptionEn}
                  </Label>
                  <Textarea
                    className={dash.input}
                    value={form.description_en}
                    onChange={(e) =>
                      setForm({ ...form, description_en: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {t?.category}
                  </Label>
                  <select
                    className={cn(
                      "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      dash.input,
                    )}
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    required
                  >
                    <option value="">{t?.categoryPlaceholder}</option>
                    {BANNER_CATEGORIES.map((key) => (
                      <option key={key} value={key}>
                        {categories?.[key] ?? key}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      {t?.url}
                    </span>
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <div className={cn(dash.cohortSectionHeadingBadge, "mb-5")}>
                <ImageIcon className="h-4 w-4" />
                {t?.image}
              </div>
              <ImageDropzone
                file={form.image}
                existingImageUrl={item.image || undefined}
                onFileChange={(file) => setForm({ ...form, image: file })}
                labels={{
                  hint: t?.imageDropHint,
                  browse: t?.imageBrowse,
                  currentImage: t?.imageCurrent,
                  noNewUpload: t?.imageNoNew,
                  loading: t?.imageLoading,
                }}
              />
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
                {isUpdating ? `${t?.processing}...` : t?.editBtn}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
