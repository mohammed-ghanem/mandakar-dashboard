/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderTree, FolderPlus } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import {
  useCreateCategoryMutation,
  useGetCategoriesTreeQuery,
} from "@/store/categories/categoriesApi";
import type { ContentCategoryType } from "@/constants/categoryTypes";

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

type Props = {
  categoryType: ContentCategoryType;
};

export default function CreateCategory({ categoryType }: Props) {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages.categories?.createCategory;
  const basePath = categoryType;

  const { data: tree = [], isLoading: treeLoading } = useGetCategoriesTreeQuery(
    { type: categoryType },
    { skip: !sessionReady },
  );

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();

  const [form, setForm] = useState<FormState>({
    name_ar: "",
    name_en: "",
    parent_id: "",
    is_active: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await createCategory({
        name_ar: form.name_ar,
        name_en: form.name_en,
        type: categoryType,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        is_active: form.is_active,
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/${basePath}/categories`);
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

  if (!sessionReady || treeLoading) {
    return <AdminFormSkeleton />;
  }

  return (
    <div className={dash.formPage}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <FolderPlus className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.titleDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section
              className={dash.sectionNeutral}
              aria-labelledby="category-create-info"
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <FolderTree className="h-5 w-5" strokeWidth={2} />
                </span>
                <p
                  id="category-create-info"
                  className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
                >
                  {t?.titleDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
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
                  />
                  <p className="text-sm text-red-500">{t?.parentHint}</p>
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
                disabled={isCreating}
                className={dash.formSubmit}
              >
                {isCreating ? `${t?.processing}...` : `${t?.createBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
