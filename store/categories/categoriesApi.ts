/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  ICategory,
  ICategoryFlat,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
  IApiMessageResponse,
} from "@/types/categories";

/* =======================
   NORMALIZER
======================= */
function normalizeCategory(item: any): ICategory {
  const name = item?.name ?? {};
  const children = Array.isArray(item?.children)
    ? item.children.map(normalizeCategory)
    : [];

  return {
    id: Number(item?.id) || 0,
    name: {
      ar: name?.ar ?? "",
      en: name?.en ?? "",
    },
    _name: item?._name ?? name?.ar ?? name?.en ?? "",
    slug: item?.slug,
    parent_id:
      item?.parent_id === null || item?.parent_id === undefined
        ? null
        : Number(item.parent_id),
    depth: Number(item?.depth) || 1,
    is_active: Boolean(
      Number(item?.is_active ?? item?.isActive ?? 0) ||
        item?.is_active === true,
    ),
    sort_order: Number(item?.sort_order ?? 0),
    parent: item?.parent
      ? {
          id: Number(item.parent.id),
          name: {
            ar: item.parent?.name?.ar ?? "",
            en: item.parent?.name?.en ?? "",
          },
          _name: item.parent?._name,
        }
      : null,
    children,
    created_at: item?.created_at,
    updated_at: item?.updated_at,
  };
}

export function flattenCategories(
  nodes: ICategory[],
  lang: "ar" | "en" = "ar",
): ICategoryFlat[] {
  const result: ICategoryFlat[] = [];

  const walk = (list: ICategory[]) => {
    for (const node of list) {
      result.push({
        ...node,
        name_ar: node.name?.ar ?? "",
        name_en: node.name?.en ?? "",
        parent_name:
          node.parent?._name ??
          node.parent?.name?.[lang] ??
          node.parent?.name?.ar ??
          node.parent?.name?.en ??
          "",
      });
      if (node.children?.length) walk(node.children);
    }
  };

  walk(nodes);
  return result;
}

/* =======================
   API
======================= */
export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Categories", "Category"],
  endpoints: (builder) => ({
    getCategoriesTree: builder.query<
      ICategory[],
      { is_active?: number | string } | void
    >({
      query: (params) => ({
        url: "/categories/tree",
        method: "get",
        params: params ?? undefined,
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.categories ??
          response?.data?.data ??
          response?.data ??
          response?.categories ??
          [];

        return Array.isArray(raw) ? raw.map(normalizeCategory) : [];
      },
      providesTags: ["Categories"],
    }),

    getCategories: builder.query<
      ICategory[],
      {
        name?: string;
        parent_id?: number | string | null;
        roots?: number | string;
        is_active?: number | string;
        orderBy?: string;
      } | void
    >({
      query: (params) => ({
        url: "/categories",
        method: "get",
        params: params ?? undefined,
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.categories ??
          response?.data?.data ??
          response?.data ??
          response?.categories ??
          [];

        return Array.isArray(raw) ? raw.map(normalizeCategory) : [];
      },
      providesTags: ["Categories"],
    }),

    getCategoryById: builder.query<ICategory, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.category ??
          response?.data?.data?.category ??
          response?.data?.data ??
          response?.data ??
          response?.category;

        if (!raw) {
          throw new Error("Category data not found");
        }

        return normalizeCategory(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Category", id }],
    }),

    createCategory: builder.mutation<
      { message: string; data?: ICategory },
      ICreateCategoryPayload
    >({
      query: (data) => {
        const formData = new FormData();
        formData.append("name[ar]", data.name_ar);
        formData.append("name[en]", data.name_en);
        formData.append("is_active", data.is_active ? "1" : "0");

        if (data.parent_id != null && data.parent_id !== undefined) {
          formData.append("parent_id", String(data.parent_id));
        }

        if (data.sort_order !== undefined) {
          formData.append("sort_order", String(data.sort_order));
        }

        return {
          url: "/categories",
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<
      { message: string; data?: ICategory },
      { id: number; data: IUpdateCategoryPayload }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        formData.append("name[ar]", data.name_ar);
        formData.append("name[en]", data.name_en);
        formData.append("is_active", data.is_active ? "1" : "0");

        if (data.parent_id !== undefined) {
          if (data.parent_id == null) {
            formData.append("parent_id", "");
          } else {
            formData.append("parent_id", String(data.parent_id));
          }
        }

        if (data.sort_order !== undefined) {
          formData.append("sort_order", String(data.sort_order));
        }

        return {
          url: `/categories/${id}`,
          method: "put",
          data: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        "Categories",
        { type: "Category", id },
      ],
    }),

    deleteCategory: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          categoriesApi.util.updateQueryData(
            "getCategoriesTree",
            undefined,
            (draft: ICategory[]) => {
              const removeFromTree = (nodes: ICategory[]): boolean => {
                const index = nodes.findIndex((n) => n.id === id);
                if (index !== -1) {
                  nodes.splice(index, 1);
                  return true;
                }
                for (const node of nodes) {
                  if (node.children?.length && removeFromTree(node.children)) {
                    return true;
                  }
                }
                return false;
              };
              removeFromTree(draft);
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Categories"],
    }),

    toggleCategoryStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/categories/toggle-status/${id}`,
        method: "post",
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchTree = dispatch(
          categoriesApi.util.updateQueryData(
            "getCategoriesTree",
            undefined,
            (draft: ICategory[]) => {
              const toggleInTree = (nodes: ICategory[]): boolean => {
                for (const node of nodes) {
                  if (node.id === id) {
                    node.is_active = !node.is_active;
                    return true;
                  }
                  if (node.children?.length && toggleInTree(node.children)) {
                    return true;
                  }
                }
                return false;
              };
              toggleInTree(draft);
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchTree.undo();
        }
      },

      // no invalidatesTags — optimistic patch only (silent toggle)
    }),
  }),
});

export const {
  useGetCategoriesTreeQuery,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
} = categoriesApi;
