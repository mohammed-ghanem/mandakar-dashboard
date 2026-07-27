/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  ILecture,
  ICreateLecturePayload,
  IUpdateLecturePayload,
  IApiMessageResponse,
} from "@/types/lectures";

/* =======================
   NORMALIZER
======================= */
function normalizeLecture(item: any): ILecture {
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

function appendLectureFormData(
  formData: FormData,
  data: ICreateLecturePayload | IUpdateLecturePayload,
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
export const lecturesApi = createApi({
  reducerPath: "lecturesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Lectures", "Lecture"],
  endpoints: (builder) => ({
    getLectures: builder.query<ILecture[], void>({
      query: () => ({
        url: "/lectures",
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.lectures ??
          response?.data?.data ??
          response?.data ??
          response?.lectures ??
          [];

        return Array.isArray(raw) ? raw.map(normalizeLecture) : [];
      },
      providesTags: ["Lectures"],
    }),

    getLectureById: builder.query<ILecture, number>({
      query: (id) => ({
        url: `/lectures/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.lecture ??
          response?.data?.data?.lecture ??
          response?.data?.data ??
          response?.data ??
          response?.lecture;

        if (!raw) {
          throw new Error("Lecture data not found");
        }

        return normalizeLecture(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Lecture", id }],
    }),

    createLecture: builder.mutation<
      { message: string; data?: ILecture },
      ICreateLecturePayload
    >({
      query: (data) => {
        const formData = new FormData();
        appendLectureFormData(formData, data);
        return {
          url: "/lectures",
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: ["Lectures"],
    }),

    updateLecture: builder.mutation<
      { message: string; data?: ILecture },
      { id: number; data: IUpdateLecturePayload }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        appendLectureFormData(formData, data);
        return {
          url: `/lectures/${id}`,
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        "Lectures",
        { type: "Lecture", id },
      ],
    }),

    deleteLecture: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/lectures/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Lectures"],
    }),

    toggleLectureStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/lectures/toggle-status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          lecturesApi.util.updateQueryData(
            "getLectures",
            undefined,
            (draft: ILecture[]) => {
              const lecture = draft.find((l) => l.id === id);
              if (lecture) lecture.is_active = !lecture.is_active;
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
  useGetLecturesQuery,
  useGetLectureByIdQuery,
  useCreateLectureMutation,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
  useToggleLectureStatusMutation,
} = lecturesApi;
