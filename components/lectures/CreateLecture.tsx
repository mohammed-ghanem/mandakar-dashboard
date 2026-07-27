"use client";

import CreateContent from "@/components/content/CreateContent";
import { lectureCreateConfig } from "@/constants/contentResources";

export default function CreateLecture() {
  return <CreateContent config={lectureCreateConfig} />;
}
