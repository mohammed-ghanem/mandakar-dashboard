/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import EditorsPageSkeleton, {
  EditorSkeleton,
} from "@/components/skeleton/EditorSkeleton";
import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { CircleCheckBig, ScrollText } from "lucide-react";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";
import {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} from "@/store/settings/termsAndConditions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const CkEditor = dynamic(() => import("@/components/ckEditor/CKEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

export default function TermsAndConditions() {
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const t = translate?.settings.termsAndConditions;

  const { data, isLoading, isError } = useGetTermsAndConditionsQuery(
    undefined,
    {
      skip: !sessionReady,
      refetchOnMountOrArgChange: true,
    },
  );
  const [updateTermsAndConditions, { isLoading: isSaving }] =
    useUpdateTermsAndConditionsMutation();

  const [form, setForm] = useState({ ar: "", en: "" });
  const [editorsReady, setEditorsReady] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!data || hydratedRef.current) return;
    hydratedRef.current = true;
    setForm({
      ar: data.ar ?? "",
      en: data.en ?? "",
    });
    setEditorsReady(true);
  }, [data]);

  if (!sessionReady || isLoading) {
    return <EditorsPageSkeleton />;
  }

  if (isError) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
      >
        {t?.loadError}
      </div>
    );
  }

  const submit = async () => {
    try {
      const res = await updateTermsAndConditions(form).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;

      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
    }
  };

  return (
    <div className={dash.formPageWide}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <ScrollText className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          {!editorsReady ? (
            <div className="space-y-8">
              <EditorSkeleton />
              <EditorSkeleton />
            </div>
          ) : (
            <div className="space-y-8 md:space-y-10">
              <section className={dash.sectionRichContent}>
                <Label className="mb-3 block font-semibold text-slate-800">
                  {t?.arabicContent}
                </Label>
                <CkEditor
                  key="terms-ar"
                  editorData={form.ar}
                  handleOnUpdate={(value) =>
                    setForm((prev) => ({ ...prev, ar: value }))
                  }
                  config={{ language: "ar", direction: "rtl" }}
                />
              </section>

              <section className={dash.sectionRichContent}>
                <Label className="mb-3 block font-semibold text-slate-800">
                  {t?.englishContent}
                </Label>
                <CkEditor
                  key="terms-en"
                  editorData={form.en}
                  handleOnUpdate={(value) =>
                    setForm((prev) => ({ ...prev, en: value }))
                  }
                  config={{ language: "en", direction: "ltr" }}
                />
              </section>

              <div className={dash.formFooterBar}>
                <Button
                  type="button"
                  onClick={submit}
                  disabled={isSaving}
                  className={cn(dash.formSubmit, "gap-2")}
                >
                  <CircleCheckBig className="h-5 w-5 shrink-0" />
                  {isSaving ? `${t?.processing}` : `${t?.saveBtn}`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
