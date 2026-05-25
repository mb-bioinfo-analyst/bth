import { forwardRef } from "react"
import { BoxplotGroupSummary, BoxplotInputRow, BoxplotPalette, BoxplotOrientation } from "../types"

type Props = {
  summaries: BoxplotGroupSummary[]
  rows: BoxplotInputRow[]
  palette: BoxplotPalette
  orientation: BoxplotOrientation
  showJitter: boolean
  showOutliers: boolean
  showMean: boolean
  showMedianLine: boolean
  showGrid: boolean
  showLegend: boolean
  jitterAmount: number
  boxWidth: number
  yMin: number | null
  yMax: number | null
  logScale: boolean
  figureTitle: string
  figureSubtitle: string
  exportWidth: 1200 | 1800 | 2400
}

const PALETTES: Record<BoxplotPalette, string[]> = {
  scientific: ["#4E79A7", "#F28E2B", "#59A14F", "#E15759", "#B07AA1", "#76B7B2"],
  blue: ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
  viridis: ["#440154", "#31688e", "#35b779", "#fde725"],
  warm: ["#7f1d1d", "#dc2626", "#f97316", "#facc15"],
  gray: ["#111827", "#374151", "#6b7280", "#9ca3af"],
}

function colorFor(index: number, palette: BoxplotPalette) {
  const colors = PALETTES[palette]
  return colors[index % colors.length]
}

function stableJitter(seed: string, amount: number) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return ((hash % 1000) / 1000 - 0.5) * amount
}

function niceTicks(min: number, max: number, count = 6) {
  if (min === max) return [min]
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, i) => min + step * i)
}

function formatTick(value: number) {
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.01) return value.toExponential(1)
  return Number(value.toFixed(2)).toString()
}

const BoxplotCanvas = forwardRef<SVGSVGElement, Props>(function BoxplotCanvas(
  {
    summaries,
    rows,
    palette,
    orientation,
    showJitter,
    showOutliers,
    showMean,
    showMedianLine,
    showGrid,
    showLegend,
    jitterAmount,
    boxWidth,
    yMin,
    yMax,
    logScale,
    figureTitle,
    figureSubtitle,
    exportWidth,
  },
  ref
) {
  const isHorizontal = orientation === "horizontal"

  const rawValues = summaries.flatMap(s => s.values).filter(v => Number.isFinite(v))
  const positiveValues = rawValues.filter(v => v > 0)

  const minRaw = yMin ?? Math.min(...rawValues)
  const maxRaw = yMax ?? Math.max(...rawValues)

  const minValue = logScale ? Math.max(Math.min(...positiveValues), 1e-6) : minRaw
  const maxValue = logScale ? Math.max(...positiveValues) : maxRaw

  const safeMin = Number.isFinite(minValue) ? minValue : 0
  const safeMax = Number.isFinite(maxValue) && maxValue !== safeMin ? maxValue : safeMin + 1

  const plotWidth = 760
  const plotHeight = 430

  const leftPad = isHorizontal ? 150 : 80
  const rightPad = showLegend ? 180 : 40
  const topPad = figureTitle.trim() || figureSubtitle.trim() ? 78 : 36
  const bottomPad = isHorizontal ? 50 : 110

  const width = leftPad + plotWidth + rightPad
  const height = topPad + plotHeight + bottomPad

  const exportHeight = Math.round((height / width) * exportWidth)

  const groups = summaries.map(s => `${s.group}${s.subgroup ? ` / ${s.subgroup}` : ""}`)

  const transformValue = (value: number) => {
    if (logScale) return Math.log10(Math.max(value, 1e-6))
    return value
  }

  const axisMin = transformValue(safeMin)
  const axisMax = transformValue(safeMax)

  const valueToY = (value: number) => {
    const t = (transformValue(value) - axisMin) / (axisMax - axisMin)
    return topPad + plotHeight - t * plotHeight
  }

  const valueToX = (value: number) => {
    const t = (transformValue(value) - axisMin) / (axisMax - axisMin)
    return leftPad + t * plotWidth
  }

  const band = isHorizontal
    ? plotHeight / Math.max(summaries.length, 1)
    : plotWidth / Math.max(summaries.length, 1)

  const boxThickness = Math.max(10, Math.min(42, band * boxWidth))

  const axisTicks = logScale
    ? niceTicks(axisMin, axisMax).map(v => 10 ** v)
    : niceTicks(safeMin, safeMax)

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="w-full overflow-x-auto">
        <svg
          ref={ref}
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          data-export-width={String(exportWidth)}
          data-export-height={String(exportHeight)}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          className="block h-auto w-full"
          style={{ maxWidth: "1050px" }}
        >
          <rect x="0" y="0" width={width} height={height} fill="#ffffff" />

          {figureTitle.trim() && (
            <text x={leftPad} y="28" fontSize="20" fontWeight="700" fill="#0f172a">
              {figureTitle}
            </text>
          )}

          {figureSubtitle.trim() && (
            <text x={leftPad} y="50" fontSize="12" fill="#475569">
              {figureSubtitle}
            </text>
          )}

          {showGrid &&
            axisTicks.map((tick, i) => {
              const pos = isHorizontal ? valueToX(tick) : valueToY(tick)
              return isHorizontal ? (
                <line key={i} x1={pos} x2={pos} y1={topPad} y2={topPad + plotHeight} stroke="#e5e7eb" />
              ) : (
                <line key={i} x1={leftPad} x2={leftPad + plotWidth} y1={pos} y2={pos} stroke="#e5e7eb" />
              )
            })}

          {/* Axes */}
          <line
            x1={leftPad}
            x2={leftPad + plotWidth}
            y1={topPad + plotHeight}
            y2={topPad + plotHeight}
            stroke="#111827"
          />
          <line x1={leftPad} x2={leftPad} y1={topPad} y2={topPad + plotHeight} stroke="#111827" />

          {/* Value axis ticks */}
          {axisTicks.map((tick, i) => {
            const pos = isHorizontal ? valueToX(tick) : valueToY(tick)

            return isHorizontal ? (
              <g key={i}>
                <line x1={pos} x2={pos} y1={topPad + plotHeight} y2={topPad + plotHeight + 5} stroke="#111827" />
                <text x={pos} y={topPad + plotHeight + 20} fontSize="10" textAnchor="middle" fill="#334155">
                  {formatTick(tick)}
                </text>
              </g>
            ) : (
              <g key={i}>
                <line x1={leftPad - 5} x2={leftPad} y1={pos} y2={pos} stroke="#111827" />
                <text x={leftPad - 9} y={pos + 3} fontSize="10" textAnchor="end" fill="#334155">
                  {formatTick(tick)}
                </text>
              </g>
            )
          })}

          {/* Boxplots */}
          {summaries.map((summary, index) => {
            const color = colorFor(index, palette)
            const center = isHorizontal
              ? topPad + band * index + band / 2
              : leftPad + band * index + band / 2

            const groupRows = rows.filter(
              r => r.group === summary.group && (r.subgroup ?? "") === (summary.subgroup ?? "")
            )

            if (isHorizontal) {
              const q1 = valueToX(summary.q1)
              const q3 = valueToX(summary.q3)
              const median = valueToX(summary.median)
              const mean = valueToX(summary.mean)
              const lower = valueToX(summary.lowerWhisker)
              const upper = valueToX(summary.upperWhisker)

              return (
                <g key={`${summary.group}-${summary.subgroup ?? index}`}>
                  <text x={leftPad - 8} y={center + 4} fontSize="11" textAnchor="end" fill="#0f172a">
                    {groups[index]}
                  </text>

                  <line x1={lower} x2={upper} y1={center} y2={center} stroke="#111827" />
                  <line x1={lower} x2={lower} y1={center - boxThickness / 4} y2={center + boxThickness / 4} stroke="#111827" />
                  <line x1={upper} x2={upper} y1={center - boxThickness / 4} y2={center + boxThickness / 4} stroke="#111827" />

                  <rect
                    x={Math.min(q1, q3)}
                    y={center - boxThickness / 2}
                    width={Math.abs(q3 - q1)}
                    height={boxThickness}
                    fill={color}
                    fillOpacity="0.72"
                    stroke="#111827"
                  />

                  {showMedianLine && (
                    <line x1={median} x2={median} y1={center - boxThickness / 2} y2={center + boxThickness / 2} stroke="#111827" strokeWidth="2" />
                  )}

                  {showMean && <circle cx={mean} cy={center} r="3.5" fill="#ffffff" stroke="#111827" />}

                  {showJitter &&
                    groupRows.map((row, i) => {
                      const y = center + stableJitter(`${row.group}-${row.value}-${i}`, band * jitterAmount)
                      return (
                        <circle
                          key={i}
                          cx={valueToX(row.value)}
                          cy={y}
                          r="2.2"
                          fill={color}
                          fillOpacity="0.48"
                          stroke="none"
                        />
                      )
                    })}

                  {showOutliers &&
                    summary.outliers.map((value, i) => (
                      <circle key={i} cx={valueToX(value)} cy={center} r="3" fill="#ffffff" stroke="#111827" />
                    ))}
                </g>
              )
            }

            const q1 = valueToY(summary.q1)
            const q3 = valueToY(summary.q3)
            const median = valueToY(summary.median)
            const mean = valueToY(summary.mean)
            const lower = valueToY(summary.lowerWhisker)
            const upper = valueToY(summary.upperWhisker)

            return (
              <g key={`${summary.group}-${summary.subgroup ?? index}`}>
                <text
                  x={center}
                  y={topPad + plotHeight + 18}
                  fontSize="11"
                  textAnchor="end"
                  dominantBaseline="middle"
                  transform={`rotate(-45 ${center} ${topPad + plotHeight + 18})`}
                  fill="#0f172a"
                >
                  {groups[index]}
                </text>

                <line x1={center} x2={center} y1={upper} y2={lower} stroke="#111827" />
                <line x1={center - boxThickness / 4} x2={center + boxThickness / 4} y1={upper} y2={upper} stroke="#111827" />
                <line x1={center - boxThickness / 4} x2={center + boxThickness / 4} y1={lower} y2={lower} stroke="#111827" />

                <rect
                  x={center - boxThickness / 2}
                  y={Math.min(q1, q3)}
                  width={boxThickness}
                  height={Math.abs(q3 - q1)}
                  fill={color}
                  fillOpacity="0.72"
                  stroke="#111827"
                />

                {showMedianLine && (
                  <line x1={center - boxThickness / 2} x2={center + boxThickness / 2} y1={median} y2={median} stroke="#111827" strokeWidth="2" />
                )}

                {showMean && <circle cx={center} cy={mean} r="3.5" fill="#ffffff" stroke="#111827" />}

                {showJitter &&
                  groupRows.map((row, i) => {
                    const x = center + stableJitter(`${row.group}-${row.value}-${i}`, band * jitterAmount)
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={valueToY(row.value)}
                        r="2.2"
                        fill={color}
                        fillOpacity="0.48"
                        stroke="none"
                      />
                    )
                  })}

                {showOutliers &&
                  summary.outliers.map((value, i) => (
                    <circle key={i} cx={center} cy={valueToY(value)} r="3" fill="#ffffff" stroke="#111827" />
                  ))}
              </g>
            )
          })}

          <text
            x={isHorizontal ? leftPad + plotWidth / 2 : leftPad - 52}
            y={isHorizontal ? topPad + plotHeight + 42 : topPad + plotHeight / 2}
            fontSize="12"
            textAnchor="middle"
            fill="#0f172a"
            transform={isHorizontal ? undefined : `rotate(-90 ${leftPad - 52} ${topPad + plotHeight / 2})`}
          >
            {logScale ? "Value (log scale)" : "Value"}
          </text>

          {showLegend && (
            <g transform={`translate(${leftPad + plotWidth + 42}, ${topPad})`}>
              <text x="0" y="0" fontSize="12" fontWeight="700" fill="#0f172a">
                Groups
              </text>

              {summaries.map((summary, i) => (
                <g key={i} transform={`translate(0, ${18 + i * 18})`}>
                  <rect x="0" y="-9" width="10" height="10" fill={colorFor(i, palette)} fillOpacity="0.72" stroke="#111827" />
                  <text x="16" y="0" fontSize="10" fill="#334155">
                    {summary.subgroup ? `${summary.group} / ${summary.subgroup}` : summary.group}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
    </div>
  )
})

export default BoxplotCanvas