"use client";

import ContentList from "@/components/content/ContentList";
import { fatwaListConfig } from "@/constants/contentResources";

export default function Fatwas() {
  return <ContentList config={fatwaListConfig} />;
}
