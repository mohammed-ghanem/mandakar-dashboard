import type { CategoryType } from "@/constants/categoryTypes";

/** Postman: categories || lectures || articles || speeches || books || explanations || fatwas */
export type SwapOrderType = CategoryType | "categories";

export type SwapOrderPayload = {
  type: SwapOrderType;
  first_id: number;
  second_id: number;
  /** Skip cache invalidation (used while chaining adjacent swaps). */
  skipInvalidate?: boolean;
};

export type SwapOrderItem = {
  id: number;
  label: string;
};
