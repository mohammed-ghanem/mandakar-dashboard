"use client";

import EditContent from "@/components/content/EditContent";
import { fatwaEditConfig } from "@/constants/contentResources";

export default function EditFatwa() {
  return <EditContent config={fatwaEditConfig} />;
}
