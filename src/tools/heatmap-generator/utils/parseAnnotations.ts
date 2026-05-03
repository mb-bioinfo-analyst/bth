import { AnnotationTrack } from "../types"

const DEFAULT_ANNOTATION_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#4f46e5",
  "#b45309",
  "#0f766e",
  "#be123c",
]

function detectDelimiter(line: string): string {
  const tabCount = (line.match(/\t/g) || []).length
  const commaCount = (line.match(/,/g) || []).length
  return tabCount >= commaCount ? "\t" : ","
}

function buildColorMap(values: string[]): Record<string, string> {
  const unique = Array.from(
    new Set(values.map(v => v.trim()).filter(Boolean))
  )

  const colorMap: Record<string, string> = {}
  unique.forEach((value, index) => {
    colorMap[value] = DEFAULT_ANNOTATION_COLORS[index % DEFAULT_ANNOTATION_COLORS.length]
  })
  return colorMap
}

export function parseAnnotationText(
  input: string,
  target: "rows" | "columns"
): { labels: string[]; tracks: AnnotationTrack[] } {
  const text = input.trim()

  if (!text) {
    throw new Error("Please paste an annotation table.")
  }

  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error("Annotation table must include a header row and at least one data row.")
  }

  const delimiter = detectDelimiter(lines[0])
  const header = lines[0].split(delimiter).map(x => x.trim())

  if (header.length < 2) {
    throw new Error("Annotation table must contain one label column and at least one annotation track.")
  }

  const trackNames = header.slice(1)
  const labels: string[] = []
  const trackValues: string[][] = trackNames.map(() => [])

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter).map(x => x.trim())

    if (parts.length < 2) {
      throw new Error(`Annotation row ${i + 1} is incomplete.`)
    }

    const label = parts[0]
    if (!label) {
      throw new Error(`Annotation row ${i + 1} is missing a label.`)
    }

    if (labels.includes(label)) {
      throw new Error(`Duplicate annotation label found: ${label}`)
    }

    labels.push(label)

    for (let j = 0; j < trackNames.length; j++) {
      trackValues[j].push(parts[j + 1] ?? "")
    }
  }

  const tracks: AnnotationTrack[] = trackNames.map((name, index) => ({
    id: `${target}-${name}-${index}-${Date.now()}`,
    target,
    name,
    values: trackValues[index],
    colorMap: buildColorMap(trackValues[index]),
  }))

  return { labels, tracks }
}

export function alignAnnotationTrack(
  track: AnnotationTrack,
  sourceLabels: string[],
  targetLabels: string[]
): AnnotationTrack {
  const lookup = new Map<string, string>()

  sourceLabels.forEach((label, index) => {
    lookup.set(label, track.values[index] ?? "")
  })

  return {
    ...track,
    values: targetLabels.map(label => lookup.get(label) ?? ""),
  }
}