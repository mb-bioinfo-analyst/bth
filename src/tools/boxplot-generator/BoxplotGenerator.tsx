import { useMemo, useRef, useState } from "react"
import ToolLayout from "../../components/ToolLayout"

import {
    BOXPLOT_NOTE,
    DEFAULT_BOXPLOT_SETTINGS,
    EXAMPLE_BOXPLOT_DATA,
} from "./constants"

import { BoxplotSettings, ParsedBoxplotData, RawDataTable } from "./types"
import { parseBoxplotData, parseRawDataTable } from "./utils/parseBoxplotData"
import { summarizeBoxplotGroups, getValueRange } from "./utils/statistics"
import { exportPng, exportSvg, exportSummaryCsv } from "./utils/export"

import BoxplotControls from "./components/BoxplotControls"
import BoxplotCanvas from "./components/BoxplotCanvas"
import DataPreview from "./components/DataPreview"
import SummaryTable from "./components/SummaryTable"

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

function validateFileSize(file: File) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File is too large. Maximum supported upload size is ${MAX_FILE_SIZE_MB} MB.`)
    }
}

export default function BoxplotGenerator() {
    const [input, setInput] = useState("")
    const [settings, setSettings] = useState<BoxplotSettings>(DEFAULT_BOXPLOT_SETTINGS)
    const [parsed, setParsed] = useState<ParsedBoxplotData | null>(null)
    const [rawTable, setRawTable] = useState<RawDataTable | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [exportError, setExportError] = useState<string | null>(null)

    const svgRef = useRef<SVGSVGElement | null>(null)

    const summaries = useMemo(() => {
        if (!parsed) return []
        return summarizeBoxplotGroups(parsed.rows)
    }, [parsed])

    const valueRange = useMemo(() => {
        if (summaries.length === 0) return { min: 0, max: 1 }
        return getValueRange(summaries)
    }, [summaries])

    function guessColumns(table: RawDataTable) {
        const headers = table.headers

        const group =
            headers.find(h => /group|condition|treatment|class|category/i.test(h)) ??
            headers[0] ??
            "Group"

        const value =
            headers.find(h => /value|score|expression|count|measurement|intensity/i.test(h)) ??
            headers[1] ??
            "Value"

        const subgroup =
            headers.find(h => /subgroup|batch|type|sex|status/i.test(h)) ?? ""

        const label =
            headers.find(h => /sample|id|label|name/i.test(h)) ?? ""

        setSettings(prev => ({
            ...prev,
            groupColumn: group,
            valueColumn: value,
            subgroupColumn: subgroup === group || subgroup === value ? "" : subgroup,
            labelColumn: label === group || label === value ? "" : label,
        }))
    }

    function handlePreviewInput(text: string) {
        const table = parseRawDataTable(text)
        setRawTable(table)
        guessColumns(table)
    }

    function handleLoadExample() {
        setInput(EXAMPLE_BOXPLOT_DATA)
        setParsed(null)
        setError(null)

        try {
            handlePreviewInput(EXAMPLE_BOXPLOT_DATA)
        } catch (err) {
            console.error(err)
        }
    }

    function handleGenerate() {
        try {
            setError(null)
            setExportError(null)

            const table = parseRawDataTable(input)
            setRawTable(table)

            const data = parseBoxplotData(
                input,
                settings.groupColumn,
                settings.valueColumn,
                settings.subgroupColumn,
                settings.labelColumn
            )

            setParsed(data)
        } catch (err) {
            console.error(err)
            setParsed(null)
            setError(err instanceof Error ? err.message : "Failed to parse boxplot data.")
        }
    }

    async function handleFileUpload(file: File) {
        try {
            validateFileSize(file)

            const text = await file.text()
            setInput(text)
            setError(null)
            setParsed(null)
            handlePreviewInput(text)
        } catch (err) {
            console.error(err)
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not read the uploaded file."
            )
        }
    }

    function handleClear() {
        setInput("")
        setParsed(null)
        setRawTable(null)
        setError(null)
        setExportError(null)
        setSettings(DEFAULT_BOXPLOT_SETTINGS)
    }

    function handleExportSvg() {
        if (!svgRef.current) return

        try {
            setExportError(null)
            exportSvg(svgRef.current, "boxplot.svg")
        } catch (err) {
            console.error(err)
            setExportError(err instanceof Error ? err.message : "SVG export failed.")
        }
    }

    async function handleExportPng() {
        if (!svgRef.current) return

        try {
            setExportError(null)
            await exportPng(svgRef.current, "boxplot.png", settings.pngExportScale)
        } catch (err) {
            console.error(err)
            setExportError(err instanceof Error ? err.message : "PNG export failed.")
        }
    }

    function handleExportSummary() {
        if (summaries.length === 0) return

        exportSummaryCsv(
            summaries.map(summary => ({
                group: summary.group,
                subgroup: summary.subgroup ?? "",
                n: summary.n,
                min: summary.min,
                q1: summary.q1,
                median: summary.median,
                q3: summary.q3,
                max: summary.max,
                mean: summary.mean,
                iqr: summary.iqr,
                lowerWhisker: summary.lowerWhisker,
                upperWhisker: summary.upperWhisker,
                outliers: summary.outliers.length,
            })),
            "boxplot-summary-statistics.csv"
        )
    }

    const canvasYMin = settings.yMin ?? valueRange.min
    const canvasYMax = settings.yMax ?? valueRange.max

    return (
        <ToolLayout
            slug="boxplot-generator"
            category="Data Visualization Tools"
            badge="Visualization Tool"
            seoContent={
                <>
                    <h2>Online Boxplot Generator for Scientific Data</h2>

                    <p>
                        This free online boxplot generator helps researchers, students, and data
                        analysts create clean, publication-ready boxplots from CSV or TSV data.
                        It is designed for long-format datasets where each row represents one
                        observation and columns define the group, numeric value, and optional
                        subgroup or sample label.
                    </p>

                    <p>
                        Boxplots are useful for comparing distributions across experimental
                        groups, treatment conditions, clinical cohorts, sample classes, time
                        points, or biological categories. This tool displays the median,
                        interquartile range, whiskers, outliers, optional mean markers, and
                        individual jittered data points so users can inspect both summary
                        statistics and raw observations.
                    </p>

                    <p>
                        The generator supports grouped boxplots, subgroup coloring, horizontal
                        or vertical layouts, custom axis ranges, log-scale visualization,
                        gridlines, palettes, summary statistics, and SVG or PNG export. SVG
                        output is especially useful for editing figures in Illustrator, Inkscape,
                        PowerPoint, or journal figure panels.
                    </p>

                    <p>
                        This tool is suitable for bioinformatics, gene expression analysis,
                        proteomics, metabolomics, qPCR results, clinical measurements,
                        experimental biology, quality-control metrics, and general statistical
                        data visualization. All processing runs in your browser, and your data is
                        not stored or uploaded to a server.
                    </p>

                    <h2>When should I use a boxplot?</h2>

                    <p>
                        Use a boxplot when you want to compare the distribution of a numeric
                        variable across two or more groups. For example, you can compare gene
                        expression values between control and treated samples, protein abundance
                        across disease groups, sequencing quality metrics across batches, or
                        clinical measurements across patient categories.
                    </p>

                    <h2>What does this boxplot show?</h2>

                    <p>
                        Each box represents the interquartile range from Q1 to Q3. The line
                        inside the box shows the median. Whiskers represent the non-outlier
                        range, typically within 1.5× the interquartile range. Points beyond the
                        whiskers are shown as outliers when enabled. Jitter points can be added
                        to show individual observations behind the summary distribution.
                    </p>
                </>
            }
            howTo={
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Prepare your data in long format with one row per observation.</li>
                    <li>Include at least one group column and one numeric value column.</li>
                    <li>Paste the table into the input box or upload a CSV/TSV file.</li>
                    <li>Select the group column and value column from the dropdown menus.</li>
                    <li>Optionally select a subgroup/color column for grouped boxplots.</li>
                    <li>Choose whether to show jitter points, outliers, mean markers, gridlines, or log scale.</li>
                    <li>Adjust the title, subtitle, axis range, palette, and export width.</li>
                    <li>Click <strong>Generate boxplot</strong>.</li>
                    <li>Export the figure as SVG or PNG, or download the summary statistics as CSV.</li>
                </ol>
            }
            faq={[
                {
                    question: "What data format should I use for the boxplot generator?",
                    answer:
                        "Use long-format data with one row per observation. The table should include at least one categorical group column and one numeric value column, such as Group and Value.",
                },
                {
                    question: "What is long-format data?",
                    answer:
                        "Long-format data means each row contains a single measurement. For example, one column may contain the group name and another column may contain the numeric value to plot.",
                },
                {
                    question: "Can I create grouped boxplots?",
                    answer:
                        "Yes. Select a subgroup or color column to split each main group into colored subgroups.",
                },
                {
                    question: "Can I show the individual data points?",
                    answer:
                        "Yes. Enable jitter points to display individual observations on top of the boxplots.",
                },
                {
                    question: "What do the whiskers represent?",
                    answer:
                        "The whiskers represent the non-outlier range of the data, typically values within 1.5 times the interquartile range from Q1 and Q3.",
                },
                {
                    question: "How are outliers detected?",
                    answer:
                        "Outliers are values below Q1 minus 1.5 times the IQR or above Q3 plus 1.5 times the IQR.",
                },
                {
                    question: "Can I hide outliers?",
                    answer:
                        "Yes. You can turn off outlier display in the plot settings.",
                },
                {
                    question: "Can I use log scale?",
                    answer:
                        "Yes. Log scale can be enabled for positive numeric values. This is useful when values span several orders of magnitude.",
                },
                {
                    question: "Can I export publication-quality figures?",
                    answer:
                        "Yes. You can export SVG for vector editing or PNG for direct use in presentations, reports, and manuscripts.",
                },
                {
                    question: "Can I download the summary statistics?",
                    answer:
                        "Yes. The tool provides a summary table with n, min, Q1, median, Q3, max, mean, IQR, whiskers, and outlier counts, which can be exported as CSV.",
                },
                {
                    question: "Is my data uploaded to a server?",
                    answer:
                        "No. The boxplot is generated in your browser. Your data is not stored or uploaded to a server.",
                },
                {
                    question: "What types of scientific data can I visualize?",
                    answer:
                        "You can visualize gene expression values, protein abundance, metabolomics measurements, qPCR values, clinical measurements, quality-control metrics, experimental readouts, and other numeric datasets.",
                },
            ]}
        >
            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-4 space-y-4">
                    <div className="text-sm font-semibold text-slate-800">
                        Input data
                    </div>

                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            setParsed(null)

                            try {
                                if (e.target.value.trim()) {
                                    handlePreviewInput(e.target.value)
                                } else {
                                    setRawTable(null)
                                }
                            } catch {
                                setRawTable(null)
                            }
                        }}
                        className="h-56 w-full rounded border p-3 font-mono text-sm"
                        placeholder={`Paste CSV or TSV data here.
Example:
Group\tValue
Control\t5.2
Control\t5.6
Treatment\t7.4`}
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleLoadExample}
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
                                    if (file) void handleFileUpload(file)
                                }}
                            />
                        </label>

                        <button
                            onClick={handleGenerate}
                            className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
                        >
                            Generate boxplot
                        </button>

                        <button
                            onClick={handleClear}
                            className="rounded border px-4 py-2 text-sm"
                        >
                            Clear
                        </button>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                        <div>{BOXPLOT_NOTE}</div>
                        <div>Maximum upload size: 10 MB.</div>
                        <div>
                            Large datasets may render but can become visually dense and difficult to interpret.
                        </div>
                    </div>

                    {error && (
                        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {rawTable && (
                    <>
                        <BoxplotControls
                            settings={settings}
                            columns={rawTable.headers}
                            onChange={setSettings}
                        />

                        <DataPreview table={rawTable} />
                    </>
                )}

                {parsed?.warnings.length ? (
                    <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        {parsed.warnings.map((warning, i) => (
                            <div key={i}>{warning}</div>
                        ))}
                    </div>
                ) : null}

                {summaries.length > 0 && parsed && (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border bg-slate-50 p-4 text-sm">
                                <div className="font-semibold">Observations</div>
                                <div className="mt-2">{parsed.rows.length}</div>
                            </div>

                            <div className="rounded-lg border bg-slate-50 p-4 text-sm">
                                <div className="font-semibold">Boxplot groups</div>
                                <div className="mt-2">{summaries.length}</div>
                            </div>

                            <div className="rounded-lg border bg-slate-50 p-4 text-sm">
                                <div className="font-semibold">Value range</div>
                                <div className="mt-2">
                                    {canvasYMin.toFixed(3)} – {canvasYMax.toFixed(3)}
                                </div>
                            </div>
                        </div>

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
                                onClick={handleExportSummary}
                                className="rounded border px-4 py-2 text-sm"
                            >
                                Export summary CSV
                            </button>
                        </div>

                        {exportError && (
                            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {exportError}
                            </div>
                        )}

                        <BoxplotCanvas
                            ref={svgRef}
                            summaries={summaries}
                            rows={parsed.rows}
                            palette={settings.palette}
                            orientation={settings.orientation}
                            showJitter={settings.showJitter}
                            showOutliers={settings.showOutliers}
                            showMean={settings.showMean}
                            showMedianLine={settings.showMedianLine}
                            showGrid={settings.showGrid}
                            showLegend={settings.showLegend}
                            jitterAmount={settings.jitterAmount}
                            boxWidth={settings.boxWidth}
                            yMin={settings.yMin}
                            yMax={settings.yMax}
                            logScale={settings.logScale}
                            figureTitle={settings.figureTitle}
                            figureSubtitle={
                                settings.figureSubtitle ||
                                `${parsed.rows.length} observations across ${summaries.length} group(s)`
                            }
                            exportWidth={settings.exportWidth}
                        />

                        <SummaryTable summaries={summaries} />
                    </>
                )}
            </div>
        </ToolLayout>
    )
}