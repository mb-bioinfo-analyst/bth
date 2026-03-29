import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    RefreshCw,
    AlertCircle,
    ChevronRight,
    Download,
    Copy, Dna, Activity, HelpCircle
} from "lucide-react"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line
} from "recharts"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

type ActiveTab = "overview" | "composition" | "entropy" | "advanced"
type SortMode = "alphabetical" | "lengthAsc" | "lengthDesc" | "gcAsc" | "gcDesc"
type SequenceKind = "DNA" | "RNA" | "Protein" | "Mixed/Unknown"

type RecordType = {
    header: string
    seq: string
    type: SequenceKind
}

type SequenceRow = {
    header: string
    seq: string
    type: SequenceKind
    length: number
    gc: number
    at: number
    entropy: number
    complexity: number
    counts: Record<string, number>
}

const DNA_BASES = ["A", "T", "G", "C", "N"]
const RNA_BASES = ["A", "U", "G", "C", "N"]
const PROTEIN_BASES = [
    "A", "R", "N", "D", "C", "Q", "E", "G", "H", "I",
    "L", "K", "M", "F", "P", "S", "T", "W", "Y", "V", "X", "*"
]

const CHART_COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"]

function cleanSequence(seq: string) {
    return seq.replace(/\s/g, "").toUpperCase()
}

function parseFasta(text: string): { header: string; seq: string }[] {
    const trimmed = text.trim()
    if (!trimmed) return []

    if (!trimmed.startsWith(">")) {
        return [{ header: "sequence_1", seq: cleanSequence(trimmed) }]
    }

    return trimmed
        .split(/^>/m)
        .filter(Boolean)
        .map((entry, i) => {
            const lines = entry.split(/\r?\n/)
            return {
                header: lines[0]?.trim() || `sequence_${i + 1}`,
                seq: cleanSequence(lines.slice(1).join(""))
            }
        })
        .filter((r) => r.seq.length > 0)
}

function detectSequenceType(seq: string): SequenceKind {
    if (!seq) return "Mixed/Unknown"

    const dna = /^[ACGTN]+$/i
    const rna = /^[ACGUN]+$/i
    const protein = /^[ARNDCQEGHILKMFPSTWYVBZX*]+$/i

    if (dna.test(seq)) return "DNA"
    if (rna.test(seq)) return "RNA"

    if (protein.test(seq) && /[EFILPQZ*]/i.test(seq)) return "Protein"

    const hasU = /U/i.test(seq)
    const hasT = /T/i.test(seq)

    if (hasU && !hasT) return "RNA"
    if (hasT && !hasU && /^[ACGTNRYSWKMBDHV]+$/i.test(seq)) return "DNA"
    if (protein.test(seq)) return "Protein"

    return "Mixed/Unknown"
}

function countCharacters(seq: string): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const c of seq) counts[c] = (counts[c] || 0) + 1
    return counts
}

function gcPercent(seq: string) {
    if (!seq.length) return 0
    const g = (seq.match(/G/g) || []).length
    const c = (seq.match(/C/g) || []).length
    return ((g + c) / seq.length) * 100
}

function atPercent(seq: string, type: SequenceKind) {
    if (!seq.length) return 0
    if (type === "DNA") {
        const a = (seq.match(/A/g) || []).length
        const t = (seq.match(/T/g) || []).length
        return ((a + t) / seq.length) * 100
    }
    if (type === "RNA") {
        const a = (seq.match(/A/g) || []).length
        const u = (seq.match(/U/g) || []).length
        return ((a + u) / seq.length) * 100
    }
    return 0
}

function shannonEntropy(seq: string) {
    if (!seq.length) return 0
    const counts = countCharacters(seq)
    let H = 0
    Object.values(counts).forEach((count) => {
        const p = count / seq.length
        H -= p * Math.log2(p)
    })
    return H
}

function normalizedComplexity(seq: string) {
    if (!seq.length) return 0
    const counts = countCharacters(seq)
    const alphabetSize = Object.keys(counts).length
    if (alphabetSize <= 1) return 0
    const maxEntropy = Math.log2(alphabetSize)
    if (!maxEntropy) return 0
    return shannonEntropy(seq) / maxEntropy
}

function dustScore(seq: string) {
    if (seq.length < 3) return 0
    const triplets: Record<string, number> = {}
    for (let i = 0; i <= seq.length - 3; i++) {
        const tri = seq.slice(i, i + 3)
        triplets[tri] = (triplets[tri] || 0) + 1
    }
    const vals = Object.values(triplets)
    const total = vals.reduce((a, b) => a + b, 0)
    if (!total) return 0
    const sumSquares = vals.reduce((a, b) => a + b * b, 0)
    return sumSquares / total
}

function linguisticComplexity(seq: string) {
    if (!seq.length) return 0
    const seen = new Set<string>()
    for (let i = 0; i < seq.length; i++) {
        for (let j = i + 1; j <= seq.length; j++) {
            seen.add(seq.slice(i, j))
        }
    }
    const max = (seq.length * (seq.length + 1)) / 2
    return max ? seen.size / max : 0
}

function gcSkew(seq: string) {
    const g = (seq.match(/G/g) || []).length
    const c = (seq.match(/C/g) || []).length
    if (g + c === 0) return 0
    return (g - c) / (g + c)
}

function reverseComplement(seq: string) {
    const map: Record<string, string> = {
        A: "T", T: "A", G: "C", C: "G",
        U: "A", N: "N", R: "Y", Y: "R",
        S: "S", W: "W", K: "M", M: "K",
        B: "V", D: "H", H: "D", V: "B"
    }
    return seq
        .split("")
        .reverse()
        .map((c) => map[c] || c)
        .join("")
}

function findMotifPositions(seq: string, pattern: string) {
    if (!pattern.trim()) return []
    try {
        const regex = new RegExp(pattern, "g")
        const hits: number[] = []
        let match: RegExpExecArray | null
        while ((match = regex.exec(seq)) !== null) {
            hits.push(match.index)
            if (regex.lastIndex === match.index) regex.lastIndex++
        }
        return hits
    } catch {
        return []
    }
}

function findSimpleRepeats(seq: string, minRepeats = 3) {
    const repeats: { motif: string; count: number; start: number }[] = []
    for (let motifSize = 1; motifSize <= 6; motifSize++) {
        for (let i = 0; i <= seq.length - motifSize * minRepeats; i++) {
            const motif = seq.slice(i, i + motifSize)
            let count = 1
            while (seq.slice(i + count * motifSize, i + (count + 1) * motifSize) === motif) {
                count++
            }
            if (count >= minRepeats) {
                repeats.push({ motif, count, start: i })
            }
        }
    }
    const uniq = new Map<string, { motif: string; count: number; start: number }>()
    repeats.forEach((r) => {
        const key = `${r.motif}_${r.start}_${r.count}`
        if (!uniq.has(key)) uniq.set(key, r)
    })
    return Array.from(uniq.values()).slice(0, 50)
}

function kmerFrequencies(seq: string, k: number) {
    const counts: Record<string, number> = {}
    if (k <= 0 || seq.length < k) return []

    for (let i = 0; i <= seq.length - k; i++) {
        const kmer = seq.slice(i, i + k)
        counts[kmer] = (counts[kmer] || 0) + 1
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    return Object.entries(counts)
        .map(([kmer, count]) => ({
            kmer,
            count,
            normalized: total ? count / total : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
}

function slidingWindowEntropy(seq: string, windowSize: number, stepSize: number) {
    const out: { position: number; entropy: number; lowComplexity: number }[] = []
    if (seq.length < windowSize || windowSize <= 0 || stepSize <= 0) return out

    for (let start = 0; start <= seq.length - windowSize; start += stepSize) {
        const window = seq.slice(start, start + windowSize)
        const H = shannonEntropy(window)
        const complexity = normalizedComplexity(window)
        out.push({
            position: start + Math.floor(windowSize / 2),
            entropy: Number(H.toFixed(4)),
            lowComplexity: Number((1 - complexity).toFixed(4))
        })
    }

    return out
}

function datasetSummary(rows: SequenceRow[]) {
    if (!rows.length) return null

    const lengths = rows.map((r) => r.length).sort((a, b) => a - b)
    const gcs = rows.map((r) => r.gc).sort((a, b) => a - b)

    const total = lengths.reduce((a, b) => a + b, 0)
    const min = lengths[0]
    const max = lengths[lengths.length - 1]
    const mean = total / lengths.length
    const medianGC =
        gcs.length % 2 === 0
            ? (gcs[gcs.length / 2 - 1] + gcs[gcs.length / 2]) / 2
            : gcs[Math.floor(gcs.length / 2)]

    const descLengths = [...lengths].sort((a, b) => b - a)
    let cumulative = 0
    let N50 = 0
    for (const len of descLengths) {
        cumulative += len
        if (cumulative >= total / 2) {
            N50 = len
            break
        }
    }

    return { min, max, mean, medianGC, N50 }
}

function lengthHistogram(lengths: number[], bins = 8) {
    if (!lengths.length) return []
    const min = Math.min(...lengths)
    const max = Math.max(...lengths)

    if (min === max) {
        return [{ range: `${min}-${max}`, count: lengths.length }]
    }

    const size = (max - min) / bins
    const hist = Array.from({ length: bins }, (_, i) => ({
        min: min + i * size,
        max: i === bins - 1 ? max : min + (i + 1) * size,
        count: 0
    }))

    lengths.forEach((len) => {
        const idx = Math.min(Math.floor((len - min) / size), bins - 1)
        hist[idx].count++
    })

    return hist.map((h) => ({
        range: `${Math.round(h.min)}-${Math.round(h.max)}`,
        count: h.count
    }))
}

function needlemanWunschScore(seq1: string, seq2: string) {
    const match = 1
    const mismatch = -1
    const gap = -1

    const m = seq1.length
    const n = seq2.length
    if (!m || !n) return 0

    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i * gap
    for (let j = 0; j <= n; j++) dp[0][j] = j * gap

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const diag = dp[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? match : mismatch)
            const up = dp[i - 1][j] + gap
            const left = dp[i][j - 1] + gap
            dp[i][j] = Math.max(diag, up, left)
        }
    }

    return dp[m][n]
}

function formatValue(value: string | number) {
    if (typeof value !== "string") return value
    if (!value.includes("/")) return value

    return value.split("/").map((part, i, arr) => (
        <span key={i}>
            {part}
            {i < arr.length - 1 && <><wbr />/</>}
        </span>
    ))
}

// function getValueStyle(value: string | number) {
//   const v = String(value).toLowerCase()

//   if (v.includes("dna")) {
//     return { color: "text-blue-600", icon: "🧬" }
//   }
//   if (v.includes("rna")) {
//     return { color: "text-purple-600", icon: "🧪" }
//   }
//   if (v.includes("protein")) {
//     return { color: "text-amber-600", icon: "🧫" }
//   }
//   if (v.includes("mixed")) {
//     return { color: "text-gray-600", icon: "❔" }
//   }
//   return { color: "text-blue-600", icon: null }
// }

function getValueStyle(value: string | number) {

    const v = String(value).toLowerCase()

    if (v.includes("dna")) {
        return {
            color: "text-blue-600",
            icon: <Dna className="w-4 h-4" />
        }
    }

    if (v.includes("rna")) {
        return {
            color: "text-purple-600",
            icon: <Activity className="w-4 h-4" />
        }
    }

    if (v.includes("protein")) {
        return {
            color: "text-orange-600",
            icon: <Activity className="w-4 h-4" />
        }
    }

    if (v.includes("mixed")) {
        return {
            color: "text-gray-600",
            //   icon: <HelpCircle className="w-2 h-2" />
        }
    }

    return {
        color: "text-blue-600",
        icon: null
    }
}

function StatCard({
    label,
    value,
    accent = "text-blue-600"
}: {
    label: string
    value: string | number
    accent?: string
}) {
    const { color, icon } = getValueStyle(value)

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center flex flex-col justify-center min-h-[100px]">
            <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>

            <div className="flex items-start justify-center gap-2 mt-2">
                {icon && <span className={`${color} mt-1 shrink-0`}>{icon}</span>}

                <p
                    className={`text-base sm:text-lg font-bold ${color || accent} leading-snug text-center break-words`}
                    title={String(value)}
                >
                    {formatValue(String(value))}
                </p>
            </div>
        </div>
    )
}

function needlemanWunsch(seq1: string, seq2: string) {

  const gap = -1
  const match = 1
  const mismatch = -1

  const m = seq1.length
  const n = seq2.length

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  // init
  for (let i = 0; i <= m; i++) dp[i][0] = i * gap
  for (let j = 0; j <= n; j++) dp[0][j] = j * gap

  // fill
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const scoreDiag =
        dp[i - 1][j - 1] +
        (seq1[i - 1] === seq2[j - 1] ? match : mismatch)

      const scoreUp = dp[i - 1][j] + gap
      const scoreLeft = dp[i][j - 1] + gap

      dp[i][j] = Math.max(scoreDiag, scoreUp, scoreLeft)
    }
  }

  // traceback
  let i = m
  let j = n
  let aligned1 = ""
  let aligned2 = ""

  while (i > 0 && j > 0) {
    const score = dp[i][j]
    const diag = dp[i - 1][j - 1]
    const up = dp[i - 1][j]
    const left = dp[i][j - 1]

    if (
      score === diag + (seq1[i - 1] === seq2[j - 1] ? match : mismatch)
    ) {
      aligned1 = seq1[i - 1] + aligned1
      aligned2 = seq2[j - 1] + aligned2
      i--
      j--
    } else if (score === up + gap) {
      aligned1 = seq1[i - 1] + aligned1
      aligned2 = "-" + aligned2
      i--
    } else {
      aligned1 = "-" + aligned1
      aligned2 = seq2[j - 1] + aligned2
      j--
    }
  }

  while (i > 0) {
    aligned1 = seq1[i - 1] + aligned1
    aligned2 = "-" + aligned2
    i--
  }

  while (j > 0) {
    aligned1 = "-" + aligned1
    aligned2 = seq2[j - 1] + aligned2
    j--
  }

  return {
    score: dp[m][n],
    aligned1,
    aligned2
  }
}

export default function SequenceStatistics() {
    const [input, setInput] = useState("")
    const [records, setRecords] = useState<RecordType[]>([])
    const [error, setError] = useState("")
    const [resultReady, setResultReady] = useState(false)
    const [activeTab, setActiveTab] = useState<ActiveTab>("overview")

    const [k, setK] = useState(3)
    const [windowSize, setWindowSize] = useState(30)
    const [stepSize, setStepSize] = useState(10)

    const [minLengthFilter, setMinLengthFilter] = useState("")
    const [maxLengthFilter, setMaxLengthFilter] = useState("")
    const [minGCFilter, setMinGCFilter] = useState("")
    const [maxGCFilter, setMaxGCFilter] = useState("")
    const [motifFilter, setMotifFilter] = useState("")
    const [sortMode, setSortMode] = useState<SortMode>("alphabetical")

    const [showReverseComplement, setShowReverseComplement] = useState(false)
    const [alignmentSeq1, setAlignmentSeq1] = useState("")
    const [alignmentSeq2, setAlignmentSeq2] = useState("")
    const [selectedSeq1, setSelectedSeq1] = useState(0)
    const [selectedSeq2, setSelectedSeq2] = useState(1)

    function safeNumber(value: string, fallback: number) {
        if (value.trim() === "") return fallback
        const n = Number(value)
        return Number.isNaN(n) ? fallback : n
    }

    function round3(num: number | null | undefined) {
        if (num === null || num === undefined || isNaN(num)) return "-"
        return Number(num).toFixed(3)
        }
    
    function handleMinLengthChange(val: string) {
        if (!bounds) return

        const num = Number(val)
        if (isNaN(num)) {
            setMinLengthFilter(val)
            return
        }

        // prevent crossing max
        if (num > Number(maxLengthFilter)) {
            setMinLengthFilter(maxLengthFilter)
        } else {
            setMinLengthFilter(val)
        }
    }

    function handleMaxLengthChange(val: string) {
        if (!bounds) return

        const num = Number(val)
        if (isNaN(num)) {
            setMaxLengthFilter(val)
            return
        }

        // prevent going below min
        if (num < Number(minLengthFilter)) {
            setMaxLengthFilter(minLengthFilter)
        } else {
            setMaxLengthFilter(val)
        }
    }

    function handleMinGCChange(val: string) {
        const num = Number(val)
        if (isNaN(num)) {
            setMinGCFilter(val)
            return
        }

        if (num > Number(maxGCFilter)) {
            setMinGCFilter(maxGCFilter)
        } else {
            setMinGCFilter(val)
        }
    }

    function handleMaxGCChange(val: string) {
        const num = Number(val)
        if (isNaN(num)) {
            setMaxGCFilter(val)
            return
        }

        if (num < Number(minGCFilter)) {
            setMaxGCFilter(minGCFilter)
        } else {
            setMaxGCFilter(val)
        }
    }

    function analyze() {
        setError("")
        setResultReady(false)

        if (!input.trim()) {
            setError("Please enter FASTA or sequence data")
            return
        }

        const parsed = parseFasta(input)
        if (!parsed.length) {
            setError("No valid sequences detected")
            return
        }

        const typed = parsed.map((r) => ({
            ...r,
            type: detectSequenceType(r.seq)
        }))

        setRecords(typed)
        setResultReady(true)
        setActiveTab("overview")
    }

    const allRows = useMemo<SequenceRow[]>(() => {
        return records.map((r) => ({
            header: r.header,
            seq: r.seq,
            type: r.type,
            length: r.seq.length,
            gc: gcPercent(r.seq),
            at: atPercent(r.seq, r.type),
            entropy: shannonEntropy(r.seq),
            complexity: normalizedComplexity(r.seq),
            counts: countCharacters(r.seq)
        }))
    }, [records])

    const bounds = useMemo(() => {
        if (!allRows.length) return null

        const lengths = allRows.map((r) => r.length)
        const gcs = allRows.map((r) => r.gc)

        return {
            minLength: Math.min(...lengths),
            maxLength: Math.max(...lengths),
            minGC: Math.min(...gcs),
            maxGC: Math.max(...gcs)
        }
    }, [allRows])

    useEffect(() => {
        if (!bounds || !resultReady) return

        setMinLengthFilter(String(bounds.minLength))
        setMaxLengthFilter(String(bounds.maxLength))
        setMinGCFilter(bounds.minGC.toFixed(2))
        setMaxGCFilter(bounds.maxGC.toFixed(2))
    }, [bounds, resultReady])

    const filteredRows = useMemo(() => {
        let rows = [...allRows]

        if (!bounds) return rows

        const minLen = safeNumber(minLengthFilter, bounds.minLength)
        const maxLen = safeNumber(maxLengthFilter, bounds.maxLength)
        const minGc = safeNumber(minGCFilter, bounds.minGC)
        const maxGc = safeNumber(maxGCFilter, bounds.maxGC)

        // If user temporarily types an invalid range, return [] gracefully
        if (minLen > maxLen || minGc > maxGc) {
            return []
        }

        rows = rows.filter((r) => {
            if (r.length < minLen) return false
            if (r.length > maxLen) return false
            if (r.gc < minGc) return false
            if (r.gc > maxGc) return false

            if (motifFilter.trim()) {
                try {
                    const re = new RegExp(motifFilter, "i")
                    if (!re.test(r.seq)) return false
                } catch {
                    return false
                }
            }

            return true
        })

        rows.sort((a, b) => {
            if (sortMode === "alphabetical") return a.header.localeCompare(b.header)
            if (sortMode === "lengthAsc") return a.length - b.length
            if (sortMode === "lengthDesc") return b.length - a.length
            if (sortMode === "gcAsc") return a.gc - b.gc
            return b.gc - a.gc
        })

        return rows
    }, [
        allRows,
        bounds,
        minLengthFilter,
        maxLengthFilter,
        minGCFilter,
        maxGCFilter,
        motifFilter,
        sortMode
    ])

    const global = useMemo(() => {
        if (!filteredRows.length) return null

        const combined = filteredRows.map((r) => r.seq).join("")
        const counts = countCharacters(combined)
        const type = detectSequenceType(combined)

        return {
            totalSequences: filteredRows.length,
            totalLength: combined.length,
            gc: gcPercent(combined),
            at: atPercent(combined, type),
            entropy: shannonEntropy(combined),
            complexity: normalizedComplexity(combined),
            dust: dustScore(combined),
            linguistic: linguisticComplexity(combined),
            gcSkew: gcSkew(combined),
            counts,
            type
        }
    }, [filteredRows])

    const summary = useMemo(() => datasetSummary(filteredRows), [filteredRows])

    const compositionData = useMemo(() => {
        if (!global) return []

        let bases = DNA_BASES
        if (global.type === "RNA") bases = RNA_BASES
        if (global.type === "Protein") bases = PROTEIN_BASES

        return bases
            .map((base) => ({
                base,
                count: global.counts[base] || 0,
                percent: global.totalLength
                    ? ((global.counts[base] || 0) / global.totalLength) * 100
                    : 0
            }))
            .filter((x) => x.count > 0)
    }, [global])

    const stackedPerSequenceData = useMemo(() => {
        return filteredRows.map((r) => {
            const counts = r.counts
            return {
                name: r.header.length > 16 ? `${r.header.slice(0, 16)}…` : r.header,
                A: counts.A || 0,
                T: counts.T || 0,
                U: counts.U || 0,
                G: counts.G || 0,
                C: counts.C || 0,
                N: counts.N || 0
            }
        })
    }, [filteredRows])

    const lengthHistData = useMemo(() => {
        return lengthHistogram(filteredRows.map((r) => r.length), 8)
    }, [filteredRows])

    const entropySlidingData = useMemo(() => {
        if (!filteredRows.length) return []
        const seq = filteredRows.map((r) => r.seq).join("")
        return slidingWindowEntropy(seq, windowSize, stepSize)
    }, [filteredRows, windowSize, stepSize])

    const kmerData = useMemo(() => {
        if (!filteredRows.length) return []
        const seq = filteredRows.map((r) => r.seq).join("")
        return kmerFrequencies(seq, k)
    }, [filteredRows, k])

    const repeatData = useMemo(() => {
        if (!filteredRows.length) return []
        const seq = filteredRows.map((r) => r.seq).join("")
        return findSimpleRepeats(seq)
    }, [filteredRows])

    const motifHits = useMemo(() => {
        if (!motifFilter.trim()) return []
        return filteredRows.map((r) => ({
            header: r.header,
            hits: findMotifPositions(r.seq, motifFilter)
        }))
    }, [filteredRows, motifFilter])

    const reverseComplementPreview = useMemo(() => {
        if (!showReverseComplement) return []
        return filteredRows
            .filter((r) => r.type === "DNA" || r.type === "RNA")
            .slice(0, 10)
            .map((r) => ({
                header: r.header,
                original: r.seq,
                rc: reverseComplement(r.type === "RNA" ? r.seq.replace(/U/g, "T") : r.seq)
            }))
    }, [filteredRows, showReverseComplement])

    // const alignmentScore = useMemo(() => {
    //     if (!alignmentSeq1.trim() || !alignmentSeq2.trim()) return null
    //     return needlemanWunschScore(
    //         cleanSequence(alignmentSeq1),
    //         cleanSequence(alignmentSeq2)
    //     )
    // }, [alignmentSeq1, alignmentSeq2])

    const alignmentResult = useMemo(() => {
        if (records.length < 2) return null

        const seq1 = records[selectedSeq1]?.seq
        const seq2 = records[selectedSeq2]?.seq

        if (!seq1 || !seq2) return null

        return needlemanWunsch(
            cleanSequence(seq1),
            cleanSequence(seq2)
        )

        }, [records, selectedSeq1, selectedSeq2])

    const reportText = useMemo(() => {
        if (!global || !summary) return ""

        const header = [
            `Type\t${global.type}`,
            `Total sequences\t${global.totalSequences}`,
            `Total length\t${global.totalLength}`,
            `Min length\t${summary.min}`,
            `Max length\t${summary.max}`,
            `Mean length\t${summary.mean.toFixed(2)}`,
            `Median GC\t${summary.medianGC.toFixed(2)}`,
            `N50\t${summary.N50}`,
            `GC%\t${global.gc.toFixed(2)}`,
            `${global.type === "RNA" ? "AU%" : "AT%"}\t${global.at.toFixed(2)}`,
            `Entropy\t${global.entropy.toFixed(4)}`,
            `Complexity\t${global.complexity.toFixed(4)}`,
            `DUST\t${global.dust.toFixed(4)}`,
            `Linguistic complexity\t${global.linguistic.toFixed(4)}`,
            `GC skew\t${global.gcSkew.toFixed(4)}`,
            ""
        ].join("\n")

        const rows = filteredRows
            .map(
                (r) =>
                    `${r.header}\t${r.type}\t${r.length}\t${r.gc.toFixed(2)}\t${r.at.toFixed(2)}\t${r.entropy.toFixed(4)}\t${r.complexity.toFixed(4)}`
            )
            .join("\n")

        return `${header}Sequence\tType\tLength\tGC%\tAT/AU%\tEntropy\tComplexity\n${rows}`
    }, [global, summary, filteredRows])

    async function handleCopy() {
        if (!reportText) return
        await navigator.clipboard.writeText(reportText)
    }

    function handleDownloadText(filename: string, content: string, mime = "text/plain") {
        const blob = new Blob([content], { type: mime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    function exportTSV() {
        if (!filteredRows.length) return
        const text = [
            ["Sequence", "Type", "Length", "GC%", "AT/AU%", "Entropy", "Complexity"].join("\t"),
            ...filteredRows.map((r) =>
                [
                    r.header,
                    r.type,
                    r.length,
                    round3(r.gc),
                    round3(r.at),
                    round3(r.entropy),
                    round3(r.complexity)
                ].join("\t")
            )
        ].join("\n")
        handleDownloadText("sequence_statistics.tsv", text, "text/tab-separated-values")
    }

    function exportCSV() {
        if (!filteredRows.length) return
        const text = [
            ["Sequence", "Type", "Length", "GC%", "AT/AU%", "Entropy", "Complexity"].join(","),
            ...filteredRows.map((r) =>
                [
                    `"${r.header}"`,
                    r.type,
                    r.length,
                    round3(r.gc),
                    round3(r.at),
                    round3(r.entropy),
                    round3(r.complexity)
                ].join(",")
            )
        ].join("\n")
        handleDownloadText("sequence_statistics.csv", text, "text/csv")
    }

    function exportFilteredFasta() {
        if (!filteredRows.length) return
        const fasta = filteredRows.map((r) => `>${r.header}\n${r.seq}`).join("\n")
        handleDownloadText("filtered_sequences.fasta", fasta)
    }

    function loadExample() {
        setInput(`>seq1_dna
ATGCGTACGTAGCTAGCTAGCGCGTTATATATGCGC
>seq2_dna_repeat
ATATATATATATATATCGCGCGCGCGCG
>seq3_rna
AUGCGUACGUAGCUAGCUAGCGCGUUAUAUAUGCGC
>seq4_protein
MKWVTFISLLFLFSSAYSRGVFRRDTHKSEIAHRFKDLGE`)
        setAlignmentSeq1("ATGCGTACGTA")
        setAlignmentSeq2("ATGCGTTCGTA")
    }

    function clearAll() {
        setInput("")
        setRecords([])
        setError("")
        setResultReady(false)
        setActiveTab("overview")
        setK(3)
        setWindowSize(30)
        setStepSize(10)
        setMinLengthFilter("")
        setMaxLengthFilter("")
        setMinGCFilter("")
        setMaxGCFilter("")
        setMotifFilter("")
        setSortMode("alphabetical")
        setShowReverseComplement(false)
        setAlignmentSeq1("")
        setAlignmentSeq2("")
    }


    return (
        <ToolLayout
            badge="Sequence Analysis"
            slug="sequence-statistics"
            category="Sequence Analysis"
            seoContent={
                <>
                    <h2>Sequence Statistics &amp; Composition Analyzer</h2>

                    <p>
                        This all-in-one sequence statistics tool analyzes DNA, RNA, protein, and multi-FASTA datasets
                        directly in the browser. It combines core sequence statistics, residue composition, entropy,
                        complexity scoring, k-mer analysis, repeat detection, filtering, sorting, motif search,
                        reverse-complement preview, and lightweight alignment into a single workflow.
                    </p>

                    <p>
                        Researchers often need more than a simple GC content calculator. They may also want multi-sequence
                        summaries, residue distribution plots, length histograms, low-complexity detection, motif screening,
                        and exportable filtered FASTA files for downstream analysis. This analyzer provides those features in
                        one integrated interface.
                    </p>

                    <p>
                        The tool supports automatic sequence type detection for DNA, RNA, and proteins. For nucleotide datasets,
                        it reports GC and AT or AU content, GC skew, k-mer frequencies, sequence entropy, complexity metrics,
                        and repeat signatures. For protein sequences, it provides residue composition, entropy, and related
                        sequence summary statistics.
                    </p>

                    <p>
                        Everything runs locally in your browser with no server-side upload. For related workflows, you can also
                        use the <Link to="/tools/fasta-toolkit">FASTA Toolkit</Link>,{" "}
                        <Link to="/tools/sequence-toolkit">Sequence Toolkit</Link>, and{" "}
                        <Link to="/tools/codon-optimization">Codon Optimization Tool</Link>.
                    </p>
                </>
            }
            howTo={
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Paste one sequence or a multi-FASTA dataset into the input panel.</li>
                    <li>Click <strong>Analyze Statistics</strong> to compute sequence-level and dataset-level metrics.</li>
                    <li>Use the <strong>Overview</strong> tab to inspect summary statistics, filtering, sorting, and per-sequence results.</li>
                    <li>Open the <strong>Composition</strong> tab to explore residue charts and length distributions.</li>
                    <li>Use the <strong>Entropy</strong> tab for entropy, complexity, and low-complexity window analysis.</li>
                    <li>Open the <strong>Advanced</strong> tab for k-mers, repeats, motif matches, reverse-complement preview, and alignment scoring.</li>
                    <li>Export the filtered dataset as TSV, CSV, or FASTA as needed.</li>
                </ol>
            }
            faq={[
                {
                    question: "Can this analyzer process multi-FASTA datasets?",
                    answer:
                        "Yes. The tool accepts single sequences and multi-FASTA inputs, then reports both per-sequence and dataset-wide statistics."
                },
                {
                    question: "Does the tool support protein sequences?",
                    answer:
                        "Yes. Protein sequences are detected automatically and analyzed for composition, entropy, complexity, and k-mer frequencies."
                },
                {
                    question: "What complexity metrics are included?",
                    answer:
                        "The analyzer includes Shannon entropy, normalized complexity, a simple DUST-like low-complexity score, and linguistic complexity."
                },
                {
                    question: "Can I filter and export sequences after analysis?",
                    answer:
                        "Yes. You can filter by length, GC content, and motif pattern, sort the dataset, and export results as TSV, CSV, or FASTA."
                },
                {
                    question: "What kind of motif search is supported?",
                    answer:
                        "The motif finder supports regular expressions, so patterns such as ATG[ATGC]{3}TAA can be searched directly."
                },
                {
                    question: "Is my sequence data uploaded anywhere?",
                    answer:
                        "No. All calculations and visualizations are generated locally in your browser."
                }
            ]}
        >
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                <SequenceInput
                    value={input}
                    onChange={setInput}
                    label="Sequence / FASTA Input"
                    onLoadExample={loadExample}
                    height="h-32"
                />

                {error && (
                    <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4">
                    <button
                        onClick={analyze}
                        className="flex-1 min-w-[220px] py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold"
                    >
                        Analyze Statistics
                    </button>

                    <button
                        onClick={handleCopy}
                        disabled={!resultReady}
                        className="px-6 py-4 bg-gray-200 rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        Copy
                    </button>

                    <button
                        onClick={() => handleDownloadText("sequence_report.txt", reportText)}
                        disabled={!resultReady}
                        className="px-6 py-4 bg-gray-200 rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Report
                    </button>

                    <button
                        onClick={clearAll}
                        className="px-6 py-4 bg-gray-200 rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Clear
                    </button>
                </div>

                {resultReady && global && summary && (
                    <div className="p-6 border-t border-gray-200 bg-white">
                        <div className="flex flex-wrap gap-2 border-b mb-6">
                            {[
                                { key: "overview", label: "Overview" },
                                { key: "composition", label: "Composition" },
                                { key: "entropy", label: "Entropy" },
                                { key: "advanced", label: "Advanced" }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as ActiveTab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === tab.key
                                            ? "bg-white border border-b-0 border-gray-200 text-slate-900"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <StatCard label="Sequences" value={global.totalSequences} />
                                    <StatCard label="Total Length" value={global.totalLength} />
                                    <StatCard label="Type" value={global.type} />
                                    <StatCard label="GC%" value={global.gc.toFixed(2)} />
                                    <StatCard label={global.type === "RNA" ? "AU%" : "AT%"} value={global.at.toFixed(2)} />
                                    <StatCard label="Entropy" value={global.entropy.toFixed(4)} />
                                </div>

                                <div className="grid md:grid-cols-5 gap-4">
                                    <StatCard label="Min Length" value={summary.min} />
                                    <StatCard label="Max Length" value={summary.max} />
                                    <StatCard label="Mean Length" value={summary.mean.toFixed(2)} />
                                    <StatCard label="Median GC" value={summary.medianGC.toFixed(2)} />
                                    <StatCard label="N50" value={summary.N50} />
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtering and Sorting</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Length</label>
                                            <input
                                                type="number"
                                                min={bounds?.minLength ?? 0}
                                                max={maxLengthFilter || bounds?.maxLength}
                                                value={minLengthFilter}
                                                // onChange={(e) => setMinLengthFilter(e.target.value)}
                                                onChange={(e) => handleMinLengthChange(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Length</label>
                                            <input
                                                type="number"
                                                min={minLengthFilter || bounds?.minLength}
                                                max={bounds?.maxLength ?? 1000000}
                                                value={maxLengthFilter}
                                                // onChange={(e) => setMaxLengthFilter(e.target.value)}
                                                onChange={(e) => handleMaxLengthChange(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Min GC%</label>
                                            <input
                                                type="number"
                                                min={bounds?.minGC ?? 0}
                                                max={maxGCFilter || bounds?.maxGC}
                                                step={0.1}
                                                value={minGCFilter}
                                                // onChange={(e) => setMinGCFilter(e.target.value)}
                                                onChange={(e) => handleMinGCChange(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Max GC%</label>
                                            <input
                                                type="number"
                                                min={minGCFilter || bounds?.minGC}
                                                max={bounds?.maxGC ?? 100}
                                                step={0.1}
                                                value={maxGCFilter}
                                                // onChange={(e) => setMaxGCFilter(e.target.value)}
                                                onChange={(e) => handleMaxGCChange(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Motif / Regex</label>
                                            <input
                                                value={motifFilter}
                                                onChange={(e) => setMotifFilter(e.target.value)}
                                                placeholder="e.g. ATG[ATGC]{3}TAA"
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort</label>
                                            <select
                                                value={sortMode}
                                                onChange={(e) => setSortMode(e.target.value as SortMode)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            >
                                                <option value="alphabetical">Alphabetical</option>
                                                <option value="lengthAsc">Length ↑</option>
                                                <option value="lengthDesc">Length ↓</option>
                                                <option value="gcAsc">GC ↑</option>
                                                <option value="gcDesc">GC ↓</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <button
                                            onClick={exportTSV}
                                            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                                        >
                                            Export TSV
                                        </button>
                                        <button
                                            onClick={exportCSV}
                                            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            onClick={exportFilteredFasta}
                                            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                                        >
                                            Export FASTA
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Per-Sequence Statistics</h3>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm rounded-xl overflow-hidden">
                                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                                <tr>
                                                    <th className="p-3 text-left">Sequence</th>
                                                    <th className="p-3 text-left">Type</th>
                                                    <th className="p-3 text-left">Length</th>
                                                    <th className="p-3 text-left">GC%</th>
                                                    <th className="p-3 text-left">AT/AU%</th>
                                                    <th className="p-3 text-left">Entropy</th>
                                                    <th className="p-3 text-left">Complexity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white">
                                                {filteredRows.map((row, i) => (
                                                    <tr key={`${row.header}-${i}`} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 font-medium text-gray-800">{row.header}</td>
                                                        <td className="p-3">
                                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                                {row.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">{row.length}</td>
                                                        <td className="p-3">{row.gc.toFixed(2)}</td>
                                                        <td className="p-3">{row.at.toFixed(2)}</td>
                                                        <td className="p-3">{row.entropy.toFixed(4)}</td>
                                                        <td className="p-3">{row.complexity.toFixed(4)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "composition" && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Composition</h3>
                                        <div className="h-[320px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={compositionData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="base" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Length Distribution</h3>
                                        <div className="h-[320px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={lengthHistData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="range" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Per-Sequence Base Composition</h3>
                                    <div className="h-[360px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stackedPerSequenceData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="A" stackId="a" fill="#4F46E5" />
                                                {"T" in (stackedPerSequenceData[0] || {}) && <Bar dataKey="T" stackId="a" fill="#06B6D4" />}
                                                {"U" in (stackedPerSequenceData[0] || {}) && <Bar dataKey="U" stackId="a" fill="#06B6D4" />}
                                                <Bar dataKey="G" stackId="a" fill="#10B981" />
                                                <Bar dataKey="C" stackId="a" fill="#F59E0B" />
                                                <Bar dataKey="N" stackId="a" fill="#9CA3AF" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "entropy" && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-4 gap-4">
                                    <StatCard label="Entropy" value={global.entropy.toFixed(4)} />
                                    <StatCard label="Complexity" value={global.complexity.toFixed(4)} />
                                    <StatCard label="DUST Score" value={global.dust.toFixed(4)} />
                                    <StatCard label="Linguistic Complexity" value={global.linguistic.toFixed(4)} />
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <div className="flex flex-wrap gap-4 items-end mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Window Size</label>
                                            <input
                                                type="number"
                                                min={5}
                                                value={windowSize}
                                                onChange={(e) => setWindowSize(Number(e.target.value))}
                                                className="w-32 px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Step Size</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={stepSize}
                                                onChange={(e) => setStepSize(Number(e.target.value))}
                                                className="w-32 px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sliding Window Entropy and Low-Complexity Plot</h3>

                                    <div className="h-[360px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={entropySlidingData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="position" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="entropy" stroke="#4F46E5" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="lowComplexity" stroke="#EF4444" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <p className="mt-4 text-sm text-gray-600">
                                        Higher low-complexity values indicate locally repetitive or compositionally biased regions.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "advanced" && (
                            <div className="space-y-6">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <div className="flex flex-wrap items-end gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">k-mer Size</label>
                                            <input
                                                type="number"
                                                min={2}
                                                max={6}
                                                value={k}
                                                onChange={(e) => setK(Number(e.target.value))}
                                                className="w-24 px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top k-mers</h3>

                                    <div className="h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={kmerData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="kmer" interval={0} angle={-35} textAnchor="end" height={70} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-6 overflow-x-auto">
                                        <table className="min-w-full text-sm bg-white rounded-xl overflow-hidden">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-3 text-left">k-mer</th>
                                                    <th className="p-3 text-left">Count</th>
                                                    <th className="p-3 text-left">Normalized Frequency</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kmerData.map((row) => (
                                                    <tr key={row.kmer} className="border-b">
                                                        <td className="p-3 font-mono">{row.kmer}</td>
                                                        <td className="p-3">{row.count}</td>
                                                        <td className="p-3">{row.normalized.toFixed(5)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Repeat Detection</h3>
                                    {repeatData.length === 0 ? (
                                        <p className="text-sm text-gray-600">No simple repeats detected with the current settings.</p>
                                    ) : (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {repeatData.map((r, i) => (
                                                <div key={`${r.motif}-${r.start}-${i}`} className="rounded-lg border bg-white p-3 shadow-sm">
                                                    <div className="font-mono font-semibold text-slate-800">{r.motif}</div>
                                                    <div className="text-sm text-gray-600 mt-1">Repeats: {r.count}</div>
                                                    <div className="text-sm text-gray-600">Start: {r.start}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Motif Finder</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Current motif / regex: <code>{motifFilter || "—"}</code>
                                    </p>

                                    {motifFilter.trim() ? (
                                        <div className="space-y-3">
                                            {motifHits.map((row) => (
                                                <div key={row.header} className="rounded-lg border bg-white p-3 shadow-sm">
                                                    <div className="font-semibold text-slate-800">{row.header}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Hits: {row.hits.length ? row.hits.join(", ") : "None"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">Enter a motif or regex in the filter section to search positions.</p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <input
                                            id="show-rc"
                                            type="checkbox"
                                            checked={showReverseComplement}
                                            onChange={() => setShowReverseComplement(!showReverseComplement)}
                                        />
                                        <label htmlFor="show-rc" className="text-lg font-semibold text-gray-900">
                                            Reverse Complement Preview
                                        </label>
                                    </div>

                                    {showReverseComplement ? (
                                        reverseComplementPreview.length ? (
                                            <div className="space-y-3">
                                                {reverseComplementPreview.map((row) => (
                                                    <div key={row.header} className="rounded-lg border bg-white p-3 shadow-sm">
                                                        <div className="font-semibold text-slate-800 mb-2">{row.header}</div>
                                                        <div className="text-xs text-gray-500 mb-1">Original</div>
                                                        <div className="font-mono text-sm break-all">{row.original}</div>
                                                        <div className="text-xs text-gray-500 mt-3 mb-1">Reverse Complement</div>
                                                        <div className="font-mono text-sm break-all">{row.rc}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600">No DNA or RNA sequences available in the filtered set.</p>
                                        )
                                    ) : (
                                        <p className="text-sm text-gray-600">Enable this option to preview reverse complements for nucleotide sequences.</p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lightweight Pairwise Alignment</h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* <textarea
                                            value={alignmentSeq1}
                                            onChange={(e) => setAlignmentSeq1(e.target.value)}
                                            className="w-full min-h-[120px] rounded-lg border p-3 font-mono text-sm"
                                            placeholder="Sequence 1"
                                        />

                                        <textarea
                                            value={alignmentSeq2}
                                            onChange={(e) => setAlignmentSeq2(e.target.value)}
                                            className="w-full min-h-[120px] rounded-lg border p-3 font-mono text-sm"
                                            placeholder="Sequence 2"
                                        /> */}

                                        <select
                                            value={selectedSeq1}
                                            onChange={(e) => setSelectedSeq1(Number(e.target.value))}
                                            className="w-full border rounded-lg p-2"
                                        >
                                            {records.map((r, i) => (
                                            <option key={i} value={i}>
                                                {r.header}
                                            </option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedSeq2}
                                            onChange={(e) => setSelectedSeq2(Number(e.target.value))}
                                            className="w-full border rounded-lg p-2"
                                        >
                                            {records.map((r, i) => (
                                            <option key={i} value={i}>
                                                {r.header}
                                            </option>
                                            ))}
                                        </select>
                                    </div>

                                    {alignmentResult && (
                                    <div className="mt-4 bg-white border rounded-lg p-4 font-mono text-sm overflow-x-auto">

                                        <div className="whitespace-pre">
                                        {alignmentResult.aligned1}
                                        </div>

                                        <div className="whitespace-pre text-gray-400">
                                        {alignmentResult.aligned1.split("").map((c, i) =>
                                            c === alignmentResult.aligned2[i] ? "|" : " "
                                        ).join("")}
                                        </div>

                                        <div className="whitespace-pre">
                                        {alignmentResult.aligned2}
                                        </div>

                                    </div>
                                    )}

                                    <div className="mt-4 grid md:grid-cols-3 gap-4">
                                        {/* <StatCard label="Needleman–Wunsch Score" value={alignmentScore ?? "—"} /> */}
                                        <StatCard label="Alignment Score" value={alignmentResult?.score ?? "—"} />
                                        <StatCard label="Seq1 Length" value={cleanSequence(alignmentSeq1).length} />
                                        <StatCard label="Seq2 Length" value={cleanSequence(alignmentSeq2).length} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}