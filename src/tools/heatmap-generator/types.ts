export type NullableNumber = number | null

export type HeatmapMatrix = {
  rowLabels: string[]
  colLabels: string[]
  values: NullableNumber[][]
}

export type TransformType =
  | "none"
  | "row-zscore"
  | "col-zscore"

export type DistanceMetric =
  | "euclidean"
  | "correlation"

export type PaletteName =
  | "blue-white-red"
  | "viridis"
  | "magma"
  | "green-black-red"

export type MissingValueMode =
  | "keep"
  | "zero"
  | "row-mean"
  | "col-mean"

export type MatrixMode =
  | "standard"
  | "correlation"

export type AnnotationTrack = {
  id: string
  target: "rows" | "columns"
  name: string
  values: string[]
  colorMap: Record<string, string>
}

export type SideBarplotMode =
  | "none"
  | "mean"

export type OverlayStyle =
  | "none"
  | "stars"
  | "dots"
  | "outlines"

export type OrderMode =
  | "default"
  | "alphabetical"
  | "reverse"
  | "custom"
  | "drag"

export type FigurePreset =
  | "compact"
  | "publication"
  | "poster"

export type FontPreset =
  | "nature"
  | "science"
  | "minimal"

export type ExportWidthPreset =
  | 1200
  | 1800
  | 2400

export type LegendPosition =
  | "right"
  | "bottom"

export type HeatmapSettings = {
  matrixMode: MatrixMode
  transform: TransformType
  clusterRows: boolean
  clusterCols: boolean
  distanceMetric: DistanceMetric
  palette: PaletteName
  reversePalette: boolean
  colorMin: number | null
  colorMax: number | null
  missingValueMode: MissingValueMode
  missingColor: string
  cellSize: number
  fontSize: number
  showRowLabels: boolean
  showColLabels: boolean

  rowSearch: string
  colSearch: string
  topNRows: number | null
  topNCols: number | null

  rowCutGroups: number | null
  colCutGroups: number | null

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

  rowOrderMode: OrderMode
  colOrderMode: OrderMode
  customRowOrderText: string
  customColOrderText: string

  figurePreset: FigurePreset
  fontPreset: FontPreset
  exportWidth: ExportWidthPreset

  figureTitle: string
  figureSubtitle: string
  showEmbeddedLegend: boolean
  legendPosition: LegendPosition
  pngExportScale: number
}

export type ClusterNode = {
  id: string
  left?: ClusterNode
  right?: ClusterNode
  indices: number[]
  height: number
}

export type ReorderedMatrix = HeatmapMatrix & {
  rowOrder: number[]
  colOrder: number[]
  rowTree?: ClusterNode
  colTree?: ClusterNode
  rowGroups?: number[]
  colGroups?: number[]
}

export type MatrixStats = {
  min: number | null
  max: number | null
}