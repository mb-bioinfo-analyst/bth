export function categoryToSlug(category: string) {
  return category
    .toLowerCase()
    .replace(/bioinformatics tools?/i, "")
    .replace(/tools?/i, "")
    .trim()
    .replace(/\s+/g, "-")
}