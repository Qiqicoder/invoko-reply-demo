/** Strip `[mem: …]` syntax for plain-text previews (sent replies, People cards). */
export function stripMemSyntax(text: string): string {
  return text
    .replace(/\[mem:\s*([^\]]+)\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate with ellipsis for card previews. */
export function previewText(text: string, maxLen: number): string {
  const plain = stripMemSyntax(text);
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trim()}…`;
}
