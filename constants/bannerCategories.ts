/** Banner `category` values as used by the API (Postman example: speech). */
export const BANNER_CATEGORIES = [
  "lecture",
  "speech",
  "article",
  "book",
  "explanation",
  "fatwa",
] as const;

export type BannerCategory = (typeof BANNER_CATEGORIES)[number];

export function isBannerCategory(value: string): value is BannerCategory {
  return (BANNER_CATEGORIES as readonly string[]).includes(value);
}
