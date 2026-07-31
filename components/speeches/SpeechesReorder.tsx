"use client";

import ContentReorder from "@/components/swapOrder/ContentReorder";
import { speechReorderConfig } from "@/constants/reorderResources";

export default function SpeechesReorder() {
  return <ContentReorder config={speechReorderConfig} />;
}
