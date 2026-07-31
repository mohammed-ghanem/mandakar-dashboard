"use client";

import { dash } from "@/constants/dashboardUi";
import WelcomeBanner from "./WelcomeBanner";
import Statistics from "./Statistics";
import ContentModulesSection from "./ContentModulesSection";
import PublishingHealth from "./PublishingHealth";
import RecentActivity from "./RecentActivity";
import QuickLinks from "./QuickLinks";

export default function Dashboard() {
  return (
    <div className={dash.page}>
      <div className="space-y-8 md:space-y-10">
        <WelcomeBanner />
        <Statistics />
        <ContentModulesSection />
        <PublishingHealth />
        {/* <RecentActivity /> */}
        <QuickLinks />
      </div>
    </div>
  );
}
