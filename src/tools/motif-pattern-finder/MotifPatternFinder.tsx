import { Link } from "react-router-dom"
import { useMemo, useRef, useState } from "react"
import { RefreshCw, AlertCircle, ChevronRight } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

type SearchMode = "exact" | "iupac" | "regex"
type SequenceType = "dna" | "rna" | "protein"

type ParsedRecord = {
  header: string
  sequence: string
}

type MotifHit = {
  sequenceName: string
  strand: "+" | "-"
  start: number
  end: number
  match: string
}

const IUPAC_DNA: Record<string, string> = {
  A: "A",
  C: "C",
  G: "G",
  T: "T",
  U: "U",
  R: "[AG]",
  Y: "[CTU]",
  S: "[GC]",
  W: "[ATU]",
  K: "[GTU]",
  M: "[AC]",
  B: "[CGTU]",
  D: "[AGTU]",
  H: "[ACTU]",
  V: "[ACG]",
  N: "[ACGTU]"
}

function cleanSequence(seq: string, type: SequenceType) {
  const upper = seq.replace(/\s/g, "").toUpperCase()
  if (type === "dna") return upper.replace(/U/g, "T")
  if (type === "rna") return upper.replace(/T/g, "U")
  return upper
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

function reverseComplement(seq: string, type: SequenceType) {
  if (type === "protein") return seq

  const dnaComp: Record<string, string> = {
    A: "T",
    T: "A",
    G: "C",
    C: "G",
    R: "Y",
    Y: "R",
    S: "S",
    W: "W",
    K: "M",
    M: "K",
    B: "V",
    V: "B",
    D: "H",
    H: "D",
    N: "N"
  }

  const rnaComp: Record<string, string> = {
    A: "U",
    U: "A",
    G: "C",
    C: "G",
    R: "Y",
    Y: "R",
    S: "S",
    W: "W",
    K: "M",
    M: "K",
    B: "V",
    V: "B",
    D: "H",
    H: "D",
    N: "N"
  }

  const comp = type === "dna" ? dnaComp : rnaComp

  return seq
    .split("")
    .reverse()
    .map((b) => comp[b] || "N")
    .join("")
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function motifToRegex(motif: string, mode: SearchMode, type: SequenceType) {
  const normalized = cleanSequence(motif, type)

  if (mode === "exact") {
    return escapeRegex(normalized)
  }

  if (mode === "iupac") {
    return normalized
      .split("")
      .map((c) => {
        if (type === "protein") return escapeRegex(c)
        return IUPAC_DNA[c] || escapeRegex(c)
      })
      .join("")
  }

  return normalized
}

function findMatches(
  seq: string,
  regexPattern: string,
  allowOverlap: boolean
): { start: number; end: number; match: string }[] {
  const results: { start: number; end: number; match: string }[] = []
  const regex = new RegExp(regexPattern, "g")

  let match: RegExpExecArray | null
  while ((match = regex.exec(seq)) !== null) {
    const start = match.index + 1
    const end = match.index + match[0].length
    results.push({
      start,
      end,
      match: match[0]
    })

    if (allowOverlap) {
      regex.lastIndex = match.index + 1
    }

    if (match[0].length === 0) {
      regex.lastIndex++
    }
  }

  return results
}

function highlightSequence(seq: string, hits: { start: number; end: number }[]) {
  if (hits.length === 0) return [{ text: seq, hit: false }]

  const sorted = [...hits].sort((a, b) => a.start - b.start)
  const chunks: { text: string; hit: boolean }[] = []
  let cursor = 1

  for (const hit of sorted) {
    if (hit.start > cursor) {
      chunks.push({
        text: seq.slice(cursor - 1, hit.start - 1),
        hit: false
      })
    }

    chunks.push({
      text: seq.slice(hit.start - 1, hit.end),
      hit: true
    })

    cursor = hit.end + 1
  }

  if (cursor <= seq.length) {
    chunks.push({
      text: seq.slice(cursor - 1),
      hit: false
    })
  }

  return chunks
}

export default function MotifPatternFinder() {
  const [sequenceInput, setSequenceInput] = useState("")
  const [motif, setMotif] = useState("")
  const [mode, setMode] = useState<SearchMode>("exact")
  const [sequenceType, setSequenceType] = useState<SequenceType>("dna")
  const [allowOverlap, setAllowOverlap] = useState(true)
  const [searchReverse, setSearchReverse] = useState(true)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [error, setError] = useState("")

  const [records, setRecords] = useState<ParsedRecord[]>([])
  const [hits, setHits] = useState<MotifHit[]>([])

  const plotRef = useRef<SVGSVGElement | null>(null)

  const hitCountsBySequence = useMemo(() => {
    const counts: Record<string, number> = {}
    hits.forEach((h) => {
      counts[h.sequenceName] = (counts[h.sequenceName] || 0) + 1
    })
    return counts
  }, [hits])

  const totalLength = useMemo(
    () => records.reduce((sum, r) => sum + r.sequence.length, 0),
    [records]
  )

  const selectedRecord = records[0] || null
  const selectedRecordHits = useMemo(() => {
    if (!selectedRecord) return []
    return hits
      .filter((h) => h.sequenceName === selectedRecord.header && h.strand === "+")
      .map((h) => ({ start: h.start, end: h.end }))
  }, [hits, selectedRecord])

  const highlightedSequence = useMemo(() => {
    if (!selectedRecord) return []
    return highlightSequence(selectedRecord.sequence, selectedRecordHits)
  }, [selectedRecord, selectedRecordHits])

  const densityData = useMemo(() => {
    if (!selectedRecord) return []
    const seq = selectedRecord.sequence
    const bins = 20
    const binSize = Math.max(1, Math.ceil(seq.length / bins))
    const arr = Array.from({ length: bins }, (_, i) => ({
      bin: i + 1,
      start: i * binSize + 1,
      end: Math.min((i + 1) * binSize, seq.length),
      count: 0
    }))

    hits
      .filter((h) => h.sequenceName === selectedRecord.header)
      .forEach((h) => {
        const idx = Math.min(bins - 1, Math.floor((h.start - 1) / binSize))
        arr[idx].count += 1
      })

    return arr
  }, [hits, selectedRecord])

  const analyze = () => {
    setError("")
    setAnalysisComplete(false)
    setHits([])

    if (!sequenceInput.trim()) {
      setError("Please enter one or more sequences")
      return
    }

    if (!motif.trim()) {
      setError("Please enter a motif or pattern")
      return
    }

    const parsed = parseMultiFasta(sequenceInput, sequenceType)

    if (parsed.length === 0) {
      setError("No valid sequence data detected")
      return
    }

    const regexPattern = motifToRegex(motif, mode, sequenceType)

    try {
      new RegExp(regexPattern)
    } catch {
      setError("Invalid motif or regular expression")
      return
    }

    const results: MotifHit[] = []

    for (const record of parsed) {
      const forwardHits = findMatches(record.sequence, regexPattern, allowOverlap)
      forwardHits.forEach((h) => {
        results.push({
          sequenceName: record.header,
          strand: "+",
          start: h.start,
          end: h.end,
          match: h.match
        })
      })

      if (searchReverse && sequenceType !== "protein") {
        const rc = reverseComplement(record.sequence, sequenceType)
        const reverseHits = findMatches(rc, regexPattern, allowOverlap)

        reverseHits.forEach((h) => {
          const originalStart = record.sequence.length - h.end + 1
          const originalEnd = record.sequence.length - h.start + 1
          results.push({
            sequenceName: record.header,
            strand: "-",
            start: originalStart,
            end: originalEnd,
            match: h.match
          })
        })
      }
    }

    results.sort((a, b) => {
      if (a.sequenceName !== b.sequenceName) {
        return a.sequenceName.localeCompare(b.sequenceName)
      }
      if (a.start !== b.start) return a.start - b.start
      return a.strand.localeCompare(b.strand)
    })

    setRecords(parsed)
    setHits(results)
    setAnalysisComplete(true)
  }

  const handleCopy = async () => {
    const text = [
      "sequence\tstrand\tstart\tend\tmatch",
      ...hits.map(
        (h) => `${h.sequenceName}\t${h.strand}\t${h.start}\t${h.end}\t${h.match}`
      )
    ].join("\n")

    await navigator.clipboard.writeText(text)
  }

  const handleDownload = () => {
    const text = [
      "sequence\tstrand\tstart\tend\tmatch",
      ...hits.map(
        (h) => `${h.sequenceName}\t${h.strand}\t${h.start}\t${h.end}\t${h.match}`
      )
    ].join("\n")

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "motif_hits.tsv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setSequenceInput(`>seq1
ATGGCTTATAAGGCTGCTTATAGCGGCTTATAA
>seq2
ATGGCGCGCTATAAGCTTAGCGCTATAAGCTA`)
    setMotif("TATAA")
    setMode("exact")
    setSequenceType("dna")
    setAllowOverlap(true)
    setSearchReverse(true)
  }

  const clearAll = () => {
    setSequenceInput("")
    setMotif("")
    setHits([])
    setRecords([])
    setError("")
    setAnalysisComplete(false)
    setMode("exact")
    setSequenceType("dna")
    setAllowOverlap(true)
    setSearchReverse(true)
  }

  const downloadDensitySVG = () => {
    if (!plotRef.current) return

    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(plotRef.current)
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "motif_density_plot.svg"
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      badge="Sequence Analysis"
      slug="motif-pattern-finder"
      category="Sequence Analysis"

      seoContent={
        <>
          <h2>Motif and Pattern Finder for DNA, RNA, and Protein Sequences</h2>

          <p>
            Motif discovery and pattern searching are essential tasks in
            bioinformatics and molecular biology. Biological sequences such as
            DNA, RNA, and proteins often contain short conserved patterns,
            known as motifs, that correspond to regulatory elements,
            transcription factor binding sites, catalytic residues, or
            structural features. Identifying these motifs can provide valuable
            insights into gene regulation, protein function, and evolutionary
            conservation.
          </p>

          <p>
            This motif and pattern finder allows researchers to search
            biological sequences for specific motifs using several flexible
            matching strategies. You can perform exact motif searches, use
            IUPAC degenerate nucleotide codes to represent variable bases, or
            apply full regular expression patterns for advanced sequence
            queries. The tool supports DNA, RNA, and protein sequences and can
            analyze both single sequences and multi-FASTA datasets.
          </p>

          <p>
            Additional capabilities include detection of overlapping motif
            occurrences and optional searching of the reverse complement
            strand for nucleic acid sequences. These options allow the tool to
            detect motif matches on either DNA strand and capture complex
            sequence patterns that may appear multiple times within a region.
            Sequence composition surrounding motifs can also be examined using
            the{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
            or explored with the{" "}
            <Link to="/tools/kmer-counter">k-mer Counter</Link>.
          </p>

          <p>
            Results include detailed motif hit tables with positional
            coordinates, strand orientation, and summary visualizations such
            as motif density plots and highlighted sequence views. All motif
            searches run directly in your browser, ensuring that biological
            sequence data remains private and is never uploaded to external
            servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste DNA, RNA, or protein sequences into the input panel.</li>
          <li>Enter the motif or pattern you want to search for.</li>
          <li>Select a search mode: exact match, IUPAC motif, or regex pattern.</li>
          <li>Choose the sequence type (DNA, RNA, or protein).</li>
          <li>Enable overlapping matches or reverse complement search if needed.</li>
          <li>Click <strong>Find Motifs</strong> to analyze the sequences.</li>
          <li>Review motif hits, density plots, and highlighted sequence results.</li>
        </ol>
      }

      faq={[
        {
          question: "What is a motif in biological sequences?",
          answer:
            "A motif is a short recurring sequence pattern found in DNA, RNA, or proteins that is often associated with biological functions such as transcription factor binding or enzymatic activity."
        },
        {
          question: "What are IUPAC degenerate motifs?",
          answer:
            "IUPAC nucleotide codes allow ambiguous bases to represent multiple possible nucleotides. For example, R represents A or G, and N represents any nucleotide."
        },
        {
          question: "Can this tool search protein sequences?",
          answer:
            "Yes. The motif finder supports protein sequence pattern searches using exact motifs or regular expression patterns."
        },
        {
          question: "What does searching the reverse complement mean?",
          answer:
            "DNA is double stranded, so motifs may occur on the reverse complement strand. This option searches both strands to identify all possible motif occurrences."
        },
        {
          question: "Are my sequences uploaded anywhere?",
          answer:
            "No. All motif searches and pattern analysis run locally in your browser, ensuring that sequence data remains private."
        }
      ]}
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Motif / Pattern
            </label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="e.g. TATAA, N{P}[ST]{P}, ATG..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Search Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as SearchMode)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="exact">Exact Match</option>
              <option value="iupac">IUPAC / Degenerate</option>
              <option value="regex">Regex Pattern</option>
            </select>
          </div>

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
              <option value="protein">Protein</option>
            </select>
          </div>

          <div className="md:col-span-3 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={allowOverlap}
                onChange={() => setAllowOverlap(!allowOverlap)}
              />
              Allow overlapping matches
            </label>

            {sequenceType !== "protein" && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={searchReverse}
                  onChange={() => setSearchReverse(!searchReverse)}
                />
                Search reverse complement
              </label>
            )}
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
              <h2 className="font-semibold text-lg">Motif Hits</h2>

              <div className="flex gap-2">
                <button
                  aria-label="Copy complete analysis 1"
                  onClick={handleCopy}
                  disabled={!analysisComplete || hits.length === 0}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Copy
                </button>

                <button
                  aria-label="Download complete analysis 1"
                  onClick={handleDownload}
                  disabled={!analysisComplete || hits.length === 0}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {!analysisComplete ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Motif search results will appear here...
                </div>
              ) : hits.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No matches found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 border-b bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700">
                    <div>Seq</div>
                    <div>Strand</div>
                    <div>Start</div>
                    <div>End</div>
                    <div>Match</div>
                  </div>

                  {hits.map((h, idx) => (
                    <div
                      key={`${h.sequenceName}-${h.start}-${h.strand}-${idx}`}
                      className="grid grid-cols-5 px-4 py-2 text-sm border-b last:border-b-0"
                    >
                      <div className="truncate" title={h.sequenceName}>
                        {h.sequenceName}
                      </div>
                      <div>{h.strand}</div>
                      <div>{h.start}</div>
                      <div>{h.end}</div>
                      <div className="font-mono">{h.match}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
            aria-label="Find Motifs 1"
            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Find Motifs
          </button>

          <button
            aria-label="Clear Find Motifs 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>

        {analysisComplete && (
          <>
            <div className="px-6 pt-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Analysis Results
              </h2>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Sequences</div>
                <div className="text-2xl font-bold text-blue-600">
                  {records.length}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Total Length</div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalLength}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Total Hits</div>
                <div className="text-2xl font-bold text-blue-600">
                  {hits.length}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Motif</div>
                <div className="text-lg font-bold text-blue-600 break-all">
                  {motif}
                </div>
              </div>
            </div>

            {selectedRecord && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Motif Density Plot</h3>
                  <button
                    aria-label="Download SVG Find Motifs 1"
                    onClick={downloadDensitySVG}
                    className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                  >
                    Download SVG
                  </button>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 overflow-x-auto">
                  <svg ref={plotRef} width="900" height="240" viewBox="0 0 900 240">
                    <line x1="50" y1="200" x2="860" y2="200" stroke="#94a3b8" />
                    <line x1="50" y1="20" x2="50" y2="200" stroke="#94a3b8" />

                    {densityData.map((d, i) => {
                      const barWidth = 800 / densityData.length - 4
                      const x = 55 + i * (800 / densityData.length)
                      const maxCount = Math.max(...densityData.map((x) => x.count), 1)
                      const h = (d.count / maxCount) * 160
                      return (
                        <g key={i}>
                          <rect
                            x={x}
                            y={200 - h}
                            width={barWidth}
                            height={h}
                            fill="#6366f1"
                          />
                          <title>
                            {`${d.start}-${d.end} bp: ${d.count} hits`}
                          </title>
                        </g>
                      )
                    })}

                    <text x="455" y="230" textAnchor="middle" fontSize="12" fill="#475569">
                      Sequence Position
                    </text>

                    <text
                      x="15"
                      y="110"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#475569"
                      transform="rotate(-90 15 110)"
                    >
                      Hits
                    </text>
                  </svg>
                </div>
              </div>
            )}

            {selectedRecord && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                    Highlighted Sequence View
                    <ChevronRight className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-90" />
                  </summary>

                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm break-all leading-7">
                    {highlightedSequence.length === 0 ? (
                      <span className="text-gray-500">No matches to highlight</span>
                    ) : (
                      highlightedSequence.map((chunk, idx) => (
                        <span
                          key={idx}
                          className={
                            chunk.hit
                              ? "bg-yellow-200 text-slate-900 px-0.5 rounded"
                              : ""
                          }
                        >
                          {chunk.text}
                        </span>
                      ))
                    )}
                  </div>
                </details>
              </div>
            )}

            {Object.keys(hitCountsBySequence).length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                    Per-Sequence Hit Summary
                    <ChevronRight className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-90" />
                  </summary>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {Object.entries(hitCountsBySequence).map(([name, count]) => (
                      <div
                        key={name}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="text-sm text-gray-500 truncate" title={name}>
                          {name}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mt-2">
                          {count}
                        </div>
                        <div className="text-sm text-gray-500">hits</div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
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