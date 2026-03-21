import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

type SortMode = "length" | "gc" | "alphabetical"
type Order = "asc" | "desc"

export default function FastaSequenceSorter() {

  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [report, setReport] = useState("")

  const [mode, setMode] = useState<SortMode>("length")
  const [order, setOrder] = useState<Order>("desc")

  const [error, setError] = useState("")

  function parseFasta(text: string) {

    const entries = text
      .trim()
      .split(/\n(?=>)/)

    return entries.map(entry => {

      const lines = entry.split("\n")

      const header = lines[0]

      const seq = lines
        .slice(1)
        .join("")
        .replace(/\s/g, "")
        .toUpperCase()

      return { header, seq }

    })

  }

  function gcContent(seq: string) {

    const gc = (seq.match(/[GC]/g) || []).length
    return (gc / seq.length) * 100

  }

  function sortSequences() {

    setError("")
    setOutput("")
    setReport("")

    if (!input.trim()) {
      setError("Please paste FASTA sequences")
      return
    }

    const entries = parseFasta(input)

    if (entries.length === 0) {
      setError("No FASTA entries detected")
      return
    }

    let sorted = [...entries]

    if (mode === "length") {

      sorted.sort((a, b) => a.seq.length - b.seq.length)

    }

    if (mode === "gc") {

      sorted.sort((a, b) => gcContent(a.seq) - gcContent(b.seq))

    }

    if (mode === "alphabetical") {

      sorted.sort((a, b) => {

        const ha = a.header.replace(/^>/, "").toLowerCase()
        const hb = b.header.replace(/^>/, "").toLowerCase()

        return ha.localeCompare(hb)

      })

    }

    if (order === "desc") {
      sorted.reverse()
    }

    const fastaOut = sorted
      .map(e => `${e.header}\n${e.seq}`)
      .join("\n")

    setOutput(fastaOut)

    setReport(
      `Total sequences: ${entries.length}
Sorting mode: ${mode}
Order: ${order === "asc" ? "Ascending" : "Descending"}`
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
    a.download = "sorted_sequences.fasta"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const loadExample = () => {

    setInput(`>seq3
ATGCGT
>seq1
ATGCGTACGTAG
>seq2
ATGCGTAC`)

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
      slug="fasta-sequence-sorter"
      category="FASTA"

      seoContent={
        <>
          <h2>Sort FASTA Sequences by Length, GC Content, or Identifier</h2>

          <p>
            FASTA files often contain large collections of biological sequences
            such as DNA, RNA, or proteins. In many bioinformatics workflows it
            is useful to organize sequences based on specific characteristics
            such as sequence length, GC composition, or alphabetical order of
            identifiers. Sorting FASTA entries can help researchers quickly
            inspect datasets, prioritize sequences, or prepare structured
            inputs for downstream analysis pipelines.
          </p>

          <p>
            This FASTA sequence sorter allows users to reorganize multi-FASTA
            datasets using several common sorting criteria. Sequences can be
            ordered by sequence length, GC content percentage, or
            alphabetically according to the FASTA header. Both ascending and
            descending sorting modes are supported, allowing flexible dataset
            organization for different analytical tasks.
          </p>

          <p>
            Sorting sequences by length or GC content can be useful when
            exploring genome assemblies, transcriptomic datasets, or
            metagenomic sequence collections where sequence composition may
            vary widely. Alphabetical sorting of headers can help standardize
            datasets before comparison or integration with other FASTA files.
            You can also calculate GC composition using the{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
            or filter datasets using the{" "}
            <Link to="/tools/fasta-filter">FASTA Filter</Link>.
          </p>

          <p>
            The tool processes FASTA data directly in your browser and returns
            a correctly formatted FASTA file containing the sorted sequences.
            Because all processing occurs locally, your biological sequence
            data remains private and is never uploaded to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a multi-FASTA dataset into the input panel.</li>
          <li>Select the sorting method such as sequence length, GC content, or alphabetical header order.</li>
          <li>Choose the desired sorting order (ascending or descending).</li>
          <li>Click <strong>Sort FASTA</strong>.</li>
          <li>The sorted FASTA dataset will appear in the output panel.</li>
          <li>Review the results and copy or download the sorted FASTA file.</li>
        </ol>
      }

      faq={[
        {
          question: "What does a FASTA sequence sorter do?",
          answer:
            "A FASTA sequence sorter reorganizes sequence entries in a FASTA dataset according to selected criteria such as sequence length, GC content, or alphabetical header order."
        },
        {
          question: "Can sequences be sorted by GC content?",
          answer:
            "Yes. The tool calculates the GC percentage of each sequence and sorts entries accordingly."
        },
        {
          question: "Will sorting modify the sequence data?",
          answer:
            "No. The sorter only changes the order of FASTA entries and does not alter the nucleotide or protein sequences."
        },
        {
          question: "Does this tool support multi-FASTA files?",
          answer:
            "Yes. The sorter works with multi-FASTA datasets containing multiple sequence entries."
        },
        {
          question: "Is my FASTA dataset uploaded anywhere?",
          answer:
            "No. All sorting operations are performed locally in your browser to ensure complete data privacy."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Sorting options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Sort By
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as SortMode)}
              className="px-4 py-2 border rounded-lg w-full"
            >

              <option value="length">
                Sequence Length
              </option>

              <option value="gc">
                GC Content
              </option>

              <option value="alphabetical">
                Alphabetical Header
              </option>

            </select>

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Order
            </label>

            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as Order)}
              className="px-4 py-2 border rounded-lg w-full"
            >

              <option value="asc">
                Ascending
              </option>

              <option value="desc">
                Descending
              </option>

            </select>

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
            title="Sorted FASTA"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {report && (

          <div className="p-6 border-t border-gray-200 bg-gray-50">

            <h3 className="font-semibold mb-2">
              Sorting Report
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
            aria-label="Sort FASTA 1"
            onClick={sortSequences}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Sort FASTA
          </button>

          <button
            aria-label="Clear Sort FASTA 1"
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