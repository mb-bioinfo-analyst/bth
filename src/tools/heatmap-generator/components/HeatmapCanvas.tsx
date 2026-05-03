import { forwardRef } from "react"
import {
  AnnotationTrack,
  ClusterNode,
  HeatmapMatrix,
  OverlayStyle,
  PaletteName,
  SideBarplotMode,
  LegendPosition,
  FontPreset,
  ExportWidthPreset,
} from "../types"
import { valueToColor } from "../utils/colorScales"
import { colDendrogramPath, rowDendrogramPath } from "../utils/dendrogram"

type Props = {
  matrix: HeatmapMatrix
  rowTree?: ClusterNode
  colTree?: ClusterNode
  overlayMatrix?: HeatmapMatrix | null
  cellSize: number
  fontSize: number
  showRowLabels: boolean
  showColLabels: boolean
  palette: PaletteName
  reversePalette: boolean
  colorMin: number
  colorMax: number
  missingColor: string
  rowGroups?: number[]
  colGroups?: number[]
  rowAnnotations?: AnnotationTrack[]
  colAnnotations?: AnnotationTrack[]
  showDendrograms: boolean
  dendrogramSize: number
  largeMatrixMode: boolean
  showCellBorders: boolean
  rowBarplotMode: SideBarplotMode
  colBarplotMode: SideBarplotMode
  barplotSize: number
  overlayStyle: OverlayStyle
  significanceThreshold1: number
  significanceThreshold2: number
  significanceThreshold3: number
  hideNonSignificantOverlay: boolean
  figureTitle?: string
  figureSubtitle?: string
  showEmbeddedLegend?: boolean
  legendPosition?: LegendPosition
  fontPreset?: FontPreset
  exportWidth?: ExportWidthPreset
}

type LegendRow = {
  label: string
  color?: string
}

type LegendBlock = {
  title: string
  rows: LegendRow[]
  height: number
  width: number
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

function groupColor(group: number | undefined): string {
  if (group === undefined) return "#64748b"
  return GROUP_COLORS[group % GROUP_COLORS.length]
}

function annotationColor(track: AnnotationTrack, index: number): string {
  const value = track.values[index] ?? ""
  if (!value) return "#f8fafc"
  return track.colorMap[value] ?? "#94a3b8"
}

function rowMean(row: (number | null)[]): number {
  const nums = row.filter((v): v is number => v !== null)
  if (nums.length === 0) return 0
  return nums.reduce((sum, v) => sum + v, 0) / nums.length
}

function colMean(matrix: HeatmapMatrix, colIndex: number): number {
  const nums = matrix.values.map(r => r[colIndex]).filter((v): v is number => v !== null)
  if (nums.length === 0) return 0
  return nums.reduce((sum, v) => sum + v, 0) / nums.length
}

function compactTrackName(name: string, max = 14) {
  if (name.length <= max) return name
  return `${name.slice(0, max - 1)}…`
}

function overlayLevel(
  p: number | null,
  t1: number,
  t2: number,
  t3: number
): 0 | 1 | 2 | 3 {
  if (p === null || !Number.isFinite(p)) return 0
  if (p <= t3) return 3
  if (p <= t2) return 2
  if (p <= t1) return 1
  return 0
}

function overlayText(level: 0 | 1 | 2 | 3): string {
  if (level === 3) return "***"
  if (level === 2) return "**"
  if (level === 1) return "*"
  return ""
}

function buildLegendStops(
  min: number,
  max: number,
  palette: PaletteName,
  reversePalette: boolean,
  missingColor: string
) {
  return Array.from({ length: 20 }, (_, i) => {
    const t = i / 19
    const value = min + (max - min) * t
    const color = valueToColor(value, min, max, palette, reversePalette, missingColor)
    return { offset: `${t * 100}%`, color }
  })
}

function getFontFamily(fontPreset: FontPreset): string {
  switch (fontPreset) {
    case "nature":
      return "Arial, Helvetica, sans-serif"
    case "science":
      return "Helvetica, Arial, sans-serif"
    case "minimal":
    default:
      return "Inter, system-ui, sans-serif"
  }
}

function getTitleWeight(fontPreset: FontPreset): number {
  switch (fontPreset) {
    case "science":
      return 700
    case "nature":
      return 600
    case "minimal":
    default:
      return 600
  }
}

function getPreviewMaxWidth(exportWidth: ExportWidthPreset): number {
  switch (exportWidth) {
    case 1200:
      return 900
    case 2400:
      return 1120
    case 1800:
    default:
      return 1020
  }
}

function estimateTextWidth(text: string, fontSize = 8.5) {
  return text.length * fontSize * 0.58
}

function makeBlock(title: string, rows: LegendRow[]): LegendBlock {
  const titleWidth = estimateTextWidth(title, 10.5)
  const rowWidths = rows.map(row => estimateTextWidth(row.label, 8.5) + (row.color ? 14 : 0))
  const width = Math.max(titleWidth, ...rowWidths, 70) + 6
  const height = 18 + rows.length * 12 + 8
  return { title, rows, height, width }
}

function buildLegendBlocks(
  overlayStyle: OverlayStyle,
  significanceThreshold1: number,
  significanceThreshold2: number,
  significanceThreshold3: number,
  clusterGroupCount: number,
  embeddedLegendTracks: AnnotationTrack[]
): LegendBlock[] {
  const blocks: LegendBlock[] = []

  if (overlayStyle !== "none") {
    blocks.push(
      makeBlock("significance", [
        { label: `* p ≤ ${significanceThreshold1}` },
        { label: `** p ≤ ${significanceThreshold2}` },
        { label: `*** p ≤ ${significanceThreshold3}` },
      ])
    )
  }

  if (clusterGroupCount > 0) {
    blocks.push(
      makeBlock(
        "groups",
        Array.from({ length: Math.min(clusterGroupCount, 12) }, (_, i) => ({
          label: `group ${i + 1}`,
          color: GROUP_COLORS[i % GROUP_COLORS.length],
        }))
      )
    )
  }

  embeddedLegendTracks.forEach(track => {
    blocks.push(
      makeBlock(
        track.name,
        Object.entries(track.colorMap).slice(0, 14).map(([label, color]) => ({
          label,
          color,
        }))
      )
    )
  })

  return blocks
}

function packLegendBlocksIntoColumns(
  blocks: LegendBlock[],
  columnHeightLimit: number,
  gapY: number
) {
  const columns: LegendBlock[][] = []
  let currentColumn: LegendBlock[] = []
  let usedHeight = 0

  blocks.forEach(block => {
    const nextHeight = currentColumn.length === 0 ? block.height : usedHeight + gapY + block.height

    if (currentColumn.length > 0 && nextHeight > columnHeightLimit) {
      columns.push(currentColumn)
      currentColumn = [block]
      usedHeight = block.height
    } else {
      currentColumn.push(block)
      usedHeight = currentColumn.length === 1 ? block.height : usedHeight + gapY + block.height
    }
  })

  if (currentColumn.length > 0) {
    columns.push(currentColumn)
  }

  return columns
}

function columnWidth(column: LegendBlock[]) {
  return Math.max(...column.map(block => block.width), 90)
}

const HeatmapCanvas = forwardRef<SVGSVGElement, Props>(function HeatmapCanvas(
  {
    matrix,
    rowTree,
    colTree,
    overlayMatrix,
    cellSize,
    fontSize,
    showRowLabels,
    showColLabels,
    palette,
    reversePalette,
    colorMin,
    colorMax,
    missingColor,
    rowGroups,
    colGroups,
    rowAnnotations = [],
    colAnnotations = [],
    showDendrograms,
    dendrogramSize,
    largeMatrixMode,
    showCellBorders,
    rowBarplotMode,
    colBarplotMode,
    barplotSize,
    overlayStyle,
    significanceThreshold1,
    significanceThreshold2,
    significanceThreshold3,
    hideNonSignificantOverlay,
    figureTitle = "Heatmap Figure",
    figureSubtitle = "",
    showEmbeddedLegend = true,
    legendPosition = "right",
    fontPreset = "minimal",
    exportWidth = 1800,
  },
  ref
) {
  const compact = largeMatrixMode || matrix.rowLabels.length * matrix.colLabels.length > 20000

  const effectiveCellSize = compact ? Math.max(8, Math.min(cellSize, 12)) : cellSize
  const effectiveFontSize = compact ? Math.max(8, Math.min(fontSize, 9)) : fontSize
  const effectiveShowRowLabels = compact ? showRowLabels && matrix.rowLabels.length <= 120 : showRowLabels
  const effectiveShowColLabels = compact ? showColLabels && matrix.colLabels.length <= 60 : showColLabels

  const rowDSize = showDendrograms && rowTree ? dendrogramSize : 0
  const colDSize = showDendrograms && colTree ? dendrogramSize : 0

  const rowGroupStrip = rowGroups ? 9 : 0
  const colGroupStrip = colGroups ? 9 : 0

  const rowAnnotationWidth = rowAnnotations.length * 10
  const colAnnotationHeight = colAnnotations.length * 10

  const rowBarplotWidth = rowBarplotMode !== "none" ? barplotSize : 0
  const colBarplotHeight = colBarplotMode !== "none" ? barplotSize : 0

  const rowLabelArea = effectiveShowRowLabels ? 150 : 18
  const colLabelArea = effectiveShowColLabels ? 102 : 18

  const trimmedTitle = figureTitle.trim()
  const trimmedSubtitle = figureSubtitle.trim()

  const titleArea =
    trimmedTitle && trimmedSubtitle ? 42 :
    trimmedTitle ? 28 :
    trimmedSubtitle ? 18 :
    2

  const leftPad = 18
  const topPad = 14
  const rightPad = 18
  const bottomPad = 16

  const plotWidth = matrix.colLabels.length * effectiveCellSize
  const plotHeight = matrix.rowLabels.length * effectiveCellSize

  const clusterGroupCount = Math.max(
    rowGroups ? Math.max(...rowGroups) + 1 : 0,
    colGroups ? Math.max(...colGroups) + 1 : 0
  )

  const embeddedLegendTracks = rowAnnotations
  const effectiveLegendPosition: LegendPosition = showEmbeddedLegend ? "right" : legendPosition

    const xHeat =
    leftPad +
    rowLabelArea +
    rowDSize +
    rowBarplotWidth +
    rowGroupStrip +
    rowAnnotationWidth

  const yHeat =
    topPad +
    titleArea +
    colLabelArea +
    colDSize +
    colBarplotHeight +
    colGroupStrip +
    colAnnotationHeight

  const heatBottom = yHeat + plotHeight

  const legendTop = yHeat
  const legendColumnHeightLimit = Math.max(plotHeight + 72, 180)

  const legendBlocks = buildLegendBlocks(
    overlayStyle,
    significanceThreshold1,
    significanceThreshold2,
    significanceThreshold3,
    clusterGroupCount,
    embeddedLegendTracks
  )

  const packedColumns =
    showEmbeddedLegend && effectiveLegendPosition === "right"
      ? packLegendBlocksIntoColumns(legendBlocks, legendColumnHeightLimit, 10)
      : []

  const scaleBarWidth = 12
  const scaleBarHeight = plotHeight
  const scaleLabelWidth = 28
  const scaleColumnWidth =
    showEmbeddedLegend && effectiveLegendPosition === "right"
      ? scaleBarWidth + scaleLabelWidth + 8
      : 0

  const scaleToBlockGap =
    showEmbeddedLegend && effectiveLegendPosition === "right" && packedColumns.length > 0
      ? 18
      : 0

  const blockColumnGap =
    showEmbeddedLegend && effectiveLegendPosition === "right"
      ? 18
      : 0

  const legendGapFromHeatmap =
    showEmbeddedLegend && effectiveLegendPosition === "right"
      ? 22
      : 0

  const packedColumnWidths = packedColumns.map(column => columnWidth(column))

  const blocksAreaWidth =
    packedColumnWidths.reduce((sum, w) => sum + w, 0) +
    Math.max(0, packedColumnWidths.length - 1) * blockColumnGap

  const legendMultiColumnWidth =
    showEmbeddedLegend && effectiveLegendPosition === "right"
      ? scaleColumnWidth + scaleToBlockGap + blocksAreaWidth
      : 0

  const rightLegendArea =
    showEmbeddedLegend && effectiveLegendPosition === "right"
      ? legendGapFromHeatmap + legendMultiColumnWidth
      : 0

  const naturalWidth =
    leftPad +
    rowLabelArea +
    rowDSize +
    rowBarplotWidth +
    rowGroupStrip +
    rowAnnotationWidth +
    plotWidth +
    rightLegendArea +
    rightPad

  const heatBlockHeight =
    titleArea +
    colLabelArea +
    colDSize +
    colBarplotHeight +
    colGroupStrip +
    colAnnotationHeight +
    plotHeight

  const tallestLegendColumnHeight =
    showEmbeddedLegend && effectiveLegendPosition === "right"
      ? Math.max(
          plotHeight,
          ...packedColumns.map(column =>
            column.reduce((sum, block, idx) => {
              return sum + block.height + (idx > 0 ? 10 : 0)
            }, 0)
          ),
          0
        )
      : 0

    const extraBottomForRowAnnotationLabels =
    rowAnnotations.length > 0 ? 42 : 0

  const naturalHeight = Math.max(
    topPad + heatBlockHeight + bottomPad + extraBottomForRowAnnotationLabels,
    legendTop + tallestLegendColumnHeight + bottomPad + extraBottomForRowAnnotationLabels
  )

  const exportScale = exportWidth / naturalWidth
  const exportHeight = Math.round(naturalHeight * exportScale)

  const rowMeans = matrix.values.map(rowMean)
  const rowBarplotMax = Math.max(...rowMeans.map(v => Math.abs(v)), 1)

  const colMeans = matrix.colLabels.map((_, j) => colMean(matrix, j))
  const colBarplotMax = Math.max(...colMeans.map(v => Math.abs(v)), 1)

  const rowPath = rowDSize > 0
    ? rowDendrogramPath(rowTree, matrix.rowLabels.length, effectiveCellSize, rowDSize)
    : ""

  const colPath = colDSize > 0
    ? colDendrogramPath(colTree, matrix.colLabels.length, effectiveCellSize, colDSize)
    : ""

  const legendStops = buildLegendStops(colorMin, colorMax, palette, reversePalette, missingColor)

  const legendX = xHeat + plotWidth + legendGapFromHeatmap
  const legendY = legendTop

  const fontFamily = getFontFamily(fontPreset)
  const titleWeight = getTitleWeight(fontPreset)
  const previewMaxWidth = getPreviewMaxWidth(exportWidth)

      const rowAnnotationLabelBaseX =
    leftPad +
    rowLabelArea +
    rowDSize +
    rowBarplotWidth +
    rowGroupStrip +
    5

  const rowAnnotationLabelY = heatBottom + 18

    const colAnnotationLabelX = xHeat - 8

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="w-full overflow-x-auto">
        <svg
          ref={ref}
          width="100%"
          viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
          data-export-width={String(exportWidth)}
          data-export-height={String(exportHeight)}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          preserveAspectRatio="xMinYMin meet"
          className="block h-auto w-full"
          style={{ maxWidth: `${previewMaxWidth}px` }}
        >
          <defs>
            <linearGradient id="embedded-heatmap-gradient-vertical" x1="0%" y1="100%" x2="0%" y2="0%">
              {legendStops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={naturalWidth} height={naturalHeight} fill="#ffffff" />

          {trimmedTitle && (
            <text
              x={leftPad}
              y={topPad + 12}
              fontSize="18"
              fontWeight={titleWeight}
              fill="#0f172a"
              style={{ fontFamily }}
            >
              {trimmedTitle}
            </text>
          )}

          {trimmedSubtitle && (
            <text
              x={leftPad}
              y={topPad + (trimmedTitle ? 28 : 12)}
              fontSize="10.5"
              fill="#475569"
              style={{ fontFamily }}
            >
              {trimmedSubtitle}
            </text>
          )}

          {effectiveShowRowLabels &&
            matrix.rowLabels.map((label, i) => (
              <text
                key={label}
                x={leftPad + rowLabelArea - 7}
                y={yHeat + i * effectiveCellSize + effectiveCellSize / 2}
                fontSize={effectiveFontSize}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#0f172a"
                style={{ fontFamily }}
              >
                {label}
              </text>
            ))}

          {effectiveShowColLabels &&
            matrix.colLabels.map((label, j) => (
              <text
                key={label}
                x={xHeat + j * effectiveCellSize + effectiveCellSize / 2}
                y={topPad + titleArea + colLabelArea - 8}
                fontSize={effectiveFontSize}
                textAnchor="start"
                dominantBaseline="middle"
                transform={`rotate(-60 ${xHeat + j * effectiveCellSize + effectiveCellSize / 2} ${topPad + titleArea + colLabelArea - 8})`}
                fill="#0f172a"
                style={{ fontFamily }}
              >
                {label}
              </text>
            ))}

                    {/* Row annotation track labels: vertical below annotation strips */}
                    {rowAnnotations.map((track, trackIndex) => {
                      const labelX = rowAnnotationLabelBaseX + trackIndex * 10

                      return (
                        <text
                          key={`row-annotation-label-${track.id}`}
                          x={labelX}
                          y={rowAnnotationLabelY}
                          fontSize={Math.max(7, effectiveFontSize - 1)}
                          textAnchor="start"
                          dominantBaseline="middle"
                          transform={`rotate(90 ${labelX} ${rowAnnotationLabelY})`}
                          fill="#334155"
                          style={{ fontFamily }}
                        >
                          {compactTrackName(track.name)}
                        </text>
                      )
                    })}

                    {/* Column annotation track labels: on the left of the top annotation strips */}
                    {colAnnotations.map((track, trackIndex) => {
                      const labelY =
                        topPad +
                        titleArea +
                        colLabelArea +
                        colDSize +
                        colBarplotHeight +
                        colGroupStrip +
                        trackIndex * 10 +
                        5

                      return (
                        <text
                          key={`col-annotation-label-${track.id}`}
                          x={colAnnotationLabelX}
                          y={labelY}
                          fontSize={Math.max(7, effectiveFontSize - 1)}
                          textAnchor="end"
                          dominantBaseline="middle"
                          fill="#334155"
                          style={{ fontFamily }}
                        >
                          {compactTrackName(track.name)}
                        </text>
                      )
                    })}

          {rowDSize > 0 && rowPath && (
            <g transform={`translate(${leftPad + rowLabelArea}, ${yHeat})`}>
              <path d={rowPath} fill="none" stroke="#334155" strokeWidth="0.9" />
            </g>
          )}

          {colDSize > 0 && colPath && (
            <g transform={`translate(${xHeat}, ${topPad + titleArea + colLabelArea})`}>
              <path d={colPath} fill="none" stroke="#334155" strokeWidth="0.9" />
            </g>
          )}

          {rowBarplotMode !== "none" &&
            rowMeans.map((value, i) => {
              const widthScaled = (Math.abs(value) / rowBarplotMax) * rowBarplotWidth
              return (
                <rect
                  key={`row-bar-${i}`}
                  x={leftPad + rowLabelArea + rowDSize}
                  y={yHeat + i * effectiveCellSize + 1}
                  width={widthScaled}
                  height={Math.max(1, effectiveCellSize - 2)}
                  fill="#64748b"
                />
              )
            })}

          {colBarplotMode !== "none" &&
            colMeans.map((value, j) => {
              const heightScaled = (Math.abs(value) / colBarplotMax) * colBarplotHeight
              return (
                <rect
                  key={`col-bar-${j}`}
                  x={xHeat + j * effectiveCellSize + 1}
                  y={topPad + titleArea + colLabelArea + colDSize + (colBarplotHeight - heightScaled)}
                  width={Math.max(1, effectiveCellSize - 2)}
                  height={heightScaled}
                  fill="#64748b"
                />
              )
            })}

          {rowGroups &&
            matrix.rowLabels.map((_, i) => (
              <rect
                key={`row-group-${i}`}
                x={leftPad + rowLabelArea + rowDSize + rowBarplotWidth}
                y={yHeat + i * effectiveCellSize}
                width={rowGroupStrip}
                height={effectiveCellSize}
                fill={groupColor(rowGroups[i])}
              />
            ))}

          {rowAnnotations.map((track, trackIndex) =>
            matrix.rowLabels.map((label, i) => (
              <rect
                key={`row-annotation-${track.id}-${label}`}
                x={leftPad + rowLabelArea + rowDSize + rowBarplotWidth + rowGroupStrip + trackIndex * 10}
                y={yHeat + i * effectiveCellSize}
                width={10}
                height={effectiveCellSize}
                fill={annotationColor(track, i)}
              />
            ))
          )}

          {colGroups &&
            matrix.colLabels.map((_, j) => (
              <rect
                key={`col-group-${j}`}
                x={xHeat + j * effectiveCellSize}
                y={topPad + titleArea + colLabelArea + colDSize + colBarplotHeight}
                width={effectiveCellSize}
                height={colGroupStrip}
                fill={groupColor(colGroups[j])}
              />
            ))}

          {colAnnotations.map((track, trackIndex) =>
            matrix.colLabels.map((label, j) => (
              <rect
                key={`col-annotation-${track.id}-${label}`}
                x={xHeat + j * effectiveCellSize}
                y={topPad + titleArea + colLabelArea + colDSize + colBarplotHeight + colGroupStrip + trackIndex * 10}
                width={effectiveCellSize}
                height={10}
                fill={annotationColor(track, j)}
              />
            ))
          )}

          {matrix.values.map((row, i) =>
            row.map((value, j) => {
              const overlayP = overlayMatrix?.values?.[i]?.[j] ?? null
              const level = overlayLevel(
                overlayP,
                significanceThreshold1,
                significanceThreshold2,
                significanceThreshold3
              )

              return (
                <g key={`${i}-${j}`}>
                  <rect
                    x={xHeat + j * effectiveCellSize}
                    y={yHeat + i * effectiveCellSize}
                    width={effectiveCellSize}
                    height={effectiveCellSize}
                    fill={valueToColor(value, colorMin, colorMax, palette, reversePalette, missingColor)}
                    stroke={showCellBorders && !compact ? "#ffffff" : "none"}
                    strokeWidth={showCellBorders && !compact ? "0.45" : "0"}
                  />

                  {overlayStyle !== "none" && (!hideNonSignificantOverlay || level > 0) && level > 0 && (
                    <>
                      {overlayStyle === "stars" && effectiveCellSize >= 10 && (
                        <text
                          x={xHeat + j * effectiveCellSize + effectiveCellSize / 2}
                          y={yHeat + i * effectiveCellSize + effectiveCellSize / 2}
                          fontSize={Math.max(7, Math.min(12, effectiveCellSize * 0.42))}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#111827"
                          fontWeight="700"
                          style={{ fontFamily }}
                        >
                          {overlayText(level)}
                        </text>
                      )}

                      {overlayStyle === "dots" && (
                        <circle
                          cx={xHeat + j * effectiveCellSize + effectiveCellSize / 2}
                          cy={yHeat + i * effectiveCellSize + effectiveCellSize / 2}
                          r={Math.max(2, Math.min(5, level + effectiveCellSize * 0.1))}
                          fill="#111827"
                        />
                      )}

                      {overlayStyle === "outlines" && (
                        <rect
                          x={xHeat + j * effectiveCellSize + 1.5}
                          y={yHeat + i * effectiveCellSize + 1.5}
                          width={Math.max(1, effectiveCellSize - 3)}
                          height={Math.max(1, effectiveCellSize - 3)}
                          fill="none"
                          stroke="#111827"
                          strokeWidth={level === 3 ? 2.2 : level === 2 ? 1.8 : 1.3}
                        />
                      )}
                    </>
                  )}
                </g>
              )
            })
          )}

          <rect
            x={xHeat}
            y={yHeat}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.9"
          />

          {showEmbeddedLegend && effectiveLegendPosition === "right" && (
            <g transform={`translate(${legendX}, ${legendY})`}>
              <g>
                <text
                  x="0"
                  y="0"
                  fontSize="10.5"
                  fontWeight={titleWeight}
                  fill="#0f172a"
                  style={{ fontFamily }}
                >
                  expression
                </text>

                <rect
                  x="0"
                  y="8"
                  width={scaleBarWidth}
                  height={scaleBarHeight}
                  fill="url(#embedded-heatmap-gradient-vertical)"
                  stroke="#cbd5e1"
                />

                <text x={scaleBarWidth + 8} y="12" fontSize="8.5" fill="#334155" style={{ fontFamily }}>
                  {colorMax.toFixed(0)}
                </text>
                <text
                  x={scaleBarWidth + 8}
                  y={8 + scaleBarHeight / 2 + 3}
                  fontSize="8.5"
                  fill="#334155"
                  style={{ fontFamily }}
                >
                  {((colorMin + colorMax) / 2).toFixed(0)}
                </text>
                <text
                  x={scaleBarWidth + 8}
                  y={8 + scaleBarHeight}
                  fontSize="8.5"
                  fill="#334155"
                  style={{ fontFamily }}
                >
                  {colorMin.toFixed(0)}
                </text>
              </g>

              {packedColumns.map((column, columnIndex) => {
                const previousWidths = packedColumnWidths
                  .slice(0, columnIndex)
                  .reduce((sum, w) => sum + w, 0)

                const x =
                  scaleColumnWidth +
                  scaleToBlockGap +
                  previousWidths +
                  columnIndex * blockColumnGap

                let currentY = 0

                return (
                  <g key={`legend-column-${columnIndex}`} transform={`translate(${x}, 0)`}>
                    {column.map((block, blockIndex) => {
                      const y = currentY
                      currentY += block.height + (blockIndex < column.length - 1 ? 10 : 0)

                      return (
                        <g key={`${block.title}-${blockIndex}`} transform={`translate(0, ${y})`}>
                          <text
                            x="0"
                            y="0"
                            fontSize="10.5"
                            fontWeight="600"
                            fill="#0f172a"
                            style={{ fontFamily }}
                          >
                            {block.title}
                          </text>

                          {block.rows.map((row, i) => (
                            <g key={`${block.title}-${row.label}-${i}`} transform={`translate(0, ${14 + i * 12})`}>
                              {row.color ? (
                                <rect
                                  x="0"
                                  y="-6.5"
                                  width="8"
                                  height="8"
                                  fill={row.color}
                                  stroke="#cbd5e1"
                                />
                              ) : null}

                              <text
                                x={row.color ? 12 : 0}
                                y="0"
                                fontSize="8.5"
                                fill="#334155"
                                style={{ fontFamily }}
                              >
                                {row.label}
                              </text>
                            </g>
                          ))}
                        </g>
                      )
                    })}
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  )
})

export default HeatmapCanvas