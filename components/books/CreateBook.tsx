"use client";

import CreateContent from "@/components/content/CreateContent";
import { bookCreateConfig } from "@/constants/contentResources";

export default function CreateBook() {
  return <CreateContent config={bookCreateConfig} />;
}
