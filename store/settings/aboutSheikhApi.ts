/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";

interface SettingValue {
  ar: string;
  en?: string;
  message?: string;
}

export const aboutSheikhApi = createApi({
  reducerPath: "aboutSheikhApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AboutSheikh"],
  endpoints: (builder) => ({
    getAboutSheikh: builder.query<SettingValue, void>({
      query: () => ({
        url: "/settings",
        method: "get",
        params: { key: "about-sheikh" },
      }),
      transformResponse: (response: any) => {
        return response?.data?.[0]?.value ?? { ar: "", en: "" };
      },
      keepUnusedDataFor: 300,
    }),

    updateAboutSheikh: builder.mutation<SettingValue, SettingValue>({
      query: (value) => ({
        url: "/settings",
        method: "post",
        params: { key: "about-sheikh" },
        data: { value },
        auth: true,
        withCsrf: true,
      }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["AboutSheikh"],
    }),
  }),
});

export const {
  useGetAboutSheikhQuery,
  useUpdateAboutSheikhMutation,
} = aboutSheikhApi;
