import { RawDataTable } from "../types"

type Props = {
  table: RawDataTable | null
}

export default function DataPreview({ table }: Props) {
  if (!table) return null

  const previewRows = table.rows.slice(0, 8)

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="text-sm font-semibold text-slate-800">
        Data preview
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-xs">
          <thead className="bg-slate-100">
            <tr>
              {table.headers.map(header => (
                <th key={header} className="border px-2 py-1 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i}>
                {table.headers.map(header => (
                  <td key={header} className="border px-2 py-1">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        Showing {previewRows.length} of {table.rows.length} rows.
      </div>
    </div>
  )
}