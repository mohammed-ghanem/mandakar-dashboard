"use client";

import ViewContent from "@/components/content/ViewContent";
import { articleViewConfig } from "@/constants/contentResources";

export default function ViewArticle() {
  return <ViewContent config={articleViewConfig} />;
}
