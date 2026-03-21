import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import JSZip from "jszip"
import { RefreshCw, AlertCircle, Download, Plus, Trash2 } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

type Tab =
  | "extract"
  | "editHeaders"
  | "filter"
  | "deduplicate"
  | "sortSample"
  | "format"
  | "stats"
  | "split"
  | "merge"

type HeaderExtractMode = "full" | "id"
type DedupMode = "sequence" | "id" | "entry"
type SortMode = "headerAsc" | "headerDesc" | "idAsc" | "idDesc" | "lengthAsc" | "lengthDesc"
type SplitMode = "perFile" | "numFiles"

type FastaEntry = {
  header: string
  id: string
  seq: string
}

type FastaStats = {
  totalSequences: number
  totalLength: number
  minLength: number
  maxLength: number
  meanLength: number
  gc: number
}

const TABS: { key: Tab; label: string }[] = [
  { key: "extract", label: "Header Extractor" },
  { key: "editHeaders", label: "Header Editor" },
  { key: "filter", label: "Filter" },
  { key: "deduplicate", label: "Deduplicate" },
  { key: "sortSample", label: "Sort & Sample" },
  { key: "format", label: "Formatter" },
  { key: "stats", label: "Statistics" },
  { key: "split", label: "Splitter" },
  { key: "merge", label: "Merger" }
]

function parseFasta(text: string): FastaEntry[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const rawEntries = trimmed.split(/\n(?=>)/).filter(Boolean)

  return rawEntries
    .map((entry) => {
      const lines = entry.split(/\r?\n/)
      const rawHeader = lines[0]?.trim() || ""
      const header = rawHeader.startsWith(">") ? rawHeader : `>${rawHeader}`
      const seq = lines
        .slice(1)
        .join("")
        .replace(/\s/g, "")

      const id = header.replace(/^>/, "").split(/\s+/)[0] || "unnamed_sequence"

      return { header, id, seq }
    })
    .filter((entry) => entry.header.startsWith(">"))
}

function toFasta(entries: FastaEntry[], wrap = 80): string {
  return entries
    .map((entry) => {
      const wrapped =
        wrap > 0
          ? entry.seq.match(new RegExp(`.{1,${wrap}}`, "g"))?.join("\n") || entry.seq
          : entry.seq

      return `${entry.header}\n${wrapped}`
    })
    .join("\n")
}

function gcContent(seq: string): number {
  if (!seq.length) return 0
  const gc = (seq.toUpperCase().match(/[GC]/g) || []).length
  return (gc / seq.length) * 100
}

function computeDatasetStats(entries: FastaEntry[]): FastaStats {
  const lengths = entries.map((e) => e.seq.length)
  const totalSequences = entries.length
  const totalLength = lengths.reduce((a, b) => a + b, 0)
  const minLength = lengths.length ? Math.min(...lengths) : 0
  const maxLength = lengths.length ? Math.max(...lengths) : 0
  const meanLength = lengths.length ? totalLength / lengths.length : 0

  const mergedSeq = entries.map((e) => e.seq.toUpperCase()).join("")
  const gc = gcContent(mergedSeq)

  return {
    totalSequences,
    totalLength,
    minLength,
    maxLength,
    meanLength,
    gc
  }
}

function safeDownload(content: BlobPart, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function FASTAToolkit() {
  const [activeTab, setActiveTab] = useState<Tab>("extract")

  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [report, setReport] = useState("")
  const [error, setError] = useState("")

  const [mergeInputs, setMergeInputs] = useState<string[]>(["", ""])

  const parsedEntries = useMemo(() => parseFasta(input), [input])

  // Extract
  const [extractMode, setExtractMode] = useState<HeaderExtractMode>("full")
  const [extractRemoveSymbol, setExtractRemoveSymbol] = useState(true)
  const [extractCsv, setExtractCsv] = useState(false)

  // Header editor
  const [headerPrefix, setHeaderPrefix] = useState("")
  const [headerSuffix, setHeaderSuffix] = useState("")
  const [headerFind, setHeaderFind] = useState("")
  const [headerReplace, setHeaderReplace] = useState("")
  const [headerModeIdOnly, setHeaderModeIdOnly] = useState(false)

  // Filter
  const [minLength, setMinLength] = useState("")
  const [maxLength, setMaxLength] = useState("")
  const [minGC, setMinGC] = useState("")
  const [maxGC, setMaxGC] = useState("")
  const [keyword, setKeyword] = useState("")

  // Deduplicate
  const [dedupMode, setDedupMode] = useState<DedupMode>("sequence")

  // Sort & sample
  const [sortMode, setSortMode] = useState<SortMode>("headerAsc")
  const [sampleSize, setSampleSize] = useState("")
  const [sampleSeedInfo, setSampleSeedInfo] = useState("")

  // Format
  const [wrapWidth, setWrapWidth] = useState("80")
  const [formatUppercase, setFormatUppercase] = useState(true)
  const [removeEmptyEntries, setRemoveEmptyEntries] = useState(true)

  // Split
  const [splitMode, setSplitMode] = useState<SplitMode>("perFile")
  const [splitValue, setSplitValue] = useState("10")

  // Merge
  const [mergeRemoveDuplicates, setMergeRemoveDuplicates] = useState(false)
  const [mergePrefix, setMergePrefix] = useState("")
  const [mergeSuffix, setMergeSuffix] = useState("")

  function resetOutputState() {
    setOutput("")
    setReport("")
    setError("")
  }

  function ensureInputEntries(): FastaEntry[] | null {
    if (!input.trim()) {
      setError("Please paste FASTA data")
      return null
    }

    const entries = parseFasta(input)
    if (entries.length === 0) {
      setError("No FASTA entries detected")
      return null
    }

    return entries
  }

  function loadExample() {
    resetOutputState()

    if (activeTab === "extract") {
      setInput(`>seq1 Homo sapiens gene A
ATGCGTACGTAG
>seq2 Mus musculus gene B
ATGCGTAGGCTA
>seq3 Example protein
ATGCGTAGCTAG`)
      return
    }

    if (activeTab === "editHeaders") {
      setInput(`>sample_1 human transcript alpha
ATGCGTACGTAG
>sample_2 mouse transcript beta
ATGCGTAGGCTA`)
      setHeaderPrefix("projectA_")
      setHeaderSuffix("")
      setHeaderFind("sample")
      setHeaderReplace("record")
      return
    }

    if (activeTab === "filter") {
      setInput(`>seq1 human
ATGCGTACGTAG
>seq2 bacteria
ATGCGTAGCTAGCTAGCT
>seq3 virus
ATGCGT`)
      setMinLength("8")
      setMaxLength("")
      setMinGC("")
      setMaxGC("")
      setKeyword("")
      return
    }

    if (activeTab === "deduplicate") {
      setInput(`>seq1
ATGCGTACGT
>seq2
ATGCGTACGT
>seq3
TTGCGTACGA`)
      setDedupMode("sequence")
      return
    }

    if (activeTab === "sortSample") {
      setInput(`>beta_seq
ATGCGTA
>alpha_seq
ATGCGTACGTAG
>gamma_seq
ATGC`)
      setSortMode("headerAsc")
      setSampleSize("2")
      return
    }

    if (activeTab === "format") {
      setInput(`>seq1
ATGCGTACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG
>seq2

atgcgtagctagctagctag`)
      setWrapWidth("20")
      setFormatUppercase(true)
      setRemoveEmptyEntries(true)
      return
    }

    if (activeTab === "stats") {
      setInput(`>seq1
ATGCGTACGTAG
>seq2
ATGCGTAGCTAGCTAGCT
>seq3
ATGCGT`)
      return
    }

    if (activeTab === "split") {
      setInput(`>seq1
ATGCGTACGT
>seq2
ATGCGTACGA
>seq3
ATGCGTACGG
>seq4
ATGCGTACTT
>seq5
ATGCGTACCC`)
      setSplitMode("perFile")
      setSplitValue("2")
      return
    }

    if (activeTab === "merge") {
      setMergeInputs([
        `>seq1
ATGCGTACGT
>seq2
ATGCGTAGCT`,
        `>seq3
ATGCGTACGA
>seq4
ATGCGTAGGA`
      ])
      setMergePrefix("")
      setMergeSuffix("")
      setMergeRemoveDuplicates(false)
    }
  }

  function clearAll() {
    setInput("")
    setOutput("")
    setReport("")
    setError("")
    setMergeInputs(["", ""])
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
  }

  function handleDownload() {
    const filenameMap: Record<Tab, string> = {
      extract: extractCsv ? "fasta_headers.csv" : "fasta_headers.txt",
      editHeaders: "edited_headers.fasta",
      filter: "filtered_sequences.fasta",
      deduplicate: "deduplicated_sequences.fasta",
      sortSample: "sorted_or_sampled_sequences.fasta",
      format: "formatted_sequences.fasta",
      stats: "fasta_statistics.txt",
      split: "fasta_split_report.txt",
      merge: "merged_sequences.fasta"
    }

    safeDownload(output || report, filenameMap[activeTab])
  }

  function runExtract() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    const headers = entries.map((entry) => {
      let h = entry.header
      if (extractRemoveSymbol) h = h.replace(/^>/, "")
      if (extractMode === "id") h = h.split(/\s+/)[0]
      return h
    })

    setOutput(extractCsv ? headers.join(",") : headers.join("\n"))
    setReport(`Headers extracted: ${headers.length}`)
  }

  function runHeaderEdit() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    const edited = entries.map((entry) => {
      const original = entry.header.replace(/^>/, "")
      const target = headerModeIdOnly
        ? `${entry.id}${original.slice(entry.id.length)}`
        : original

      let editedHeader = target

      if (headerFind) {
        editedHeader = editedHeader.split(headerFind).join(headerReplace)
      }

      editedHeader = `${headerPrefix}${editedHeader}${headerSuffix}`

      return {
        ...entry,
        header: `>${editedHeader}`
      }
    })

    setOutput(toFasta(edited, 80))
    setReport(`Headers edited: ${edited.length}`)
  }

  function runFilter() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    const minLen = Number(minLength) || 0
    const maxLen = Number(maxLength) || Infinity
    const minGc = Number(minGC) || 0
    const maxGc = Number(maxGC) || 100

    const filtered = entries.filter((entry) => {
      const len = entry.seq.length
      const gc = gcContent(entry.seq)

      if (len < minLen) return false
      if (len > maxLen) return false
      if (gc < minGc) return false
      if (gc > maxGc) return false

      if (keyword && !entry.header.toLowerCase().includes(keyword.toLowerCase())) {
        return false
      }

      return true
    })

    if (!filtered.length) {
      setError("No sequences passed the selected filters")
      return
    }

    setOutput(toFasta(filtered, 80))
    setReport(`Total sequences: ${entries.length}
Sequences passing filter: ${filtered.length}
Filtered out: ${entries.length - filtered.length}`)
  }

  function runDeduplicate() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    const seen = new Set<string>()
    const kept: FastaEntry[] = []
    let removed = 0

    for (const entry of entries) {
      let key = ""

      if (dedupMode === "sequence") key = entry.seq.toUpperCase()
      if (dedupMode === "id") key = entry.id
      if (dedupMode === "entry") key = `${entry.header}\n${entry.seq.toUpperCase()}`

      if (seen.has(key)) {
        removed++
        continue
      }

      seen.add(key)
      kept.push(entry)
    }

    setOutput(toFasta(kept, 80))
    setReport(`Total sequences: ${entries.length}
Unique sequences: ${kept.length}
Duplicates removed: ${removed}`)
  }

  function runSortAndSample() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    let processed = [...entries]

    processed.sort((a, b) => {
      if (sortMode === "headerAsc") return a.header.localeCompare(b.header)
      if (sortMode === "headerDesc") return b.header.localeCompare(a.header)
      if (sortMode === "idAsc") return a.id.localeCompare(b.id)
      if (sortMode === "idDesc") return b.id.localeCompare(a.id)
      if (sortMode === "lengthAsc") return a.seq.length - b.seq.length
      return b.seq.length - a.seq.length
    })

    let sampled = processed
    let sampledInfo = "No random sampling applied"

    const n = Number(sampleSize)
    if (n && n > 0) {
      sampled = shuffleArray(processed).slice(0, Math.min(n, processed.length))
      sampledInfo = `Random sample size: ${sampled.length}`
    }

    setSampleSeedInfo(sampledInfo)
    setOutput(toFasta(sampled, 80))
    setReport(`Total input sequences: ${entries.length}
Output sequences: ${sampled.length}
Sort mode: ${sortMode}
${sampledInfo}`)
  }

  function runFormat() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    const width = Math.max(1, Number(wrapWidth) || 80)

    let processed = entries.map((entry) => ({
      ...entry,
      seq: formatUppercase ? entry.seq.toUpperCase() : entry.seq
    }))

    if (removeEmptyEntries) {
      processed = processed.filter((entry) => entry.seq.length > 0)
    }

    if (!processed.length) {
      setError("No FASTA entries remain after formatting")
      return
    }

    setOutput(toFasta(processed, width))
    setReport(`Original entries: ${entries.length}
Formatted entries: ${processed.length}
Wrap width: ${width}`)
  }

  function runStats() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    const stats = computeDatasetStats(entries)

    const perSeq = entries
      .map((entry, i) => {
        const gc = gcContent(entry.seq).toFixed(2)
        return `${i + 1}. ${entry.id} | length=${entry.seq.length} | GC=${gc}%`
      })
      .join("\n")

    const text = `FASTA Statistics

Total sequences: ${stats.totalSequences}
Total residues: ${stats.totalLength}
Minimum length: ${stats.minLength}
Maximum length: ${stats.maxLength}
Mean length: ${stats.meanLength.toFixed(2)}
Dataset GC%: ${stats.gc.toFixed(2)}

Per-sequence summary:
${perSeq}`

    setOutput(text)
    setReport(`Statistics calculated for ${stats.totalSequences} sequences`)
  }

  async function runSplit() {
    resetOutputState()
    const entries = ensureInputEntries()
    if (!entries) return

    let chunks: FastaEntry[][] = []
    const value = Number(splitValue)

    if (splitMode === "perFile") {
      if (!value || value <= 0) {
        setError("Sequences per file must be greater than 0")
        return
      }

      for (let i = 0; i < entries.length; i += value) {
        chunks.push(entries.slice(i, i + value))
      }
    }

    if (splitMode === "numFiles") {
      if (!value || value <= 0) {
        setError("Number of output files must be greater than 0")
        return
      }

      const numFiles = Math.min(value, entries.length)
      const size = Math.ceil(entries.length / numFiles)

      for (let i = 0; i < entries.length; i += size) {
        chunks.push(entries.slice(i, i + size))
      }
    }

    if (!chunks.length) {
      setError("Unable to split FASTA input")
      return
    }

    const zip = new JSZip()

    chunks.forEach((chunk, i) => {
      zip.file(`fasta_part_${i + 1}_n${chunk.length}.fasta`, toFasta(chunk, 80))
    })

    const blob = await zip.generateAsync({ type: "blob" })
    safeDownload(blob, "fasta_split.zip", "application/zip")

    const summary = `Total sequences: ${entries.length}
Files created: ${chunks.length}
Split mode: ${splitMode === "perFile" ? "Sequences per file" : "Number of files"}`

    setReport(summary)
    setOutput(summary)
  }

  function updateMergeInput(index: number, value: string) {
    const next = [...mergeInputs]
    next[index] = value
    setMergeInputs(next)
  }

  function removeMergeInput(index: number) {
    if (mergeInputs.length <= 1) return
    setMergeInputs(mergeInputs.filter((_, i) => i !== index))
  }

  function runMerge() {
    resetOutputState()

    const validInputs = mergeInputs.filter((i) => i.trim())
    if (!validInputs.length) {
      setError("Please paste at least one FASTA dataset")
      return
    }

    const parsed = validInputs.map(parseFasta)
    let merged = parsed.flat()

    if (!merged.length) {
      setError("No FASTA entries detected in the provided inputs")
      return
    }

    const totalBefore = merged.length

    if (mergeRemoveDuplicates) {
      const seen = new Set<string>()

      merged = merged.filter((entry) => {
        const seq = entry.seq.replace(/\s/g, "").toUpperCase()
        if (seen.has(seq)) return false
        seen.add(seq)
        return true
      })
    }

    if (mergePrefix || mergeSuffix) {
      merged = merged.map((entry) => ({
        ...entry,
        header: `>${mergePrefix}${entry.header.replace(/^>/, "")}${mergeSuffix}`
      }))
    }

    setOutput(toFasta(merged, 80))
    setReport(`Input datasets: ${validInputs.length}
Sequences before merge options: ${totalBefore}
Sequences in final merged file: ${merged.length}`)
  }

  function runActiveTool() {
    if (activeTab === "extract") return runExtract()
    if (activeTab === "editHeaders") return runHeaderEdit()
    if (activeTab === "filter") return runFilter()
    if (activeTab === "deduplicate") return runDeduplicate()
    if (activeTab === "sortSample") return runSortAndSample()
    if (activeTab === "format") return runFormat()
    if (activeTab === "stats") return runStats()
    if (activeTab === "split") return runSplit()
    if (activeTab === "merge") return runMerge()
  }

  const statsPreview = useMemo(() => {
    if (!parsedEntries.length) return null
    return computeDatasetStats(parsedEntries)
  }, [parsedEntries])

  return (
    <ToolLayout
      badge="FASTA Toolkit"
      slug="fasta-toolkit"
      category="FASTA"
      seoContent={
        <>
          <h2>FASTA Toolkit: Split, Merge, Filter, Deduplicate, Edit Headers, and Analyze FASTA Files</h2>

          <p>
            The FASTA Toolkit is a comprehensive browser-based platform for working with multi-FASTA
            datasets. Instead of switching between separate one-purpose tools, you can manage headers,
            filter sequences, remove duplicates, sort records, sample subsets, format files, compute
            statistics, split large datasets, and merge multiple FASTA inputs from a single interface.
          </p>

          <p>
            FASTA processing is a routine part of genomics, transcriptomics, metagenomics, phylogenetics,
            and protein analysis workflows. Researchers frequently need to inspect FASTA headers, isolate
            records matching a keyword, remove redundant sequences, split large files for cluster jobs,
            or merge datasets from different experiments. This toolkit brings those common preprocessing
            steps together in one place.
          </p>

          <p>
            The toolkit supports multi-FASTA input, dynamic merging of several datasets, filtering by
            sequence length and GC content, header extraction or editing, formatting with configurable
            line wrapping, and downloadable ZIP output for split datasets. Because all processing happens
            locally in the browser, sequence data is never uploaded to external servers.
          </p>

          <p>
            This page works especially well alongside related tools such as the{" "}
            <Link to="/tools/sequence-toolkit">Sequence Toolkit</Link>,{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>, and{" "}
            <Link to="/tools/nucleotide-composition-calculator">Nucleotide Composition Calculator</Link>.
            Together, these tools support both FASTA file management and downstream sequence analysis.
          </p>
        </>
      }
      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Select the FASTA operation you want to run using the toolkit tabs.</li>
          <li>Paste a FASTA dataset into the input panel, or paste multiple datasets in merge mode.</li>
          <li>Adjust the module-specific options such as filtering thresholds, deduplication mode, wrap width, or split settings.</li>
          <li>Click <strong>Run FASTA Toolkit</strong> to process the dataset.</li>
          <li>Review the output FASTA file, extracted headers, report, or statistics in the result panel.</li>
          <li>Copy or download the output for further analysis or pipeline integration.</li>
        </ol>
      }
      faq={[
        {
          question: "What can this FASTA Toolkit do?",
          answer:
            "This toolkit combines multiple FASTA file utilities into one interface, including header extraction and editing, filtering, deduplication, sorting, random sampling, formatting, statistics, splitting, and merging."
        },
        {
          question: "Does the toolkit support multi-FASTA files?",
          answer:
            "Yes. The toolkit is designed for multi-FASTA datasets and can process many sequence records within a single input."
        },
        {
          question: "Can I merge more than two FASTA datasets?",
          answer:
            "Yes. The merge module supports adding multiple FASTA input panels, so you can combine several datasets into one output file."
        },
        {
          question: "Can I split large FASTA files into multiple files?",
          answer:
            "Yes. The split module can create output files based on sequences per file or the total number of output files, and downloads them as a ZIP archive."
        },
        {
          question: "Can I remove duplicate sequences?",
          answer:
            "Yes. The deduplication module can remove duplicates by sequence content, by sequence identifier, or by identical full FASTA entry."
        },
        {
          question: "Is my FASTA data uploaded anywhere?",
          answer:
            "No. All FASTA processing happens locally in your browser, which helps preserve privacy for unpublished or sensitive biological sequence datasets."
        }
      ]}
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  resetOutputState()
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab !== "merge" && (
          <>
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              {activeTab === "extract" && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Extraction Mode</label>
                    <select
                      value={extractMode}
                      onChange={(e) => setExtractMode(e.target.value as HeaderExtractMode)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="full">Full header</option>
                      <option value="id">Sequence ID only</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 mt-8">
                    <input
                      type="checkbox"
                      checked={extractRemoveSymbol}
                      onChange={() => setExtractRemoveSymbol(!extractRemoveSymbol)}
                    />
                    Remove {">"} symbol
                  </label>

                  <label className="flex items-center gap-2 mt-8">
                    <input
                      type="checkbox"
                      checked={extractCsv}
                      onChange={() => setExtractCsv(!extractCsv)}
                    />
                    Output as CSV
                  </label>
                </div>
              )}

              {activeTab === "editHeaders" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Header Prefix</label>
                    <input
                      value={headerPrefix}
                      onChange={(e) => setHeaderPrefix(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Header Suffix</label>
                    <input
                      value={headerSuffix}
                      onChange={(e) => setHeaderSuffix(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Find Text</label>
                    <input
                      value={headerFind}
                      onChange={(e) => setHeaderFind(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Replace With</label>
                    <input
                      value={headerReplace}
                      onChange={(e) => setHeaderReplace(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Optional"
                    />
                  </div>

                  <label className="flex items-center gap-2 lg:col-span-2">
                    <input
                      type="checkbox"
                      checked={headerModeIdOnly}
                      onChange={() => setHeaderModeIdOnly(!headerModeIdOnly)}
                    />
                    Apply text replacement primarily to ID-focused header editing
                  </label>
                </div>
              )}

              {activeTab === "filter" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Minimum Length</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={minLength}
                      onChange={(e) => setMinLength(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Maximum Length</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={maxLength}
                      onChange={(e) => setMaxLength(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Minimum GC %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={minGC}
                      onChange={(e) => setMinGC(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Maximum GC %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={maxGC}
                      onChange={(e) => setMaxGC(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Header Keyword</label>
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              {activeTab === "deduplicate" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Deduplication Mode</label>
                  <select
                    value={dedupMode}
                    onChange={(e) => setDedupMode(e.target.value as DedupMode)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="sequence">Remove duplicates by sequence</option>
                    <option value="id">Remove duplicates by sequence ID</option>
                    <option value="entry">Remove identical FASTA entries</option>
                  </select>
                </div>
              )}

              {activeTab === "sortSample" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Sort Mode</label>
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value as SortMode)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="headerAsc">Header A → Z</option>
                      <option value="headerDesc">Header Z → A</option>
                      <option value="idAsc">ID A → Z</option>
                      <option value="idDesc">ID Z → A</option>
                      <option value="lengthAsc">Length low → high</option>
                      <option value="lengthDesc">Length high → low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Random Sample Size</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={sampleSize}
                      onChange={(e) => setSampleSize(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              {activeTab === "format" && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Wrap Width</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={wrapWidth}
                      onChange={(e) => setWrapWidth(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <label className="flex items-center gap-2 mt-8">
                    <input
                      type="checkbox"
                      checked={formatUppercase}
                      onChange={() => setFormatUppercase(!formatUppercase)}
                    />
                    Convert sequences to uppercase
                  </label>

                  <label className="flex items-center gap-2 mt-8">
                    <input
                      type="checkbox"
                      checked={removeEmptyEntries}
                      onChange={() => setRemoveEmptyEntries(!removeEmptyEntries)}
                    />
                    Remove empty entries
                  </label>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="text-sm text-gray-600">
                  Calculate per-dataset and per-sequence FASTA statistics from the input.
                </div>
              )}

              {activeTab === "split" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Split Mode</label>
                    <select
                      value={splitMode}
                      onChange={(e) => setSplitMode(e.target.value as SplitMode)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="perFile">Sequences per file</option>
                      <option value="numFiles">Number of output files</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Value</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={splitValue}
                      onChange={(e) => setSplitValue(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 divide-x divide-gray-200">
              <SequenceInput
                value={input}
                onChange={setInput}
                label="FASTA Input"
                // onLoadExample={loadExample}
              />

              <SequenceOutput
                value={output}
                title="Toolkit Output"
                onCopy={handleCopy}
                onDownload={handleDownload}
              />
            </div>
          </>
        )}

        {activeTab === "merge" && (
          <>
            <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Header Prefix</label>
                <input
                  value={mergePrefix}
                  onChange={(e) => setMergePrefix(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Header Suffix</label>
                <input
                  value={mergeSuffix}
                  onChange={(e) => setMergeSuffix(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>

              <label className="flex items-center gap-2 mt-8">
                <input
                  type="checkbox"
                  checked={mergeRemoveDuplicates}
                  onChange={() => setMergeRemoveDuplicates(!mergeRemoveDuplicates)}
                />
                Remove duplicate sequences
              </label>
            </div>

            <div className="p-6 space-y-4 border-b border-gray-200">
              {mergeInputs.map((value, i) => (
                <div key={i} className="relative rounded-xl border border-gray-200">
                  

                  <SequenceInput
                    value={value}
                    onChange={(val) => updateMergeInput(i, val)}
                    label={`FASTA Input ${i + 1}`}
                    // onLoadExample={loadExample}
                  />

                      <div className="absolute right-3 top-3 z-10 flex gap-2">
                          {mergeInputs.length > 1 && (
                              <button
                                  onClick={() => removeMergeInput(i)}
                                  className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs border border-red-200 hover:bg-red-100"
                              >
                                  <span className="inline-flex items-center gap-1">
                                      <Trash2 className="w-3 h-3" />
                                      Remove
                                  </span>
                              </button>
                          )}
                      </div>



                </div>
              ))}

              <button
                onClick={() => setMergeInputs([...mergeInputs, ""])}
                className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add another FASTA input
              </button>
            </div>

            <div className="border-t border-gray-200">
              <SequenceOutput
                value={output}
                title="Merged FASTA"
                onCopy={handleCopy}
                onDownload={handleDownload}
              />
            </div>
          </>
        )}

        <div className="p-6 border-t border-gray-200 bg-white flex flex-wrap gap-4">
          <button
            onClick={runActiveTool}
            className="flex-1 min-w-[220px] py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Run FASTA Toolkit
          </button>

          <button
            onClick={loadExample}
            className="px-6 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200"
          >
            Load Example
          </button>

          <button
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>

          <button
            onClick={handleDownload}
            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        {statsPreview && activeTab !== "merge" && (
          <div className="p-6 border-t bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">FASTA Overview</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Sequences</p>
                <p className="text-2xl font-bold text-blue-600">{statsPreview.totalSequences}</p>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Total Residues</p>
                <p className="text-2xl font-bold text-purple-600">{statsPreview.totalLength}</p>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Mean Length</p>
                <p className="text-2xl font-bold text-green-600">{statsPreview.meanLength.toFixed(1)}</p>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Dataset GC%</p>
                <p className="text-2xl font-bold text-amber-600">{statsPreview.gc.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {report && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold mb-2">Toolkit Report</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{report}</pre>
            {sampleSeedInfo && activeTab === "sortSample" && (
              <p className="text-xs text-gray-500 mt-2">{sampleSeedInfo}</p>
            )}
          </div>
        )}

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}