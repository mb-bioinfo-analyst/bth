import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

import { speciesCodonUsage, Species } from "../../data/codonTables"

import {
  InputMode,
  OptimizationStrategy,
  cleanInputSequence,
  countHomopolymerMax,
  estimateAdaptationScore,
  gcPercent,
  isValidDna,
  isValidProtein,
  optimizeDnaSequence,
  optimizeProteinSequence,
  parseInputRecords,
  translateDna,
  wrapFasta
} from "../../utils/codonOptimizationUtils"


const speciesList = Object.keys(speciesCodonUsage) as Species[]

type OptimizationRow = {
  position: number
  aminoAcid: string
  originalCodon?: string
  optimizedCodon: string
  originalFrequency?: number
  optimizedFrequency: number
}

export default function CodonOptimizationTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const [mode, setMode] = useState<InputMode>("dna")
  const [species, setSpecies] = useState<Species>("ecoli")
  const [strategy, setStrategy] = useState<OptimizationStrategy>("max")
  const [outputAsFasta, setOutputAsFasta] = useState(true)

  const [recordCount, setRecordCount] = useState(0)
  const [inputLength, setInputLength] = useState(0)
  const [optimizedLength, setOptimizedLength] = useState(0)
  const [inputGc, setInputGc] = useState(0)
  const [optimizedGc, setOptimizedGc] = useState(0)
  const [inputAdaptation, setInputAdaptation] = useState(0)
  const [optimizedAdaptation, setOptimizedAdaptation] = useState(0)
  const [maxHomopolymer, setMaxHomopolymer] = useState(0)
  const [proteinPreview, setProteinPreview] = useState("")
  const [rows, setRows] = useState<OptimizationRow[]>([])

  const analyze = () => {
    setError("")
    setOutput("")
    setAnalysisComplete(false)
    setRows([])

    if (!input.trim()) {
      setError(`Please enter a ${mode === "dna" ? "coding DNA" : "protein"} sequence`)
      return
    }

    const records = parseInputRecords(input, mode)

    if (records.length === 0) {
      setError("No valid input detected")
      return
    }

    const combinedInputLength = records.reduce((sum, r) => sum + r.sequence.length, 0)

    if (mode === "dna") {
      for (const record of records) {
        if (!isValidDna(record.sequence)) {
          setError("DNA input contains invalid characters. Only A/C/G/T/N are allowed.")
          return
        }

        if (record.sequence.length < 3) {
          setError("DNA sequence must contain at least one codon.")
          return
        }
      }
    } else {
      for (const record of records) {
        if (!isValidProtein(record.sequence)) {
          setError("Protein input contains invalid characters. Use standard amino acid letters only.")
          return
        }
      }
    }

    const allOutputs: string[] = []
    const allRows: OptimizationRow[] = []
    let optimizedCombined = ""
    let proteinCombined = ""

    records.forEach((record, idx) => {
      if (mode === "dna") {
        const clean = cleanInputSequence(record.sequence, "dna")
        const protein = translateDna(clean)
        const result = optimizeDnaSequence(clean, species, strategy)

        proteinCombined += protein
        optimizedCombined += result.optimized

        result.choices.forEach(choice => {
          allRows.push({
            position: choice.position,
            aminoAcid: choice.aminoAcid,
            originalCodon: choice.originalCodon,
            optimizedCodon: choice.optimizedCodon,
            originalFrequency: choice.originalFrequency,
            optimizedFrequency: choice.optimizedFrequency
          })
        })

        allOutputs.push(
          outputAsFasta
            ? wrapFasta(`${record.header}_optimized_${species}`, result.optimized)
            : result.optimized
        )
      } else {
        const clean = cleanInputSequence(record.sequence, "protein")
        const result = optimizeProteinSequence(clean, species, strategy)

        proteinCombined += clean
        optimizedCombined += result.optimized

        result.choices.forEach(choice => {
          allRows.push({
            position: choice.position,
            aminoAcid: choice.aminoAcid,
            optimizedCodon: choice.optimizedCodon,
            optimizedFrequency: choice.optimizedFrequency
          })
        })

        allOutputs.push(
          outputAsFasta
            ? wrapFasta(`${record.header}_optimized_${species}`, result.optimized)
            : result.optimized
        )
      }

      if (idx < records.length - 1 && !outputAsFasta) {
        allOutputs.push("")
      }
    })

    const inputDnaForScore =
      mode === "dna"
        ? records.map(r => cleanInputSequence(r.sequence, "dna")).join("")
        : ""

    setRecordCount(records.length)
    setInputLength(combinedInputLength)
    setOptimizedLength(optimizedCombined.length)
    setInputGc(mode === "dna" ? gcPercent(inputDnaForScore) : 0)
    setOptimizedGc(gcPercent(optimizedCombined))
    setInputAdaptation(mode === "dna" ? estimateAdaptationScore(inputDnaForScore, species) : 0)
    setOptimizedAdaptation(estimateAdaptationScore(optimizedCombined, species))
    setMaxHomopolymer(countHomopolymerMax(optimizedCombined))
    setProteinPreview(proteinCombined.slice(0, 120))
    setRows(allRows)
    setOutput(allOutputs.join("\n"))
    setAnalysisComplete(true)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = outputAsFasta ? "codon_optimized.fasta" : "codon_optimized.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  const handleCopyTable = async () => {
    const header = mode === "dna"
      ? "position\tamino_acid\toriginal_codon\toptimized_codon\toriginal_frequency\toptimized_frequency"
      : "position\tamino_acid\toptimized_codon\toptimized_frequency"

    const lines = rows.map(row =>
      mode === "dna"
        ? `${row.position}\t${row.aminoAcid}\t${row.originalCodon || ""}\t${row.optimizedCodon}\t${(row.originalFrequency ?? 0).toFixed(6)}\t${row.optimizedFrequency.toFixed(6)}`
        : `${row.position}\t${row.aminoAcid}\t${row.optimizedCodon}\t${row.optimizedFrequency.toFixed(6)}`
    )

    await navigator.clipboard.writeText([header, ...lines].join("\n"))
  }

  const loadExample = () => {
    if (mode === "dna") {
      setInput(`>example_cds
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG`)
    } else {
      setInput(`>example_protein
MAIVMGR*KGAR*`)
    }

    setOutput("")
    setError("")
    setAnalysisComplete(false)
    setRows([])
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
    setAnalysisComplete(false)
    setRows([])
    setRecordCount(0)
    setInputLength(0)
    setOptimizedLength(0)
    setInputGc(0)
    setOptimizedGc(0)
    setInputAdaptation(0)
    setOptimizedAdaptation(0)
    setMaxHomopolymer(0)
    setProteinPreview("")
  }

  const changedCodons = useMemo(() => {
    return rows.filter(row => row.originalCodon && row.originalCodon !== row.optimizedCodon).length
  }, [rows])

  return (
    <ToolLayout

      badge="Sequence Engineering"
      slug="codon-optimization"
      category="Sequence Engineering"

      seoContent={
        <>
          <h2>Codon Optimization for Gene Expression and Synthetic Biology</h2>

          <p>
            Codon optimization is an important technique in molecular biology and
            synthetic biology used to improve protein expression in a specific host
            organism. Although multiple codons encode the same amino acid, different
            organisms preferentially use certain codons. This phenomenon is known as
            <strong> codon usage bias</strong>, and adapting a gene sequence to match the
            preferred codons of the host organism can significantly increase translation
            efficiency and protein yield.
          </p>

          <p>
            This codon optimization tool redesigns coding DNA sequences or reverse
            translates protein sequences using host-specific codon usage tables.
            By selecting codons that are commonly used in the target organism,
            the optimized sequence can improve ribosome translation efficiency,
            reduce translational pauses, and enhance recombinant protein production.
          </p>

          <p>
            The optimizer supports multiple strategies including maximum frequency
            codon selection, balanced codon usage, and GC-aware optimization to
            maintain stable nucleotide composition. During optimization the tool
            also evaluates several sequence properties such as GC content,
            codon adaptation score, homopolymer runs, and translation previews
            to help researchers assess sequence quality before gene synthesis.
          </p>

          <p>
            Researchers can further analyze optimized sequences using additional
            bioinformatics utilities such as the{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
            to evaluate nucleotide composition or the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>{" "}
            to examine base frequencies and sequence characteristics.
          </p>

          <p>
            Because the entire analysis runs locally in your browser,
            no sequence data is uploaded to a server. This ensures complete
            privacy for sensitive data such as unpublished genes,
            synthetic constructs, or proprietary expression systems.
          </p>

          <p>
            Codon optimization is widely used in recombinant protein expression,
            synthetic gene design, vaccine development, metabolic engineering,
            and heterologous expression systems across biotechnology
            and biomedical research.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a coding DNA sequence or protein sequence into the input box.</li>
          <li>Select the target host organism for codon usage.</li>
          <li>Choose an optimization strategy such as maximum usage or GC-aware optimization.</li>
          <li>Click <strong>Optimize Codons</strong>.</li>
          <li>The optimized DNA sequence will appear instantly along with statistics.</li>
          <li>Copy or download the optimized sequence for cloning or gene synthesis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is codon optimization?",
          answer:
            "Codon optimization is the process of modifying a DNA sequence to use codons that are preferred by a specific host organism in order to improve protein expression."
        },
        {
          question: "Why is codon optimization important?",
          answer:
            "Different organisms prefer different codons for the same amino acid. Optimizing codons for a host organism can increase translation efficiency and protein yield."
        },
        {
          question: "Can this tool reverse translate protein sequences?",
          answer:
            "Yes. The tool can convert protein sequences into optimized coding DNA sequences using host-specific codon usage tables."
        },
        {
          question: "Does this tool calculate codon adaptation metrics?",
          answer:
            "Yes. The tool estimates codon adaptation scores, GC content, homopolymer runs, and provides optimization statistics."
        },
        {
          question: "Is my sequence uploaded to a server?",
          answer:
            "No. All codon optimization calculations are performed locally in your browser to ensure full privacy."
        }
      ]}

    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-wrap items-end gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Input Type
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as InputMode)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="dna">Coding DNA</option>
              <option value="protein">Protein</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Host Species
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Strategy
            </label>

            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as OptimizationStrategy)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="max">Max usage</option>
              <option value="balanced">Balanced top codons</option>
              <option value="gc-low">GC-aware low</option>
              <option value="gc-high">GC-aware high</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={outputAsFasta}
              onChange={() => setOutputAsFasta(!outputAsFasta)}
            />
            Output as FASTA
          </label>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={input}
            onChange={setInput}
            label={mode === "dna" ? "Coding DNA / Multi-FASTA" : "Protein / Multi-FASTA"}
            onLoadExample={loadExample}
            fileLabel={mode === "dna"
              ? "Drag & drop FASTA / TXT coding DNA files"
              : "Drag & drop FASTA / TXT protein files"}
            accept={mode === "dna"
              ? ".fasta,.fa,.fna,.txt"
              : ".fasta,.fa,.faa,.txt"}
            placeholder={mode === "dna"
              ? "Paste coding DNA or FASTA data..."
              : "Paste protein sequence or FASTA data..."}
          />

          <SequenceOutput
            value={output}
            title="Optimized Sequence"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
            aria-label="Optimize Codons"

            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Optimize Codons
          </button>

          <button
            aria-label="Clear Codons"
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
                Optimization Summary
              </h2>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Records</div>
                <div className="text-2xl font-bold text-blue-600">{recordCount}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Input Length</div>
                <div className="text-2xl font-bold text-blue-600">{inputLength}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Optimized Length</div>
                <div className="text-2xl font-bold text-blue-600">{optimizedLength}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Changed Codons</div>
                <div className="text-2xl font-bold text-blue-600">{changedCodons}</div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Input Adaptation</div>
                <div className="text-2xl font-bold text-blue-600">{inputAdaptation.toFixed(3)}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Optimized Adaptation</div>
                <div className="text-2xl font-bold text-blue-600">{optimizedAdaptation.toFixed(3)}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Input GC%</div>
                <div className="text-2xl font-bold text-blue-600">{inputGc.toFixed(2)}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Optimized GC%</div>
                <div className="text-2xl font-bold text-blue-600">{optimizedGc.toFixed(2)}</div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-4 text-center">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Max Homopolymer Run</div>
                <div className="text-2xl font-bold text-blue-600">{maxHomopolymer}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Protein Preview</div>
                <div className="text-sm font-mono text-slate-800 break-all mt-2">
                  {proteinPreview || "-"}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <details className="group" open>
                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                  Codon Optimization Table
                </summary>

                <div className="mt-4">
                  <div className="flex justify-end mb-3">
                    <button
                      aria-label="Copy Codons Table "
                      onClick={handleCopyTable}
                      className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                    >
                      Copy Table
                    </button>
                  </div>

                  <div className="max-h-[28rem] overflow-auto rounded-lg border border-gray-200 bg-white">
                    {!rows.length ? (
                      <div className="p-6 text-sm text-gray-500">
                        Optimization details will appear here...
                      </div>
                    ) : (
                      <>
                        <div className={`grid ${mode === "dna" ? "grid-cols-6" : "grid-cols-4"} border-b bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700`}>
                          <div>Pos</div>
                          <div>AA</div>
                          {mode === "dna" && <div>Original</div>}
                          <div>Optimized</div>
                          {mode === "dna" && <div>Orig Freq</div>}
                          <div>Opt Freq</div>
                        </div>

                        {rows.map((row, idx) => (
                          <div
                            key={`${row.position}-${row.optimizedCodon}-${idx}`}
                            className={`grid ${mode === "dna" ? "grid-cols-6" : "grid-cols-4"} px-4 py-2 text-sm border-b last:border-b-0`}
                          >
                            <div>{row.position}</div>
                            <div>{row.aminoAcid}</div>
                            {mode === "dna" && <div className="font-mono">{row.originalCodon || "-"}</div>}
                            <div className="font-mono text-blue-700">{row.optimizedCodon}</div>
                            {mode === "dna" && <div>{(row.originalFrequency ?? 0).toFixed(4)}</div>}
                            <div>{row.optimizedFrequency.toFixed(4)}</div>
                          </div>
                        ))}
                      </>
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
