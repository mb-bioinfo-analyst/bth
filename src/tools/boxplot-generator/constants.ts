import { BoxplotPalette, BoxplotSettings } from "./types"

export const DEFAULT_BOXPLOT_SETTINGS: BoxplotSettings = {
  groupColumn: "Group",
  valueColumn: "Value",
  subgroupColumn: "",
  labelColumn: "",

  orientation: "vertical",
  palette: "scientific",

  showJitter: true,
  showOutliers: true,
  showMean: true,
  showMedianLine: true,
  showGrid: true,

  jitterAmount: 0.28,
  boxWidth: 0.62,

  yMin: null,
  yMax: null,
  logScale: false,

  figureTitle: "Boxplot Figure",
  figureSubtitle: "",
  showLegend: true,
  exportWidth: 1800,
  pngExportScale: 2,
}

export const BOXPLOT_PALETTE_OPTIONS: {
  value: BoxplotPalette
  label: string
}[] = [
  { value: "scientific", label: "Scientific" },
  { value: "blue", label: "Blue" },
  { value: "viridis", label: "Viridis-like" },
  { value: "warm", label: "Warm" },
  { value: "gray", label: "Gray" },
]

export const EXAMPLE_BOXPLOT_DATA = `Group\tValue\tCondition\tSample
Control\t5.2\tBaseline\tC1
Control\t5.6\tBaseline\tC2
Control\t4.9\tBaseline\tC3
Control\t6.1\tBaseline\tC4
Control\t5.7\tBaseline\tC5
Treatment_A\t7.4\tDrug_A\tA1
Treatment_A\t7.9\tDrug_A\tA2
Treatment_A\t8.2\tDrug_A\tA3
Treatment_A\t6.8\tDrug_A\tA4
Treatment_A\t7.6\tDrug_A\tA5
Treatment_B\t9.1\tDrug_B\tB1
Treatment_B\t8.7\tDrug_B\tB2
Treatment_B\t9.5\tDrug_B\tB3
Treatment_B\t10.2\tDrug_B\tB4
Treatment_B\t8.9\tDrug_B\tB5`

export const BOXPLOT_NOTE =
  "Use long-format data with one row per observation. The first row should contain column names. A typical table has at least one group column and one numeric value column."