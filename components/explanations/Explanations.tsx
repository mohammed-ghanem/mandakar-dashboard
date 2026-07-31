"use client";

import ContentList from "@/components/content/ContentList";
import { explanationListConfig } from "@/constants/contentResources";

export default function Explanations() {
  return <ContentList config={explanationListConfig} />;
}
