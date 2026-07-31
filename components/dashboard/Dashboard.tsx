"use client";

import { dash } from "@/constants/dashboardUi";
import WelcomeBanner from "./WelcomeBanner";
import Statistics from "./Statistics";
import ContentModulesSection from "./ContentModulesSection";
import CategoriesBreakdown from "./CategoriesBreakdown";
import PublishingHealth from "./PublishingHealth";
import SystemAccessSection from "./SystemAccessSection";
import RecentActivity from "./RecentActivity";
import QuickLinks from "./QuickLinks";

export default function Dashboard() {
  return (
    <div className={dash.page}>
      <div className="space-y-8 md:space-y-10">
        <WelcomeBanner />
        <Statistics />
        <ContentModulesSection />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PublishingHealth />
          <CategoriesBreakdown />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <RecentActivity />
          <SystemAccessSection />
        </div>

        <QuickLinks />
      </div>
    </div>
  );
}
