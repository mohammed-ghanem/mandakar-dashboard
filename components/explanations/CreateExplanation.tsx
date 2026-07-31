"use client";

import CreateContent from "@/components/content/CreateContent";
import { explanationCreateConfig } from "@/constants/contentResources";

export default function CreateExplanation() {
  return <CreateContent config={explanationCreateConfig} />;
}
