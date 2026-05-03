import { HeatmapMatrix } from "../types"

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length
}

function correlation(a: number[], b: number[]): number {
  const ma = mean(a)
  const mb = mean(b)

  let num = 0
  let da = 0
  let db = 0

  for (let i = 0; i < a.length; i++) {
    const xa = a[i] - ma
    const xb = b[i] - mb
    num += xa * xb
    da += xa * xa
    db += xb * xb
  }

  const denom = Math.sqrt(da) * Math.sqrt(db)
  if (denom === 0) return 0
  return num / denom
}

function safeRow(row: (number | null)[]): number[] {
  return row.map(v => (v === null ? 0 : v))
}

export function buildRowCorrelationMatrix(matrix: HeatmapMatrix): HeatmapMatrix {
  const rowVectors = matrix.values.map(safeRow)
  const labels = [...matrix.rowLabels]

  const values = rowVectors.map(a =>
    rowVectors.map(b => correlation(a, b))
  )

  return {
    rowLabels: labels,
    colLabels: labels,
    values,
  }
}