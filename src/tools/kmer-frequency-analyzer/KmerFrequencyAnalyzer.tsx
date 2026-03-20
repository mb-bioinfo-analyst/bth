import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceListOutput from "../../components/SequenceListOutput"
import {
  parseFasta,
  cleanSequence,
  reverseComplement,
} from "../../utils/sequenceUtils"

interface KmerResult {
  kmer: string
  count: number
  frequency: number
  percent: number
  gcPercent: number
}

interface SequenceSummary {
  header: string
  length: number
  totalWindows: number
  uniqueKmers: number
  entropy: number
}

type SortMode = "frequency" | "count" | "alphabetical"

export default function KmerFrequencyAnalyzer() {
  const [input, setInput] = useState("")
  const [k, setK] = useState(4)
  const [collapseRC, setCollapseRC] = useState(false)
  const [ignoreAmbiguous, setIgnoreAmbiguous] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>("frequency")
  const [topN, setTopN] = useState(100)

  const [results, setResults] = useState<KmerResult[]>([])
  const [summaries, setSummaries] = useState<SequenceSummary[]>([])

  const [totalWindows, setTotalWindows] = useState(0)
  const [uniqueKmers, setUniqueKmers] = useState(0)
  const [entropy, setEntropy] = useState<number | null>(null)
  const [rareCount, setRareCount] = useState(0)

  const [error, setError] = useState("")

  const canonicalKmer = (kmer: string) => {
    const rc = reverseComplement(kmer)
    return kmer < rc ? kmer : rc
  }

  const gcPercentOfKmer = (kmer: string) => {
    const gc = (kmer.match(/[GC]/g) || []).length
    return (gc / kmer.length) * 100
  }

  const calculateEntropy = (counts: Map<string, number>, total: number) => {
    if (total === 0) return 0

    let h = 0
    for (const count of counts.values()) {
      const p = count / total
      h -= p * Math.log2(p)
    }
    return h
  }

  const analyze = () => {
    setError("")
    setResults([])
    setSummaries([])
    setTotalWindows(0)
    setUniqueKmers(0)
    setEntropy(null)
    setRareCount(0)

    if (!input.trim()) {
      setError("Please enter sequence data")
      return
    }

    if (k < 1 || k > 15) {
      setError("k must be between 1 and 15")
      return
    }

    const records = parseFasta(input)

    if (records.length === 0) {
      setError("No sequence data detected")
      return
    }

    const globalCounts = new Map<string, number>()
    const perSequenceSummaries: SequenceSummary[] = []

    let globalWindows = 0

    for (const record of records) {
      const seq = cleanSequence(record.sequence)

      if (!seq) continue

      if (!/^[ACGTUN]+$/i.test(seq)) {
        setError("Sequence contains invalid characters. Allowed: A, C, G, T, U, N")
        return
      }

      const localCounts = new Map<string, number>()
      let localWindows = 0

      if (seq.length >= k) {
        for (let i = 0; i <= seq.length - k; i++) {
          let mer = seq.slice(i, i + k)

          if (ignoreAmbiguous && mer.includes("N")) {
            continue
          }

          if (collapseRC) {
            mer = canonicalKmer(mer)
          }

          localCounts.set(mer, (localCounts.get(mer) || 0) + 1)
          globalCounts.set(mer, (globalCounts.get(mer) || 0) + 1)

          localWindows++
          globalWindows++
        }
      }

      perSequenceSummaries.push({
        header: record.header,
        length: seq.length,
        totalWindows: localWindows,
        uniqueKmers: localCounts.size,
        entropy: Number(calculateEntropy(localCounts, localWindows).toFixed(6)),
      })
    }

    let rows: KmerResult[] = Array.from(globalCounts.entries()).map(([kmer, count]) => ({
      kmer,
      count,
      frequency: globalWindows === 0 ? 0 : count / globalWindows,
      percent: globalWindows === 0 ? 0 : (count / globalWindows) * 100,
      gcPercent: gcPercentOfKmer(kmer),
    }))

    if (sortMode === "frequency") {
      rows.sort((a, b) => b.frequency - a.frequency)
    } else if (sortMode === "count") {
      rows.sort((a, b) => b.count - a.count)
    } else {
      rows.sort((a, b) => a.kmer.localeCompare(b.kmer))
    }

    const rare = rows.filter((r) => r.count === 1).length

    if (topN > 0) {
      rows = rows.slice(0, topN)
    }

    setResults(rows)
    setSummaries(perSequenceSummaries)
    setTotalWindows(globalWindows)
    setUniqueKmers(globalCounts.size)
    setEntropy(Number(calculateEntropy(globalCounts, globalWindows).toFixed(6)))
    setRareCount(rare)
  }

  const exportText = useMemo(() => {
    return results
      .map(
        (r) =>
          `${r.kmer}\t${r.count}\t${r.frequency.toFixed(6)}\t${r.percent.toFixed(
            4
          )}\t${r.gcPercent.toFixed(2)}`
      )
      .join("\n")
  }, [results])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `kmer\tcount\tfrequency\tpercent\tgc_percent\n${exportText}`
    )
  }

  const handleDownload = () => {
    const text = `kmer\tcount\tfrequency\tpercent\tgc_percent\n${exportText}`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "kmer_frequency_analysis.tsv"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setInput(`>seq1
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG
>seq2
ATGCGCGCGTTTAAACCCGGGATATATATAT`)
  }

  const clearAll = () => {
    setInput("")
    setK(4)
    setCollapseRC(false)
    setIgnoreAmbiguous(true)
    setSortMode("frequency")
    setTopN(100)

    setResults([])
    setSummaries([])
    setTotalWindows(0)
    setUniqueKmers(0)
    setEntropy(null)
    setRareCount(0)
    setError("")
  }

  return (
    <ToolLayout
      badge="Sequence Analysis"
      slug="kmer-frequency-analyzer"
      category="Sequence Analysis"

      seoContent={
        <>
          <h2>Analyze k-mer Frequencies in DNA and RNA Sequences</h2>

          <p>
            k-mer frequency analysis is a fundamental technique in computational
            genomics and bioinformatics. A k-mer represents a subsequence of
            length <em>k</em> extracted from a biological sequence such as DNA
            or RNA. By counting and normalizing the frequency of these short
            subsequences, researchers can analyze sequence composition,
            identify motifs, detect repetitive elements, and compare genomes
            across organisms.
          </p>

          <p>
            This k-mer frequency analyzer calculates normalized k-mer
            frequencies from nucleotide sequences provided in FASTA format.
            The tool reports raw counts, relative frequencies, GC composition
            of each k-mer, and diversity metrics such as Shannon entropy.
            Results can be sorted by frequency, count, or alphabetically,
            allowing researchers to quickly identify dominant or rare
            sequence patterns.
          </p>

          <p>
            Additional options include reverse-complement collapsing, which
            treats a k-mer and its reverse complement as identical sequences,
            and filtering of ambiguous k-mers that contain uncertain bases.
            These features help improve the accuracy of nucleotide pattern
            analysis in genomic datasets. For simpler counting tasks you may
            also use the{" "}
            <Link to="/tools/kmer-counter">k-mer Counter</Link>{" "}
            or explore nucleotide composition using the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
          </p>

          <p>
            The analyzer also produces per-sequence summaries including
            sequence length, number of unique k-mers, and entropy-based
            diversity statistics. All analysis runs directly in your browser,
            meaning your sequence data is processed locally and never
            uploaded to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste DNA or RNA sequences in FASTA format into the input panel.</li>
          <li>Select the desired k-mer length.</li>
          <li>Choose sorting options and optional filters.</li>
          <li>Enable reverse complement collapsing if needed.</li>
          <li>Click <strong>Analyze k-mer Frequencies</strong>.</li>
          <li>Review frequency results and per-sequence statistics or export the data.</li>
        </ol>
      }

      faq={[
        {
          question: "What is a k-mer frequency analysis?",
          answer:
            "k-mer frequency analysis counts how often short subsequences of length k appear in a DNA or RNA sequence and measures their relative abundance."
        },
        {
          question: "Why are k-mer frequencies useful in bioinformatics?",
          answer:
            "k-mer frequencies are widely used in genome assembly, sequence classification, motif discovery, genome comparison, and metagenomic analysis."
        },
        {
          question: "What does reverse complement collapsing do?",
          answer:
            "Reverse complement collapsing treats a k-mer and its reverse complement as the same sequence, reducing redundancy in nucleotide pattern analysis."
        },
        {
          question: "What does Shannon entropy indicate for k-mers?",
          answer:
            "Shannon entropy measures sequence complexity and diversity of k-mer distribution. Higher entropy indicates more diverse sequence composition."
        },
        {
          question: "Are my sequences uploaded during analysis?",
          answer:
            "No. All sequence processing and k-mer analysis are performed locally in your browser to ensure data privacy."
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sort mode
            </label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="frequency">By Frequency</option>
              <option value="count">By Count</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Top results
            </label>
            <input
              type="number"
              value={topN}
              min={0}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div className="flex items-end">
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={collapseRC}
                  onChange={() => setCollapseRC(!collapseRC)}
                />
                Collapse reverse complements
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ignoreAmbiguous}
                  onChange={() => setIgnoreAmbiguous(!ignoreAmbiguous)}
                />
                Ignore ambiguous k-mers
              </label>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={input}
            onChange={setInput}
            label="DNA / RNA FASTA Input"
            onLoadExample={loadExample}
          />

          <SequenceListOutput
            title="k-mer Frequency Results"
            items={results.map((r) => ({
              header: r.kmer,
              meta: `Count ${r.count} | Freq ${r.frequency.toFixed(6)} | ${r.percent.toFixed(
                4
              )}% | GC ${r.gcPercent.toFixed(2)}%`,
              sequence: "",
            }))}
            placeholder="k-mer frequencies will appear here..."
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>

        {(totalWindows > 0 || uniqueKmers > 0 || entropy !== null) && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Total Windows</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalWindows.toLocaleString()}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Unique k-mers</div>
              <div className="text-2xl font-bold text-blue-600">
                {uniqueKmers.toLocaleString()}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Shannon Entropy</div>
              <div className="text-2xl font-bold text-blue-600">
                {entropy ?? "-"}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Rare k-mers</div>
              <div className="text-2xl font-bold text-blue-600">
                {rareCount.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {summaries.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold mb-4">Per-sequence Summary</h3>

            <div className="max-h-[320px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
              <div className="grid grid-cols-4 border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
                <div>Sequence</div>
                <div>Length</div>
                <div>Unique k-mers</div>
                <div>Entropy</div>
              </div>

              {summaries.map((row, index) => (
                <div
                  key={`${row.header}-${index}`}
                  className="grid grid-cols-4 px-4 py-2 text-sm border-b last:border-b-0"
                >
                  <div className="truncate" title={row.header}>
                    {row.header}
                  </div>
                  <div>{row.length}</div>
                  <div>{row.uniqueKmers}</div>
                  <div>{row.entropy}</div>
                </div>
              ))}
            </div>
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
            aria-label="Clear Analyze k-mer Frequencies 1"
            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Analyze k-mer Frequencies
          </button>

          <button
            aria-label="Clear Analyze k-mer Frequencies 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}