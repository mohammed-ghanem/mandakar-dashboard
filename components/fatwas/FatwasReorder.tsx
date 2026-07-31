"use client";

import ContentReorder from "@/components/swapOrder/ContentReorder";
import { fatwaReorderConfig } from "@/constants/reorderResources";

export default function FatwasReorder() {
  return <ContentReorder config={fatwaReorderConfig} />;
}
