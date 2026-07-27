/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderTree, FolderPen } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import {
  useGetCategoriesTreeQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
} from "@/store/categories/categoriesApi";

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
import CategoryTreeSelect from "@/components/shared/CategoryTreeSelect";

type FormState = {
  name_ar: string;
  name_en: string;
  parent_id: string;
  is_active: boolean;
};

export default function EditCategory() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.categories?.editCategory;

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const {
    data: category,
    isLoading,
    isError,
  } = useGetCategoryByIdQuery(idNum, {
    skip: !sessionReady || invalidId,
  });

  const { data: tree = [], isLoading: treeLoading } =
    useGetCategoriesTreeQuery(undefined, { skip: !sessionReady });

  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const [form, setForm] = useState<FormState>({
    name_ar: "",
    name_en: "",
    parent_id: "",
    is_active: true,
  });

  useEffect(() => {
    if (!category) return;

    setForm({
      name_ar: category.name?.ar ?? "",
      name_en: category.name?.en ?? "",
      parent_id:
        category.parent_id != null ? String(category.parent_id) : "",
      is_active: Boolean(category.is_active),
    });
  }, [category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await updateCategory({
        id: idNum,
        data: {
          name_ar: form.name_ar,
          name_en: form.name_en,
          parent_id: form.parent_id ? Number(form.parent_id) : null,
          is_active: form.is_active,
        },
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/categories`);
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

  if (!sessionReady || isLoading || treeLoading) {
    return <AdminFormSkeleton />;
  }

  if (invalidId || isError || !category) {
    return (
      <div className={dash.formPage} dir={pageDir}>
        <Card className={dash.formCard}>
          <CardContent className="py-10 text-center text-slate-600">
            {t?.notFound}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <FolderPen className="w-6 h-6" />
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
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <FolderTree className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t?.titleUpdate}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.nameAr}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.name_ar}
                    onChange={(e) =>
                      setForm({ ...form, name_ar: e.target.value })
                    }
                    placeholder={t?.nameArPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.nameEn}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={form.name_en}
                    onChange={(e) =>
                      setForm({ ...form, name_en: e.target.value })
                    }
                    placeholder={t?.nameEnPlaceholder}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.parent}
                  </Label>
                  <CategoryTreeSelect
                    tree={tree}
                    lang={lang}
                    value={form.parent_id}
                    onChange={(value) =>
                      setForm({ ...form, parent_id: value })
                    }
                    placeholder={t?.parentNone}
                    searchPlaceholder={t?.parentSearch}
                    emptyLabel={t?.parentEmpty}
                    selectedLabel={t?.parentSelected}
                    excludeId={idNum}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t?.parentHint}
                  </p>
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
