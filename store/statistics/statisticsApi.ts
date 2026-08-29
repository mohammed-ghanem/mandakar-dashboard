/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  emptyStatistics,
  type IContentModuleStats,
  type IStatistics,
} from "@/types/statistics";

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeModuleStats(item: any): IContentModuleStats {
  return {
    total: toNumber(item?.total ?? item?.count),
    active: toNumber(item?.active),
    inactive: toNumber(item?.inactive),
  };
}

function normalizeStatistics(payload: any): IStatistics {
  const stats =
    payload?.data?.statistics ??
    payload?.statistics ??
    payload?.data ??
    payload ??
    {};

  const quickStats = stats?.quick_stats ?? stats?.quickStats ?? {};
  const distribution =
    stats?.content_distribution ?? stats?.contentDistribution ?? {};
  const health = stats?.publishing_health ?? stats?.publishingHealth ?? {};

  const contentDistribution: Record<string, IContentModuleStats> = {};
  if (distribution && typeof distribution === "object") {
    Object.entries(distribution).forEach(([key, value]) => {
      contentDistribution[key] = normalizeModuleStats(value);
    });
  }

  const active = toNumber(health?.active);
  const inactive = toNumber(health?.inactive);
  const total = active + inactive;
  const activePercentage =
    health?.active_percentage != null || health?.activePercentage != null
      ? toNumber(health?.active_percentage ?? health?.activePercentage)
      : total > 0
        ? Math.round((active / total) * 100)
        : 0;

  return {
    totalVisits: toNumber(stats?.total_visits ?? stats?.totalVisits),
    quickStats: {
      content: toNumber(
        quickStats?.total_content ??
          quickStats?.content ??
          quickStats?.totalContent,
      ),
      categories: toNumber(quickStats?.categories),
      admins: toNumber(quickStats?.users ?? quickStats?.admins),
      roles: toNumber(quickStats?.roles),
    },
    contentDistribution,
    publishingHealth: {
      active,
      inactive,
      addedThisWeek: toNumber(
        health?.added_this_week ??
          health?.publishedThisWeek ??
          health?.addedThisWeek,
      ),
      activePercentage,
    },
  };
}

export const statisticsApi = createApi({
  reducerPath: "statisticsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Statistics"],
  endpoints: (builder) => ({
    getStatistics: builder.query<IStatistics, void>({
      query: () => ({
        url: "/statistics",
        method: "GET",
        auth: true,
      }),
      transformResponse: (response: any) => normalizeStatistics(response),
      providesTags: ["Statistics"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetStatisticsQuery } = statisticsApi;

export { emptyStatistics };
