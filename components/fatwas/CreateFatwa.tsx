"use client";

import CreateContent from "@/components/content/CreateContent";
import { fatwaCreateConfig } from "@/constants/contentResources";

export default function CreateFatwa() {
  return <CreateContent config={fatwaCreateConfig} />;
}
