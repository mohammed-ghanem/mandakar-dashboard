"use client";

import ContentReorder from "@/components/swapOrder/ContentReorder";
import { lectureReorderConfig } from "@/constants/reorderResources";

export default function LecturesReorder() {
  return <ContentReorder config={lectureReorderConfig} />;
}
