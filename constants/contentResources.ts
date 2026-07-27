"use client";

import { Mic2, Megaphone, Newspaper } from "lucide-react";
import type { ContentListConfig } from "@/components/content/ContentList";
import type { CreateContentConfig } from "@/components/content/CreateContent";
import type { EditContentConfig } from "@/components/content/EditContent";
import {
  useGetLecturesQuery,
  useGetLectureByIdQuery,
  useCreateLectureMutation,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
  useToggleLectureStatusMutation,
} from "@/store/lectures/lecturesApi";
import {
  useGetSpeechesQuery,
  useGetSpeechByIdQuery,
  useCreateSpeechMutation,
  useUpdateSpeechMutation,
  useDeleteSpeechMutation,
  useToggleSpeechStatusMutation,
} from "@/store/speeches/speechesApi";
import {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useToggleArticleStatusMutation,
} from "@/store/articles/articlesApi";

const editFailMessage = {
  ar: "فشل حفظ التغييرات",
  en: "Failed to save changes",
};

/* =======================
   Lectures
======================= */
export const lectureListConfig: ContentListConfig = {
  icon: Mic2,
  basePath: "lectures",
  pagesKey: "lectures",
  titleKey: "lecturesTitle",
  createKey: "createLecture",
  tableHeadersKey: "lectures",
  useGetListQuery: useGetLecturesQuery,
  useToggleStatusMutation: useToggleLectureStatusMutation,
  useDeleteMutation: useDeleteLectureMutation,
};

export const lectureCreateConfig: CreateContentConfig = {
  icon: Mic2,
  basePath: "lectures",
  pagesKey: "lectures",
  createKey: "createLecture",
  failMessage: {
    ar: "فشل انشاء المحاضرة",
    en: "Failed to create lecture",
  },
  useCreateMutation: useCreateLectureMutation,
};

export const lectureEditConfig: EditContentConfig = {
  icon: Mic2,
  basePath: "lectures",
  pagesKey: "lectures",
  editKey: "editLecture",
  failMessage: editFailMessage,
  useGetByIdQuery: useGetLectureByIdQuery,
  useUpdateMutation: useUpdateLectureMutation,
};

/* =======================
   Speeches
======================= */
export const speechListConfig: ContentListConfig = {
  icon: Megaphone,
  basePath: "speeches",
  pagesKey: "speeches",
  titleKey: "speechesTitle",
  createKey: "createSpeech",
  tableHeadersKey: "speeches",
  useGetListQuery: useGetSpeechesQuery,
  useToggleStatusMutation: useToggleSpeechStatusMutation,
  useDeleteMutation: useDeleteSpeechMutation,
};

export const speechCreateConfig: CreateContentConfig = {
  icon: Megaphone,
  basePath: "speeches",
  pagesKey: "speeches",
  createKey: "createSpeech",
  failMessage: {
    ar: "فشل انشاء الخطبة",
    en: "Failed to create speech",
  },
  useCreateMutation: useCreateSpeechMutation,
};

export const speechEditConfig: EditContentConfig = {
  icon: Megaphone,
  basePath: "speeches",
  pagesKey: "speeches",
  editKey: "editSpeech",
  failMessage: editFailMessage,
  useGetByIdQuery: useGetSpeechByIdQuery,
  useUpdateMutation: useUpdateSpeechMutation,
};

/* =======================
   Articles
======================= */
export const articleListConfig: ContentListConfig = {
  icon: Newspaper,
  basePath: "articles",
  pagesKey: "articles",
  titleKey: "articlesTitle",
  createKey: "createArticle",
  tableHeadersKey: "articles",
  useGetListQuery: useGetArticlesQuery,
  useToggleStatusMutation: useToggleArticleStatusMutation,
  useDeleteMutation: useDeleteArticleMutation,
};

export const articleCreateConfig: CreateContentConfig = {
  icon: Newspaper,
  basePath: "articles",
  pagesKey: "articles",
  createKey: "createArticle",
  failMessage: {
    ar: "فشل انشاء المقال",
    en: "Failed to create article",
  },
  useCreateMutation: useCreateArticleMutation,
};

export const articleEditConfig: EditContentConfig = {
  icon: Newspaper,
  basePath: "articles",
  pagesKey: "articles",
  editKey: "editArticle",
  failMessage: editFailMessage,
  useGetByIdQuery: useGetArticleByIdQuery,
  useUpdateMutation: useUpdateArticleMutation,
};
