"use client";

import EditContent from "@/components/content/EditContent";
import { articleEditConfig } from "@/constants/contentResources";

export default function EditArticle() {
  return <EditContent config={articleEditConfig} />;
}
