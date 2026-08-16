/** Max characters shown for titles in content list tables (then "...") */
export const TABLE_TITLE_MAX_CHARS = 80;

export function truncateTableText(
  value: string,
  maxChars: number = TABLE_TITLE_MAX_CHARS,
) {
  const text = value.trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}...`;
}
