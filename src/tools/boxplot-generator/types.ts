export type NullableNumber = number | null

export type BoxplotInputRow = {
  group: string
  value: number
  subgroup?: string
  label?: string
}

export type BoxplotGroupSummary = {
  group: string
  subgroup?: string
  n: number
  min: number
  q1: number
  median: number
  q3: number
  max: number
  mean: number
  iqr: number
  lowerWhisker: number
  upperWhisker: number
  outliers: number[]
  values: number[]
}

export type ParsedBoxplotData = {
  rows: BoxplotInputRow[]
  columns: string[]
  warnings: string[]
}

export type BoxplotOrientation = "vertical" | "horizontal"

export type BoxplotPalette =
  | "scientific"
  | "blue"
  | "viridis"
  | "warm"
  | "gray"

export type BoxplotSettings = {
  groupColumn: string
  valueColumn: string
  subgroupColumn: string
  labelColumn: string

  orientation: BoxplotOrientation
  palette: BoxplotPalette

  showJitter: boolean
  showOutliers: boolean
  showMean: boolean
  showMedianLine: boolean
  showGrid: boolean

  jitterAmount: number
  boxWidth: number

  yMin: number | null
  yMax: number | null
  logScale: boolean

  figureTitle: string
  figureSubtitle: string
  showLegend: boolean
  exportWidth: 1200 | 1800 | 2400
  pngExportScale: number
}

export type RawDataTable = {
  headers: string[]
  rows: Record<string, string>[]
}