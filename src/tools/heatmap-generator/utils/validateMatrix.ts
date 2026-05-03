import { HeatmapMatrix } from "../types"

export function validateMatrix(matrix: HeatmapMatrix): void {
  const rowCount = matrix.rowLabels.length
  const colCount = matrix.colLabels.length

  if (rowCount === 0 || colCount === 0) {
    throw new Error("The matrix must contain at least one row and one column.")
  }

  if (matrix.values.length !== rowCount) {
    throw new Error("Matrix row labels and values are out of sync.")
  }

  for (let i = 0; i < matrix.values.length; i++) {
    if (matrix.values[i].length !== colCount) {
      throw new Error(`Row ${i + 1} does not match the number of columns.`)
    }
  }

  const uniqueRowLabels = new Set(matrix.rowLabels)
  if (uniqueRowLabels.size !== matrix.rowLabels.length) {
    throw new Error("Row labels must be unique.")
  }

  const uniqueColLabels = new Set(matrix.colLabels)
  if (uniqueColLabels.size !== matrix.colLabels.length) {
    throw new Error("Column labels must be unique.")
  }
}