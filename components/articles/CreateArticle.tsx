"use client";

import CreateContent from "@/components/content/CreateContent";
import { articleCreateConfig } from "@/constants/contentResources";

export default function CreateArticle() {
  return <CreateContent config={articleCreateConfig} />;
}
