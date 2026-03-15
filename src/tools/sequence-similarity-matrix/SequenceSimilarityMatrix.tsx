import { Link } from "react-router-dom"
import React, { useMemo, useState } from "react"
import { RefreshCw, AlertCircle, ChevronRight } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

type SequenceType = "dna" | "protein"
type MatrixMode = "identity" | "similarity" | "distance"

type ParsedRecord = {
  header: string
  sequence: string
}

type AlignmentResult = {
  alignedA: string
  alignedB: string
  score: number
  identity: number
  similarity: number
  distance: number
}

type TreeNode = {
  name: string
  height: number
  left?: TreeNode
  right?: TreeNode
  members: string[]
}

const BLOSUM62: Record<string, Record<string, number>> = {
  A: { A: 4, R: -1, N: -2, D: -2, C: 0, Q: -1, E: -1, G: 0, H: -2, I: -1, L: -1, K: -1, M: -1, F: -2, P: -1, S: 1, T: 0, W: -3, Y: -2, V: 0 },
  R: { A: -1, R: 5, N: 0, D: -2, C: -3, Q: 1, E: 0, G: -2, H: 0, I: -3, L: -2, K: 2, M: -1, F: -3, P: -2, S: -1, T: -1, W: -3, Y: -2, V: -3 },
  N: { A: -2, R: 0, N: 6, D: 1, C: -3, Q: 0, E: 0, G: 0, H: 1, I: -3, L: -3, K: 0, M: -2, F: -3, P: -2, S: 1, T: 0, W: -4, Y: -2, V: -3 },
  D: { A: -2, R: -2, N: 1, D: 6, C: -3, Q: 0, E: 2, G: -1, H: -1, I: -3, L: -4, K: -1, M: -3, F: -3, P: -1, S: 0, T: -1, W: -4, Y: -3, V: -3 },
  C: { A: 0, R: -3, N: -3, D: -3, C: 9, Q: -3, E: -4, G: -3, H: -3, I: -1, L: -1, K: -3, M: -1, F: -2, P: -3, S: -1, T: -1, W: -2, Y: -2, V: -1 },
  Q: { A: -1, R: 1, N: 0, D: 0, C: -3, Q: 5, E: 2, G: -2, H: 0, I: -3, L: -2, K: 1, M: 0, F: -3, P: -1, S: 0, T: -1, W: -2, Y: -1, V: -2 },
  E: { A: -1, R: 0, N: 0, D: 2, C: -4, Q: 2, E: 5, G: -2, H: 0, I: -3, L: -3, K: 1, M: -2, F: -3, P: -1, S: 0, T: -1, W: -3, Y: -2, V: -2 },
  G: { A: 0, R: -2, N: 0, D: -1, C: -3, Q: -2, E: -2, G: 6, H: -2, I: -4, L: -4, K: -2, M: -3, F: -3, P: -2, S: 0, T: -2, W: -2, Y: -3, V: -3 },
  H: { A: -2, R: 0, N: 1, D: -1, C: -3, Q: 0, E: 0, G: -2, H: 8, I: -3, L: -3, K: -1, M: -2, F: -1, P: -2, S: -1, T: -2, W: -2, Y: 2, V: -3 },
  I: { A: -1, R: -3, N: -3, D: -3, C: -1, Q: -3, E: -3, G: -4, H: -3, I: 4, L: 2, K: -3, M: 1, F: 0, P: -3, S: -2, T: -1, W: -3, Y: -1, V: 3 },
  L: { A: -1, R: -2, N: -3, D: -4, C: -1, Q: -2, E: -3, G: -4, H: -3, I: 2, L: 4, K: -2, M: 2, F: 0, P: -3, S: -2, T: -1, W: -2, Y: -1, V: 1 },
  K: { A: -1, R: 2, N: 0, D: -1, C: -3, Q: 1, E: 1, G: -2, H: -1, I: -3, L: -2, K: 5, M: -1, F: -3, P: -1, S: 0, T: -1, W: -3, Y: -2, V: -2 },
  M: { A: -1, R: -1, N: -2, D: -3, C: -1, Q: 0, E: -2, G: -3, H: -2, I: 1, L: 2, K: -1, M: 5, F: 0, P: -2, S: -1, T: -1, W: -1, Y: -1, V: 1 },
  F: { A: -2, R: -3, N: -3, D: -3, C: -2, Q: -3, E: -3, G: -3, H: -1, I: 0, L: 0, K: -3, M: 0, F: 6, P: -4, S: -2, T: -2, W: 1, Y: 3, V: -1 },
  P: { A: -1, R: -2, N: -2, D: -1, C: -3, Q: -1, E: -1, G: -2, H: -2, I: -3, L: -3, K: -1, M: -2, F: -4, P: 7, S: -1, T: -1, W: -4, Y: -3, V: -2 },
  S: { A: 1, R: -1, N: 1, D: 0, C: -1, Q: 0, E: 0, G: 0, H: -1, I: -2, L: -2, K: 0, M: -1, F: -2, P: -1, S: 4, T: 1, W: -3, Y: -2, V: -2 },
  T: { A: 0, R: -1, N: 0, D: -1, C: -1, Q: -1, E: -1, G: -2, H: -2, I: -1, L: -1, K: -1, M: -1, F: -2, P: -1, S: 1, T: 5, W: -2, Y: -2, V: 0 },
  W: { A: -3, R: -3, N: -4, D: -4, C: -2, Q: -2, E: -3, G: -2, H: -2, I: -3, L: -2, K: -3, M: -1, F: 1, P: -4, S: -3, T: -2, W: 11, Y: 2, V: -3 },
  Y: { A: -2, R: -2, N: -2, D: -3, C: -2, Q: -1, E: -2, G: -3, H: 2, I: -1, L: -1, K: -2, M: -1, F: 3, P: -3, S: -2, T: -2, W: 2, Y: 7, V: -1 },
  V: { A: 0, R: -3, N: -3, D: -3, C: -1, Q: -2, E: -2, G: -3, H: -3, I: 3, L: 1, K: -2, M: 1, F: -1, P: -2, S: -2, T: 0, W: -3, Y: -1, V: 4 }
}

const PROTEIN_GROUPS: string[] = [
  "A","R","N","D","C","Q","E","G","H","I","L","K","M","F","P","S","T","W","Y","V"
]

function cleanSequence(seq: string, type: SequenceType) {
  return seq.replace(/\s/g, "").toUpperCase().replace(type === "dna" ? /U/g : /[^A-Z*-]/g, type === "dna" ? "T" : "")
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
    .map((entry, i) => {
      const lines = entry.split("\n")
      return {
        header: (lines[0] || `sequence_${i + 1}`).trim(),
        sequence: cleanSequence(lines.slice(1).join(""), type)
      }
    })
    .filter((r) => r.sequence.length > 0)
}

function dnaScore(a: string, b: string) {
  return a === b ? 1 : -1
}

function proteinScore(a: string, b: string) {
  return BLOSUM62[a]?.[b] ?? (a === b ? 1 : -1)
}

function alignNeedlemanWunsch(
  seqA: string,
  seqB: string,
  type: SequenceType,
  gapPenalty = -2
): AlignmentResult {
  const m = seqA.length
  const n = seqB.length
  const score: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const trace: ("diag" | "up" | "left")[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill("diag"))

  for (let i = 1; i <= m; i++) {
    score[i][0] = i * gapPenalty
    trace[i][0] = "up"
  }

  for (let j = 1; j <= n; j++) {
    score[0][j] = j * gapPenalty
    trace[0][j] = "left"
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matchScore =
        score[i - 1][j - 1] +
        (type === "dna" ? dnaScore(seqA[i - 1], seqB[j - 1]) : proteinScore(seqA[i - 1], seqB[j - 1]))
      const upScore = score[i - 1][j] + gapPenalty
      const leftScore = score[i][j - 1] + gapPenalty

      const best = Math.max(matchScore, upScore, leftScore)
      score[i][j] = best

      if (best === matchScore) trace[i][j] = "diag"
      else if (best === upScore) trace[i][j] = "up"
      else trace[i][j] = "left"
    }
  }

  let alignedA = ""
  let alignedB = ""
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    const t = trace[i][j]
    if (i > 0 && j > 0 && t === "diag") {
      alignedA = seqA[i - 1] + alignedA
      alignedB = seqB[j - 1] + alignedB
      i--
      j--
    } else if (i > 0 && (j === 0 || t === "up")) {
      alignedA = seqA[i - 1] + alignedA
      alignedB = "-" + alignedB
      i--
    } else {
      alignedA = "-" + alignedA
      alignedB = seqB[j - 1] + alignedB
      j--
    }
  }

  let identical = 0
  let similar = 0
  let alignedPositions = 0

  for (let k = 0; k < alignedA.length; k++) {
    const a = alignedA[k]
    const b = alignedB[k]
    if (a === "-" || b === "-") continue

    alignedPositions++
    if (a === b) {
      identical++
      similar++
    } else if (type === "protein" && (proteinScore(a, b) > 0)) {
      similar++
    }
  }

  const identity = alignedPositions > 0 ? (identical / alignedPositions) * 100 : 0
  const similarity = alignedPositions > 0 ? (similar / alignedPositions) * 100 : identity
  const distance = 100 - identity

  return {
    alignedA,
    alignedB,
    score: score[m][n],
    identity: Number(identity.toFixed(2)),
    similarity: Number(similarity.toFixed(2)),
    distance: Number(distance.toFixed(2))
  }
}

function buildMatrices(records: ParsedRecord[], type: SequenceType) {
  const n = records.length
  const identityMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const similarityMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const distanceMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const pairwise: Record<string, AlignmentResult> = {}

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        identityMatrix[i][j] = 100
        similarityMatrix[i][j] = 100
        distanceMatrix[i][j] = 0
        pairwise[`${i}-${j}`] = {
          alignedA: records[i].sequence,
          alignedB: records[j].sequence,
          score: 0,
          identity: 100,
          similarity: 100,
          distance: 0
        }
      } else {
        const result = alignNeedlemanWunsch(records[i].sequence, records[j].sequence, type)
        identityMatrix[i][j] = identityMatrix[j][i] = result.identity
        similarityMatrix[i][j] = similarityMatrix[j][i] = result.similarity
        distanceMatrix[i][j] = distanceMatrix[j][i] = result.distance
        pairwise[`${i}-${j}`] = result
        pairwise[`${j}-${i}`] = {
          ...result,
          alignedA: result.alignedB,
          alignedB: result.alignedA
        }
      }
    }
  }

  return { identityMatrix, similarityMatrix, distanceMatrix, pairwise }
}

function buildUPGMATree(records: ParsedRecord[], distanceMatrix: number[][]): TreeNode | null {
  if (records.length === 0) return null
  if (records.length === 1) {
    return {
      name: records[0].header,
      height: 0,
      members: [records[0].header]
    }
  }

  let clusters: TreeNode[] = records.map((r) => ({
    name: r.header,
    height: 0,
    members: [r.header]
  }))

  let clusterDistances = new Map<string, number>()

  const keyOf = (a: string, b: string) => [a, b].sort().join("||")

  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      clusterDistances.set(keyOf(records[i].header, records[j].header), distanceMatrix[i][j])
    }
  }

  while (clusters.length > 1) {
    let bestA = 0
    let bestB = 1
    let bestDistance = Infinity

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDistances.get(keyOf(clusters[i].name, clusters[j].name)) ?? Infinity
        if (d < bestDistance) {
          bestDistance = d
          bestA = i
          bestB = j
        }
      }
    }

    const left = clusters[bestA]
    const right = clusters[bestB]

    const merged: TreeNode = {
      name: `${left.name}+${right.name}`,
      height: bestDistance / 2,
      left,
      right,
      members: [...left.members, ...right.members]
    }

    const remaining = clusters.filter((_, idx) => idx !== bestA && idx !== bestB)

    for (const other of remaining) {
      const distances: number[] = []
      for (const m1 of merged.members) {
        for (const m2 of other.members) {
          const d = clusterDistances.get(keyOf(m1, m2))
          if (d !== undefined) distances.push(d)
        }
      }
      const avg = distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0
      clusterDistances.set(keyOf(merged.name, other.name), avg)
    }

    clusters = [...remaining, merged]
  }

  return clusters[0]
}

function flattenLeaves(node: TreeNode | undefined): string[] {
  if (!node) return []
  if (!node.left && !node.right) return [node.name]
  return [...flattenLeaves(node.left), ...flattenLeaves(node.right)]
}

function renderDendrogram(node: TreeNode | null, width = 900, height = 320) {
  if (!node) return null

  const leaves = flattenLeaves(node)
  const leafY: Record<string, number> = {}
  const topMargin = 30
  const bottomMargin = 30
  const usableHeight = height - topMargin - bottomMargin

  leaves.forEach((leaf, i) => {
    leafY[leaf] = topMargin + (leaves.length === 1 ? usableHeight / 2 : (i * usableHeight) / (leaves.length - 1))
  })

  const maxHeight = Math.max(node.height, 1)
  const scaleX = (h: number) => 60 + (h / maxHeight) * (width - 220)

const elements: React.ReactNode[] = []

  function walk(n: TreeNode): { x: number; y: number } {
    if (!n.left && !n.right) {
      const y = leafY[n.name]
      const x = 60
      elements.push(
        <text key={`label-${n.name}`} x={10} y={y + 4} fontSize="12" fill="#334155">
          {n.name}
        </text>
      )
      return { x, y }
    }

    const left = walk(n.left!)
    const right = walk(n.right!)
    const x = scaleX(n.height)
    const y = (left.y + right.y) / 2

    elements.push(
      <g key={`branch-${n.name}`}>
        <line x1={left.x} y1={left.y} x2={x} y2={left.y} stroke="#6366f1" strokeWidth="2" />
        <line x1={right.x} y1={right.y} x2={x} y2={right.y} stroke="#6366f1" strokeWidth="2" />
        <line x1={x} y1={left.y} x2={x} y2={right.y} stroke="#6366f1" strokeWidth="2" />
      </g>
    )

    return { x, y }
  }

  walk(node)

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {elements}
      <text x={width - 120} y={20} fontSize="12" fill="#475569">
        UPGMA distance
      </text>
    </svg>
  )
}

function getHeatColor(value: number, mode: MatrixMode) {
  if (mode === "distance") {
    const alpha = Math.min(1, Math.max(0.08, value / 100))
    return `rgba(239,68,68,${alpha})`
  }
  const alpha = Math.min(1, Math.max(0.08, value / 100))
  return `rgba(79,70,229,${alpha})`
}

export default function SequenceSimilarityMatrix() {
  const [sequence, setSequence] = useState("")
  const [records, setRecords] = useState<ParsedRecord[]>([])
  const [type, setType] = useState<SequenceType>("dna")
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [error, setError] = useState("")

  const [identityMatrix, setIdentityMatrix] = useState<number[][]>([])
  const [similarityMatrix, setSimilarityMatrix] = useState<number[][]>([])
  const [distanceMatrix, setDistanceMatrix] = useState<number[][]>([])
  const [pairwiseAlignments, setPairwiseAlignments] = useState<Record<string, AlignmentResult>>({})

  const [matrixMode, setMatrixMode] = useState<MatrixMode>("identity")
  const [selectedPair, setSelectedPair] = useState<[number, number] | null>(null)

  const activeMatrix = useMemo(() => {
    if (matrixMode === "identity") return identityMatrix
    if (matrixMode === "similarity") return similarityMatrix
    return distanceMatrix
  }, [matrixMode, identityMatrix, similarityMatrix, distanceMatrix])

  const tree = useMemo(() => {
    if (!analysisComplete || records.length < 2 || distanceMatrix.length === 0) return null
    return buildUPGMATree(records, distanceMatrix)
  }, [analysisComplete, records, distanceMatrix])

  const selectedAlignment = useMemo(() => {
    if (!selectedPair) return null
    return pairwiseAlignments[`${selectedPair[0]}-${selectedPair[1]}`] ?? null
  }, [selectedPair, pairwiseAlignments])

  const analyze = () => {
    setError("")
    setAnalysisComplete(false)
    setSelectedPair(null)

    if (!sequence.trim()) {
      setError("Please enter two or more sequences")
      return
    }

    const parsed = parseMultiFasta(sequence, type)

    if (parsed.length < 2) {
      setError("At least two sequences are required")
      return
    }

    const valid =
      type === "dna"
        ? /^[ACGTN]+$/
        : /^[ARNDCQEGHILKMFPSTWYVBZX*]+$/

    for (const r of parsed) {
      if (!valid.test(r.sequence)) {
        setError(`Sequence "${r.header}" contains invalid characters for ${type.toUpperCase()} mode`)
        return
      }
    }

    const { identityMatrix, similarityMatrix, distanceMatrix, pairwise } = buildMatrices(parsed, type)

    setRecords(parsed)
    setIdentityMatrix(identityMatrix)
    setSimilarityMatrix(similarityMatrix)
    setDistanceMatrix(distanceMatrix)
    setPairwiseAlignments(pairwise)
    setAnalysisComplete(true)
    setSelectedPair([0, 1])
  }

  const loadExample = () => {
    if (type === "dna") {
      setSequence(`>seq1
ATGCGTATGCTAGCTAGCTAG
>seq2
ATGCGTATGCTAGCTAGATAG
>seq3
ATGCGTATGATAGCTAGATAG
>seq4
TTGCGTATGCTAGCTAGATAG`)
    } else {
      setSequence(`>prot1
MKTAYIAKQRQISFVKSHFSRQDIL
>prot2
MKTAYIAKQRQISFVKAHFSRQDIL
>prot3
MKTTYIAKQRQISFVKAHFTRQDIL
>prot4
GKTAYIAKQRQISFVKAHFSRQDVL`)
    }
  }

  const clearAll = () => {
    setSequence("")
    setRecords([])
    setIdentityMatrix([])
    setSimilarityMatrix([])
    setDistanceMatrix([])
    setPairwiseAlignments({})
    setAnalysisComplete(false)
    setError("")
    setSelectedPair(null)
    setMatrixMode("identity")
  }

  const copyMatrix = async () => {
    if (activeMatrix.length === 0) return

    const header = ["", ...records.map((r) => r.header)].join("\t")
    const rows = activeMatrix.map((row, i) =>
      [records[i].header, ...row.map((v) => v.toString())].join("\t")
    )

    await navigator.clipboard.writeText([header, ...rows].join("\n"))
  }

  const downloadMatrix = () => {
    if (activeMatrix.length === 0) return

    const header = ["", ...records.map((r) => r.header)].join("\t")
    const rows = activeMatrix.map((row, i) =>
      [records[i].header, ...row.map((v) => v.toString())].join("\t")
    )

    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${matrixMode}_matrix.tsv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    
    <ToolLayout
  title="Sequence Similarity Matrix"
  description="Compute pairwise sequence identity, similarity, and distance matrices with Needleman–Wunsch alignment, BLOSUM62 scoring, heatmaps, and UPGMA clustering."
  badge="Sequence Analysis"
  slug="sequence-similarity-matrix"
  category="Sequence"

  seoContent={
  <>
    <h2>Sequence Similarity Matrix Calculator</h2>

    <p>
      A sequence similarity matrix is a fundamental bioinformatics tool used
      to compare multiple biological sequences and quantify how similar they
      are to each other. Pairwise comparisons are calculated between every
      sequence in a dataset, producing a matrix that summarizes sequence
      identity, similarity scores, or evolutionary distances.
    </p>

    <p>
      This tool performs global pairwise sequence alignment using the
      Needleman-Wunsch algorithm and computes identity, similarity, and
      distance matrices. For protein sequences, similarity scoring is based
      on the BLOSUM62 substitution matrix, while nucleotide sequences use
      simple match and mismatch scoring.
    </p>

    <p>
      The resulting matrix can be visualized as an interactive heatmap,
      allowing researchers to quickly identify closely related sequences.
      Additionally, hierarchical clustering using the UPGMA algorithm
      generates a dendrogram that illustrates evolutionary relationships
      between sequences.
    </p>

    <p>
      Sequence similarity matrices are commonly used in phylogenetics,
      comparative genomics, protein family analysis, and evolutionary
      biology studies to identify homologous sequences and clustering
      patterns across datasets.
    </p>

    <p>
      After computing similarity matrices, you may also analyze pairwise
      similarity using the{" "}
      <Link to="/tools/sequence-identity-calculator">
        Sequence Identity Calculator
      </Link>{" "}
      or explore sequence patterns with the{" "}
      <Link to="/tools/motif-pattern-finder">
        Motif / Pattern Finder
      </Link>.
    </p>

    <p>
      All computations run directly in your browser, ensuring that sequence
      data remains private and is never transmitted to external servers.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste two or more sequences in FASTA format into the input field.</li>
    <li>Select the sequence type (DNA or Protein).</li>
    <li>Click <strong>Compute Similarity Matrix</strong>.</li>
    <li>View the identity, similarity, or distance matrix heatmap.</li>
    <li>Click a cell in the matrix to inspect the pairwise alignment.</li>
    <li>Explore clustering results using the generated UPGMA dendrogram.</li>
    <li>Download or copy the matrix for downstream analysis.</li>
  </ol>
}

faq={[
  {
    question: "What is a sequence similarity matrix?",
    answer:
      "A sequence similarity matrix is a table showing pairwise comparison scores between multiple biological sequences, typically representing identity percentages, similarity scores, or evolutionary distances."
  },
  {
    question: "What is the difference between identity and similarity?",
    answer:
      "Sequence identity measures the percentage of identical residues between aligned sequences. Sequence similarity also considers biologically similar substitutions, such as conservative amino acid replacements scored using substitution matrices like BLOSUM62."
  },
  {
    question: "What alignment algorithm does this tool use?",
    answer:
      "The tool uses the Needleman-Wunsch global alignment algorithm, which aligns entire sequences and finds the optimal alignment score across their full length."
  },
  {
    question: "What is UPGMA clustering?",
    answer:
      "UPGMA (Unweighted Pair Group Method with Arithmetic Mean) is a hierarchical clustering method used to build phylogenetic trees from distance matrices by iteratively grouping the closest sequences."
  },
  {
    question: "Can this tool analyze protein sequences?",
    answer:
      "Yes. When protein mode is selected, similarity scoring uses the BLOSUM62 substitution matrix to evaluate biologically meaningful amino acid substitutions."
  },
  {
    question: "Is my sequence data uploaded to a server?",
    answer:
      "No. All sequence alignments and matrix calculations are performed locally in your browser, ensuring full data privacy."
  }
]}
>




      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sequence Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SequenceType)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="dna">DNA</option>
              <option value="protein">Protein</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Matrix View
            </label>
            <select
              value={matrixMode}
              onChange={(e) => setMatrixMode(e.target.value as MatrixMode)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="identity">Identity %</option>
              <option value="similarity">Similarity %</option>
              <option value="distance">Distance %</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label="Multi-FASTA Sequences"
            onLoadExample={loadExample}
          />

          <div className="p-6 bg-gray-50">
            <div className="flex justify-between mb-3 items-center">
              <h2 className="font-semibold text-lg">Interactive Similarity Heatmap</h2>

              <div className="flex gap-2">
                <button
                aria-label="Copy matrix 1"
                  onClick={copyMatrix}
                  disabled={!analysisComplete}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Copy
                </button>

                <button
                aria-label="Download matrix 1"
                  onClick={downloadMatrix}
                  disabled={!analysisComplete}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              {!analysisComplete ? (
                <div className="flex h-80 items-center justify-center text-sm text-gray-500">
                  Similarity matrix will appear here...
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2"></th>
                      {records.map((r) => (
                        <th key={r.header} className="p-2 whitespace-nowrap">
                          {r.header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {activeMatrix.map((row, i) => (
                      <tr key={i}>
                        <td className="font-semibold p-2 whitespace-nowrap">
                          {records[i].header}
                        </td>

                        {row.map((value, j) => (
                          <td
                            key={j}
                            className={`p-2 text-center cursor-pointer transition hover:scale-[1.02] ${
                              selectedPair?.[0] === i && selectedPair?.[1] === j
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            style={{ backgroundColor: getHeatColor(value, matrixMode) }}
                            onClick={() => setSelectedPair([i, j])}
                            title={`${records[i].header} vs ${records[j].header}: ${value.toFixed(2)}${
                              matrixMode === "distance" ? "% distance" : "%"
                            }`}
                          >
                            {value.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {analysisComplete && (
              <p className="mt-3 text-xs text-gray-500">
                Click a matrix cell to inspect the pairwise alignment.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
          aria-label="Compute Similarity Matrix 1"
            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Compute Similarity Matrix
          </button>

          <button
          aria-label="Clear Compute Similarity Matrix 1"
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

            <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-sm text-gray-500">Sequences</div>
                <div className="text-2xl font-bold text-blue-600">{records.length}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-sm text-gray-500">Mode</div>
                <div className="text-2xl font-bold text-blue-600">{type.toUpperCase()}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-sm text-gray-500">Matrix View</div>
                <div className="text-2xl font-bold text-blue-600">{matrixMode}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-sm text-gray-500">Scoring</div>
                <div className="text-2xl font-bold text-blue-600">
                  {type === "protein" ? "BLOSUM62" : "Match/Mismatch"}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="font-semibold mb-4">Sequence Lengths</h3>

              <div className="grid md:grid-cols-4 gap-3">
                {records.map((r) => (
                  <div
                    key={r.header}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-center"
                  >
                    <div className="text-sm text-gray-500 truncate" title={r.header}>
                      {r.header}
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {r.sequence.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {tree && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <h3 className="font-semibold mb-4">UPGMA Tree / Cluster Dendrogram</h3>

                <div className="rounded-lg border border-gray-200 bg-white p-4 overflow-x-auto">
                  {renderDendrogram(tree)}
                </div>
              </div>
            )}

            {selectedAlignment && selectedPair && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <details className="group" open>
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                    Pairwise Alignment Viewer
                    <ChevronRight className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-90" />
                  </summary>

                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="rounded border p-3 text-center">
                        <div className="text-sm text-gray-500">Pair</div>
                        <div className="font-semibold">
                          {records[selectedPair[0]].header} vs {records[selectedPair[1]].header}
                        </div>
                      </div>
                      <div className="rounded border p-3 text-center">
                        <div className="text-sm text-gray-500">Identity</div>
                        <div className="font-semibold text-blue-600">
                          {selectedAlignment.identity.toFixed(2)}%
                        </div>
                      </div>
                      <div className="rounded border p-3 text-center">
                        <div className="text-sm text-gray-500">Similarity</div>
                        <div className="font-semibold text-blue-600">
                          {selectedAlignment.similarity.toFixed(2)}%
                        </div>
                      </div>
                      <div className="rounded border p-3 text-center">
                        <div className="text-sm text-gray-500">Score</div>
                        <div className="font-semibold text-blue-600">
                          {selectedAlignment.score}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all leading-7">
                      <div className="mb-3">{selectedAlignment.alignedA}</div>
                      <div className="mb-3">
                        {selectedAlignment.alignedA.split("").map((c, idx) => {
                          const d = selectedAlignment.alignedB[idx]
                          if (c === "-" || d === "-") return " "
                          if (c === d) return "|"
                          if (type === "protein" && proteinScore(c, d) > 0) return ":"
                          return "."
                        }).join("")}
                      </div>
                      <div>{selectedAlignment.alignedB}</div>
                    </div>
                  </div>
                </details>
              </div>
            )}

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                  Cluster Grouping Summary
                  <ChevronRight className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-90" />
                </summary>

                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm text-slate-700">
                    {tree ? (
                      <>
                        <div className="mb-2 font-semibold">Leaf order:</div>
                        <div className="flex flex-wrap gap-2">
                          {flattenLeaves(tree).map((leaf) => (
                            <span
                              key={leaf}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                            >
                              {leaf}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500">No cluster information available.</span>
                    )}
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