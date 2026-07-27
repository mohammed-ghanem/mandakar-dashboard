"use client";

import ContentList from "@/components/content/ContentList";
import { speechListConfig } from "@/constants/contentResources";

export default function Speeches() {
  return <ContentList config={speechListConfig} />;
}
