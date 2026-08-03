/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  IBanner,
  ICreateBannerPayload,
  IUpdateBannerPayload,
  IApiMessageResponse,
} from "@/types/banners";

function normalizeBanner(item: any): IBanner {
  const title = item?.title ?? {};
  const description = item?.description ?? {};

  return {
    id: Number(item?.id) || 0,
    title: {
      ar: title?.ar ?? "",
      en: title?.en ?? "",
    },
    _title: item?._title ?? title?.ar ?? title?.en ?? "",
    description: {
      ar: description?.ar ?? "",
      en: description?.en ?? "",
    },
    category: item?.category ?? "",
    url: item?.url ?? null,
    image: item?.image ?? null,
    is_active: Boolean(
      Number(item?.is_active ?? item?.isActive ?? 0) ||
        item?.is_active === true,
    ),
    sort_order: Number(item?.sort_order ?? item?.order ?? 0),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
  };
}

function appendBannerFormData(
  formData: FormData,
  data: ICreateBannerPayload | IUpdateBannerPayload,
) {
  formData.append("title[ar]", data.title_ar);
  formData.append("title[en]", data.title_en);
  formData.append("description[ar]", data.description_ar ?? "");
  formData.append("description[en]", data.description_en ?? "");
  formData.append("category", data.category);
  formData.append("url", data.url ?? "");
  formData.append("is_active", data.is_active ? "1" : "0");

  if (data.image instanceof File) {
    formData.append("image", data.image);
  }
}

export const bannersApi = createApi({
  reducerPath: "bannersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Banners", "Banner"],
  endpoints: (builder) => ({
    getBanners: builder.query<IBanner[], void>({
      query: () => ({
        url: "/banners",
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.banners ??
          response?.data?.data ??
          response?.data ??
          response?.banners ??
          [];

        return Array.isArray(raw) ? raw.map(normalizeBanner) : [];
      },
      providesTags: ["Banners"],
    }),

    getBannerById: builder.query<IBanner, number>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.banner ??
          response?.data?.data?.banner ??
          response?.data?.data ??
          response?.data ??
          response?.banner;

        if (!raw) {
          throw new Error("Banner data not found");
        }

        return normalizeBanner(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Banner", id }],
    }),

    createBanner: builder.mutation<
      { message: string; data?: IBanner },
      ICreateBannerPayload
    >({
      query: (data) => {
        const formData = new FormData();
        appendBannerFormData(formData, data);
        return {
          url: "/banners",
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: ["Banners"],
    }),

    updateBanner: builder.mutation<
      { message: string; data?: IBanner },
      { id: number; data: IUpdateBannerPayload }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        formData.append("_method", "put");
        appendBannerFormData(formData, data);
        return {
          url: `/banners/${id}`,
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        "Banners",
        { type: "Banner", id },
      ],
    }),

    deleteBanner: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Banners"],
    }),

    toggleBannerStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/banners/toggle-status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          bannersApi.util.updateQueryData("getBanners", undefined, (draft) => {
            const item = draft.find((b) => b.id === id);
            if (item) item.is_active = !item.is_active;
          }),
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
  useGetBannersQuery,
  useGetBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
} = bannersApi;
