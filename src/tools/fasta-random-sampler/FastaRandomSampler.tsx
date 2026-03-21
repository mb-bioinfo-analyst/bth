import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

type Mode = "count" | "percent"

export default function FastaRandomSampler() {

  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [report, setReport] = useState("")
  const [mode, setMode] = useState<Mode>("count")
  const [value, setValue] = useState("5")
  const [error, setError] = useState("")

  function parseFasta(text: string) {

    const entries = text
      .trim()
      .split(/\n(?=>)/)

    return entries

  }

  function sample() {

    setError("")
    setOutput("")
    setReport("")

    if (!input.trim()) {
      setError("Please paste FASTA sequences")
      return
    }

    const entries = parseFasta(input)

    if (entries.length === 0) {
      setError("No FASTA sequences detected")
      return
    }

    let sampleSize = 0

    if (mode === "count") {
      sampleSize = Number(value)
    }

    if (mode === "percent") {
      const percent = Number(value)
      sampleSize = Math.round(entries.length * percent / 100)
    }

    if (sampleSize <= 0) {
      setError("Sample size must be greater than 0")
      return
    }

    if (sampleSize > entries.length) {
      sampleSize = entries.length
    }

    // shuffle
    const shuffled = [...entries].sort(() => Math.random() - 0.5)

    const subset = shuffled.slice(0, sampleSize)

    const fastaOut = subset.join("\n")

    setOutput(fastaOut)

    setReport(
      `Total sequences: ${entries.length}
Sampled sequences: ${subset.length}`
    )

  }

  const handleCopy = async () => {

    await navigator.clipboard.writeText(output)

  }

  const handleDownload = () => {

    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "random_sample.fasta"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const loadExample = () => {

    setInput(`>seq1
ATGCGTACGT
>seq2
ATGCGTAGCT
>seq3
ATGCGTACGA
>seq4
ATGCGTAGGA
>seq5
ATGCGTACCC
>seq6
ATGCGTACAA`)

    setOutput("")
    setReport("")
    setError("")

  }

  const clearAll = () => {

    setInput("")
    setOutput("")
    setReport("")
    setError("")

  }

  return (

    <ToolLayout
      badge="FASTA Tool"
      slug="fasta-random-sampler"
      category="FASTA"

      seoContent={
        <>
          <h2>Randomly Sample Sequences from FASTA Files</h2>

          <p>
            Random sampling of FASTA sequences is a common preprocessing step
            in bioinformatics when working with very large sequence datasets.
            Researchers often need to generate smaller representative subsets
            for testing analysis pipelines, performing exploratory data
            analysis, or creating balanced datasets for computational
            experiments.
          </p>

          <p>
            This FASTA random sampler allows users to quickly select a subset
            of sequences from a multi-FASTA dataset. Sampling can be performed
            either by specifying a fixed number of sequences or by selecting
            a percentage of the total dataset. The tool randomly shuffles the
            FASTA entries and returns a sampled subset without modifying the
            underlying nucleotide or protein sequences.
          </p>

          <p>
            Random sequence sampling is frequently used in genomics,
            metagenomics, transcriptomics, and phylogenetic studies to reduce
            dataset size while preserving representative diversity. If you
            need to remove duplicate entries before sampling, you can also use
            the{" "}
            <Link to="/tools/fasta-deduplicator">FASTA Deduplicator</Link>{" "}
            or filter sequences by length or GC content with the{" "}
            <Link to="/tools/fasta-filter">FASTA Filter</Link>.
          </p>

          <p>
            The sampled output is returned as a valid FASTA file that can be
            directly used in downstream sequence analysis tools. Because all
            processing occurs locally in your browser, your biological sequence
            data remains private and is never transmitted to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a FASTA dataset into the input field.</li>
          <li>Select the sampling mode: number of sequences or percentage of the dataset.</li>
          <li>Enter the desired sampling value.</li>
          <li>Click <strong>Sample FASTA</strong>.</li>
          <li>The randomly sampled FASTA sequences will appear in the output panel.</li>
          <li>Review the sampling report showing the number of sequences selected.</li>
          <li>Copy or download the sampled FASTA dataset.</li>
        </ol>
      }

      faq={[
        {
          question: "What is FASTA random sampling?",
          answer:
            "FASTA random sampling selects a subset of sequences from a FASTA dataset using a random selection process while preserving the original sequence entries."
        },
        {
          question: "Can I sample by percentage instead of sequence count?",
          answer:
            "Yes. The tool allows sampling either by a fixed number of sequences or by specifying a percentage of the dataset."
        },
        {
          question: "Does sampling modify the sequences?",
          answer:
            "No. The tool only selects a subset of sequences and does not alter the sequence data."
        },
        {
          question: "Can this tool work with multi-FASTA files?",
          answer:
            "Yes. The sampler supports multi-FASTA datasets containing multiple sequence entries."
        },
        {
          question: "Is my FASTA data uploaded anywhere?",
          answer:
            "No. All sampling operations are performed locally in your browser to ensure complete data privacy."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Sampling Mode
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="px-4 py-2 border rounded-lg"
            >

              <option value="count">
                Number of sequences
              </option>

              <option value="percent">
                Percentage of sequences
              </option>

            </select>

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Value
            </label>

            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full"
            />

          </div>

        </div>

        {/* Input Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="FASTA Input"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Random FASTA Sample"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {report && (

          <div className="p-6 border-t border-gray-200 bg-gray-50">

            <h3 className="font-semibold mb-2">
              Sampling Report
            </h3>

            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {report}
            </pre>

          </div>

        )}

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-600" />

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        {/* Buttons */}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
            aria-label="Sample FASTA 1"
            onClick={sample}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Sample FASTA
          </button>

          <button
            aria-label="Clear Sample FASTA 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>

        </div>

      </div>

      <div className="mt-10 p-6 md:p-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-sm">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* LEFT CONTENT */}
          <div className="space-y-4 max-w-xl">

            <h3 className="text-xl font-semibold text-gray-900">
              Explore the Complete FASTA Toolkit
            </h3>

            <p className="text-sm text-gray-600">
              Go beyond basic sequence handling. Manage, clean, and analyze FASTA files with a full suite of powerful tools — all in one place.
            </p>

            {/* FEATURES */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">

              <span>• Header extraction & editing</span>
              <span>• Filtering & deduplication</span>
              <span>• Sorting & random sampling</span>
              <span>• FASTA splitting & merging</span>
              <span>• Sequence formatting</span>
              <span>• Dataset statistics</span>

            </div>

          </div>

          {/* CTA */}
          <Link
            to="/tools/fasta-toolkit"
            className="group flex flex-col items-center justify-center min-w-[180px] px-8 py-5 rounded-2xl 
                 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg 
                 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 
                 hover:scale-[1.03]"
          >

            <span className="text-base">
              Open Toolkit
            </span>

            <span className="text-2xl leading-none mt-2 transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>

          </Link>

        </div>

      </div>

    </ToolLayout>

  )

}