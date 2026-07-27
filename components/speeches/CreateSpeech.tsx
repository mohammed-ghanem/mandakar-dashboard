"use client";

import CreateContent from "@/components/content/CreateContent";
import { speechCreateConfig } from "@/constants/contentResources";

export default function CreateSpeech() {
  return <CreateContent config={speechCreateConfig} />;
}
