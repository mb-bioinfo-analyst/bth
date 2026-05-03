import { HeatmapMatrix, MissingValueMode, TransformType } from "../types"
import { mean, std } from "./statistics"

function cloneMatrix(matrix: HeatmapMatrix): HeatmapMatrix {
  return {
    rowLabels: [...matrix.rowLabels],
    colLabels: [...matrix.colLabels],
    values: matrix.values.map(row => [...row]),
  }
}

function fillMissing(matrix: HeatmapMatrix, mode: MissingValueMode): HeatmapMatrix {
  if (mode === "keep") {
    return cloneMatrix(matrix)
  }

  const result = cloneMatrix(matrix)

  if (mode === "zero") {
    result.values = result.values.map(row => row.map(v => (v === null ? 0 : v)))
    return result
  }

  if (mode === "row-mean") {
    result.values = result.values.map(row => {
      const nums = row.filter((v): v is number => v !== null)
      const fallback = nums.length > 0 ? mean(nums) : 0
      return row.map(v => (v === null ? fallback : v))
    })
    return result
  }

  if (mode === "col-mean") {
    const colMeans = result.colLabels.map((_, colIndex) => {
      const nums = result.values
        .map(row => row[colIndex])
        .filter((v): v is number => v !== null)
      return nums.length > 0 ? mean(nums) : 0
    })

    result.values = result.values.map(row =>
      row.map((v, colIndex) => (v === null ? colMeans[colIndex] : v))
    )
    return result
  }

  return result
}

export function transformMatrix(
  matrix: HeatmapMatrix,
  transform: TransformType,
  missingValueMode: MissingValueMode
): HeatmapMatrix {
  const filled = fillMissing(matrix, missingValueMode)

  if (transform === "none") {
    return filled
  }

  if (transform === "row-zscore") {
    return {
      ...filled,
      values: filled.values.map(row => {
        const nums = row.filter((v): v is number => v !== null)
        if (nums.length === 0) return row
        const m = mean(nums)
        const s = std(nums) || 1
        return row.map(v => (v === null ? null : (v - m) / s))
      }),
    }
  }

  if (transform === "col-zscore") {
    const colStats = filled.colLabels.map((_, colIndex) => {
      const nums = filled.values
        .map(row => row[colIndex])
        .filter((v): v is number => v !== null)

      return {
        mean: nums.length > 0 ? mean(nums) : 0,
        std: nums.length > 0 ? std(nums) || 1 : 1,
      }
    })

    return {
      ...filled,
      values: filled.values.map(row =>
        row.map((v, colIndex) =>
          v === null ? null : (v - colStats[colIndex].mean) / colStats[colIndex].std
        )
      ),
    }
  }

  return filled
}