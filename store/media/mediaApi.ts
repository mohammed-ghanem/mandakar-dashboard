import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { ContentCategoryType } from "@/constants/categoryTypes";

export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    deleteAudio: builder.mutation<
      { message?: string },
      { type: ContentCategoryType; id: number }
    >({
      query: ({ type, id }) => {
        const formData = new FormData();
        formData.append("type", type);
        formData.append("id", String(id));
        return {
          url: "/delete-audio",
          method: "post",
          data: formData,
        };
      },
    }),

    deleteAttachment: builder.mutation<
      { message?: string },
      {
        type: ContentCategoryType;
        id: number;
        attachment_id: number;
      }
    >({
      query: ({ type, id, attachment_id }) => {
        const formData = new FormData();
        formData.append("type", type);
        formData.append("id", String(id));
        formData.append("attachment_id", String(attachment_id));
        return {
          url: "/delete-attachment",
          method: "post",
          data: formData,
        };
      },
    }),
  }),
});

export const { useDeleteAudioMutation, useDeleteAttachmentMutation } =
  mediaApi;
