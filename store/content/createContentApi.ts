/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  IContentItem,
  ICreateContentPayload,
  IUpdateContentPayload,
  IApiMessageResponse,
} from "@/types/contentResource";

export type CreateContentApiConfig<
  ReducerPath extends string = string,
  ListTag extends string = string,
  ItemTag extends string = string,
> = {
  reducerPath: ReducerPath;
  basePath: string;
  listTag: ListTag;
  itemTag: ItemTag;
  pluralResponseKey: string;
  singularResponseKey: string;
};

function normalizeContentItem(item: any): IContentItem {
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

function appendContentFormData(
  formData: FormData,
  data: ICreateContentPayload | IUpdateContentPayload,
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

export function createContentApi<
  ReducerPath extends string,
  ListTag extends string,
  ItemTag extends string,
>(config: CreateContentApiConfig<ReducerPath, ListTag, ItemTag>) {
  const {
    reducerPath,
    basePath,
    listTag,
    itemTag,
    pluralResponseKey,
    singularResponseKey,
  } = config;

  const api = createApi({
    reducerPath,
    baseQuery: axiosBaseQuery(),
    tagTypes: [listTag, itemTag],
    endpoints: (builder) => ({
      getList: builder.query<IContentItem[], void>({
        query: () => ({
          url: `/${basePath}`,
          method: "get",
        }),
        transformResponse: (response: any) => {
          const raw =
            response?.data?.[pluralResponseKey] ??
            response?.data?.data ??
            response?.data ??
            response?.[pluralResponseKey] ??
            [];

          return Array.isArray(raw) ? raw.map(normalizeContentItem) : [];
        },
        providesTags: [listTag],
      }),

      getById: builder.query<IContentItem, number>({
        query: (id) => ({
          url: `/${basePath}/${id}`,
          method: "get",
        }),
        transformResponse: (response: any) => {
          const raw =
            response?.data?.[singularResponseKey] ??
            response?.data?.data?.[singularResponseKey] ??
            response?.data?.data ??
            response?.data ??
            response?.[singularResponseKey];

          if (!raw) {
            throw new Error("Content data not found");
          }

          return normalizeContentItem(raw);
        },
        providesTags: (_r, _e, id) => [{ type: itemTag, id }],
      }),

      create: builder.mutation<
        { message: string; data?: IContentItem },
        ICreateContentPayload
      >({
        query: (data) => {
          const formData = new FormData();
          appendContentFormData(formData, data);
          return {
            url: `/${basePath}`,
            method: "post",
            data: formData,
          };
        },
        invalidatesTags: [listTag],
      }),

      update: builder.mutation<
        { message: string; data?: IContentItem },
        { id: number; data: IUpdateContentPayload }
      >({
        query: ({ id, data }) => {
          const formData = new FormData();
          appendContentFormData(formData, data);
          return {
            url: `/${basePath}/${id}`,
            method: "put",
            data: formData,
          };
        },
        invalidatesTags: (_r, _e, { id }) => [
          listTag,
          { type: itemTag, id },
        ],
      }),

      delete: builder.mutation<IApiMessageResponse, number>({
        query: (id) => ({
          url: `/${basePath}/${id}`,
          method: "delete",
        }),
        invalidatesTags: [listTag],
      }),

      toggleStatus: builder.mutation<{ message: string }, number>({
        query: (id) => ({
          url: `/${basePath}/toggle-status/${id}`,
          method: "post",
        }),
        async onQueryStarted(id, { dispatch, queryFulfilled }) {
          // Cast needed: circular `api` ref inside createApi endpoints
          const patch = dispatch(
            (api as any).util.updateQueryData(
              "getList",
              undefined,
              (draft: IContentItem[]) => {
                const item = draft.find((l) => l.id === id);
                if (item) item.is_active = !item.is_active;
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

  return api;
}
