import { BoxplotInputRow, ParsedBoxplotData, RawDataTable } from "../types"

function detectDelimiter(text: string): string {
  const firstNonEmptyLine =
    text
      .split(/\r?\n/)
      .map(line => line.trim())
      .find(Boolean) ?? ""

  const tabCount = (firstNonEmptyLine.match(/\t/g) ?? []).length
  const commaCount = (firstNonEmptyLine.match(/,/g) ?? []).length
  const semicolonCount = (firstNonEmptyLine.match(/;/g) ?? []).length

  if (tabCount >= commaCount && tabCount >= semicolonCount) return "\t"
  if (semicolonCount > commaCount) return ";"
  return ","
}

function splitLine(line: string, delimiter: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && next === '"') {
      current += '"'
      i++
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function parseNumber(value: string): number | null {
  const cleaned = value
    .trim()
    .replace(",", ".")

  if (!cleaned || ["NA", "NaN", "null", "None", "-", "."].includes(cleaned)) {
    return null
  }

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseRawDataTable(text: string): RawDataTable {
  const delimiter = detectDelimiter(text)

  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error("Please provide a table with a header row and at least one data row.")
  }

  const headers = splitLine(lines[0], delimiter).map(h => h.trim())

  if (headers.length < 2) {
    throw new Error("The input table must contain at least two columns.")
  }

  const rows = lines.slice(1).map(line => {
    const cells = splitLine(line, delimiter)
    const record: Record<string, string> = {}

    headers.forEach((header, index) => {
      record[header] = cells[index]?.trim() ?? ""
    })

    return record
  })

  return { headers, rows }
}

export function parseBoxplotData(
  text: string,
  groupColumn: string,
  valueColumn: string,
  subgroupColumn?: string,
  labelColumn?: string
): ParsedBoxplotData {
  const table = parseRawDataTable(text)
  const warnings: string[] = []

  if (!table.headers.includes(groupColumn)) {
    throw new Error(`Group column "${groupColumn}" was not found.`)
  }

  if (!table.headers.includes(valueColumn)) {
    throw new Error(`Value column "${valueColumn}" was not found.`)
  }

  if (subgroupColumn && !table.headers.includes(subgroupColumn)) {
    throw new Error(`Subgroup column "${subgroupColumn}" was not found.`)
  }

  if (labelColumn && !table.headers.includes(labelColumn)) {
    throw new Error(`Label column "${labelColumn}" was not found.`)
  }

  const rows: BoxplotInputRow[] = []

  let skippedMissingGroup = 0
  let skippedInvalidValue = 0

  for (const record of table.rows) {
    const group = record[groupColumn]?.trim() ?? ""
    const value = parseNumber(record[valueColumn] ?? "")

    if (!group) {
      skippedMissingGroup++
      continue
    }

    if (value === null) {
      skippedInvalidValue++
      continue
    }

    rows.push({
      group,
      value,
      subgroup: subgroupColumn ? record[subgroupColumn]?.trim() || undefined : undefined,
      label: labelColumn ? record[labelColumn]?.trim() || undefined : undefined,
    })
  }

  if (skippedMissingGroup > 0) {
    warnings.push(`${skippedMissingGroup} row(s) were skipped because the group value was missing.`)
  }

  if (skippedInvalidValue > 0) {
    warnings.push(`${skippedInvalidValue} row(s) were skipped because the numeric value was missing or invalid.`)
  }

  if (rows.length === 0) {
    throw new Error("No valid numeric observations were found.")
  }

  return {
    rows,
    columns: table.headers,
    warnings,
  }
}