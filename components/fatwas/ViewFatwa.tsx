"use client";

import ViewContent from "@/components/content/ViewContent";
import { fatwaViewConfig } from "@/constants/contentResources";

export default function ViewFatwa() {
  return <ViewContent config={fatwaViewConfig} />;
}
