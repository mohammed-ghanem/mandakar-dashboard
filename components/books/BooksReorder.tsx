"use client";

import ContentReorder from "@/components/swapOrder/ContentReorder";
import { bookReorderConfig } from "@/constants/reorderResources";

export default function BooksReorder() {
  return <ContentReorder config={bookReorderConfig} />;
}
