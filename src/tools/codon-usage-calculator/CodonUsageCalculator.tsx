import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import CodonHeatmap from "../../components/CodonHeatmap"

import {
  speciesCodonUsage,
  Species
} from "../../data/codonTables"

import { slidingWindowCodonBias } from "../../utils/codonUtils"


type CodonStat = {
  codon: string
  aminoAcid: string
  count: number
  frequency: number
  rscu: number
}

type AminoAcidCodonMap = Record<string, string[]>

const speciesList = Object.keys(speciesCodonUsage) as Species[]

const CODON_TABLE: Record<string, string> = {
  TTT: "F", TTC: "F",
  TTA: "L", TTG: "L", CTT: "L", CTC: "L", CTA: "L", CTG: "L",
  ATT: "I", ATC: "I", ATA: "I",
  ATG: "M",
  GTT: "V", GTC: "V", GTA: "V", GTG: "V",

  TCT: "S", TCC: "S", TCA: "S", TCG: "S", AGT: "S", AGC: "S",
  CCT: "P", CCC: "P", CCA: "P", CCG: "P",
  ACT: "T", ACC: "T", ACA: "T", ACG: "T",
  GCT: "A", GCC: "A", GCA: "A", GCG: "A",

  TAT: "Y", TAC: "Y",
  TAA: "*", TAG: "*", TGA: "*",
  CAT: "H", CAC: "H",
  CAA: "Q", CAG: "Q",
  AAT: "N", AAC: "N",
  AAA: "K", AAG: "K",
  GAT: "D", GAC: "D",
  GAA: "E", GAG: "E",

  TGT: "C", TGC: "C",
  TGG: "W",
  CGT: "R", CGC: "R", CGA: "R", CGG: "R", AGA: "R", AGG: "R",
  GGT: "G", GGC: "G", GGA: "G", GGG: "G"
}

const AMINO_TO_CODONS: AminoAcidCodonMap = Object.entries(CODON_TABLE).reduce(
  (acc, [codon, aa]) => {
    if (!acc[aa]) acc[aa] = []
    acc[aa].push(codon)
    return acc
  },
  {} as AminoAcidCodonMap
)

type ParsedRecord = {
  header: string
  sequence: string
}

function parseMultiFasta(input: string): ParsedRecord[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  if (!trimmed.startsWith(">")) {
    return [
      {
        header: "sequence_1",
        sequence: cleanSequence(trimmed)
      }
    ]
  }

  return trimmed
    .split(/^>/m)
    .filter(Boolean)
    .map((entry, idx) => {
      const lines = entry.split("\n")
      return {
        header: lines[0]?.trim() || `sequence_${idx + 1}`,
        sequence: cleanSequence(lines.slice(1).join(""))
      }
    })
    .filter((r) => r.sequence.length > 0)
}

function cleanSequence(seq: string) {
  return seq
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/U/g, "T")
}

function gcPercent(seq: string) {
  if (!seq.length) return 0
  const gc = (seq.match(/[GC]/g) || []).length
  return (gc / seq.length) * 100
}




export default function CodonUsageCalculator() {
  const [sequence, setSequence] = useState("")
  const [codonStats, setCodonStats] = useState<CodonStat[]>([])
  const [error, setError] = useState("")
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [ignoreStops, setIgnoreStops] = useState(true)

  const [sequenceCount, setSequenceCount] = useState(0)
  const [totalLength, setTotalLength] = useState(0)
  const [totalCodons, setTotalCodons] = useState(0)
  const [gcAll, setGcAll] = useState(0)
  const [gc1, setGc1] = useState(0)
  const [gc2, setGc2] = useState(0)
  const [gc3, setGc3] = useState(0)

  const aminoAcidSummary = useMemo(() => {
    const counts: Record<string, number> = {}
    codonStats.forEach((row) => {
      counts[row.aminoAcid] = (counts[row.aminoAcid] || 0) + row.count
    })
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }, [codonStats])

  const analyze = () => {
    setError("")
    setAnalysisComplete(false)
    setCodonStats([])

    if (!sequence.trim()) {
      setError("Please enter one or more coding sequences")
      return
    }

    const records = parseMultiFasta(sequence)

    if (records.length === 0) {
      setError("No valid sequence data detected")
      return
    }

    const cleanedSequences = records.map((r) => ({
      ...r,
      sequence: cleanSequence(r.sequence)
    }))

    for (const record of cleanedSequences) {
      if (!/^[ACGTN]+$/.test(record.sequence)) {
        setError("Sequence contains invalid characters. Only DNA/RNA bases are allowed.")
        return
      }
    }

    const combined = cleanedSequences.map((r) => r.sequence).join("")
    const countMap: Record<string, number> = {}
    Object.keys(CODON_TABLE).forEach((codon) => {
      countMap[codon] = 0
    })

    let codonCount = 0
    let pos1 = ""
    let pos2 = ""
    let pos3 = ""

    for (const record of cleanedSequences) {
      const seq = record.sequence
      const usableLength = seq.length - (seq.length % 3)

      for (let i = 0; i < usableLength; i += 3) {
        const codon = seq.slice(i, i + 3)

        if (codon.includes("N")) continue
        if (!CODON_TABLE[codon]) continue
        if (ignoreStops && CODON_TABLE[codon] === "*") continue

        countMap[codon] += 1
        codonCount += 1

        pos1 += codon[0]
        pos2 += codon[1]
        pos3 += codon[2]
      }
    }

    const stats: CodonStat[] = Object.entries(CODON_TABLE)
      .filter(([, aa]) => !(ignoreStops && aa === "*"))
      .map(([codon, aa]) => {
        const synonymous = AMINO_TO_CODONS[aa].filter(
          (c) => !(ignoreStops && CODON_TABLE[c] === "*")
        )
        const aaTotal = synonymous.reduce((sum, c) => sum + countMap[c], 0)
        const expected = aaTotal > 0 ? aaTotal / synonymous.length : 0
        const rscu = expected > 0 ? countMap[codon] / expected : 0

        return {
          codon,
          aminoAcid: aa,
          count: countMap[codon],
          frequency: codonCount > 0 ? countMap[codon] / codonCount : 0,
          rscu
        }
      })
      .sort((a, b) => {
        if (a.aminoAcid !== b.aminoAcid) return a.aminoAcid.localeCompare(b.aminoAcid)
        return a.codon.localeCompare(b.codon)
      })

    setSequenceCount(cleanedSequences.length)
    setTotalLength(combined.length)
    setTotalCodons(codonCount)
    setGcAll(gcPercent(combined))
    setGc1(gcPercent(pos1))
    setGc2(gcPercent(pos2))
    setGc3(gcPercent(pos3))
    setCodonStats(stats)
    setAnalysisComplete(true)


    const reference = speciesCodonUsage[species]

    const sliding = slidingWindowCodonBias(
      combined,
      30,
      3,
      reference
    )

    setBiasMap(sliding)


  }

  const handleCopy = async () => {
    const header = "codon\tamino_acid\tcount\tfrequency\trscu"
    const rows = codonStats.map(
      (row) =>
        `${row.codon}\t${row.aminoAcid}\t${row.count}\t${row.frequency.toFixed(6)}\t${row.rscu.toFixed(3)}`
    )
    await navigator.clipboard.writeText([header, ...rows].join("\n"))
  }

  const handleDownload = () => {
    const header = "codon\tamino_acid\tcount\tfrequency\trscu"
    const rows = codonStats.map(
      (row) =>
        `${row.codon}\t${row.aminoAcid}\t${row.count}\t${row.frequency.toFixed(6)}\t${row.rscu.toFixed(3)}`
    )

    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "codon_usage.tsv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setSequence(`>cds_1
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG
>cds_2
ATGGCTGCTGCTGCTAAAGGAGGAGGATTTCCCGAA`)
  }

  const clearAll = () => {
    setSequence("")
    setCodonStats([])
    setError("")
    setAnalysisComplete(false)
    setSequenceCount(0)
    setTotalLength(0)
    setTotalCodons(0)
    setGcAll(0)
    setGc1(0)
    setGc2(0)
    setGc3(0)
    setIgnoreStops(true)
  }

  const rscuHeatmapData = useMemo(() => {
    return codonStats.map((row) => ({
      codon: row.codon,
      rscu: Number(row.rscu.toFixed(3)),
    }))
  }, [codonStats])


  const heatmapData = codonStats.map((row) => ({
    codon: row.codon,
    aminoAcid: row.aminoAcid,
    rscu: row.rscu
  }))

  const [biasMap, setBiasMap] = useState<any[]>([])

  const [species, setSpecies] =
    useState<Species>("ecoli")
  // const referenceTable = speciesCodonUsage[species]

  return (
    <ToolLayout
      badge="Sequence Analysis"
      slug="codon-usage-calculator"
      category="Sequence Analysis"

      seoContent={
        <>
          <h2>Codon Usage Analysis and RSCU Calculator</h2>

          <p>
            Codon usage analysis is an important method in genomics and
            bioinformatics used to study how frequently different codons
            appear in protein-coding DNA sequences. Although several codons
            can encode the same amino acid, organisms often prefer specific
            synonymous codons. This phenomenon is known as <strong>codon usage bias</strong>
            and plays a key role in translation efficiency, gene expression,
            and genome evolution.
          </p>

          <p>
            This codon usage calculator analyzes coding DNA sequences and
            computes codon counts, codon frequencies, and Relative Synonymous
            Codon Usage (RSCU) values. These statistics help researchers
            understand translation patterns, detect codon bias, and compare
            coding sequences across species or experimental datasets.
          </p>

          <p>
            The tool also calculates GC content across codon positions,
            including GC1, GC2, and GC3. These metrics are widely used
            indicators of genome composition and codon preference. If you
            want to further evaluate nucleotide composition you can use the{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
            or examine base frequencies with the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
          </p>

          <p>
            Codon usage statistics are particularly useful for applications
            such as gene expression analysis, evolutionary genomics, synthetic
            biology, and recombinant protein production. Researchers often
            analyze multi-FASTA datasets to generate codon usage tables,
            identify codon bias patterns, and compare gene sets between
            organisms.
          </p>

          <p>
            The entire analysis runs locally in your browser, ensuring that
            your sequence data remains private and is never transmitted to
            a remote server.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a coding DNA sequence or multi-FASTA dataset into the input box.</li>
          <li>Select the reference species for codon bias comparison.</li>
          <li>Choose whether stop codons should be included or ignored.</li>
          <li>Click <strong>Calculate Codon Usage</strong>.</li>
          <li>The tool will generate codon counts, frequencies, and RSCU statistics.</li>
          <li>Explore codon bias visualizations including bar plots and heatmaps.</li>
          <li>Copy or download the codon usage table for downstream analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is codon usage bias?",
          answer:
            "Codon usage bias refers to the tendency of organisms to preferentially use certain synonymous codons when encoding proteins, even though multiple codons can specify the same amino acid."
        },
        {
          question: "What does RSCU mean?",
          answer:
            "Relative Synonymous Codon Usage (RSCU) measures how frequently a codon appears compared to the expected frequency if all synonymous codons were used equally."
        },
        {
          question: "What are GC1, GC2, and GC3?",
          answer:
            "GC1, GC2, and GC3 represent the GC content at the first, second, and third codon positions respectively, which are commonly used indicators of codon bias and genomic composition."
        },
        {
          question: "Can this tool analyze multiple sequences?",
          answer:
            "Yes. The calculator supports multi-FASTA input and can analyze codon usage across multiple coding sequences simultaneously."
        },
        {
          question: "Is my sequence uploaded to a server?",
          answer:
            "No. All codon usage calculations and visualizations run locally in your browser, ensuring that your sequence data remains private."
        }
      ]}
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-wrap items-end gap-6">

          {/* Host species */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Reference Species
            </label>

            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value as Species)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {speciesList.map((sp) => (
                <option key={sp} value={sp}>
                  {sp.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Ignore stop codons */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={ignoreStops}
              onChange={() => setIgnoreStops(!ignoreStops)}
            />
            Ignore stop codons
          </label>

        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label="Coding Sequence / Multi-FASTA"
            onLoadExample={loadExample}
          />

          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Codon Usage Table</h2>

              <div className="flex gap-2">
                <button
                  aria-label="Copy data"
                  onClick={handleCopy}
                  disabled={!analysisComplete || codonStats.length === 0}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Copy
                </button>

                <button
                  aria-label="Download data"
                  onClick={handleDownload}
                  disabled={!analysisComplete || codonStats.length === 0}
                  className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {!analysisComplete ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Codon usage results will appear here...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 border-b bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700">
                    <div>Codon</div>
                    <div>AA</div>
                    <div>Count</div>
                    <div>Freq</div>
                    <div>RSCU</div>
                  </div>

                  {codonStats.map((row) => (
                    <div
                      key={row.codon}
                      className="grid grid-cols-5 px-4 py-2 text-sm border-b last:border-b-0"
                    >
                      <div className="font-mono">{row.codon}</div>
                      <div>{row.aminoAcid}</div>
                      <div>{row.count}</div>
                      <div>{row.frequency.toFixed(4)}</div>
                      <div>{row.rscu.toFixed(3)}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
            aria-label="Calculate Codon Usage data"
            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Calculate Codon Usage
          </button>

          <button
            aria-label="Clear Codon Usage data"
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
                <div className="text-2xl font-bold text-blue-600">{sequenceCount}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Total Length</div>
                <div className="text-2xl font-bold text-blue-600">{totalLength}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Counted Codons</div>
                <div className="text-2xl font-bold text-blue-600">{totalCodons}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Overall GC%</div>
                <div className="text-2xl font-bold text-blue-600">{gcAll.toFixed(2)}</div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">GC1</div>
                <div className="text-2xl font-bold text-blue-600">{gc1.toFixed(2)}%</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">GC2</div>
                <div className="text-2xl font-bold text-blue-600">{gc2.toFixed(2)}%</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">GC3</div>
                <div className="text-2xl font-bold text-blue-600">{gc3.toFixed(2)}%</div>
              </div>
            </div>


            <div className="p-6 border-t border-gray-200 bg-gray-50">

              <details className="group">

                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">

                  RSCU Codon Bias Barplot

                </summary>

                <div className="mt-6 overflow-x-auto">

                  <BarChart
                    width={900}
                    height={350}
                    data={rscuHeatmapData}
                  >

                    <XAxis
                      dataKey="codon"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="rscu"
                      fill="#6366f1"
                      isAnimationActive={false}
                    />

                  </BarChart>

                </div>

              </details>

            </div>



            <div className="p-6 border-t border-gray-200 bg-gray-50">

              <details className="group">

                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold border border-gray-200 hover:bg-gray-50">

                  RSCU Codon Bias Heatmap

                </summary>

                <div className="mt-6">

                  <CodonHeatmap data={heatmapData} />

                </div>

              </details>

            </div>



            <div className="p-6 border-t border-gray-200 bg-gray-50">

              <details className="group">

                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold border border-gray-200 hover:bg-gray-50">

                  Sliding Window Codon Bias Map

                </summary>

                <div className="mt-6 overflow-x-auto">

                  <LineChart
                    width={900}
                    height={350}
                    data={biasMap}
                  >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="position"
                      type="number"
                      label={{
                        value: "Codon Position",
                        position: "insideBottom",
                        offset: -5
                      }}
                    />

                    <YAxis
                      domain={[0, 1]}
                      label={{
                        value: "CAI",
                        angle: -90,
                        position: "insideLeft"
                      }}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="cai"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                    />

                  </LineChart>

                </div>

              </details>

            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                  Amino Acid Summary
                </summary>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {aminoAcidSummary.map(([aa, count]) => (
                    <div
                      key={aa}
                      className="rounded-lg border border-gray-200 bg-white p-4 text-center"
                    >
                      <div className="text-sm text-gray-500">AA</div>
                      <div className="text-lg font-bold text-slate-800">{aa}</div>
                      <div className="text-sm text-gray-500 mt-1">Count</div>
                      <div className="text-xl font-bold text-blue-600">{count}</div>
                    </div>
                  ))}
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