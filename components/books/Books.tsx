"use client";

import ContentList from "@/components/content/ContentList";
import { bookListConfig } from "@/constants/contentResources";

export default function Books() {
  return <ContentList config={bookListConfig} />;
}
