"use client";

import {
  Mic2,
  Megaphone,
  Newspaper,
  BookOpen,
  BookMarked,
  Scale,
} from "lucide-react";
import type { ContentListConfig } from "@/components/content/ContentList";
import type { CreateContentConfig } from "@/components/content/CreateContent";
import type { EditContentConfig } from "@/components/content/EditContent";
import type { ViewContentConfig } from "@/components/content/ViewContent";
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
import {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useToggleBookStatusMutation,
} from "@/store/books/booksApi";
import {
  useGetExplanationsQuery,
  useGetExplanationByIdQuery,
  useCreateExplanationMutation,
  useUpdateExplanationMutation,
  useDeleteExplanationMutation,
  useToggleExplanationStatusMutation,
} from "@/store/explanations/explanationsApi";
import {
  useGetFatwasQuery,
  useGetFatwaByIdQuery,
  useCreateFatwaMutation,
  useUpdateFatwaMutation,
  useDeleteFatwaMutation,
  useToggleFatwaStatusMutation,
} from "@/store/fatwas/fatwasApi";

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

export const lectureViewConfig: ViewContentConfig = {
  icon: Mic2,
  basePath: "lectures",
  pagesKey: "lectures",
  viewKey: "viewContent",
  useGetByIdQuery: useGetLectureByIdQuery,
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

export const speechViewConfig: ViewContentConfig = {
  icon: Megaphone,
  basePath: "speeches",
  pagesKey: "speeches",
  viewKey: "viewContent",
  useGetByIdQuery: useGetSpeechByIdQuery,
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

export const articleViewConfig: ViewContentConfig = {
  icon: Newspaper,
  basePath: "articles",
  pagesKey: "articles",
  viewKey: "viewContent",
  useGetByIdQuery: useGetArticleByIdQuery,
};

/* =======================
   Books
======================= */
export const bookListConfig: ContentListConfig = {
  icon: BookOpen,
  basePath: "books",
  pagesKey: "books",
  titleKey: "booksTitle",
  createKey: "createBook",
  tableHeadersKey: "books",
  useGetListQuery: useGetBooksQuery,
  useToggleStatusMutation: useToggleBookStatusMutation,
  useDeleteMutation: useDeleteBookMutation,
};

export const bookCreateConfig: CreateContentConfig = {
  icon: BookOpen,
  basePath: "books",
  pagesKey: "books",
  createKey: "createBook",
  failMessage: {
    ar: "فشل انشاء الكتاب",
    en: "Failed to create book",
  },
  useCreateMutation: useCreateBookMutation,
};

export const bookEditConfig: EditContentConfig = {
  icon: BookOpen,
  basePath: "books",
  pagesKey: "books",
  editKey: "editBook",
  failMessage: editFailMessage,
  useGetByIdQuery: useGetBookByIdQuery,
  useUpdateMutation: useUpdateBookMutation,
};

export const bookViewConfig: ViewContentConfig = {
  icon: BookOpen,
  basePath: "books",
  pagesKey: "books",
  viewKey: "viewContent",
  useGetByIdQuery: useGetBookByIdQuery,
};

/* =======================
   Explanations
======================= */
export const explanationListConfig: ContentListConfig = {
  icon: BookMarked,
  basePath: "explanations",
  pagesKey: "explanations",
  titleKey: "explanationsTitle",
  createKey: "createExplanation",
  tableHeadersKey: "explanations",
  useGetListQuery: useGetExplanationsQuery,
  useToggleStatusMutation: useToggleExplanationStatusMutation,
  useDeleteMutation: useDeleteExplanationMutation,
};

export const explanationCreateConfig: CreateContentConfig = {
  icon: BookMarked,
  basePath: "explanations",
  pagesKey: "explanations",
  createKey: "createExplanation",
  failMessage: {
    ar: "فشل انشاء الشرح",
    en: "Failed to create explanation",
  },
  useCreateMutation: useCreateExplanationMutation,
};

export const explanationEditConfig: EditContentConfig = {
  icon: BookMarked,
  basePath: "explanations",
  pagesKey: "explanations",
  editKey: "editExplanation",
  failMessage: editFailMessage,
  useGetByIdQuery: useGetExplanationByIdQuery,
  useUpdateMutation: useUpdateExplanationMutation,
};

export const explanationViewConfig: ViewContentConfig = {
  icon: BookMarked,
  basePath: "explanations",
  pagesKey: "explanations",
  viewKey: "viewContent",
  useGetByIdQuery: useGetExplanationByIdQuery,
};

/* =======================
   Fatwas
======================= */
export const fatwaListConfig: ContentListConfig = {
  icon: Scale,
  basePath: "fatwas",
  pagesKey: "fatwas",
  titleKey: "fatwasTitle",
  createKey: "createFatwa",
  tableHeadersKey: "fatwas",
  useGetListQuery: useGetFatwasQuery,
  useToggleStatusMutation: useToggleFatwaStatusMutation,
  useDeleteMutation: useDeleteFatwaMutation,
};

export const fatwaCreateConfig: CreateContentConfig = {
  icon: Scale,
  basePath: "fatwas",
  pagesKey: "fatwas",
  createKey: "createFatwa",
  failMessage: {
    ar: "فشل انشاء الفتوى",
    en: "Failed to create fatwa",
  },
  useCreateMutation: useCreateFatwaMutation,
};

export const fatwaEditConfig: EditContentConfig = {
  icon: Scale,
  basePath: "fatwas",
  pagesKey: "fatwas",
  editKey: "editFatwa",
  failMessage: editFailMessage,
  useGetByIdQuery: useGetFatwaByIdQuery,
  useUpdateMutation: useUpdateFatwaMutation,
};

export const fatwaViewConfig: ViewContentConfig = {
  icon: Scale,
  basePath: "fatwas",
  pagesKey: "fatwas",
  viewKey: "viewContent",
  useGetByIdQuery: useGetFatwaByIdQuery,
};
