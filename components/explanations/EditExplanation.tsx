"use client";

import EditContent from "@/components/content/EditContent";
import { explanationEditConfig } from "@/constants/contentResources";

export default function EditExplanation() {
  return <EditContent config={explanationEditConfig} />;
}
