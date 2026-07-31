"use client";

import ViewContent from "@/components/content/ViewContent";
import { bookViewConfig } from "@/constants/contentResources";

export default function ViewBook() {
  return <ViewContent config={bookViewConfig} />;
}
