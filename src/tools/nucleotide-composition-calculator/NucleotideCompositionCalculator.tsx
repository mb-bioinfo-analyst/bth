import { Link } from "react-router-dom"
import { useMemo, useRef, useState } from "react"
import { RefreshCw, AlertCircle, ChevronRight } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

type SequenceType = "dna" | "rna"

type ParsedRecord = {
  header: string
  sequence: string
}

type BaseCounts = Record<string, number>

type SummaryStats = {
  totalLength: number
  gcPercent: number
  atPercent: number
  ambiguousPercent: number
  purines: number
  pyrimidines: number
  strong: number
  weak: number
  gc1: number
  gc2: number
  gc3: number
  at1: number
  at2: number
  at3: number
  cpgObserved: number
  cpgExpected: number
  cpgOE: number
}

const BASE_ORDER_DNA = ["A", "T", "G", "C"]
const BASE_ORDER_RNA = ["A", "U", "G", "C"]
const IUPAC_AMBIGUOUS = ["R", "Y", "S", "W", "K", "M", "B", "D", "H", "V", "N"]

function cleanSequence(seq: string, type: SequenceType) {
  const upper = seq.replace(/\s/g, "").toUpperCase()
  if (type === "dna") return upper.replace(/U/g, "T")
  return upper.replace(/T/g, "U")
}

function parseMultiFasta(input: string, type: SequenceType): ParsedRecord[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  if (!trimmed.startsWith(">")) {
    return [{ header: "sequence_1", sequence: cleanSequence(trimmed, type) }]
  }

  return trimmed
    .split(/^>/m)
    .filter(Boolean)
    .map((entry, idx) => {
      const lines = entry.split("\n")
      return {
        header: lines[0]?.trim() || `sequence_${idx + 1}`,
        sequence: cleanSequence(lines.slice(1).join(""), type)
      }
    })
    .filter((r) => r.sequence.length > 0)
}

function countBases(seq: string, type: SequenceType): BaseCounts {
  const counts: BaseCounts = {
    A: 0,
    T: 0,
    U: 0,
    G: 0,
    C: 0,
    R: 0,
    Y: 0,
    S: 0,
    W: 0,
    K: 0,
    M: 0,
    B: 0,
    D: 0,
    H: 0,
    V: 0,
    N: 0,
    other: 0
  }

  for (const base of seq) {
    if (counts[base] !== undefined) counts[base] += 1
    else counts.other += 1
  }

  if (type === "dna") delete counts.U
  if (type === "rna") delete counts.T

  return counts
}

function percent(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : 0
}

function gcPercent(seq: string) {
  const gc = (seq.match(/[GC]/g) || []).length
  return percent(gc, seq.length)
}

function atPercent(seq: string, type: SequenceType) {
  const regex = type === "dna" ? /[AT]/g : /[AU]/g
  const at = (seq.match(regex) || []).length
  return percent(at, seq.length)
}

function positionalComposition(seq: string, type: SequenceType) {
  let pos1 = ""
  let pos2 = ""
  let pos3 = ""

  const usableLength = seq.length - (seq.length % 3)
  for (let i = 0; i < usableLength; i += 3) {
    pos1 += seq[i]
    pos2 += seq[i + 1]
    pos3 += seq[i + 2]
  }

  return {
    gc1: gcPercent(pos1),
    gc2: gcPercent(pos2),
    gc3: gcPercent(pos3),
    at1: atPercent(pos1, type),
    at2: atPercent(pos2, type),
    at3: atPercent(pos3, type)
  }
}

function dinucleotideFrequencies(seq: string) {
  const counts: Record<string, number> = {}
  for (let i = 0; i < seq.length - 1; i++) {
    const di = seq.slice(i, i + 2)
    counts[di] = (counts[di] || 0) + 1
  }
  return counts
}

function cpgMetrics(seq: string, type: SequenceType) {
  if (type !== "dna") {
    return {
      cpgObserved: 0,
      cpgExpected: 0,
      cpgOE: 0
    }
  }

  const c = (seq.match(/C/g) || []).length
  const g = (seq.match(/G/g) || []).length
  const cpg = (seq.match(/CG/g) || []).length
  const expected = seq.length > 0 ? (c * g) / seq.length : 0
  const oe = expected > 0 ? cpg / expected : 0

  return {
    cpgObserved: cpg,
    cpgExpected: expected,
    cpgOE: oe
  }
}

function slidingWindowGC(seq: string, windowSize: number, stepSize: number) {
  const results: { position: number; gc: number }[] = []
  if (seq.length < windowSize) return results

  for (let start = 0; start <= seq.length - windowSize; start += stepSize) {
    const window = seq.slice(start, start + windowSize)
    results.push({
      position: start + Math.floor(windowSize / 2),
      gc: Number(gcPercent(window).toFixed(2))
    })
  }

  return results
}

export default function NucleotideCompositionCalculator() {
  const [sequenceInput, setSequenceInput] = useState("")
  const [sequenceType, setSequenceType] = useState<SequenceType>("dna")
  const [windowSize, setWindowSize] = useState(100)
  const [stepSize, setStepSize] = useState(10)

  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [error, setError] = useState("")

  const [records, setRecords] = useState<ParsedRecord[]>([])
  const [combinedSequence, setCombinedSequence] = useState("")
  const [baseCounts, setBaseCounts] = useState<BaseCounts | null>(null)
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [dinucs, setDinucs] = useState<Record<string, number>>({})
  const [gcSliding, setGcSliding] = useState<{ position: number; gc: number }[]>([])

  const gcPlotRef = useRef<SVGSVGElement | null>(null)

  const baseOrder = sequenceType === "dna" ? BASE_ORDER_DNA : BASE_ORDER_RNA

  const hitSummaryBySequence = useMemo(() => {
    return records.map((r) => ({
      header: r.header,
      length: r.sequence.length,
      gc: gcPercent(r.sequence),
      at: atPercent(r.sequence, sequenceType)
    }))
  }, [records, sequenceType])

  const baseChartData = useMemo(() => {
    if (!baseCounts) return []
    return baseOrder.map((base) => ({
      base,
      count: baseCounts[base] || 0,
      pct: percent(baseCounts[base] || 0, combinedSequence.length)
    }))
  }, [baseCounts, baseOrder, combinedSequence.length])

  const ambiguousData = useMemo(() => {
    if (!baseCounts) return []
    return IUPAC_AMBIGUOUS
      .map((base) => ({
        base,
        count: baseCounts[base] || 0
      }))
      .filter((x) => x.count > 0)
  }, [baseCounts])

  const analyze = () => {
    setError("")
    setAnalysisComplete(false)

    if (!sequenceInput.trim()) {
      setError("Please enter one or more sequences")
      return
    }

    const parsed = parseMultiFasta(sequenceInput, sequenceType)

    if (parsed.length === 0) {
      setError("No valid sequence data detected")
      return
    }

    const validRegex =
      sequenceType === "dna"
        ? /^[ACGTRYSWKMBDHVN]+$/
        : /^[ACGURYSWKMBDHVN]+$/

    for (const record of parsed) {
      if (!validRegex.test(record.sequence)) {
        setError(`Sequence "${record.header}" contains invalid characters`)
        return
      }
    }

    const combined = parsed.map((r) => r.sequence).join("")
    const counts = countBases(combined, sequenceType)

    const purines = (counts.A || 0) + (counts.G || 0)
    const pyrimidines =
      sequenceType === "dna"
        ? (counts.C || 0) + (counts.T || 0)
        : (counts.C || 0) + (counts.U || 0)

    const strong = (counts.G || 0) + (counts.C || 0)
    const weak =
      sequenceType === "dna"
        ? (counts.A || 0) + (counts.T || 0)
        : (counts.A || 0) + (counts.U || 0)

    const positional = positionalComposition(combined, sequenceType)
    const cpg = cpgMetrics(combined, sequenceType)
    const sliding = slidingWindowGC(combined, windowSize, stepSize)

    setRecords(parsed)
    setCombinedSequence(combined)
    setBaseCounts(counts)
    setDinucs(dinucleotideFrequencies(combined))
    setGcSliding(sliding)

    setSummary({
      totalLength: combined.length,
      gcPercent: gcPercent(combined),
      atPercent: atPercent(combined, sequenceType),
      ambiguousPercent: percent(
        IUPAC_AMBIGUOUS.reduce((sum, base) => sum + (counts[base] || 0), 0) + (counts.other || 0),
        combined.length
      ),
      purines,
      pyrimidines,
      strong,
      weak,
      gc1: positional.gc1,
      gc2: positional.gc2,
      gc3: positional.gc3,
      at1: positional.at1,
      at2: positional.at2,
      at3: positional.at3,
      cpgObserved: cpg.cpgObserved,
      cpgExpected: cpg.cpgExpected,
      cpgOE: cpg.cpgOE
    })

    setAnalysisComplete(true)
  }

  const handleCopy = async () => {
    if (!summary || !baseCounts) return

    const lines = [
      `Total length\t${summary.totalLength}`,
      `GC%\t${summary.gcPercent.toFixed(2)}`,
      `AT%\t${summary.atPercent.toFixed(2)}`,
      ...baseOrder.map((b) => `${b}\t${baseCounts[b] || 0}\t${percent(baseCounts[b] || 0, summary.totalLength).toFixed(2)}%`)
    ]

    await navigator.clipboard.writeText(lines.join("\n"))
  }

  const handleDownload = () => {
    if (!summary || !baseCounts) return

    const lines = [
      "metric\tvalue",
      `Total length\t${summary.totalLength}`,
      `GC%\t${summary.gcPercent.toFixed(2)}`,
      `AT%\t${summary.atPercent.toFixed(2)}`,
      `Ambiguous%\t${summary.ambiguousPercent.toFixed(2)}`,
      `Purines\t${summary.purines}`,
      `Pyrimidines\t${summary.pyrimidines}`,
      `Strong(GC)\t${summary.strong}`,
      `Weak(AT/AU)\t${summary.weak}`,
      `GC1\t${summary.gc1.toFixed(2)}`,
      `GC2\t${summary.gc2.toFixed(2)}`,
      `GC3\t${summary.gc3.toFixed(2)}`,
      `AT1\t${summary.at1.toFixed(2)}`,
      `AT2\t${summary.at2.toFixed(2)}`,
      `AT3\t${summary.at3.toFixed(2)}`,
      `CpG Observed\t${summary.cpgObserved}`,
      `CpG Expected\t${summary.cpgExpected.toFixed(3)}`,
      `CpG O/E\t${summary.cpgOE.toFixed(3)}`
    ]

    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "nucleotide_composition.tsv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  const downloadGCPlotSVG = () => {
    if (!gcPlotRef.current) return

    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(gcPlotRef.current)
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "gc_sliding_window_plot.svg"
    a.click()

    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setSequenceInput(`>seq1
ATGGCGCGCGTTATATATCGCGCGCGGCGTATATATATGCGCGCGTAA
>seq2
ATGAAATTTGGGCCCGCGCGCGCGTTTAAACCCGGGATATATATATA`)
    setSequenceType("dna")
    setWindowSize(20)
    setStepSize(5)
  }

  const clearAll = () => {
    setSequenceInput("")
    setAnalysisComplete(false)
    setError("")
    setRecords([])
    setCombinedSequence("")
    setBaseCounts(null)
    setSummary(null)
    setDinucs({})
    setGcSliding([])
    setSequenceType("dna")
    setWindowSize(100)
    setStepSize(10)
  }

  return (
    <ToolLayout
      badge="Sequence Analysis"
      slug="nucleotide-composition-calculator"
      category="Sequence Analysis"

      seoContent={
        <>
          <h2>Analyze Nucleotide Composition in DNA and RNA Sequences</h2>

          <p>
            Nucleotide composition analysis is a fundamental step in many
            bioinformatics workflows. Understanding the proportion of
            nucleotides within a sequence helps researchers evaluate sequence
            quality, detect compositional bias, and identify genomic regions
            with unique structural or functional properties. Key metrics such
            as GC content, AT or AU content, and nucleotide distribution are
            commonly used to characterize genomes, transcripts, and coding
            sequences.
          </p>

          <p>
            This nucleotide composition calculator analyzes DNA or RNA
            sequences and reports detailed statistics including nucleotide
            frequencies, GC percentage, purine and pyrimidine counts, and
            strong versus weak base pairing composition. The tool also
            calculates positional nucleotide composition across codon
            positions (GC1, GC2, GC3) and provides dinucleotide frequency
            statistics for deeper sequence analysis.
          </p>

          <p>
            For genomic sequences, CpG metrics are also reported including
            observed CpG counts, expected CpG frequencies, and the
            observed-to-expected (CpG O/E) ratio. These values are widely used
            to identify CpG islands and study DNA methylation patterns in
            epigenomics. You may also compute overall GC percentage using the{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
            or calculate sequence statistics with the{" "}
            <Link to="/tools/fasta-stats">FASTA Statistics</Link>.
          </p>

          <p>
            The calculator can also generate sliding-window GC content plots
            that visualize how nucleotide composition varies along a
            sequence. This helps highlight GC-rich regions, compositional
            domains, or potential regulatory elements within genomes. All
            computations run locally in your browser so sequence data remains
            private and is never uploaded to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste one or more DNA or RNA sequences in FASTA format.</li>
          <li>Select the sequence type (DNA or RNA).</li>
          <li>Set the sliding window and step size for GC analysis if desired.</li>
          <li>Click <strong>Calculate Composition</strong>.</li>
          <li>Review nucleotide counts, GC content, and composition metrics.</li>
          <li>Explore dinucleotide frequencies, CpG statistics, and positional GC values.</li>
          <li>Copy or download the analysis results.</li>
        </ol>
      }

      faq={[
        {
          question: "What is nucleotide composition?",
          answer:
            "Nucleotide composition refers to the proportion of nucleotides (A, C, G, T or U) present in a DNA or RNA sequence. It is commonly used to analyze genome structure and sequence characteristics."
        },
        {
          question: "Why is GC content important?",
          answer:
            "GC content influences DNA stability, gene density, and replication properties. Regions with unusually high or low GC content may indicate functional genomic elements."
        },
        {
          question: "What are GC1, GC2, and GC3?",
          answer:
            "GC1, GC2, and GC3 represent GC content at the first, second, and third codon positions of coding sequences. These metrics are widely used in codon usage and evolutionary studies."
        },
        {
          question: "What is the CpG observed/expected ratio?",
          answer:
            "The CpG O/E ratio compares the observed frequency of CpG dinucleotides to the expected frequency based on individual C and G counts. It helps identify CpG islands and study methylation patterns."
        },
        {
          question: "Is my sequence data uploaded anywhere?",
          answer:
            "No. All nucleotide composition calculations run locally in your browser, ensuring that sequence data remains private."
        }
      ]}
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sequence Type
            </label>
            <select
              value={sequenceType}
              onChange={(e) => setSequenceType(e.target.value as SequenceType)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="dna">DNA</option>
              <option value="rna">RNA</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sliding Window Size
            </label>
            <input
              type="number"
              min={5}
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Step Size
            </label>
            <input
              type="number"
              min={1}
              value={stepSize}
              onChange={(e) => setStepSize(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={sequenceInput}
            onChange={setSequenceInput}
            label="Sequence / Multi-FASTA"
            onLoadExample={loadExample}
          />

          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Composition Summary</h2>

              <div className="flex gap-2">
                <button
                  aria-label="Copy composition 1"
                  onClick={handleCopy}
                  disabled={!analysisComplete || !summary}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Copy
                </button>

                <button
                  aria-label="Download composition 1"
                  onClick={handleDownload}
                  disabled={!analysisComplete || !summary}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {!analysisComplete || !summary || !baseCounts ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Nucleotide composition results will appear here...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 border-b bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700">
                    <div>Base</div>
                    <div>Count</div>
                    <div>%</div>
                  </div>

                  {baseOrder.map((base) => (
                    <div
                      key={base}
                      className="grid grid-cols-3 px-4 py-2 text-sm border-b"
                    >
                      <div className="font-mono">{base}</div>
                      <div>{baseCounts[base] || 0}</div>
                      <div>
                        {percent(baseCounts[base] || 0, summary.totalLength).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  {ambiguousData.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border-b">
                        Ambiguous Bases
                      </div>

                      {ambiguousData.map((row) => (
                        <div
                          key={row.base}
                          className="grid grid-cols-3 px-4 py-2 text-sm border-b"
                        >
                          <div className="font-mono">{row.base}</div>
                          <div>{row.count}</div>
                          <div>{percent(row.count, summary.totalLength).toFixed(2)}</div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
            aria-label="Calculate Composition 1"
            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Calculate Composition
          </button>

          <button
            aria-label="Clear Calculate Composition 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>

        {analysisComplete && summary && baseCounts && (
          <>
            <div className="px-6 pt-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Analysis Results
              </h2>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Sequences</div>
                <div className="text-2xl font-bold text-blue-600">{records.length}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Total Length</div>
                <div className="text-2xl font-bold text-blue-600">{summary.totalLength}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">GC%</div>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.gcPercent.toFixed(2)}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">AT% / AU%</div>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.atPercent.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="font-semibold mb-4">Base Composition Overview</h3>

              <div className="grid md:grid-cols-4 gap-4">
                {baseChartData.map((row) => (
                  <div
                    key={row.base}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-semibold text-slate-800">
                        {row.base}
                      </span>
                      <span className="text-sm text-slate-500">
                        {row.pct.toFixed(2)}%
                      </span>
                    </div>

                    <div className="h-3 rounded bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      Count: {row.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="font-semibold mb-4">Sequence Composition Metrics</h3>

              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-500">Purines (A+G)</div>
                  <div className="text-2xl font-bold text-blue-600">{summary.purines}</div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-500">Pyrimidines</div>
                  <div className="text-2xl font-bold text-blue-600">{summary.pyrimidines}</div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-500">Strong (G+C)</div>
                  <div className="text-2xl font-bold text-blue-600">{summary.strong}</div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-gray-500">Weak (A+T/U)</div>
                  <div className="text-2xl font-bold text-blue-600">{summary.weak}</div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Sliding Window GC Plot</h3>

                <button
                  aria-label="Download SVG Calculate Composition 1"
                  onClick={downloadGCPlotSVG}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                >
                  Download SVG
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 overflow-x-auto">
                {gcSliding.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Sequence is shorter than the selected window size.
                  </div>
                ) : (
                  <svg ref={gcPlotRef} width="900" height="260" viewBox="0 0 900 260">
                    <line x1="50" y1="210" x2="860" y2="210" stroke="#94a3b8" />
                    <line x1="50" y1="20" x2="50" y2="210" stroke="#94a3b8" />

                    {gcSliding.map((point, i) => {
                      if (i === 0) return null
                      const prev = gcSliding[i - 1]

                      const x1 = 50 + ((i - 1) / Math.max(gcSliding.length - 1, 1)) * 800
                      const y1 = 210 - (prev.gc / 100) * 180
                      const x2 = 50 + (i / Math.max(gcSliding.length - 1, 1)) * 800
                      const y2 = 210 - (point.gc / 100) * 180

                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#6366f1"
                          strokeWidth="2"
                        />
                      )
                    })}

                    <text x="455" y="245" textAnchor="middle" fontSize="12" fill="#475569">
                      Sequence Position
                    </text>

                    <text
                      x="18"
                      y="120"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#475569"
                      transform="rotate(-90 18 120)"
                    >
                      GC%
                    </text>
                  </svg>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                  Advanced Analysis
                  <ChevronRight className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-90" />
                </summary>

                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">GC1 / GC2 / GC3 and AT1 / AT2 / AT3</h3>
                    <div className="grid md:grid-cols-6 gap-3 text-center">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-500">GC1</div>
                        <div className="text-xl font-bold text-blue-600">{summary.gc1.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-500">GC2</div>
                        <div className="text-xl font-bold text-blue-600">{summary.gc2.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-500">GC3</div>
                        <div className="text-xl font-bold text-blue-600">{summary.gc3.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-500">AT1 / AU1</div>
                        <div className="text-xl font-bold text-blue-600">{summary.at1.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-500">AT2 / AU2</div>
                        <div className="text-xl font-bold text-blue-600">{summary.at2.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-500">AT3 / AU3</div>
                        <div className="text-xl font-bold text-blue-600">{summary.at3.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>

                  {sequenceType === "dna" && (
                    <div>
                      <h3 className="font-semibold mb-3">CpG Metrics</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="text-sm text-gray-500">Observed CpG</div>
                          <div className="text-2xl font-bold text-blue-600">{summary.cpgObserved}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="text-sm text-gray-500">Expected CpG</div>
                          <div className="text-2xl font-bold text-blue-600">{summary.cpgExpected.toFixed(2)}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="text-sm text-gray-500">CpG O/E Ratio</div>
                          <div className="text-2xl font-bold text-blue-600">{summary.cpgOE.toFixed(3)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-3">Dinucleotide Frequencies</h3>
                    <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
                        {Object.entries(dinucs)
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([di, count]) => (
                            <div
                              key={di}
                              className="border-b border-r px-4 py-3 text-center"
                            >
                              <div className="font-mono text-sm text-slate-700">{di}</div>
                              <div className="text-lg font-bold text-blue-600 mt-1">{count}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Per-Sequence Summary</h3>
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <div className="grid grid-cols-4 border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
                        <div>Sequence</div>
                        <div>Length</div>
                        <div>GC%</div>
                        <div>AT% / AU%</div>
                      </div>

                      {hitSummaryBySequence.map((row) => (
                        <div
                          key={row.header}
                          className="grid grid-cols-4 px-4 py-2 text-sm border-b last:border-b-0"
                        >
                          <div className="truncate" title={row.header}>{row.header}</div>
                          <div>{row.length}</div>
                          <div>{row.gc.toFixed(2)}</div>
                          <div>{row.at.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </>
        )}

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}