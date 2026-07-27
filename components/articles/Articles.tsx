"use client";

import ContentList from "@/components/content/ContentList";
import { articleListConfig } from "@/constants/contentResources";

export default function Articles() {
  return <ContentList config={articleListConfig} />;
}
