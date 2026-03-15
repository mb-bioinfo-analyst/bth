import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

export default function FastaStats() {

  const [input,setInput] = useState("")
  const [output,setOutput] = useState("")
  const [error,setError] = useState("")

  const computeStats = () => {

    setError("")
    setOutput("")

    if(!input.trim()){
      setError("Please enter a sequence")
      return
    }

    const seq = input
      .replace(/^>.*$/gm,"")
      .replace(/\s/g,"")
      .toUpperCase()

    const A = (seq.match(/A/g)||[]).length
    const C = (seq.match(/C/g)||[]).length
    const G = (seq.match(/G/g)||[]).length
    const T = (seq.match(/T/g)||[]).length
    const N = (seq.match(/N/g)||[]).length

    const length = seq.length
    const gc = ((G+C)/length*100).toFixed(2)
    const at = ((A+T)/length*100).toFixed(2)

    const text =
`Length: ${length}
GC Content: ${gc}%
AT Content: ${at}%

Base Counts
A: ${A}
C: ${C}
G: ${G}
T: ${T}
N: ${N}`

    setOutput(text)

  }

  const loadExample = () => {

    setInput(`>example
ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAA`)

  }

  const clearAll = () => {

    setInput("")
    setOutput("")
    setError("")

  }

  const copy = async () => {

    await navigator.clipboard.writeText(output)

  }

  const download = () => {

    const blob = new Blob([output],{type:"text/plain"})
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "fasta_stats.txt"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  return (

    <ToolLayout
  title="FASTA Statistics"
  description="Calculate base composition, GC content and sequence length."
  badge="Sequence Tool"
  slug="fasta-stats"
  category="Sequence"

  seoContent={
  <>
    <h2>Calculate FASTA Sequence Statistics and Nucleotide Composition</h2>

    <p>
      FASTA sequence statistics provide essential insights into the
      composition and characteristics of nucleotide sequences. Basic
      metrics such as sequence length, GC content, AT content, and
      nucleotide counts are commonly used in genomics, transcriptomics,
      and molecular biology to evaluate sequence properties before
      performing downstream bioinformatics analyses.
    </p>

    <p>
      This FASTA statistics calculator analyzes nucleotide sequences
      and reports key composition metrics including total sequence
      length, counts of each nucleotide base (A, C, G, T, and N), and
      GC and AT percentages. These statistics help researchers assess
      sequence composition, identify potential biases, and verify the
      integrity of sequencing datasets.
    </p>

    <p>
      GC content is particularly important in genomics because it can
      influence DNA stability, gene expression patterns, and genome
      structure. Researchers frequently use GC composition to compare
      genomic regions, analyze genome assemblies, or evaluate sequencing
      quality. For more detailed composition analysis you may also use
      the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>{" "}
      or analyze GC percentage separately using the{" "}
      <Link to="/tools/gc-content">GC Content Calculator</Link>.
    </p>

    <p>
      The FASTA statistics tool runs entirely in your browser and
      processes sequence data locally. This ensures that biological
      sequences remain private and are never transmitted to external
      servers, making the tool suitable for analyzing unpublished or
      sensitive sequence datasets.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a nucleotide sequence or FASTA entry into the input panel.</li>
    <li>Click <strong>Compute Statistics</strong>.</li>
    <li>The tool will calculate sequence length, GC percentage, and AT percentage.</li>
    <li>Base counts for A, C, G, T, and N will also be displayed.</li>
    <li>Copy or download the statistics report for further analysis.</li>
  </ol>
}

faq={[
  {
    question: "What statistics does this FASTA tool calculate?",
    answer:
      "The tool calculates sequence length, GC content, AT content, and the counts of each nucleotide base including A, C, G, T, and N."
  },
  {
    question: "What is GC content in DNA sequences?",
    answer:
      "GC content is the percentage of nucleotides in a DNA sequence that are either guanine (G) or cytosine (C). It is an important measure of sequence composition in genomics."
  },
  {
    question: "Can this tool analyze sequences in FASTA format?",
    answer:
      "Yes. The calculator automatically detects FASTA headers and processes the sequence data to compute statistics."
  },
  {
    question: "Why is nucleotide composition important in bioinformatics?",
    answer:
      "Nucleotide composition helps researchers understand genome structure, sequence bias, and sequencing data quality before performing further analyses."
  },
  {
    question: "Is my sequence data uploaded to a server?",
    answer:
      "No. All sequence analysis is performed locally in your browser to ensure privacy and data security."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Input FASTA"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Sequence Statistics"
            onCopy={copy}
            onDownload={download}
          />

        </div>

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600"/>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t flex gap-4">

          <button
          aria-label="Compute Statistics 1"
            onClick={computeStats}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Compute Statistics
          </button>

          <button
          aria-label="Clear Compute Statistics 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4"/>
            Clear
          </button>

        </div>

      </div>

    </ToolLayout>

  )

}