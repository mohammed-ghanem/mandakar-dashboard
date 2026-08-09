/** Replace whitespace with commas so keywords stay comma-separated on type/paste. */
export function normalizeKeywordsInput(value: string) {
  return value.replace(/\s+/g, ",").replace(/,+/g, ",");
}
