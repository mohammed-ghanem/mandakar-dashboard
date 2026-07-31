"use client";

import ContentReorder from "@/components/swapOrder/ContentReorder";
import { articleReorderConfig } from "@/constants/reorderResources";

export default function ArticlesReorder() {
  return <ContentReorder config={articleReorderConfig} />;
}
