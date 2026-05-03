import { AnnotationTrack, OverlayStyle, PaletteName } from "../types"
import { valueToColor } from "../utils/colorScales"

type Props = {
  min: number
  max: number
  palette: PaletteName
  reversePalette: boolean
  missingColor: string
  rowAnnotations?: AnnotationTrack[]
  colAnnotations?: AnnotationTrack[]
  rowGroups?: number[]
  colGroups?: number[]
  overlayStyle?: OverlayStyle
  significanceThreshold1?: number
  significanceThreshold2?: number
  significanceThreshold3?: number
}

const GROUP_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
]

export default function HeatmapLegend({
  min,
  max,
  palette,
  reversePalette,
  missingColor,
  rowAnnotations = [],
  colAnnotations = [],
  rowGroups,
  colGroups,
  overlayStyle = "none",
  significanceThreshold1 = 0.05,
  significanceThreshold2 = 0.01,
  significanceThreshold3 = 0.001,
}: Props) {
  const stops = Array.from({ length: 20 }, (_, i) => {
    const t = i / 19
    const value = min + (max - min) * t
    const color = valueToColor(value, min, max, palette, reversePalette, missingColor)
    return { offset: `${t * 100}%`, color }
  })

  const groupCount = Math.max(
    rowGroups ? Math.max(...rowGroups) + 1 : 0,
    colGroups ? Math.max(...colGroups) + 1 : 0
  )

  return (
    <div className="rounded-lg border bg-white p-4 space-y-5">
      <div className="text-sm font-semibold">Legends</div>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-800">Heatmap scale</div>

        <svg width="100%" height="56" viewBox="0 0 320 56" className="max-w-full">
          <defs>
            <linearGradient id="heatmap-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {stops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>

          <rect x="10" y="10" width="240" height="18" fill="url(#heatmap-gradient)" stroke="#cbd5e1" />
          <rect x="265" y="10" width="18" height="18" fill={missingColor} stroke="#cbd5e1" />

          <text x="10" y="45" fontSize="11" fill="#334155">{min.toFixed(3)}</text>
          <text x="250" y="45" fontSize="11" textAnchor="end" fill="#334155">{max.toFixed(3)}</text>
          <text x="286" y="24" fontSize="11" fill="#334155">NA</text>
        </svg>
      </div>

      {overlayStyle !== "none" && (
        <div>
          <div className="mb-2 text-sm font-medium text-slate-800">Significance overlay</div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Style:</span>
              <span>{overlayStyle}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">*</span>
              <span>p ≤ {significanceThreshold1}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">**</span>
              <span>p ≤ {significanceThreshold2}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">***</span>
              <span>p ≤ {significanceThreshold3}</span>
            </div>
          </div>
        </div>
      )}

      {groupCount > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium text-slate-800">Cluster groups</div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: groupCount }, (_, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-3 w-3 rounded-sm border"
                  style={{ backgroundColor: GROUP_COLORS[i % GROUP_COLORS.length] }}
                />
                <span>Group {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rowAnnotations.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-800">Row annotation tracks</div>
          {rowAnnotations.map(track => (
            <div key={`row-legend-${track.id}`}>
              <div className="text-sm font-medium">{track.name}</div>
              <div className="mt-2 flex flex-wrap gap-3">
                {Object.entries(track.colorMap).map(([value, color]) => (
                  <div key={value} className="flex items-center gap-2 text-xs">
                    <span
                      className="inline-block h-3 w-3 rounded-sm border"
                      style={{ backgroundColor: color }}
                    />
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {colAnnotations.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-800">Column annotation tracks</div>
          {colAnnotations.map(track => (
            <div key={`col-legend-${track.id}`}>
              <div className="text-sm font-medium">{track.name}</div>
              <div className="mt-2 flex flex-wrap gap-3">
                {Object.entries(track.colorMap).map(([value, color]) => (
                  <div key={value} className="flex items-center gap-2 text-xs">
                    <span
                      className="inline-block h-3 w-3 rounded-sm border"
                      style={{ backgroundColor: color }}
                    />
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}