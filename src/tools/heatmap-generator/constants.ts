import { HeatmapSettings, PaletteName } from "./types"

export const DEFAULT_HEATMAP_SETTINGS: HeatmapSettings = {
  matrixMode: "standard",
  transform: "none",
  clusterRows: false,
  clusterCols: false,
  distanceMetric: "euclidean",
  palette: "blue-white-red",
  reversePalette: false,
  colorMin: null,
  colorMax: null,
  missingValueMode: "keep",
  missingColor: "#e5e7eb",
  cellSize: 24,
  fontSize: 11,
  showRowLabels: true,
  showColLabels: true,

  rowSearch: "",
  colSearch: "",
  topNRows: null,
  topNCols: null,

  rowCutGroups: null,
  colCutGroups: null,

  showDendrograms: true,
  dendrogramSize: 80,
  largeMatrixMode: false,
  showCellBorders: true,

  rowBarplotMode: "none",
  colBarplotMode: "none",
  barplotSize: 60,

  overlayStyle: "none",
  significanceThreshold1: 0.05,
  significanceThreshold2: 0.01,
  significanceThreshold3: 0.001,
  hideNonSignificantOverlay: false,

  rowOrderMode: "default",
  colOrderMode: "default",
  customRowOrderText: "",
  customColOrderText: "",

  figurePreset: "publication",
  fontPreset: "minimal",
  exportWidth: 1800,

  figureTitle: "Heatmap Figure",
  figureSubtitle: "",
  showEmbeddedLegend: false,
  legendPosition: "bottom",
  pngExportScale: 2,
}

export const PALETTE_OPTIONS: { value: PaletteName; label: string }[] = [
  { value: "blue-white-red", label: "Blue → White → Red" },
  { value: "viridis", label: "Viridis" },
  { value: "magma", label: "Magma" },
  { value: "green-black-red", label: "Green → Black → Red" },
]

export const EXAMPLE_MATRIX = `Gene\tSample_A\tSample_B\tSample_C\tSample_D
TP53\t2.1\t3.4\t4.2\t5.0
EGFR\t8.1\t7.3\t6.2\t5.8
BRCA1\t1.2\t2.0\t2.9\t3.3
MYC\t6.5\t5.9\t4.8\t4.1
PTEN\t3.1\t3.7\t2.8\t2.1
KRAS\t0.5\t1.1\t1.8\t2.2
NRAS\t4.9\t4.2\t3.5\t2.7
CDKN2A\t2.8\t2.6\t3.2\t3.8`

export const EXAMPLE_COLUMN_ANNOTATION = `Sample\tCondition\tBatch
Sample_A\tControl\tBatch1
Sample_B\tControl\tBatch1
Sample_C\tTreated\tBatch2
Sample_D\tTreated\tBatch2`

export const EXAMPLE_SIGNIFICANCE_MATRIX = `Gene\tSample_A\tSample_B\tSample_C\tSample_D
TP53\t0.040\t0.008\t0.002\t0.200
EGFR\t0.300\t0.020\t0.005\t0.001
BRCA1\t0.070\t0.050\t0.020\t0.008
MYC\t0.009\t0.040\t0.200\t0.030
PTEN\t0.500\t0.200\t0.060\t0.010
KRAS\t0.800\t0.090\t0.030\t0.004
NRAS\t0.200\t0.030\t0.020\t0.001
CDKN2A\t0.060\t0.040\t0.020\t0.009`