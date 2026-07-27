/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  ISpeech,
  ICreateSpeechPayload,
  IUpdateSpeechPayload,
  IApiMessageResponse,
} from "@/types/speeches";

/* =======================
   NORMALIZER
======================= */
function normalizeSpeech(item: any): ISpeech {
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

function appendSpeechFormData(
  formData: FormData,
  data: ICreateSpeechPayload | IUpdateSpeechPayload,
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
export const speechesApi = createApi({
  reducerPath: "speechesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Speeches", "Speech"],
  endpoints: (builder) => ({
    getSpeeches: builder.query<ISpeech[], void>({
      query: () => ({
        url: "/speeches",
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.speeches ??
          response?.data?.data ??
          response?.data ??
          response?.speeches ??
          [];

        return Array.isArray(raw) ? raw.map(normalizeSpeech) : [];
      },
      providesTags: ["Speeches"],
    }),

    getSpeechById: builder.query<ISpeech, number>({
      query: (id) => ({
        url: `/speeches/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.speech ??
          response?.data?.data?.speech ??
          response?.data?.data ??
          response?.data ??
          response?.speech;

        if (!raw) {
          throw new Error("Speech data not found");
        }

        return normalizeSpeech(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Speech", id }],
    }),

    createSpeech: builder.mutation<
      { message: string; data?: ISpeech },
      ICreateSpeechPayload
    >({
      query: (data) => {
        const formData = new FormData();
        appendSpeechFormData(formData, data);
        return {
          url: "/speeches",
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: ["Speeches"],
    }),

    updateSpeech: builder.mutation<
      { message: string; data?: ISpeech },
      { id: number; data: IUpdateSpeechPayload }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        appendSpeechFormData(formData, data);
        return {
          url: `/speeches/${id}`,
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        "Speeches",
        { type: "Speech", id },
      ],
    }),

    deleteSpeech: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/speeches/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Speeches"],
    }),

    toggleSpeechStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/speeches/toggle-status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          speechesApi.util.updateQueryData(
            "getSpeeches",
            undefined,
            (draft: ISpeech[]) => {
              const speech = draft.find((l) => l.id === id);
              if (speech) speech.is_active = !speech.is_active;
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
  useGetSpeechesQuery,
  useGetSpeechByIdQuery,
  useCreateSpeechMutation,
  useUpdateSpeechMutation,
  useDeleteSpeechMutation,
  useToggleSpeechStatusMutation,
} = speechesApi;
