/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  IArticle,
  ICreateArticlePayload,
  IUpdateArticlePayload,
  IApiMessageResponse,
} from "@/types/articles";

/* =======================
   NORMALIZER
======================= */
function normalizeArticle(item: any): IArticle {
  const title = item?.title ?? {};
  const content = item?.content ?? {};

  const linksRaw = item?.links;
  const links = Array.isArray(linksRaw)
    ? linksRaw.map((l: any) => ({
        title: l?.title ?? "",
        url: l?.url ?? "",
      }))
    : [];

  const seo = item?.seo
    ? {
        description: item.seo?.description ?? "",
        keywords: Array.isArray(item.seo?.keywords)
          ? item.seo.keywords.map(String)
          : [],
      }
    : null;

  return {
    id: Number(item?.id) || 0,
    title: {
      ar: title?.ar ?? "",
      en: title?.en ?? "",
    },
    _title: item?._title ?? title?.ar ?? title?.en ?? "",
    content: {
      ar: content?.ar ?? "",
      en: content?.en ?? "",
    },
    category_id:
      item?.category_id === null || item?.category_id === undefined
        ? null
        : Number(item.category_id),
    category: item?.category
      ? {
          id: Number(item.category.id),
          name: {
            ar: item.category?.name?.ar ?? "",
            en: item.category?.name?.en ?? "",
          },
          _name: item.category?._name,
        }
      : null,
    youtube_url: item?.youtube_url ?? null,
    image: item?.image ?? null,
    audio: item?.audio ?? null,
    attachments: item?.attachments ?? [],
    links,
    seo,
    is_active: Boolean(
      Number(item?.is_active ?? item?.isActive ?? 0) ||
        item?.is_active === true,
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
  };
}

function appendArticleFormData(
  formData: FormData,
  data: ICreateArticlePayload | IUpdateArticlePayload,
) {
  formData.append("title[ar]", data.title_ar);
  formData.append("title[en]", data.title_en);
  formData.append("content[ar]", data.content_ar);
  formData.append("content[en]", data.content_en);
  formData.append("category_id", String(data.category_id));
  formData.append("is_active", data.is_active ? "1" : "0");

  if (data.youtube_url) {
    formData.append("youtube_url", data.youtube_url);
  }

  if (data.image instanceof File) {
    formData.append("image", data.image);
  }

  if (data.audio instanceof File) {
    formData.append("audio", data.audio);
  }

  (data.attachments ?? []).forEach((file) => {
    if (file instanceof File) {
      formData.append("attachments[]", file);
    }
  });

  (data.links ?? [])
    .filter((l) => l.title.trim() || l.url.trim())
    .forEach((link, index) => {
      formData.append(`links[${index}][title]`, link.title);
      formData.append(`links[${index}][url]`, link.url);
    });

  if (data.seo_description) {
    formData.append("seo[description]", data.seo_description);
  }

  (data.seo_keywords ?? [])
    .map((k) => k.trim())
    .filter(Boolean)
    .forEach((keyword, index) => {
      formData.append(`seo[keywords][${index}]`, keyword);
    });
}

/* =======================
   API
======================= */
export const articlesApi = createApi({
  reducerPath: "articlesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Articles", "Article"],
  endpoints: (builder) => ({
    getArticles: builder.query<IArticle[], void>({
      query: () => ({
        url: "/articles",
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.articles ??
          response?.data?.data ??
          response?.data ??
          response?.articles ??
          [];

        return Array.isArray(raw) ? raw.map(normalizeArticle) : [];
      },
      providesTags: ["Articles"],
    }),

    getArticleById: builder.query<IArticle, number>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.article ??
          response?.data?.data?.article ??
          response?.data?.data ??
          response?.data ??
          response?.article;

        if (!raw) {
          throw new Error("Article data not found");
        }

        return normalizeArticle(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Article", id }],
    }),

    createArticle: builder.mutation<
      { message: string; data?: IArticle },
      ICreateArticlePayload
    >({
      query: (data) => {
        const formData = new FormData();
        appendArticleFormData(formData, data);
        return {
          url: "/articles",
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: ["Articles"],
    }),

    updateArticle: builder.mutation<
      { message: string; data?: IArticle },
      { id: number; data: IUpdateArticlePayload }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        appendArticleFormData(formData, data);
        return {
          url: `/articles/${id}`,
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        "Articles",
        { type: "Article", id },
      ],
    }),

    deleteArticle: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Articles"],
    }),

    toggleArticleStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/articles/toggle-status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          articlesApi.util.updateQueryData(
            "getArticles",
            undefined,
            (draft: IArticle[]) => {
              const article = draft.find((l) => l.id === id);
              if (article) article.is_active = !article.is_active;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useToggleArticleStatusMutation,
} = articlesApi;
