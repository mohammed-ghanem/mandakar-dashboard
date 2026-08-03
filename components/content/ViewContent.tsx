/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Eye, ExternalLink, FileText } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import type { ContentCategoryType } from "@/constants/categoryTypes";
import type {
  IContentAttachment,
  IContentItem,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AdminFormSkeleton from "@/components/skeleton/AdminFormSkeleton";

export type ViewContentConfig = {
  icon: LucideIcon;
  basePath: ContentCategoryType;
  pagesKey: string;
  viewKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useGetByIdQuery: any;
};

type Props = {
  config: ViewContentConfig;
};

function attachmentUrl(item: string | IContentAttachment) {
  if (typeof item === "string") return item;
  return item?.url || item?.file || "";
}

function attachmentTitle(item: string | IContentAttachment) {
  if (typeof item === "string") return "";
  return (item.title || "").trim();
}

function attachmentFileLabel(
  item: string | IContentAttachment,
  index: number,
  fallback: string,
) {
  if (typeof item === "string") {
    const parts = item.split("/");
    return parts[parts.length - 1] || `${fallback} ${index + 1}`;
  }
  const url = attachmentUrl(item);
  return (
    item?.name ||
    (url ? url.split("/").pop() : "") ||
    `${fallback} ${index + 1}`
  );
}

export default function ViewContent({ config }: Props) {
  const { icon: Icon, basePath, pagesKey, viewKey, useGetByIdQuery } = config;

  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.[pagesKey]?.[viewKey];
  const pg = translate?.pages?.[pagesKey];

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const {
    data: item,
    isLoading,
    isError,
  }: {
    data?: IContentItem;
    isLoading: boolean;
    isError: boolean;
  } = useGetByIdQuery(idNum, {
    skip: !sessionReady || invalidId,
  });

  if (!sessionReady || isLoading) {
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

  const categoryName =
    item.category?._name ??
    item.category?.name?.[lang] ??
    item.category?.name?.ar ??
    item.category?.name?.en ??
    "—";

  const attachments = item.attachments ?? [];
  const links = (item.links ?? []).filter((l) => l.title || l.url);
  const keywords = item.seo?.keywords ?? [];

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
                <Icon className="h-5 w-5" />
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
                <div className={dash.viewFieldBox}>{categoryName}</div>
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
              {item.youtube_url ? (
                <div className="md:col-span-2">
                  <Label className="font-semibold text-slate-800">
                    {t?.youtubeUrl}
                  </Label>
                  <div className={dash.viewFieldBox}>
                    <a
                      href={item.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-700 hover:underline break-all"
                    >
                      {item.youtube_url}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className={dash.sectionRichContent}>
            <p className="mb-4 text-base font-semibold text-slate-800">
              {t?.contentAr}
            </p>
            <div
              className="prose prose-slate max-w-none rounded-xl border border-slate-200/80 bg-white/90 p-4 text-sm"
              dangerouslySetInnerHTML={{
                __html: item.content?.ar || "—",
              }}
            />
            <p className="mb-4 mt-6 text-base font-semibold text-slate-800">
              {t?.contentEn}
            </p>
            <div
              className="prose prose-slate max-w-none rounded-xl border border-slate-200/80 bg-white/90 p-4 text-sm"
              dangerouslySetInnerHTML={{
                __html: item.content?.en || "—",
              }}
            />
          </section>

          {(item.image || item.audio) && (
            <section className={dash.sectionNeutral}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {item.image ? (
                  <div>
                    <Label className="font-semibold text-slate-800">
                      {t?.coverImage}
                    </Label>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title?.ar || ""}
                      className="mt-2 max-h-56 w-full rounded-xl border border-slate-200 object-cover"
                    />
                  </div>
                ) : null}
                {item.audio ? (
                  <div>
                    <Label className="font-semibold text-slate-800">
                      {t?.audio}
                    </Label>
                    <audio
                      controls
                      src={item.audio}
                      className="mt-2 w-full"
                    />
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {attachments.length > 0 ? (
            <section className={dash.sectionPdf}>
              <p className="mb-4 text-base font-semibold text-slate-800">
                {t?.attachments}
              </p>
              <ul className="space-y-2">
                {attachments.map((file, index) => {
                  const url = attachmentUrl(file);
                  if (!url) return null;
                  const title = attachmentTitle(file);
                  const fileLabel = attachmentFileLabel(
                    file,
                    index,
                    t?.attachmentFallback ?? "",
                  );
                  return (
                    <li key={`${url}-${index}`}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          dash.viewFieldBox,
                          "flex items-start gap-2 text-emerald-700 hover:underline",
                        )}
                      >
                        <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="min-w-0">
                          {title ? (
                            <span className="block truncate font-medium text-slate-900">
                              {title}
                            </span>
                          ) : null}
                          <span className="block truncate">{fileLabel}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {links.length > 0 ? (
            <section className={dash.sectionNeutral}>
              <p className="mb-4 text-base font-semibold text-slate-800">
                {t?.externalLinks}
              </p>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={`${link.url}-${index}`} className={dash.viewFieldBox}>
                    <p className="font-medium text-slate-800">
                      {link.title || t?.linkTitle}
                    </p>
                    {link.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-2 text-sm text-emerald-700 hover:underline break-all"
                      >
                        {link.url}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(item.seo?.description || keywords.length > 0) && (
            <section className={dash.sectionNeutral}>
              <div className="grid grid-cols-1 gap-5">
                {item.seo?.description ? (
                  <div>
                    <Label className="font-semibold text-slate-800">
                      {t?.seoDescription}
                    </Label>
                    <div className={dash.viewFieldBox}>
                      {item.seo.description}
                    </div>
                  </div>
                ) : null}
                {keywords.length > 0 ? (
                  <div>
                    <Label className="font-semibold text-slate-800">
                      {t?.seoKeywords}
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="rounded-md"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          <Separator />

          <Button
            type="button"
            className={dash.viewBackButton}
            onClick={() => router.push(`/${lang}/${basePath}`)}
          >
            {t?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
