import { HeatmapMatrix, NullableNumber } from "../types"

function detectDelimiter(line: string): string {
  const tabCount = (line.match(/\t/g) || []).length
  const commaCount = (line.match(/,/g) || []).length
  return tabCount >= commaCount ? "\t" : ","
}

function parseValue(raw: string): NullableNumber {
  const value = raw.trim()

  if (
    value === "" ||
    /^na$/i.test(value) ||
    /^nan$/i.test(value) ||
    /^null$/i.test(value) ||
    value === "-"
  ) {
    return null
  }

  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function parseMatrix(input: string): HeatmapMatrix {
  const text = input.trim()

  if (!text) {
    throw new Error("Please paste a CSV or TSV matrix.")
  }

  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error("The matrix must contain a header row and at least one data row.")
  }

  const delimiter = detectDelimiter(lines[0])
  const header = lines[0].split(delimiter).map(x => x.trim())

  if (header.length < 2) {
    throw new Error("The header row must contain one label column and at least one numeric column.")
  }

  const colLabels = header.slice(1)

  if (colLabels.some(label => !label)) {
    throw new Error("Column labels cannot be empty.")
  }

  const rowLabels: string[] = []
  const values: NullableNumber[][] = []

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter).map(x => x.trim())

    if (parts.length < 2) {
      throw new Error(`Row ${i + 1} is incomplete.`)
    }

    const rowLabel = parts[0]
    if (!rowLabel) {
      throw new Error(`Row ${i + 1} is missing a row label.`)
    }

    const numericValues = parts.slice(1).map(parseValue)

    if (numericValues.length !== colLabels.length) {
      throw new Error(
        `Row ${i + 1} has ${numericValues.length} value columns, but the header defines ${colLabels.length}.`
      )
    }

    rowLabels.push(rowLabel)
    values.push(numericValues)
  }

  return { rowLabels, colLabels, values }
}