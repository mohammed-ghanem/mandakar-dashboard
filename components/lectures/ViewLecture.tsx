"use client";

import ViewContent from "@/components/content/ViewContent";
import { lectureViewConfig } from "@/constants/contentResources";

export default function ViewLecture() {
  return <ViewContent config={lectureViewConfig} />;
}
