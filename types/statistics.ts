export interface IContentModuleStats {
  total: number;
  active: number;
  inactive: number;
}

export interface IQuickStats {
  content: number;
  categories: number;
  admins: number;
  roles: number;
}

export interface IPublishingHealth {
  active: number;
  inactive: number;
  addedThisWeek: number;
  activePercentage: number;
}

export interface IStatistics {
  totalVisits: number;
  quickStats: IQuickStats;
  contentDistribution: Record<string, IContentModuleStats>;
  publishingHealth: IPublishingHealth;
}

export const emptyStatistics: IStatistics = {
  totalVisits: 0,
  quickStats: {
    content: 0,
    categories: 0,
    admins: 0,
    roles: 0,
  },
  contentDistribution: {},
  publishingHealth: {
    active: 0,
    inactive: 0,
    addedThisWeek: 0,
    activePercentage: 0,
  },
};
