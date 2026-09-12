import type { CategoryType } from "@/constants/categoryTypes";

/**
 * Postman: categories || sub_categories || sub_sub_categories
 * || lectures || articles || speeches || books || explanations || fatwas || banners
 */
export type SwapOrderType =
  | CategoryType
  | "categories"
  | "sub_categories"
  | "sub_sub_categories"
  | "banners";

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
