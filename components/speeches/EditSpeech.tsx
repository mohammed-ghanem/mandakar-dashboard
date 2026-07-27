"use client";

import EditContent from "@/components/content/EditContent";
import { speechEditConfig } from "@/constants/contentResources";

export default function EditSpeech() {
  return <EditContent config={speechEditConfig} />;
}
