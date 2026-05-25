import { BoxplotGroupSummary } from "../types"

type Props = {
  summaries: BoxplotGroupSummary[]
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(3) : "—"
}

export default function SummaryTable({ summaries }: Props) {
  if (summaries.length === 0) return null

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="text-sm font-semibold text-slate-800">
        Summary statistics
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-1 text-left">Group</th>
              <th className="border px-2 py-1 text-left">Subgroup</th>
              <th className="border px-2 py-1 text-right">n</th>
              <th className="border px-2 py-1 text-right">Min</th>
              <th className="border px-2 py-1 text-right">Q1</th>
              <th className="border px-2 py-1 text-right">Median</th>
              <th className="border px-2 py-1 text-right">Q3</th>
              <th className="border px-2 py-1 text-right">Max</th>
              <th className="border px-2 py-1 text-right">Mean</th>
              <th className="border px-2 py-1 text-right">IQR</th>
              <th className="border px-2 py-1 text-right">Outliers</th>
            </tr>
          </thead>

          <tbody>
            {summaries.map(summary => (
              <tr key={`${summary.group}-${summary.subgroup ?? "main"}`}>
                <td className="border px-2 py-1">{summary.group}</td>
                <td className="border px-2 py-1">{summary.subgroup ?? "—"}</td>
                <td className="border px-2 py-1 text-right">{summary.n}</td>
                <td className="border px-2 py-1 text-right">{formatNumber(summary.min)}</td>
                <td className="border px-2 py-1 text-right">{formatNumber(summary.q1)}</td>
                <td className="border px-2 py-1 text-right">{formatNumber(summary.median)}</td>
                <td className="border px-2 py-1 text-right">{formatNumber(summary.q3)}</td>
                <td className="border px-2 py-1 text-right">{formatNumber(summary.max)}</td>
                <td className="border px-2 py-1 text-right">{formatNumber(summary.mean)}</td>
                <td className="border px-2 py-1 text-right">{formatNumber(summary.iqr)}</td>
                <td className="border px-2 py-1 text-right">{summary.outliers.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}