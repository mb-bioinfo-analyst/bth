import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceListOutput from "../../components/SequenceListOutput"

interface KmerResult {
  kmer: string
  count: number
  freq: number
  gcPercent: number
}

type SortMode = "count" | "alphabetical" | "frequency"
type ExportFormat = "tsv" | "csv" | "json"

interface HistogramBin {
  label: string
  value: number
}

interface DensityPoint {
  window: number
  start: number
  end: number
  value: number
}

const YIELD_EVERY = 50000

export default function KmerCounter() {
  const [sequence, setSequence] = useState("")
  const [k, setK] = useState(3)

  const [collapseRC, setCollapseRC] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>("count")
  const [topN, setTopN] = useState(100)
  const [rareThreshold, setRareThreshold] = useState(1)

  const [minGC, setMinGC] = useState("")
  const [maxGC, setMaxGC] = useState("")

  const [windowSize, setWindowSize] = useState(100)
  const [targetKmer, setTargetKmer] = useState("")

  const [exportFormat, setExportFormat] = useState<ExportFormat>("tsv")

  const [kmers, setKmers] = useState<KmerResult[]>([])
  const [histogram, setHistogram] = useState<HistogramBin[]>([])
  const [density, setDensity] = useState<DensityPoint[]>([])

  const [totalWindows, setTotalWindows] = useState(0)
  const [uniqueCount, setUniqueCount] = useState(0)
  const [entropy, setEntropy] = useState<number | null>(null)
  const [rareCount, setRareCount] = useState(0)
  const [sequenceCount, setSequenceCount] = useState(0)
  const [totalBases, setTotalBases] = useState(0)

  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState("")

  const gcFilterMin = minGC === "" ? 0 : Number(minGC)
  const gcFilterMax = maxGC === "" ? 100 : Number(maxGC)

  const reverseComplement = (seq: string) => {
    const comp: Record<string, string> = {
      A: "T",
      T: "A",
      C: "G",
      G: "C",
      U: "A",
      N: "N",
    }

    let out = ""
    for (let i = seq.length - 1; i >= 0; i--) {
      out += comp[seq[i]] || "N"
    }
    return out
  }

  const canonical = (kmer: string) => {
    const rc = reverseComplement(kmer)
    return kmer < rc ? kmer : rc
  }

  const gcPercentOfKmer = (kmer: string) => {
    const gc = (kmer.match(/[GC]/g) || []).length
    return (gc / kmer.length) * 100
  }

  const cleanAndSplitSequences = (input: string) => {
    const text = input.trim()

    if (!text) return []

    if (text.startsWith(">")) {
      return text
        .split(/^>/m)
        .filter(Boolean)
        .map((entry) => {
          const lines = entry.split("\n")
          return lines
            .slice(1)
            .join("")
            .replace(/\s/g, "")
            .toUpperCase()
        })
        .filter(Boolean)
    }

    return [
      text
        .replace(/\s/g, "")
        .toUpperCase(),
    ]
  }

  const validateSequence = (seq: string) => /^[ACGTUN]+$/.test(seq)

  const calculateEntropy = (counts: Map<string, number>, total: number) => {
    if (total === 0) return 0

    let h = 0
    for (const c of counts.values()) {
      const p = c / total
      h -= p * Math.log2(p)
    }
    return h
  }

  const buildHistogram = (results: KmerResult[]) => {
    const bins: HistogramBin[] = [
      { label: "1", value: 0 },
      { label: "2", value: 0 },
      { label: "3-5", value: 0 },
      { label: "6-10", value: 0 },
      { label: "11-20", value: 0 },
      { label: ">20", value: 0 },
    ]

    for (const r of results) {
      if (r.count === 1) bins[0].value++
      else if (r.count === 2) bins[1].value++
      else if (r.count >= 3 && r.count <= 5) bins[2].value++
      else if (r.count >= 6 && r.count <= 10) bins[3].value++
      else if (r.count >= 11 && r.count <= 20) bins[4].value++
      else bins[5].value++
    }

    return bins
  }

  const buildDensity = (seq: string, kValue: number, win: number, target: string) => {
    const points: DensityPoint[] = []

    if (seq.length < win || win < kValue) return points

    const useTarget = target.trim().length === kValue
    const normalizedTarget = target.trim().toUpperCase()

    let windowIndex = 1

    for (let start = 0; start <= seq.length - win; start += win) {
      const chunk = seq.slice(start, start + win)

      let value = 0

      if (useTarget) {
        for (let i = 0; i <= chunk.length - kValue; i++) {
          if (chunk.slice(i, i + kValue) === normalizedTarget) {
            value++
          }
        }
      } else {
        const seen = new Set<string>()
        for (let i = 0; i <= chunk.length - kValue; i++) {
          const mer = chunk.slice(i, i + kValue)
          if (!mer.includes("N")) {
            seen.add(collapseRC ? canonical(mer) : mer)
          }
        }
        value = seen.size
      }

      points.push({
        window: windowIndex,
        start: start + 1,
        end: start + win,
        value,
      })

      windowIndex++
    }

    return points
  }

  const buildExportText = useMemo(() => {
    return (format: ExportFormat, rows: KmerResult[]) => {
      if (format === "json") {
        return JSON.stringify(rows, null, 2)
      }

      const delimiter = format === "csv" ? "," : "\t"
      const header = ["kmer", "count", "frequency", "gc_percent"].join(delimiter)

      const body = rows
        .map((r) =>
          [r.kmer, r.count, r.freq.toFixed(6), r.gcPercent.toFixed(2)].join(delimiter)
        )
        .join("\n")

      return `${header}\n${body}`
    }
  }, [])

  const countKmers = async () => {
    setError("")
    setKmers([])
    setHistogram([])
    setDensity([])
    setEntropy(null)
    setRareCount(0)
    setSequenceCount(0)
    setTotalBases(0)
    setUniqueCount(0)
    setTotalWindows(0)
    setProgress(0)
    setIsRunning(false)

    if (!sequence.trim()) {
      setError("Please enter a sequence")
      return
    }

    if (k < 1 || k > 15) {
      setError("k must be between 1 and 15")
      return
    }

    if (windowSize < k) {
      setError("Sliding window size must be greater than or equal to k")
      return
    }

    const sequences = cleanAndSplitSequences(sequence)

    if (sequences.length === 0) {
      setError("No sequence data detected")
      return
    }

    for (const seq of sequences) {
      if (!validateSequence(seq)) {
        setError("Sequence contains invalid characters. Allowed: A, C, G, T, U, N")
        return
      }
    }

    const totalSeqBases = sequences.reduce((sum, s) => sum + s.length, 0)
    const allWindows = sequences.reduce((sum, s) => sum + Math.max(0, s.length - k + 1), 0)

    setSequenceCount(sequences.length)
    setTotalBases(totalSeqBases)
    setTotalWindows(allWindows)
    setIsRunning(true)

    const counts = new Map<string, number>()
    let processed = 0
    let validWindowCount = 0

    for (const seq of sequences) {
      if (seq.length < k) continue

      for (let i = 0; i <= seq.length - k; i++) {
        let mer = seq.slice(i, i + k)

        if (mer.includes("N")) {
          processed++
          if (processed % YIELD_EVERY === 0) {
            setProgress(Math.round((processed / allWindows) * 100))
            await new Promise((resolve) => setTimeout(resolve, 0))
          }
          continue
        }

        const gcPct = gcPercentOfKmer(mer)
        if (gcPct < gcFilterMin || gcPct > gcFilterMax) {
          processed++
          if (processed % YIELD_EVERY === 0) {
            setProgress(Math.round((processed / allWindows) * 100))
            await new Promise((resolve) => setTimeout(resolve, 0))
          }
          continue
        }

        if (collapseRC) {
          mer = canonical(mer)
        }

        counts.set(mer, (counts.get(mer) || 0) + 1)
        validWindowCount++
        processed++

        if (processed % YIELD_EVERY === 0) {
          setProgress(Math.round((processed / allWindows) * 100))
          await new Promise((resolve) => setTimeout(resolve, 0))
        }
      }
    }

    let results: KmerResult[] = Array.from(counts.entries()).map(([kmer, count]) => ({
      kmer,
      count,
      freq: validWindowCount === 0 ? 0 : count / validWindowCount,
      gcPercent: gcPercentOfKmer(kmer),
    }))

    if (sortMode === "count") {
      results.sort((a, b) => b.count - a.count)
    } else if (sortMode === "frequency") {
      results.sort((a, b) => b.freq - a.freq)
    } else {
      results.sort((a, b) => a.kmer.localeCompare(b.kmer))
    }

    const rare = results.filter((r) => r.count <= rareThreshold).length
    const hist = buildHistogram(results)
    const firstSeq = sequences[0] || ""
    const dens = buildDensity(firstSeq, k, windowSize, targetKmer)

    if (topN > 0) {
      results = results.slice(0, topN)
    }

    setKmers(results)
    setHistogram(hist)
    setDensity(dens)
    setRareCount(rare)
    setUniqueCount(counts.size)
    setEntropy(Number(calculateEntropy(counts, validWindowCount).toFixed(6)))
    setProgress(100)
    setIsRunning(false)
  }

  const handleCopy = async () => {
    const text = buildExportText("tsv", kmers)
    await navigator.clipboard.writeText(text)
  }

  const handleDownload = () => {
    const text = buildExportText(exportFormat, kmers)
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const ext =
      exportFormat === "json" ? "json" : exportFormat === "csv" ? "csv" : "tsv"

    const a = document.createElement("a")
    a.href = url
    a.download = `kmer_counts.${ext}`

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setSequence(`>seq1
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG
>seq2
ATGCGCGCGTTTAAACCCGGGATATATATAT`)
  }

  const clearAll = () => {
    setSequence("")
    setKmers([])
    setHistogram([])
    setDensity([])
    setEntropy(null)
    setRareCount(0)
    setSequenceCount(0)
    setTotalBases(0)
    setUniqueCount(0)
    setTotalWindows(0)
    setProgress(0)
    setIsRunning(false)
    setError("")
    setK(3)
    setCollapseRC(false)
    setSortMode("count")
    setTopN(100)
    setRareThreshold(1)
    setMinGC("")
    setMaxGC("")
    setWindowSize(100)
    setTargetKmer("")
    setExportFormat("tsv")
  }

  return (
    <ToolLayout
  title="k-mer Counter"
  description="Count k-mer frequencies in DNA or RNA sequences with reverse-complement collapsing, entropy, histograms, density profiles, and export options."
  badge="Sequence Analysis"
  slug="kmer-counter"
  category="Sequence Analysis"

  seoContent={
  <>
    <h2>Count k-mer Frequencies in DNA and RNA Sequences</h2>

    <p>
      k-mers are short subsequences of length <em>k</em> extracted from
      biological sequences such as DNA or RNA. Counting k-mers is a
      fundamental operation in bioinformatics and computational genomics
      and is widely used in applications such as genome assembly,
      sequence comparison, motif discovery, and metagenomic
      classification. Analyzing k-mer frequencies helps researchers
      understand nucleotide composition and detect patterns within
      genomic data.
    </p>

    <p>
      This k-mer counter analyzes nucleotide sequences and calculates
      the frequency of all possible k-mers for a chosen value of
      <em>k</em>. The tool supports advanced analysis options including
      reverse-complement collapsing, GC-content filtering, k-mer
      frequency histograms, sliding-window density plots, and Shannon
      entropy estimation to measure sequence complexity.
    </p>

    <p>
      Reverse complement collapsing allows canonical representation of
      k-mers by treating a k-mer and its reverse complement as the same
      sequence, which is common in genome analysis pipelines. The tool
      can also highlight rare or highly abundant k-mers and visualize
      their distribution across the sequence. For additional sequence
      composition analysis you may also use the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>{" "}
      or compute GC percentage using the{" "}
      <Link to="/tools/gc-content">GC Content Calculator</Link>.
    </p>

    <p>
      All k-mer analysis is performed directly within your browser,
      enabling fast analysis of nucleotide sequences without uploading
      data to external servers. This ensures that genomic datasets
      remain private and secure during analysis.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a DNA or RNA sequence (or multi-FASTA input) into the sequence field.</li>
    <li>Choose the desired k-mer length.</li>
    <li>Optionally enable reverse-complement collapsing or apply GC filters.</li>
    <li>Select sorting options or limit results using the Top Results field.</li>
    <li>Click <strong>Count k-mers</strong> to perform the analysis.</li>
    <li>Review k-mer frequencies, histograms, and density plots or export the results.</li>
  </ol>
}

faq={[
  {
    question: "What is a k-mer in bioinformatics?",
    answer:
      "A k-mer is a subsequence of length k extracted from a DNA or RNA sequence. For example, with k = 3, the sequence ATGCG contains the 3-mers ATG, TGC, and GCG."
  },
  {
    question: "Why are k-mers important in genomics?",
    answer:
      "k-mer frequencies are used in genome assembly, sequence classification, motif detection, sequencing error correction, and many other genomic analyses."
  },
  {
    question: "What does reverse complement collapsing mean?",
    answer:
      "Reverse complement collapsing treats a k-mer and its reverse complement as the same sequence, allowing canonical representation of nucleotide patterns."
  },
  {
    question: "What is k-mer entropy?",
    answer:
      "Shannon entropy measures the diversity of k-mers in a sequence. Higher entropy indicates greater sequence complexity and lower repetition."
  },
  {
    question: "Are my sequences uploaded during analysis?",
    answer:
      "No. All k-mer counting and analysis are performed locally in your browser to ensure data privacy."
  }
]}
>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              k-mer length
            </label>
            <input
              type="number"
              value={k}
              min={1}
              max={15}
              onChange={(e) => setK(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sort
            </label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
            >
              <option value="count">By Count</option>
              <option value="frequency">By Frequency</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Top Results
            </label>
            <input
              type="number"
              value={topN}
              min={0}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
            >
              <option value="tsv">TSV</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4">
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={collapseRC}
                onChange={() => setCollapseRC(!collapseRC)}
              />
              Collapse Reverse Complements
            </label>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Rare k-mer threshold
            </label>
            <input
              type="number"
              value={rareThreshold}
              min={1}
              onChange={(e) => setRareThreshold(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Min GC %
            </label>
            <input
              type="number"
              value={minGC}
              min={0}
              max={100}
              onChange={(e) => setMinGC(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Max GC %
            </label>
            <input
              type="number"
              value={maxGC}
              min={0}
              max={100}
              onChange={(e) => setMaxGC(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
              placeholder="100"
            />
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sliding window size
            </label>
            <input
              type="number"
              value={windowSize}
              min={k}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              Target k-mer for density (optional)
            </label>
            <input
              type="text"
              value={targetKmer}
              onChange={(e) => setTargetKmer(e.target.value.toUpperCase())}
              className="px-4 py-2 rounded-lg border border-gray-300 w-full"
              placeholder="Leave blank to measure distinct k-mer density"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label="DNA / RNA Sequence"
            onLoadExample={loadExample}
          />

          <SequenceListOutput
            title="k-mer Counts"
            items={kmers.map((row) => ({
              header: row.kmer,
              meta: `Count ${row.count} | Freq ${row.freq.toFixed(6)} | GC ${row.gcPercent.toFixed(2)}%`,
              sequence: "",
            }))}
            placeholder="k-mer counts will appear here..."
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>

        {(sequenceCount > 0 || totalBases > 0 || uniqueCount > 0 || entropy !== null) && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Sequences</div>
              <div className="text-2xl font-bold text-blue-600">{sequenceCount}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Total Bases</div>
              <div className="text-2xl font-bold text-blue-600">{totalBases.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Unique k-mers</div>
              <div className="text-2xl font-bold text-blue-600">{uniqueCount.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Shannon Entropy</div>
              <div className="text-2xl font-bold text-blue-600">{entropy ?? "-"}</div>
            </div>
          </div>
        )}

        {rareCount > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold mb-2">Rare k-mers</h3>
            <p className="text-sm text-gray-700">
              {rareCount.toLocaleString()} k-mers occur at or below count {rareThreshold}.
            </p>
          </div>
        )}

        {histogram.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold mb-4">k-mer Histogram</h3>
            <div className="space-y-3">
              {histogram.map((bin) => {
                const maxValue = Math.max(...histogram.map((b) => b.value), 1)
                const width = `${(bin.value / maxValue) * 100}%`

                return (
                  <div key={bin.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{bin.label}</span>
                      <span>{bin.value}</span>
                    </div>
                    <div className="h-3 rounded bg-gray-200 overflow-hidden">
                      <div className="h-3 bg-blue-600" style={{ width }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {density.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold mb-4">Sliding Window k-mer Density</h3>
            <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
              <div className="grid grid-cols-4 border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
                <div>Window</div>
                <div>Start</div>
                <div>End</div>
                <div>Value</div>
              </div>
              {density.map((d) => (
                <div key={`${d.window}-${d.start}`} className="grid grid-cols-4 px-4 py-2 text-sm border-b last:border-b-0">
                  <div>{d.window}</div>
                  <div>{d.start}</div>
                  <div>{d.end}</div>
                  <div>{d.value}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {targetKmer.trim().length === k
                ? `Showing occurrences of ${targetKmer.trim().toUpperCase()} per window.`
                : "Showing distinct canonical k-mer count per window."}
            </p>
          </div>
        )}

        {isRunning && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between text-sm mb-2">
              <span>Processing large sequence...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 rounded bg-gray-200 overflow-hidden">
              <div
                className="h-3 bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Chunked counting keeps the browser responsive for genome-scale inputs.
            </p>
          </div>
        )}

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
          aria-label="Count Kmers 1"
            onClick={() => void countKmers()}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
            disabled={isRunning}
          >
            {isRunning ? "Counting..." : "Count k-mers"}
          </button>

          <button
          aria-label="Clear count Kmers 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
            disabled={isRunning}
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}