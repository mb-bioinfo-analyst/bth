import * as XLSX from "xlsx"

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function sheetToDelimitedText(sheet: XLSX.WorkSheet): string {
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  })

  const cleanedRows = rows
    .map((row) => row.map(cellToString))
    .filter((row) => row.some((cell) => cell !== ""))

  return cleanedRows
    .map((row) => row.join("\t"))
    .join("\n")
}

function findFirstNonEmptySheet(workbook: XLSX.WorkBook): XLSX.WorkSheet | null {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const ref = sheet["!ref"]
    if (!ref) continue

    const text = sheetToDelimitedText(sheet)
    if (text.trim()) {
      return sheet
    }
  }

  return null
}

export async function parseExcelToDelimitedText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })

  if (!workbook.SheetNames.length) {
    throw new Error("The Excel file does not contain any sheets.")
  }

  const sheet = findFirstNonEmptySheet(workbook)

  if (!sheet) {
    throw new Error("No non-empty sheet was found in the Excel file.")
  }

  const text = sheetToDelimitedText(sheet)

  if (!text.trim()) {
    throw new Error("The selected Excel sheet is empty.")
  }

  return text
}