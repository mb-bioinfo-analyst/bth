import { HeatmapMatrix } from "../types"

type Props = {
  matrix: HeatmapMatrix
  maxRows?: number
  maxCols?: number
  title?: string
}

function formatValue(v: number | null): string {
  if (v === null) return "NA"
  return Number.isInteger(v) ? String(v) : v.toFixed(3)
}

export default function MatrixPreview({
  matrix,
  maxRows = 12,
  maxCols = 10,
  title = "Matrix preview",
}: Props) {
  const rows = matrix.rowLabels.slice(0, maxRows)
  const cols = matrix.colLabels.slice(0, maxCols)

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>

      <div className="overflow-auto">
        <table className="w-full min-w-[500px] text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Label</th>
              {cols.map((col, i) => (
                <th key={i} className="border p-2 text-left">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowLabel, rowIndex) => (
              <tr key={rowLabel}>
                <td className="border p-2 font-medium">{rowLabel}</td>
                {cols.map((_, colIndex) => (
                  <td key={colIndex} className="border p-2 tabular-nums">
                    {formatValue(matrix.values[rowIndex][colIndex])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Showing up to {Math.min(maxRows, matrix.rowLabels.length)} rows and {Math.min(maxCols, matrix.colLabels.length)} columns.
      </div>
    </div>
  )
}