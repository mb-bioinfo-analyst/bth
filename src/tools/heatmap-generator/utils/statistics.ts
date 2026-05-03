import { HeatmapMatrix, MatrixStats } from "../types"

export function numericValues(matrix: HeatmapMatrix): number[] {
  return matrix.values.flat().filter((v): v is number => v !== null && Number.isFinite(v))
}

export function matrixStats(matrix: HeatmapMatrix): MatrixStats {
  let min: number | null = null
  let max: number | null = null

  for (const row of matrix.values) {
    for (const value of row) {
      if (value === null || !Number.isFinite(value)) continue

      if (min === null || value < min) {
        min = value
      }

      if (max === null || value > max) {
        max = value
      }
    }
  }

  return { min, max }
}

export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function std(values: number[]): number {
  if (values.length === 0) return 0
  const m = mean(values)
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length
  return Math.sqrt(variance)
}