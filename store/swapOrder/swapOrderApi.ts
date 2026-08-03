/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import { categoriesApi } from "@/store/categories/categoriesApi";
import { lecturesApi } from "@/store/lectures/lecturesApi";
import { speechesApi } from "@/store/speeches/speechesApi";
import { articlesApi } from "@/store/articles/articlesApi";
import { booksApi } from "@/store/books/booksApi";
import { explanationsApi } from "@/store/explanations/explanationsApi";
import { fatwasApi } from "@/store/fatwas/fatwasApi";
import { bannersApi } from "@/store/banners/bannersApi";
import type { SwapOrderPayload, SwapOrderType } from "@/types/swapOrder";

type ApiWithTags = {
  util: {
    invalidateTags: (tags: any[]) => any;
  };
};

const contentInvalidation: Partial<
  Record<SwapOrderType, { api: ApiWithTags; tags: any[] }>
> = {
  lectures: {
    api: lecturesApi as ApiWithTags,
    tags: ["Lectures", "Lecture"],
  },
  speeches: {
    api: speechesApi as ApiWithTags,
    tags: ["Speeches", "Speech"],
  },
  articles: {
    api: articlesApi as ApiWithTags,
    tags: ["Articles", "Article"],
  },
  books: {
    api: booksApi as ApiWithTags,
    tags: ["Books", "Book"],
  },
  explanations: {
    api: explanationsApi as ApiWithTags,
    tags: ["Explanations", "Explanation"],
  },
  fatwas: {
    api: fatwasApi as ApiWithTags,
    tags: ["Fatwas", "Fatwa"],
  },
  banners: {
    api: bannersApi as ApiWithTags,
    tags: ["Banners", "Banner"],
  },
};

export const swapOrderApi = createApi({
  reducerPath: "swapOrderApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    swapOrder: builder.mutation<{ message?: string }, SwapOrderPayload>({
      query: ({ type, first_id, second_id }) => {
        const formData = new FormData();
        formData.append("type", type);
        formData.append("first_id", String(first_id));
        formData.append("second_id", String(second_id));

        return {
          url: "/swap-order",
          method: "post",
          data: formData,
        };
      },
      async onQueryStarted(
        { type, skipInvalidate },
        { dispatch, queryFulfilled },
      ) {
        try {
          await queryFulfilled;
          if (skipInvalidate) return;

          if (type === "categories") {
            dispatch(
              categoriesApi.util.invalidateTags(["Categories", "Category"]),
            );
            return;
          }

          const target = contentInvalidation[type];
          if (target) {
            dispatch(target.api.util.invalidateTags(target.tags));
          }
        } catch {
          // Caller handles toast / local revert.
        }
      },
    }),
  }),
});

export const { useSwapOrderMutation } = swapOrderApi;
