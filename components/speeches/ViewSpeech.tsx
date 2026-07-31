"use client";

import ViewContent from "@/components/content/ViewContent";
import { speechViewConfig } from "@/constants/contentResources";

export default function ViewSpeech() {
  return <ViewContent config={speechViewConfig} />;
}
