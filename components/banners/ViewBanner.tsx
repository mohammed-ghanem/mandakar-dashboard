"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye, ExternalLink, PanelsTopLeft } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetBannerByIdQuery } from "@/store/banners/bannersApi";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminFormSkeleton from "@/components/skeleton/AdminFormSkeleton";

export default function ViewBanner() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.banners?.viewBanner;
  const pg = translate?.pages?.banners;
  const categories = pg?.categories;

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const {
    data: item,
    isLoading,
    isError,
  } = useGetBannerByIdQuery(idNum, {
    skip: !sessionReady || invalidId,
  });

  if (!sessionReady || isLoading) return <AdminFormSkeleton />;

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

  const categoryLabel =
    categories?.[item.category as keyof typeof categories] ?? item.category;

  return (
    <div className={dash.formPage}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Eye className="w-6 h-6" />
            </span>
            <div className="min-w-0 space-y-2">
              <span className="leading-tight block">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={cn(dash.formCardContent, "space-y-8")}>
          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex items-center gap-3">
              <span className={dash.sectionIconWrap}>
                <PanelsTopLeft className="h-5 w-5" />
              </span>
              <p className="text-base font-semibold text-slate-800">
                {t?.titlesBox}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.titleAr}
                </Label>
                <div className={dash.viewFieldBox}>
                  {item.title?.ar || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.titleEn}
                </Label>
                <div className={dash.viewFieldBox}>
                  {item.title?.en || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.category}
                </Label>
                <div className={dash.viewFieldBox}>{categoryLabel || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.status}
                </Label>
                <div className="mt-1">
                  {item.is_active ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                      {pg?.active}
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="font-semibold px-3 py-1"
                    >
                      {pg?.inactive}
                    </Badge>
                  )}
                </div>
              </div>
              {item.url ? (
                <div className="md:col-span-2">
                  <Label className="font-semibold text-slate-800">
                    {t?.url}
                  </Label>
                  <div className={dash.viewFieldBox}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-700 hover:underline break-all"
                    >
                      {item.url}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className={dash.sectionNeutral}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.descriptionAr}
                </Label>
                <div className={cn(dash.viewFieldBox, "whitespace-pre-wrap")}>
                  {item.description?.ar || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.descriptionEn}
                </Label>
                <div className={cn(dash.viewFieldBox, "whitespace-pre-wrap")}>
                  {item.description?.en || "—"}
                </div>
              </div>
            </div>
          </section>

          {item.image ? (
            <section className={dash.sectionNeutral}>
              <Label className="font-semibold text-slate-800">{t?.image}</Label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title?.ar || ""}
                className="mt-2 max-h-72 w-full rounded-xl border border-slate-200 object-cover"
              />
            </section>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push(`/${lang}/banners`)}
            >
              {t?.backBtn}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
