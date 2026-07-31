"use client";

import ContentReorder from "@/components/swapOrder/ContentReorder";
import { explanationReorderConfig } from "@/constants/reorderResources";

export default function ExplanationsReorder() {
  return <ContentReorder config={explanationReorderConfig} />;
}
