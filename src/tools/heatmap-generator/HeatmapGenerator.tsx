import { useEffect, useMemo, useRef, useState } from "react"
import ToolLayout from "../../components/ToolLayout"
import { Link } from "react-router-dom"


import {
  DEFAULT_HEATMAP_SETTINGS,
  EXAMPLE_MATRIX,
  EXAMPLE_SIGNIFICANCE_MATRIX,
} from "./constants"
import { AnnotationTrack, HeatmapMatrix } from "./types"
import { parseMatrix } from "./utils/parseMatrix"
import { parseExcelToDelimitedText } from "./utils/parseExcel"
import { alignAnnotationTrack } from "./utils/parseAnnotations"
import { parseOverlayMatrix, alignOverlayMatrix } from "./utils/parseOverlayMatrix"
import { validateMatrix } from "./utils/validateMatrix"
import { transformMatrix } from "./utils/transformMatrix"
import { clusterMatrix } from "./utils/clustering"
import { matrixStats } from "./utils/statistics"
import { exportMatrixAsCsv, exportPng, exportSvg } from "./utils/export"
import { buildRowCorrelationMatrix } from "./utils/correlationMatrix"
import { filterMatrix } from "./utils/filterMatrix"
import { applyManualOrdering } from "./utils/reorderMatrix"

import HeatmapCanvas from "./components/HeatmapCanvas"
import HeatmapControls from "./components/HeatmapControls"
import HeatmapLegend from "./components/HeatmapLegend"
import MatrixPreview from "./components/MatrixPreview"
import AnnotationEditor from "./components/AnnotationEditor"
import ReorderEditor from "./components/ReorderEditor"
import { applyFigurePreset } from "./utils/figurePresets"

type AnnotationBundle = {
  labels: string[]
  tracks: AnnotationTrack[]
}

export default function HeatmapGenerator() {
  const [input, setInput] = useState("")
  const [rawMatrix, setRawMatrix] = useState<HeatmapMatrix | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState(DEFAULT_HEATMAP_SETTINGS)
  const [activePreview, setActivePreview] = useState<"raw" | "filtered" | "transformed">("transformed")
  const [exportError, setExportError] = useState<string | null>(null)

  const [rowAnnotationSourceLabels, setRowAnnotationSourceLabels] = useState<string[]>([])
  const [colAnnotationSourceLabels, setColAnnotationSourceLabels] = useState<string[]>([])
  const [rowTracks, setRowTracks] = useState<AnnotationTrack[]>([])
  const [colTracks, setColTracks] = useState<AnnotationTrack[]>([])

  const [overlayInput, setOverlayInput] = useState("")
  const [overlayRawMatrix, setOverlayRawMatrix] = useState<HeatmapMatrix | null>(null)
  const [overlayError, setOverlayError] = useState<string | null>(null)

  const [dragRowLabels, setDragRowLabels] = useState<string[]>([])
  const [dragColLabels, setDragColLabels] = useState<string[]>([])

  const svgRef = useRef<SVGSVGElement | null>(null)

  function updateAnnotationColor(
    target: "rows" | "columns",
    trackId: string,
    value: string,
    color: string
  ) {
    if (target === "rows") {
      setRowTracks(prev =>
        prev.map(track =>
          track.id === trackId
            ? {
                ...track,
                colorMap: {
                  ...track.colorMap,
                  [value]: color,
                },
              }
            : track
        )
      )
      return
    }

    setColTracks(prev =>
      prev.map(track =>
        track.id === trackId
          ? {
              ...track,
              colorMap: {
                ...track.colorMap,
                [value]: color,
              },
            }
          : track
      )
    )
  }

  function handleGenerate() {
    try {
      setError(null)
      const parsed = parseMatrix(input)
      validateMatrix(parsed)
      setRawMatrix(parsed)
    } catch (err) {
      console.error(err)
      setRawMatrix(null)
      setError(err instanceof Error ? err.message : "Failed to parse matrix.")
    }
  }

  function handleParseOverlay() {
    try {
      setOverlayError(null)
      const parsed = parseOverlayMatrix(overlayInput)
      validateMatrix(parsed)
      setOverlayRawMatrix(parsed)
    } catch (err) {
      console.error(err)
      setOverlayRawMatrix(null)
      setOverlayError(err instanceof Error ? err.message : "Failed to parse significance matrix.")
    }
  }

  async function handleDelimitedFileUpload(file: File) {
    try {
      const text = await file.text()
      setInput(text)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Could not read the uploaded file.")
    }
  }

  async function handleExcelFileUpload(file: File) {
    try {
      const text = await parseExcelToDelimitedText(file)
      setInput(text)
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Could not parse the Excel file.")
    }
  }

  const matrixForMode = useMemo(() => {
    if (!rawMatrix) return null

    if (settings.matrixMode === "correlation") {
      return buildRowCorrelationMatrix(rawMatrix)
    }

    return rawMatrix
  }, [rawMatrix, settings.matrixMode])

  const filteredMatrix = useMemo(() => {
    if (!matrixForMode) return null

    return filterMatrix(
      matrixForMode,
      settings.rowSearch,
      settings.colSearch,
      settings.topNRows,
      settings.topNCols
    )
  }, [
    matrixForMode,
    settings.rowSearch,
    settings.colSearch,
    settings.topNRows,
    settings.topNCols,
  ])

  const transformedMatrix = useMemo(() => {
    if (!filteredMatrix) return null
    return transformMatrix(filteredMatrix, settings.transform, settings.missingValueMode)
  }, [filteredMatrix, settings.transform, settings.missingValueMode])

  const clusteredMatrix = useMemo(() => {
    if (!transformedMatrix) return null

    return clusterMatrix(
      transformedMatrix,
      settings.clusterRows,
      settings.clusterCols,
      settings.distanceMetric,
      settings.rowCutGroups,
      settings.colCutGroups
    )
  }, [
    transformedMatrix,
    settings.clusterRows,
    settings.clusterCols,
    settings.distanceMetric,
    settings.rowCutGroups,
    settings.colCutGroups,
  ])

  useEffect(() => {
    if (!clusteredMatrix) {
      setDragRowLabels([])
      setDragColLabels([])
      return
    }

    setDragRowLabels(clusteredMatrix.rowLabels)
    setDragColLabels(clusteredMatrix.colLabels)
  }, [clusteredMatrix])

  const finalMatrix = useMemo(() => {
    if (!clusteredMatrix) return null

    return applyManualOrdering(
      clusteredMatrix,
      settings.rowOrderMode,
      settings.colOrderMode,
      settings.customRowOrderText,
      settings.customColOrderText,
      dragRowLabels,
      dragColLabels
    )
  }, [
    clusteredMatrix,
    settings.rowOrderMode,
    settings.colOrderMode,
    settings.customRowOrderText,
    settings.customColOrderText,
    dragRowLabels,
    dragColLabels,
  ])

  const alignedOverlayMatrix = useMemo(() => {
    if (!finalMatrix || !overlayRawMatrix) return null
    return alignOverlayMatrix(overlayRawMatrix, finalMatrix.rowLabels, finalMatrix.colLabels)
  }, [overlayRawMatrix, finalMatrix])

  const alignedRowAnnotations = useMemo(() => {
    if (!finalMatrix || rowTracks.length === 0) return []
    return rowTracks.map(track =>
      alignAnnotationTrack(track, rowAnnotationSourceLabels, finalMatrix.rowLabels)
    )
  }, [finalMatrix, rowTracks, rowAnnotationSourceLabels])

  const alignedColAnnotations = useMemo(() => {
    if (!finalMatrix || colTracks.length === 0) return []
    return colTracks.map(track =>
      alignAnnotationTrack(track, colAnnotationSourceLabels, finalMatrix.colLabels)
    )
  }, [finalMatrix, colTracks, colAnnotationSourceLabels])

  const stats = useMemo(() => {
    if (!finalMatrix) return { min: null, max: null }
    return matrixStats(finalMatrix)
  }, [finalMatrix])

  const effectiveColorMin =
    settings.colorMin !== null
      ? settings.colorMin
      : stats.min ?? 0

  const effectiveColorMax =
    settings.colorMax !== null
      ? settings.colorMax
      : stats.max ?? 1

  const matrixCells = finalMatrix
    ? finalMatrix.rowLabels.length * finalMatrix.colLabels.length
    : 0

  const compactActive =
    settings.largeMatrixMode || matrixCells > 20000

  async function handleExportPng() {
    if (!svgRef.current) return
    try {
      setExportError(null)
      await exportPng(svgRef.current, "heatmap.png", settings.pngExportScale)
    } catch (err) {
      console.error(err)
      setExportError(err instanceof Error ? err.message : "PNG export failed.")
    }
  }

  function handleExportSvg() {
    if (!svgRef.current) return
    try {
      setExportError(null)
      exportSvg(svgRef.current, "heatmap.svg")
    } catch (err) {
      console.error(err)
      setExportError(err instanceof Error ? err.message : "SVG export failed.")
    }
  }

  function handleExportCsv() {
    if (!finalMatrix) return
    try {
      setExportError(null)
      exportMatrixAsCsv(finalMatrix, "heatmap-transformed-matrix.csv")
    } catch (err) {
      console.error(err)
      setExportError(err instanceof Error ? err.message : "CSV export failed.")
    }
  }

  function handleAddRowTracks(bundle: AnnotationBundle) {
    setRowAnnotationSourceLabels(bundle.labels)
    setRowTracks(prev => [...prev, ...bundle.tracks])
  }

  function handleAddColTracks(bundle: AnnotationBundle) {
    setColAnnotationSourceLabels(bundle.labels)
    setColTracks(prev => [...prev, ...bundle.tracks])
  }

  function handleRemoveTrack(trackId: string, target: "rows" | "columns") {
    if (target === "rows") {
      setRowTracks(prev => prev.filter(track => track.id !== trackId))
      return
    }

    setColTracks(prev => prev.filter(track => track.id !== trackId))
  }

  const presetValues = applyFigurePreset(settings.figurePreset)

  return (
    <ToolLayout
      slug="heatmap-generator"
      category="Data Visualization Tools"
      badge="Visualization Tool"
      seoContent={
        <>
          <h2>Heatmap Generator for Gene Expression, RNA-seq, and Omics Data</h2>

          <p>
            Create publication-ready heatmaps for <strong>gene expression</strong>,{" "}
            <strong>RNA-seq</strong>, microarray, proteomics, metabolomics, and other
            omics datasets directly in your browser. This online heatmap generator
            helps you turn a numerical matrix into an interpretable clustered heatmap
            with color-scaled values, row and column labels, hierarchical clustering,
            dendrograms, annotations, and export-ready figure formatting.
          </p>

          <p>
            Heatmaps are one of the most widely used visualization methods in
            bioinformatics because they make it easier to compare many genes, samples,
            pathways, or experimental conditions at once. By mapping numerical values
            to color intensity, a heatmap can reveal expression patterns, sample
            groups, outliers, treatment effects, co-regulated genes, and biologically
            meaningful clusters that may be difficult to detect from tables alone.
          </p>

          <p>
            This interactive heatmap generator allows you to create clustered heatmaps
            online without requiring R, Python, command-line tools, or package
            installation. You can upload or paste CSV, TSV, or Excel data, apply
            normalization such as row or column z-scores, perform hierarchical
            clustering, and visualize dendrograms for both rows and columns.
            Annotation tracks, group labels, and legends can be added to improve
            biological interpretation.
          </p>

          <p>
            The tool is designed for modern bioinformatics workflows and supports
            figure customization options such as color palettes, clustering settings,
            annotation legends, embedded layouts, label control, and export-ready
            formatting. You can generate heatmaps suitable for manuscripts,
            presentations, posters, reports, lab meetings, and supplementary figures.
          </p>

          <p>
            You can use this tool to visualize RNA-seq expression matrices such as
            TPM, FPKM, CPM, normalized counts, log-transformed values, microarray
            expression data, proteomics abundance tables, metabolomics matrices,
            pathway-level summaries, marker gene panels, or other numerical omics
            datasets.
          </p>

          <h2>Why use this online heatmap generator?</h2>

          <p>
            Many heatmap workflows require coding in R or Python using packages such
            as pheatmap, ComplexHeatmap, heatmaply, seaborn, or matplotlib. Other
            online tools such as Heatmapper, Clustergrammer, Morpheus, and Heatmapper2
            show how useful browser-based heatmap visualization can be for biological
            data exploration. This tool is built for researchers who want a fast,
            private, no-code way to generate clustered heatmaps for gene expression
            and omics data.
          </p>

          <p>
            Use this heatmap maker when you want to quickly inspect an expression
            matrix, compare treatment and control samples, visualize selected
            differentially expressed genes, explore sample clustering, or prepare a
            clean figure for publication. For best readability and performance, this
            tool is optimized for matrices with up to <strong>1,000 rows</strong>.
            Larger heatmaps may become difficult to interpret visually, especially
            when row labels and dendrograms are displayed.
          </p>

          <h2>Key features</h2>

          <p>
            The heatmap generator supports hierarchical clustering for rows and
            columns, optional dendrograms, z-score normalization, customizable color
            scales, row and column labels, annotation tracks, legends, missing value
            handling, and export as SVG or PNG. These features make it useful for
            exploratory analysis as well as publication-ready bioinformatics figures.
          </p>

          <p>
            Row-wise z-score normalization is especially useful for gene expression
            heatmaps because it highlights relative expression patterns for each gene
            across samples. Column-wise normalization can be useful when comparing
            sample-level patterns or feature distributions. You can also keep your
            original values when absolute differences are more important than relative
            trends.
          </p>

          <p>
            Heatmaps are often used alongside other sequence and data analysis tools.
            For example, you can explore sequence-level properties using the{" "}
            <Link to="/tools/gc-content-calculator" className="underline">GC Content Calculator</Link>,{" "}
            analyze nucleotide distributions with the{" "}
            <Link to="/tools/nucleotide-composition-calculator" className="underline">
              Nucleotide Composition Calculator
            </Link>
            , or summarize sequence datasets using the{" "}
            <Link to="/tools/fasta-toolkit" className="underline">FASTA Toolkit</Link>. These complementary
            tools help provide deeper biological context before visualization.
          </p>

          <p>
            All computations are performed locally in your browser. Your uploaded
            files, gene expression values, sample annotations, and processed data are
            not uploaded or stored on a server. This makes the tool suitable for
            unpublished results, sensitive genomic datasets, clinical research tables,
            and internal lab analyses.
          </p>
        </>
      }
      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Upload or paste your gene expression or numerical matrix in CSV, TSV, or
            Excel format.
          </li>
          <li>
            Use the first row as column labels and the first column as row labels.
          </li>
          <li>
            Click <strong>Generate heatmap</strong> to create an interactive clustered
            heatmap.
          </li>
          <li>
            Apply row-wise or column-wise z-score normalization if you want to compare
            relative expression patterns.
          </li>
          <li>
            Enable hierarchical clustering for rows, columns, or both to reveal
            relationships between genes, samples, or conditions.
          </li>
          <li>
            Add row and column annotations such as pathway, treatment group,
            condition, tissue, batch, or sample type.
          </li>
          <li>
            Customize color palettes, labels, legends, dendrograms, and figure layout
            for publication or presentation.
          </li>
          <li>
            Export the final heatmap as SVG or PNG, or download the processed data.
          </li>
        </ol>
      }
      faq={[
        {
          question: "What is a heatmap used for in bioinformatics?",
          answer:
            "A heatmap is used to visualize numerical biological data as a color-coded matrix. In bioinformatics, heatmaps are commonly used for gene expression, RNA-seq, microarray, proteomics, metabolomics, and microbiome datasets. They help researchers identify expression patterns, sample groups, clusters, outliers, and differences between experimental conditions."
        },
        {
          question: "Can I create a clustered heatmap online without coding?",
          answer:
            "Yes. This tool allows you to create clustered heatmaps online without using R, Python, or command-line software. You can upload or paste your matrix, apply normalization, cluster rows and columns, add annotations, customize the figure, and export the final heatmap directly from your browser."
        },
        {
          question: "Does this heatmap tool support gene expression and RNA-seq data?",
          answer:
            "Yes. You can upload gene expression matrices from RNA-seq, microarray, proteomics, metabolomics, or other omics datasets. The tool works well with TPM, FPKM, CPM, normalized counts, log-transformed expression values, and other numerical matrices."
        },
        {
          question: "Can I add annotations to my heatmap?",
          answer:
            "Yes. You can add row and column annotation tracks such as pathway, sample group, condition, tissue, treatment, time point, or batch. These annotations help explain clustering patterns and improve biological interpretation."
        },
        {
          question: "What is row z-score normalization?",
          answer:
            "Row z-score normalization transforms each row so that values show relative changes across samples. In gene expression heatmaps, this is useful for showing whether each gene is relatively high or low in different samples or conditions."
        },
        {
          question: "Should I cluster rows, columns, or both?",
          answer:
            "Use row clustering when you want to group genes or features with similar patterns. Use column clustering when you want to group samples or conditions based on similarity. Use both when you want to explore relationships across genes and samples together."
        },
        {
          question: "How many rows can I use in the heatmap?",
          answer:
            "This tool is optimized for up to 1,000 rows to keep the heatmap readable and responsive. Larger matrices may be difficult to interpret because cells, labels, and dendrograms become crowded. For RNA-seq data, it is usually better to plot selected genes such as top differentially expressed genes, highly variable genes, marker genes, or pathway genes."
        },
        {
          question: "Can I export the heatmap for publication?",
          answer:
            "Yes. You can export the heatmap as SVG or PNG. SVG is recommended for publication figures and further editing in vector graphics software, while PNG is useful for presentations, reports, and quick sharing."
        },
        {
          question: "Is my data uploaded to a server?",
          answer:
            "No. All processing is performed locally in your browser. Your uploaded files, gene expression values, sample labels, annotations, and processed data are not uploaded, stored, or shared."
        },
        {
          question: "What file formats are supported?",
          answer:
            "The tool supports common tabular formats including CSV, TSV, and Excel files. Your input should be arranged as a numerical matrix where rows represent genes, proteins, metabolites, or other features, and columns represent samples or conditions."
        }
      ]}
    >
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-4 space-y-4">
          <div className="text-sm font-semibold text-slate-800">Input matrix</div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-48 w-full rounded border p-3 font-mono text-sm"
            placeholder={`Paste CSV or TSV matrix here.
Example:
Gene\tSample_A\tSample_B
TP53\t2.1\t3.4
EGFR\t8.1\t7.3`}
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setInput(EXAMPLE_MATRIX)}
              className="rounded border px-4 py-2 text-sm"
            >
              Load example
            </button>

            <label className="rounded border px-4 py-2 text-sm cursor-pointer">
              Upload CSV/TSV
              <input
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleDelimitedFileUpload(file)
                }}
              />
            </label>

            <label className="rounded border px-4 py-2 text-sm cursor-pointer">
              Upload Excel
              <input
                type="file"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleExcelFileUpload(file)
                }}
              />
            </label>

            <button
              onClick={handleGenerate}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Generate heatmap
            </button>

            <button
              onClick={() => {
                setInput("")
                setRawMatrix(null)
                setError(null)
                setExportError(null)
                setOverlayInput("")
                setOverlayRawMatrix(null)
                setOverlayError(null)
                setRowAnnotationSourceLabels([])
                setColAnnotationSourceLabels([])
                setRowTracks([])
                setColTracks([])
                setDragRowLabels([])
                setDragColLabels([])
              }}
              className="rounded border px-4 py-2 text-sm"
            >
              Clear
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Use the first row as column labels and the first column as row labels. Blank values, NA, NaN, null, and - are treated as missing.
          </div>
          <div className="text-xs text-slate-500">
            Use the first row as column labels and the first column as row labels. 
            Blank values, NA, NaN, null, and - are treated as missing.
            <br />
            For optimal performance and readability, heatmaps are recommended for up to ~1000 rows. 
            Larger datasets may still render but can become difficult to interpret and visually cluttered.
            </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <HeatmapControls settings={settings} onChange={setSettings} />

        {rawMatrix && (
          <>
            <div className="rounded-lg border bg-white p-4 space-y-4">
              <div className="text-sm font-semibold text-slate-800">Significance overlay matrix</div>

              <textarea
                value={overlayInput}
                onChange={(e) => setOverlayInput(e.target.value)}
                className="h-40 w-full rounded border p-3 font-mono text-sm"
                placeholder="Paste a p-value matrix with matching row and column labels..."
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setOverlayInput(EXAMPLE_SIGNIFICANCE_MATRIX)}
                  className="rounded border px-4 py-2 text-sm"
                >
                  Load overlay example
                </button>

                <button
                  onClick={handleParseOverlay}
                  className="rounded border px-4 py-2 text-sm"
                >
                  Parse overlay matrix
                </button>

                <button
                  onClick={() => {
                    setOverlayInput("")
                    setOverlayRawMatrix(null)
                    setOverlayError(null)
                  }}
                  className="rounded border px-4 py-2 text-sm"
                >
                  Clear overlay
                </button>
              </div>

              <div className="text-xs text-slate-500">
                The overlay matrix should match the heatmap row and column labels. Values are typically p-values.
              </div>

              {overlayError && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {overlayError}
                </div>
              )}
            </div>

            <AnnotationEditor
              rowAnnotationSourceLabels={rowAnnotationSourceLabels}
              colAnnotationSourceLabels={colAnnotationSourceLabels}
              rowTracks={rowTracks}
              colTracks={colTracks}
              onAddRowTracks={handleAddRowTracks}
              onAddColTracks={handleAddColTracks}
              onRemoveTrack={handleRemoveTrack}
              onUpdateTrackColor={updateAnnotationColor}
            />
          </>
        )}

        {clusteredMatrix && (settings.rowOrderMode === "drag" || settings.colOrderMode === "drag") && (
          <div className="grid gap-6 lg:grid-cols-2">
            {settings.rowOrderMode === "drag" && (
              <ReorderEditor
                title="Row reorder editor"
                labels={dragRowLabels}
                onChange={setDragRowLabels}
                onReset={() => setDragRowLabels(clusteredMatrix.rowLabels)}
              />
            )}

            {settings.colOrderMode === "drag" && (
              <ReorderEditor
                title="Column reorder editor"
                labels={dragColLabels}
                onChange={setDragColLabels}
                onReset={() => setDragColLabels(clusteredMatrix.colLabels)}
              />
            )}
          </div>
        )}

        {finalMatrix && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold">Input dimensions</div>
                <div className="mt-2">
                  Rows: {rawMatrix?.rowLabels.length ?? 0}<br />
                  Columns: {rawMatrix?.colLabels.length ?? 0}
                </div>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold">Filtered dimensions</div>
                <div className="mt-2">
                  Rows: {filteredMatrix?.rowLabels.length ?? 0}<br />
                  Columns: {filteredMatrix?.colLabels.length ?? 0}
                </div>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold">Color scale range</div>
                <div className="mt-2">
                  Min: {effectiveColorMin.toFixed(3)}<br />
                  Max: {effectiveColorMax.toFixed(3)}
                </div>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold">Overlay status</div>
                <div className="mt-2">
                  Overlay parsed: {alignedOverlayMatrix ? "yes" : "no"}<br />
                  Compact mode: {compactActive ? "on" : "off"}
                </div>
              </div>
            </div>

            {!settings.showEmbeddedLegend && (
              <HeatmapLegend
                min={effectiveColorMin}
                max={effectiveColorMax}
                palette={settings.palette}
                reversePalette={settings.reversePalette}
                missingColor={settings.missingColor}
                rowAnnotations={alignedRowAnnotations}
                colAnnotations={alignedColAnnotations}
                rowGroups={finalMatrix.rowGroups}
                colGroups={finalMatrix.colGroups}
                overlayStyle={settings.overlayStyle}
                significanceThreshold1={settings.significanceThreshold1}
                significanceThreshold2={settings.significanceThreshold2}
                significanceThreshold3={settings.significanceThreshold3}
              />
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportSvg}
                className="rounded border px-4 py-2 text-sm"
              >
                Export SVG
              </button>

              <button
                onClick={() => void handleExportPng()}
                className="rounded border px-4 py-2 text-sm"
              >
                Export PNG
              </button>

              <button
                onClick={handleExportCsv}
                className="rounded border px-4 py-2 text-sm"
              >
                Export transformed CSV
              </button>
            </div>

            {exportError && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {exportError}
              </div>
            )}

            <HeatmapCanvas
              ref={svgRef}
              matrix={finalMatrix}
              rowTree={finalMatrix.rowTree}
              colTree={finalMatrix.colTree}
              overlayMatrix={alignedOverlayMatrix}
              cellSize={presetValues.cellSize}
              fontSize={presetValues.fontSize}
              showRowLabels={settings.showRowLabels}
              showColLabels={settings.showColLabels}
              palette={settings.palette}
              reversePalette={settings.reversePalette}
              colorMin={effectiveColorMin}
              colorMax={effectiveColorMax}
              missingColor={settings.missingColor}
              rowGroups={finalMatrix.rowGroups}
              colGroups={finalMatrix.colGroups}
              rowAnnotations={alignedRowAnnotations}
              colAnnotations={alignedColAnnotations}
              showDendrograms={settings.showDendrograms}
              dendrogramSize={presetValues.dendrogramSize}
              largeMatrixMode={settings.largeMatrixMode}
              showCellBorders={settings.showCellBorders}
              rowBarplotMode={settings.rowBarplotMode}
              colBarplotMode={settings.colBarplotMode}
              barplotSize={presetValues.barplotSize}
              overlayStyle={settings.overlayStyle}
              significanceThreshold1={settings.significanceThreshold1}
              significanceThreshold2={settings.significanceThreshold2}
              significanceThreshold3={settings.significanceThreshold3}
              hideNonSignificantOverlay={settings.hideNonSignificantOverlay}
              figureTitle={settings.figureTitle}
              figureSubtitle={
                settings.figureSubtitle ||
                `${finalMatrix.rowLabels.length} rows × ${finalMatrix.colLabels.length} columns`
              }
              showEmbeddedLegend={settings.showEmbeddedLegend}
              legendPosition={settings.legendPosition}
              fontPreset={settings.fontPreset}
              exportWidth={settings.exportWidth}
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActivePreview("transformed")}
                className={`rounded px-4 py-2 text-sm ${activePreview === "transformed" ? "bg-blue-600 text-white" : "border"}`}
              >
                Transformed preview
              </button>

              <button
                onClick={() => setActivePreview("filtered")}
                className={`rounded px-4 py-2 text-sm ${activePreview === "filtered" ? "bg-blue-600 text-white" : "border"}`}
              >
                Filtered preview
              </button>

              <button
                onClick={() => setActivePreview("raw")}
                className={`rounded px-4 py-2 text-sm ${activePreview === "raw" ? "bg-blue-600 text-white" : "border"}`}
              >
                Raw preview
              </button>
            </div>

            {activePreview === "raw" && rawMatrix && (
              <MatrixPreview matrix={rawMatrix} title="Raw matrix preview" />
            )}

            {activePreview === "filtered" && filteredMatrix && (
              <MatrixPreview matrix={filteredMatrix} title="Filtered matrix preview" />
            )}

            {activePreview === "transformed" && transformedMatrix && (
              <MatrixPreview matrix={transformedMatrix} title="Transformed matrix preview" />
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}