import type { RevelResult } from "../types"

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportCSV(results: RevelResult[]) {
  if (!results.length) return

  const header = [
    "input",
    "chr",
    "pos",
    "ref",
    "alt",
    "revel_score",
    "classification",
    "evidence",
    "gene_symbol",
    "gene_id",
    "gene_biotype",
  ]

  const rows = results.map((r) => [
    r.input,
    r.variant?.chr ?? "",
    r.variant?.pos ?? "",
    r.variant?.ref ?? "",
    r.variant?.alt ?? "",
    r.score ?? "",
    r.classification.label,
    r.classification.evidence,
    r.gene?.symbol ?? "",
    r.gene?.geneId ?? "",
    r.gene?.biotype ?? "",
  ])

  const csv = [
    header.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = "revel_results.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}