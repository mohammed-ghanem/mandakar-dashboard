/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  type IAppContactsValue,
  emptyAppContacts,
  SOCIAL_KEYS,
} from "@/types/appContacts";

const SETTINGS_KEY = "website-contacts";

function normalizeAppContacts(raw: any): IAppContactsValue {
  if (!raw || typeof raw !== "object") {
    return emptyAppContacts();
  }

  const social = raw.social && typeof raw.social === "object" ? raw.social : {};

  return {
    whatsapp: String(raw.whatsapp ?? ""),
    email: String(raw.email ?? ""),
    social: {
      facebook: String(social.facebook ?? ""),
      instagram: String(social.instagram ?? ""),
      snapchat: String(social.snapchat ?? ""),
      tiktok: String(social.tiktok ?? ""),
      x: String(social.x ?? social.twitter ?? ""),
      telegram: String(social.telegram ?? ""),
      youtube: String(social.youtube ?? ""),
    },
  };
}

function buildAppContactsFormData(value: IAppContactsValue) {
  const fd = new FormData();
  fd.append("key", SETTINGS_KEY);
  fd.append("value[whatsapp]", value.whatsapp ?? "");
  fd.append("value[email]", value.email ?? "");

  for (const key of SOCIAL_KEYS) {
    fd.append(`value[social][${key}]`, value.social?.[key] ?? "");
  }

  return fd;
}

export const appContactsApi = createApi({
  reducerPath: "appContactsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AppContacts"],
  endpoints: (builder) => ({
    getAppContacts: builder.query<IAppContactsValue, void>({
      query: () => ({
        url: "/settings",
        method: "get",
        params: { key: SETTINGS_KEY },
      }),
      transformResponse: (response: any) => {
        const row =
          response?.data?.[0]?.value ??
          response?.data?.value ??
          response?.value;
        return normalizeAppContacts(row);
      },
      providesTags: ["AppContacts"],
    }),

    updateAppContacts: builder.mutation<
      { message?: string } | any,
      IAppContactsValue
    >({
      query: (value) => ({
        url: "/settings",
        method: "post",
        params: { key: SETTINGS_KEY },
        data: buildAppContactsFormData(value),
        auth: true,
        withCsrf: true,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ["AppContacts"],
    }),
  }),
});

export const { useGetAppContactsQuery, useUpdateAppContactsMutation } =
  appContactsApi;
