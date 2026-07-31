"use client";

import EditContent from "@/components/content/EditContent";
import { bookEditConfig } from "@/constants/contentResources";

export default function EditBook() {
  return <EditContent config={bookEditConfig} />;
}
