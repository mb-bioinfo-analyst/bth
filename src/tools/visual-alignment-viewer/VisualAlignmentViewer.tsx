import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

type AlignmentMode = "global" | "local"

interface AlignmentResult {
  aligned1: string
  aligned2: string
  midline: string
  score: number
  matches: number
  mismatches: number
  gaps: number
  identity: number
  length: number
}

interface AlignmentChunk {
  seq1: string
  mid: string
  seq2: string
  start: number
  end: number
}

export default function VisualAlignmentViewer() {
  const [seq1, setSeq1] = useState("")
  const [seq2, setSeq2] = useState("")
  const [mode, setMode] = useState<AlignmentMode>("global")

  const [matchScore, setMatchScore] = useState(1)
  const [mismatchScore, setMismatchScore] = useState(-1)
  const [gapPenalty, setGapPenalty] = useState(-2)
  const [chunkSize, setChunkSize] = useState(70)

  const [result, setResult] = useState<AlignmentResult | null>(null)
  const [error, setError] = useState("")

  const clean = (s: string) =>
    s
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase()

  const validate = (s: string) => /^[A-Z*\-]+$/.test(s)

  const scorePair = (a: string, b: string) => (a === b ? matchScore : mismatchScore)

  const needlemanWunsch = (a: string, b: string): AlignmentResult => {
    const m = a.length
    const n = b.length

    const score: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    const trace: string[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""))

    for (let i = 1; i <= m; i++) {
      score[i][0] = score[i - 1][0] + gapPenalty
      trace[i][0] = "U"
    }

    for (let j = 1; j <= n; j++) {
      score[0][j] = score[0][j - 1] + gapPenalty
      trace[0][j] = "L"
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const diag = score[i - 1][j - 1] + scorePair(a[i - 1], b[j - 1])
        const up = score[i - 1][j] + gapPenalty
        const left = score[i][j - 1] + gapPenalty

        const best = Math.max(diag, up, left)
        score[i][j] = best

        if (best === diag) trace[i][j] = "D"
        else if (best === up) trace[i][j] = "U"
        else trace[i][j] = "L"
      }
    }

    let i = m
    let j = n
    let aligned1 = ""
    let aligned2 = ""

    while (i > 0 || j > 0) {
      const t = trace[i][j]

      if (i > 0 && j > 0 && t === "D") {
        aligned1 = a[i - 1] + aligned1
        aligned2 = b[j - 1] + aligned2
        i--
        j--
      } else if (i > 0 && t === "U") {
        aligned1 = a[i - 1] + aligned1
        aligned2 = "-" + aligned2
        i--
      } else {
        aligned1 = "-" + aligned1
        aligned2 = b[j - 1] + aligned2
        j--
      }
    }

    return buildAlignmentStats(aligned1, aligned2, score[m][n])
  }

  const smithWaterman = (a: string, b: string): AlignmentResult => {
    const m = a.length
    const n = b.length

    const score: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    const trace: string[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""))

    let maxScore = 0
    let maxI = 0
    let maxJ = 0

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const diag = score[i - 1][j - 1] + scorePair(a[i - 1], b[j - 1])
        const up = score[i - 1][j] + gapPenalty
        const left = score[i][j - 1] + gapPenalty

        const best = Math.max(0, diag, up, left)
        score[i][j] = best

        if (best === 0) trace[i][j] = "0"
        else if (best === diag) trace[i][j] = "D"
        else if (best === up) trace[i][j] = "U"
        else trace[i][j] = "L"

        if (best > maxScore) {
          maxScore = best
          maxI = i
          maxJ = j
        }
      }
    }

    let i = maxI
    let j = maxJ
    let aligned1 = ""
    let aligned2 = ""

    while (i > 0 && j > 0 && score[i][j] > 0) {
      const t = trace[i][j]

      if (t === "D") {
        aligned1 = a[i - 1] + aligned1
        aligned2 = b[j - 1] + aligned2
        i--
        j--
      } else if (t === "U") {
        aligned1 = a[i - 1] + aligned1
        aligned2 = "-" + aligned2
        i--
      } else if (t === "L") {
        aligned1 = "-" + aligned1
        aligned2 = b[j - 1] + aligned2
        j--
      } else {
        break
      }
    }

    return buildAlignmentStats(aligned1, aligned2, maxScore)
  }

  const buildAlignmentStats = (aligned1: string, aligned2: string, score: number): AlignmentResult => {
    let matches = 0
    let mismatches = 0
    let gaps = 0
    let midline = ""

    for (let i = 0; i < aligned1.length; i++) {
      const a = aligned1[i]
      const b = aligned2[i]

      if (a === "-" || b === "-") {
        gaps++
        midline += " "
      } else if (a === b) {
        matches++
        midline += "|"
      } else {
        mismatches++
        midline += "."
      }
    }

    const identity = aligned1.length > 0 ? (matches / aligned1.length) * 100 : 0

    return {
      aligned1,
      aligned2,
      midline,
      score,
      matches,
      mismatches,
      gaps,
      identity,
      length: aligned1.length,
    }
  }

  const runAlignment = () => {
    setError("")
    setResult(null)

    if (!seq1.trim() || !seq2.trim()) {
      setError("Please enter both sequences")
      return
    }

    const a = clean(seq1)
    const b = clean(seq2)

    if (!a || !b) {
      setError("Invalid sequence input")
      return
    }

    if (!validate(a) || !validate(b)) {
      setError("Sequences contain unsupported characters")
      return
    }

    if (chunkSize < 20) {
      setError("Chunk size should be at least 20")
      return
    }

    const alignment =
      mode === "global"
        ? needlemanWunsch(a, b)
        : smithWaterman(a, b)

    setResult(alignment)
  }

  const handleCopy = async () => {
    if (!result) return

    const text = [
      `Score: ${result.score}`,
      `Identity: ${result.identity.toFixed(2)}%`,
      `Matches: ${result.matches}`,
      `Mismatches: ${result.mismatches}`,
      `Gaps: ${result.gaps}`,
      "",
      result.aligned1,
      result.midline,
      result.aligned2,
    ].join("\n")

    await navigator.clipboard.writeText(text)
  }

  const handleDownload = () => {
    if (!result) return

    const text = [
      `Score: ${result.score}`,
      `Identity: ${result.identity.toFixed(2)}%`,
      `Matches: ${result.matches}`,
      `Mismatches: ${result.mismatches}`,
      `Gaps: ${result.gaps}`,
      "",
      result.aligned1,
      result.midline,
      result.aligned2,
    ].join("\n")

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "alignment.txt"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setSeq1("ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG")
    setSeq2("ATGGCCATCGTAATGGGCCGCTGAATGGGTGCCCGATAG")
  }

  const clearAll = () => {
    setSeq1("")
    setSeq2("")
    setResult(null)
    setError("")
    setMode("global")
    setMatchScore(1)
    setMismatchScore(-1)
    setGapPenalty(-2)
    setChunkSize(70)
  }

  const chunks: AlignmentChunk[] = useMemo(() => {
    if (!result) return []

    const out: AlignmentChunk[] = []

    for (let i = 0; i < result.aligned1.length; i += chunkSize) {
      out.push({
        seq1: result.aligned1.slice(i, i + chunkSize),
        mid: result.midline.slice(i, i + chunkSize),
        seq2: result.aligned2.slice(i, i + chunkSize),
        start: i + 1,
        end: Math.min(i + chunkSize, result.aligned1.length),
      })
    }

    return out
  }, [result, chunkSize])

  const renderMid = (line: string) =>
    line.split("").map((c, i) => {
      let color = "text-gray-400"
      if (c === "|") color = "text-green-600"
      else if (c === ".") color = "text-red-500"

      return (
        <span key={i} className={color}>
          {c}
        </span>
      )
    })

  const renderSeq = (seq: string, ref: string) =>
    seq.split("").map((c, i) => {
      let color = "text-gray-700"

      if (c === "-" || ref[i] === "-") {
        color = "text-blue-500"
      } else if (c === ref[i]) {
        color = "text-green-600"
      } else {
        color = "text-red-600"
      }

      return (
        <span key={i} className={color}>
          {c}
        </span>
      )
    })

  return (
    
    <ToolLayout
  title="Visual Alignment Viewer"
  description="Perform global or local pairwise alignment with configurable scoring and a color-coded visual viewer."
  badge="Sequence Analysis"
  slug="visual-alignment-viewer"
  category="Sequence"

  seoContent={
  <>
    <h2>Visual Pairwise Sequence Alignment Viewer</h2>

    <p>
      Pairwise sequence alignment is a fundamental technique in bioinformatics
      used to compare biological sequences and identify regions of similarity.
      These similarities can reveal functional, structural, or evolutionary
      relationships between DNA, RNA, or protein sequences.
    </p>

    <p>
      This visual alignment viewer performs pairwise sequence alignment using
      two widely used algorithms: the Needleman-Wunsch algorithm for global
      alignment and the Smith-Waterman algorithm for local alignment. Global
      alignment compares sequences across their full length, while local
      alignment identifies the best matching subsections within sequences.
    </p>

    <p>
      The tool provides an interactive color-coded visualization of the
      alignment, highlighting matches, mismatches, and gaps. Adjustable
      scoring parameters for match, mismatch, and gap penalties allow
      researchers to customize alignment behavior for different biological
      scenarios.
    </p>

    <p>
      Sequence alignments are widely used in genomics, evolutionary biology,
      protein structure analysis, and gene annotation. By examining the
      alignment patterns, researchers can identify conserved regions,
      mutations, insertions, and deletions across sequences.
    </p>

    <p>
      After performing sequence alignment, you may also want to analyze
      sequence similarity using the{" "}
      <Link to="/tools/sequence-similarity-matrix">
        Sequence Similarity Matrix
      </Link>{" "}
      or compute identity percentages using the{" "}
      <Link to="/tools/sequence-identity-calculator">
        Sequence Identity Calculator
      </Link>.
    </p>

    <p>
      All alignments are computed directly within your browser, ensuring that
      sequence data remains private and is never uploaded to external servers.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste two sequences into the input fields.</li>
    <li>Select the alignment mode (global or local).</li>
    <li>Adjust scoring parameters such as match, mismatch, and gap penalties if needed.</li>
    <li>Click <strong>Run Alignment</strong>.</li>
    <li>The alignment will be displayed with color-coded matches and mismatches.</li>
    <li>Copy or download the alignment results for further analysis.</li>
  </ol>
}

faq={[
  {
    question: "What is pairwise sequence alignment?",
    answer:
      "Pairwise sequence alignment is a method used to compare two biological sequences to identify similarities, differences, and evolutionary relationships."
  },
  {
    question: "What is the difference between global and local alignment?",
    answer:
      "Global alignment aligns entire sequences across their full length using algorithms such as Needleman-Wunsch, while local alignment identifies the most similar subsequences using algorithms such as Smith-Waterman."
  },
  {
    question: "What do matches, mismatches, and gaps represent?",
    answer:
      "Matches indicate identical residues in both sequences, mismatches represent substitutions, and gaps represent insertions or deletions introduced during alignment."
  },
  {
    question: "Why are gap penalties important?",
    answer:
      "Gap penalties control how insertions and deletions are treated during alignment. Higher penalties discourage gaps, while lower penalties allow more insertions or deletions."
  },
  {
    question: "Can this tool align protein sequences?",
    answer:
      "Yes. The viewer can align nucleotide or protein sequences as long as they contain valid sequence characters."
  },
  {
    question: "Is my sequence data uploaded anywhere?",
    answer:
      "No. All alignment calculations are performed locally in your browser and your sequences remain private."
  }
]}
>
    


      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Alignment Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as AlignmentMode)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="global">Global (Needleman–Wunsch)</option>
              <option value="local">Local (Smith–Waterman)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Match
            </label>
            <input
              type="number"
              value={matchScore}
              onChange={(e) => setMatchScore(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Mismatch
            </label>
            <input
              type="number"
              value={mismatchScore}
              onChange={(e) => setMismatchScore(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Gap Penalty
            </label>
            <input
              type="number"
              value={gapPenalty}
              onChange={(e) => setGapPenalty(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Line Width
            </label>
            <input
              type="number"
              value={chunkSize}
              min={20}
              max={120}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={seq1}
            onChange={setSeq1}
            label="Sequence 1"
            onLoadExample={loadExample}
          />

          <SequenceInput
            value={seq2}
            onChange={setSeq2}
            label="Sequence 2"
          />
        </div>

        {result && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-5 gap-4 text-center">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-2xl font-bold text-blue-600">{result.score}</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Identity</div>
              <div className="text-2xl font-bold text-blue-600">
                {result.identity.toFixed(2)}%
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Matches</div>
              <div className="text-2xl font-bold text-blue-600">{result.matches}</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Mismatches</div>
              <div className="text-2xl font-bold text-blue-600">{result.mismatches}</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Gaps</div>
              <div className="text-2xl font-bold text-blue-600">{result.gaps}</div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {!result ? (
            <p className="text-center text-gray-500">
              Alignment will appear here
            </p>
          ) : (
            <div className="bg-white border rounded-lg p-4 font-mono text-sm overflow-auto max-h-[500px]">
              {chunks.map((line, index) => (
                <div key={index} className="mb-5">
                  <div className="text-xs text-gray-500 mb-1">
                    Positions {line.start}-{line.end}
                  </div>

                  <div>{renderSeq(line.seq1, line.seq2)}</div>
                  <div>{renderMid(line.mid)}</div>
                  <div>{renderSeq(line.seq2, line.seq1)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
          aria-label="Run Alignment 1"
            onClick={runAlignment}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Run Alignment
          </button>

          <button
          aria-label="Copy Run Alignment 1"
            onClick={handleCopy}
            disabled={!result}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
          >
            Copy
          </button>

          <button
          aria-label="Download Run Alignment 1"
            onClick={handleDownload}
            disabled={!result}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
          >
            Download
          </button>

          <button
          aria-label="Clear Run Alignment 1"
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