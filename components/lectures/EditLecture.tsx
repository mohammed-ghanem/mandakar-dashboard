"use client";

import EditContent from "@/components/content/EditContent";
import { lectureEditConfig } from "@/constants/contentResources";

export default function EditLecture() {
  return <EditContent config={lectureEditConfig} />;
}
