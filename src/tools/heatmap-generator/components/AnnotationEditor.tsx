import { useState } from "react"
import { AnnotationTrack } from "../types"
import { EXAMPLE_COLUMN_ANNOTATION } from "../constants"
import { parseAnnotationText } from "../utils/parseAnnotations"

type AnnotationBundle = {
  labels: string[]
  tracks: AnnotationTrack[]
}

type Props = {
  rowAnnotationSourceLabels: string[]
  colAnnotationSourceLabels: string[]
  rowTracks: AnnotationTrack[]
  colTracks: AnnotationTrack[]
  onAddRowTracks: (bundle: AnnotationBundle) => void
  onAddColTracks: (bundle: AnnotationBundle) => void
  onRemoveTrack: (trackId: string, target: "rows" | "columns") => void
  onUpdateTrackColor: (
    target: "rows" | "columns",
    trackId: string,
    value: string,
    color: string
  ) => void
}

const EXAMPLE_ROW_ANNOTATION = `Gene\tPathway\tClass
TP53\tDNA_Repair\tTumorSuppressor
EGFR\tRTK\tOncogene
BRCA1\tDNA_Repair\tTumorSuppressor
MYC\tTranscription\tOncogene
PTEN\tPI3K_Pathway\tTumorSuppressor
KRAS\tMAPK_Pathway\tOncogene
NRAS\tMAPK_Pathway\tOncogene
CDKN2A\tCell_Cycle\tTumorSuppressor`

export default function AnnotationEditor({
  rowAnnotationSourceLabels,
  colAnnotationSourceLabels,
  rowTracks,
  colTracks,
  onAddRowTracks,
  onAddColTracks,
  onRemoveTrack,
  onUpdateTrackColor,
}: Props) {
  const [rowInput, setRowInput] = useState("")
  const [colInput, setColInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleAddAnnotations(
    input: string,
    target: "rows" | "columns"
  ) {
    try {
      setError(null)
      const parsed = parseAnnotationText(input, target)

      if (target === "rows") {
        onAddRowTracks(parsed)
        setRowInput("")
      } else {
        onAddColTracks(parsed)
        setColInput("")
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to parse annotation table.")
    }
  }

  async function handleFileUpload(
    file: File,
    target: "rows" | "columns"
  ) {
    try {
      const text = await file.text()
      if (target === "rows") {
        setRowInput(text)
      } else {
        setColInput(text)
      }
    } catch (err) {
      console.error(err)
      setError("Could not read the annotation file.")
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-5">
      <div className="text-sm font-semibold">Annotation tracks</div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-800">Row annotations</div>

          <textarea
            value={rowInput}
            onChange={(e) => setRowInput(e.target.value)}
            className="h-36 w-full rounded border p-3 font-mono text-sm"
            placeholder={EXAMPLE_ROW_ANNOTATION}
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAddAnnotations(rowInput, "rows")}
              className="rounded border px-3 py-2 text-sm"
            >
              Add row annotations
            </button>

            <button
              onClick={() => setRowInput(EXAMPLE_ROW_ANNOTATION)}
              className="rounded border px-3 py-2 text-sm"
            >
              Load example
            </button>

            <label className="rounded border px-3 py-2 text-sm cursor-pointer">
              Upload row annotation file
              <input
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleFileUpload(file, "rows")
                }}
              />
            </label>
          </div>

          <div className="text-xs text-slate-500">
            Use the first column for row labels and the remaining columns as annotation tracks.
            These labels should match the row labels in your matrix.
          </div>

          <div className="rounded border bg-slate-50 p-3 text-xs text-slate-600">
            Loaded row tracks: {rowTracks.length}<br />
            Row labels in source table: {rowAnnotationSourceLabels.length}
          </div>

          {rowTracks.length > 0 && (
            <div className="space-y-2">
              {rowTracks.map(track => (
                <div
                  key={track.id}
                  className="rounded border bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{track.name}</div>
                      <div className="text-xs text-slate-500">
                        {Object.keys(track.colorMap).length} categories
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveTrack(track.id, "rows")}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    {Object.entries(track.colorMap).map(([name, color]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between gap-3 rounded border bg-white px-2 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-sm border"
                            style={{ backgroundColor: color }}
                          />
                          <span>{name}</span>
                        </div>

                        <input
                          type="color"
                          value={color}
                          onChange={(e) =>
                            onUpdateTrackColor("rows", track.id, name, e.target.value)
                          }
                          className="h-8 w-12 rounded border p-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-800">Column annotations</div>

          <textarea
            value={colInput}
            onChange={(e) => setColInput(e.target.value)}
            className="h-36 w-full rounded border p-3 font-mono text-sm"
            placeholder={EXAMPLE_COLUMN_ANNOTATION}
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAddAnnotations(colInput, "columns")}
              className="rounded border px-3 py-2 text-sm"
            >
              Add column annotations
            </button>

            <button
              onClick={() => setColInput(EXAMPLE_COLUMN_ANNOTATION)}
              className="rounded border px-3 py-2 text-sm"
            >
              Load example
            </button>

            <label className="rounded border px-3 py-2 text-sm cursor-pointer">
              Upload column annotation file
              <input
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleFileUpload(file, "columns")
                }}
              />
            </label>
          </div>

          <div className="text-xs text-slate-500">
            Use the first column for column labels and the remaining columns as annotation tracks.
            These labels should match the column labels in your matrix.
          </div>

          <div className="rounded border bg-slate-50 p-3 text-xs text-slate-600">
            Loaded column tracks: {colTracks.length}<br />
            Column labels in source table: {colAnnotationSourceLabels.length}
          </div>

          {colTracks.length > 0 && (
            <div className="space-y-2">
              {colTracks.map(track => (
                <div
                  key={track.id}
                  className="rounded border bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{track.name}</div>
                      <div className="text-xs text-slate-500">
                        {Object.keys(track.colorMap).length} categories
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveTrack(track.id, "columns")}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    {Object.entries(track.colorMap).map(([name, color]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between gap-3 rounded border bg-white px-2 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-sm border"
                            style={{ backgroundColor: color }}
                          />
                          <span>{name}</span>
                        </div>

                        <input
                          type="color"
                          value={color}
                          onChange={(e) =>
                            onUpdateTrackColor("columns", track.id, name, e.target.value)
                          }
                          className="h-8 w-12 rounded border p-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}