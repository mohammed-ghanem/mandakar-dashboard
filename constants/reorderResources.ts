"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  BookOpen,
  FileText,
  Mic,
  Scale,
  TvMinimalPlay,
} from "lucide-react";

import type { ContentCategoryType } from "@/constants/categoryTypes";
import { useGetLecturesQuery } from "@/store/lectures/lecturesApi";
import { useGetSpeechesQuery } from "@/store/speeches/speechesApi";
import { useGetArticlesQuery } from "@/store/articles/articlesApi";
import { useGetBooksQuery } from "@/store/books/booksApi";
import { useGetExplanationsQuery } from "@/store/explanations/explanationsApi";
import { useGetFatwasQuery } from "@/store/fatwas/fatwasApi";

export type ContentReorderConfig = {
  contentType: ContentCategoryType;
  icon: LucideIcon;
  /** Key under pages.dashboard for the items tab label */
  moduleLabelKey:
    | "moduleLectures"
    | "moduleSpeeches"
    | "moduleArticles"
    | "moduleExplanations"
    | "moduleFatwas"
    | "moduleBooks";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useGetListQuery: any;
};

export const lectureReorderConfig: ContentReorderConfig = {
  contentType: "lectures",
  icon: TvMinimalPlay,
  moduleLabelKey: "moduleLectures",
  useGetListQuery: useGetLecturesQuery,
};

export const speechReorderConfig: ContentReorderConfig = {
  contentType: "speeches",
  icon: Mic,
  moduleLabelKey: "moduleSpeeches",
  useGetListQuery: useGetSpeechesQuery,
};

export const articleReorderConfig: ContentReorderConfig = {
  contentType: "articles",
  icon: FileText,
  moduleLabelKey: "moduleArticles",
  useGetListQuery: useGetArticlesQuery,
};

export const explanationReorderConfig: ContentReorderConfig = {
  contentType: "explanations",
  icon: BookOpen,
  moduleLabelKey: "moduleExplanations",
  useGetListQuery: useGetExplanationsQuery,
};

export const fatwaReorderConfig: ContentReorderConfig = {
  contentType: "fatwas",
  icon: Scale,
  moduleLabelKey: "moduleFatwas",
  useGetListQuery: useGetFatwasQuery,
};

export const bookReorderConfig: ContentReorderConfig = {
  contentType: "books",
  icon: BookMarked,
  moduleLabelKey: "moduleBooks",
  useGetListQuery: useGetBooksQuery,
};
