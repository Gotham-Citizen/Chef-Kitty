export function normalizeMarkdown(str) {
  if (!str) return str
  return String(str)
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "\t")
}