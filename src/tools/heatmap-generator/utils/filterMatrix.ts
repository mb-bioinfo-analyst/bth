import { HeatmapMatrix } from "../types"

function variance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
}

export function filterMatrix(
  matrix: HeatmapMatrix,
  rowSearch: string,
  colSearch: string,
  topNRows: number | null,
  topNCols: number | null
): HeatmapMatrix {
  let rowIndices = matrix.rowLabels.map((_, i) => i)
  let colIndices = matrix.colLabels.map((_, i) => i)

  if (rowSearch.trim()) {
    const q = rowSearch.trim().toLowerCase()
    rowIndices = rowIndices.filter(i => matrix.rowLabels[i].toLowerCase().includes(q))
  }

  if (colSearch.trim()) {
    const q = colSearch.trim().toLowerCase()
    colIndices = colIndices.filter(i => matrix.colLabels[i].toLowerCase().includes(q))
  }

  if (topNRows !== null && topNRows > 0) {
    rowIndices = [...rowIndices]
      .sort((a, b) => {
        const va = variance(matrix.values[a].filter((v): v is number => v !== null))
        const vb = variance(matrix.values[b].filter((v): v is number => v !== null))
        return vb - va
      })
      .slice(0, topNRows)
  }

  if (topNCols !== null && topNCols > 0) {
    colIndices = [...colIndices]
      .sort((a, b) => {
        const colA = matrix.values.map(r => r[a]).filter((v): v is number => v !== null)
        const colB = matrix.values.map(r => r[b]).filter((v): v is number => v !== null)
        return variance(colB) - variance(colA)
      })
      .slice(0, topNCols)
  }

  return {
    rowLabels: rowIndices.map(i => matrix.rowLabels[i]),
    colLabels: colIndices.map(i => matrix.colLabels[i]),
    values: rowIndices.map(i => colIndices.map(j => matrix.values[i][j])),
  }
}