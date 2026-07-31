export const CATEGORY_TYPES = [
  "lectures",
  "articles",
  "speeches",
  "books",
  "explanations",
  "fatwas",
] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

/** Content modules with list/create/edit/view + categories UI. */
export type ContentCategoryType = CategoryType;

export function isCategoryType(value: string): value is CategoryType {
  return (CATEGORY_TYPES as readonly string[]).includes(value);
}
