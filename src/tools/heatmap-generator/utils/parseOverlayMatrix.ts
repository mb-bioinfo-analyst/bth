import { HeatmapMatrix } from "../types"
import { parseMatrix } from "./parseMatrix"

export function parseOverlayMatrix(input: string): HeatmapMatrix {
  return parseMatrix(input)
}

export function alignOverlayMatrix(
  overlay: HeatmapMatrix,
  targetRows: string[],
  targetCols: string[]
): HeatmapMatrix {
  const rowIndex = new Map<string, number>()
  const colIndex = new Map<string, number>()

  overlay.rowLabels.forEach((label, i) => rowIndex.set(label, i))
  overlay.colLabels.forEach((label, i) => colIndex.set(label, i))

  const values = targetRows.map(rowLabel =>
    targetCols.map(colLabel => {
      const ri = rowIndex.get(rowLabel)
      const ci = colIndex.get(colLabel)

      if (ri === undefined || ci === undefined) return null
      return overlay.values[ri]?.[ci] ?? null
    })
  )

  return {
    rowLabels: [...targetRows],
    colLabels: [...targetCols],
    values,
  }
}