import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceListOutput from "../../components/SequenceListOutput"

import {
  parseFasta,
  cleanSequence,
  reverseComplement
} from "../../utils/sequenceUtils"

interface KmerRow {
  kmer: string
  count: number
  frequency: number
  percent: number
  expected: number
  obsExp: number
  gc: number
}

export default function KmerFrequencyCalculator(){

  const [input,setInput] = useState("")
  const [k,setK] = useState(3)
  const [collapseRC,setCollapseRC] = useState(false)

  const [rows,setRows] = useState<KmerRow[]>([])
  const [error,setError] = useState("")

  const canonical = (kmer:string) => {

    const rc = reverseComplement(kmer)

    return kmer < rc ? kmer : rc

  }

  const gcPercent = (kmer:string) => {

    const gc = (kmer.match(/[GC]/g) || []).length

    return (gc / kmer.length) * 100

  }

  const analyze = () => {

    setError("")
    setRows([])

    if(!input.trim()){
      setError("Please enter sequence data")
      return
    }

    const records = parseFasta(input)

    let seq = ""

    for(const r of records){
      seq += cleanSequence(r.sequence)
    }

    if(!seq.length){
      setError("No sequence detected")
      return
    }

    if(!/^[ACGTUN]+$/i.test(seq)){
      setError("Invalid characters detected")
      return
    }

    const counts = new Map<string,number>()

    let windows = 0

    for(let i=0;i<=seq.length-k;i++){

      let mer = seq.slice(i,i+k)

      if(mer.includes("N")) continue

      if(collapseRC){
        mer = canonical(mer)
      }

      counts.set(mer,(counts.get(mer) || 0)+1)

      windows++

    }

    const expectedProb = 1 / Math.pow(4,k)

    const results:KmerRow[] = []

    for(const [kmer,count] of counts){

      const freq = count / windows

      const percent = freq * 100

      const obsExp = freq / expectedProb

      results.push({
        kmer,
        count,
        frequency:freq,
        percent,
        expected:expectedProb,
        obsExp,
        gc:gcPercent(kmer)
      })

    }

    results.sort((a,b)=>b.frequency-a.frequency)

    setRows(results)

  }

  const handleCopy = async () => {

    const text = rows
      .map(r =>
        `${r.kmer}\t${r.count}\t${r.frequency}\t${r.percent}\t${r.obsExp}`
      )
      .join("\n")

    await navigator.clipboard.writeText(text)

  }

  const handleDownload = () => {

    const header = "kmer\tcount\tfrequency\tpercent\tobs_exp\n"

    const text = header + rows
      .map(r =>
        `${r.kmer}\t${r.count}\t${r.frequency}\t${r.percent}\t${r.obsExp}`
      )
      .join("\n")

    const blob = new Blob([text],{type:"text/plain"})

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")

    a.href = url
    a.download = "kmer_frequency.tsv"

    document.body.appendChild(a)

    a.click()

    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const loadExample = () => {

    setInput(
`>example
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG`
    )

  }

  const clearAll = () => {

    setInput("")
    setRows([])
    setError("")

  }

  return(

    <ToolLayout
  title="k-mer Frequency Calculator"
  description="Calculate normalized k-mer frequencies, expected probabilities and enrichment scores."
  badge="Sequence Analysis"
  slug="kmer-frequency-calculator"
  category="Sequence Analysis"

  seoContent={
  <>
    <h2>Calculate k-mer Frequencies and Enrichment in DNA and RNA Sequences</h2>

    <p>
      k-mer frequency analysis is widely used in genomics, transcriptomics,
      and computational biology to study patterns within nucleotide
      sequences. A k-mer is a short subsequence of length <em>k</em>
      extracted from a larger DNA or RNA sequence. By counting how often
      each k-mer appears, researchers can analyze sequence composition,
      detect motifs, and investigate genomic structure.
    </p>

    <p>
      This k-mer frequency calculator determines both the raw occurrence
      and normalized frequency of k-mers within nucleotide sequences.
      In addition to simple counts, the tool computes the expected
      probability of each k-mer and calculates the observed-to-expected
      (Obs/Exp) enrichment ratio. These metrics help identify k-mers
      that appear significantly more or less frequently than expected
      under a random nucleotide distribution.
    </p>

    <p>
      The calculator also reports GC composition for each k-mer and
      supports reverse-complement collapsing, which treats a k-mer and
      its reverse complement as the same sequence. This is particularly
      useful when analyzing double-stranded DNA where both strands carry
      equivalent biological information. For simpler counting tasks you
      may also use the{" "}
      <Link to="/tools/kmer-counter">k-mer Counter</Link>{" "}
      or perform more advanced diversity analysis with the{" "}
      <Link to="/tools/kmer-frequency-analyzer">
        k-mer Frequency Analyzer
      </Link>.
    </p>

    <p>
      All sequence analysis is performed directly within your browser.
      DNA or RNA sequences are processed locally and are never uploaded
      to external servers, ensuring privacy when working with genomic
      datasets.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste DNA or RNA sequences in FASTA format into the input panel.</li>
    <li>Choose the desired k-mer length.</li>
    <li>Optionally enable reverse-complement collapsing.</li>
    <li>Click <strong>Calculate k-mer Frequencies</strong>.</li>
    <li>Review counts, normalized frequencies, and enrichment scores.</li>
    <li>Copy or download the results for further analysis.</li>
  </ol>
}

faq={[
  {
    question: "What is a k-mer in sequence analysis?",
    answer:
      "A k-mer is a short subsequence of length k derived from a DNA or RNA sequence. For example, if k = 3, the sequence ATGCG contains the 3-mers ATG, TGC, and GCG."
  },
  {
    question: "What does the observed-to-expected (Obs/Exp) ratio mean?",
    answer:
      "The Obs/Exp ratio compares the observed frequency of a k-mer to the frequency expected under a random nucleotide model. Values greater than 1 indicate enrichment."
  },
  {
    question: "Why collapse reverse complements?",
    answer:
      "Collapsing reverse complements treats a k-mer and its reverse complement as the same sequence, which is appropriate when analyzing double-stranded DNA."
  },
  {
    question: "Can this tool analyze FASTA files?",
    answer:
      "Yes. The calculator accepts FASTA-formatted input and automatically extracts the sequence data for analysis."
  },
  {
    question: "Is my sequence data uploaded anywhere?",
    answer:
      "No. All k-mer calculations run locally in your browser to ensure that sequence data remains private."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Controls */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-4">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              k-mer length
            </label>

            <input
              type="number"
              value={k}
              min={1}
              max={12}
              onChange={(e)=>setK(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg w-full"
            />

          </div>

          <div className="flex items-end">

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={collapseRC}
                onChange={()=>setCollapseRC(!collapseRC)}
              />

              Collapse reverse complements

            </label>

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
            title="k-mer Frequencies"
            items={rows.map(r=>({

              header:r.kmer,

              meta:`Count ${r.count} | Freq ${r.frequency.toFixed(6)} | Obs/Exp ${r.obsExp.toFixed(2)}`,

              sequence:""

            }))}
            placeholder="k-mer frequencies will appear here..."
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">

            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5"/>

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Calculate k-mer Frequencies 1"
            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Calculate k-mer Frequencies
          </button>

          <button
          aria-label="Clear Calculate k-mer Frequencies 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4"/>
            Clear
          </button>

        </div>

      </div>

    </ToolLayout>

  )

}