"use client";

import ContentList from "@/components/content/ContentList";
import { lectureListConfig } from "@/constants/contentResources";

export default function Lectures() {
  return <ContentList config={lectureListConfig} />;
}
