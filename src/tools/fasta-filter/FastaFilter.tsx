import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

export default function FastaFilter() {

  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [report, setReport] = useState("")

  const [minLength, setMinLength] = useState("")
  const [maxLength, setMaxLength] = useState("")
  const [minGC, setMinGC] = useState("")
  const [maxGC, setMaxGC] = useState("")
  const [keyword, setKeyword] = useState("")

  const [error, setError] = useState("")

  function parseFasta(text: string) {

    const entries = text.trim().split(/\n(?=>)/)

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

  function filter() {

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

    const minLen = Number(minLength) || 0
    const maxLen = Number(maxLength) || Infinity
    const minGc = Number(minGC) || 0
    const maxGc = Number(maxGC) || 100

    const results = entries.filter(e => {

      const length = e.seq.length
      const gc = gcContent(e.seq)

      if (length < minLen) return false
      if (length > maxLen) return false

      if (gc < minGc) return false
      if (gc > maxGc) return false

      if (keyword && !e.header.toLowerCase().includes(keyword.toLowerCase())) {
        return false
      }

      return true

    })

    if (results.length === 0) {
      setError("No sequences passed the filters")
      return
    }

    const fastaOut = results
      .map(r => `${r.header}\n${r.seq}`)
      .join("\n")

    setOutput(fastaOut)

    setReport(
      `Total sequences: ${entries.length}
Sequences passing filter: ${results.length}
Filtered out: ${entries.length - results.length}`
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
    a.download = "filtered_sequences.fasta"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const loadExample = () => {

    setInput(`>seq1 human
ATGCGTACGTAG
>seq2 bacteria
ATGCGTAGCTAGCTAGCT
>seq3 virus
ATGCGT`)

    setMinLength("8")
    setMaxLength("")
    setMinGC("")
    setMaxGC("")
    setKeyword("")

    setOutput("")
    setReport("")
    setError("")

  }

  const clearAll = () => {

    setInput("")
    setOutput("")
    setReport("")
    setError("")

    setMinLength("")
    setMaxLength("")
    setMinGC("")
    setMaxGC("")
    setKeyword("")

  }

  return (

    <ToolLayout
      badge="FASTA Tool"
      slug="fasta-filter"
      category="FASTA"

      seoContent={
        <>
          <h2>Filter FASTA Sequences by Length, GC Content, or Annotation</h2>

          <p>
            FASTA sequence filtering is an important preprocessing step in many
            bioinformatics workflows. Large sequence datasets often contain
            entries that do not meet specific criteria such as sequence length,
            GC composition, or annotation keywords. Applying filters helps
            researchers isolate sequences that are suitable for downstream
            analyses such as genome assembly, comparative genomics, or
            transcriptomics studies.
          </p>

          <p>
            This FASTA filtering tool allows users to select nucleotide
            sequences based on minimum and maximum length thresholds,
            GC content ranges, and optional header keywords. The tool scans
            each FASTA entry and keeps only sequences that satisfy all
            defined filtering conditions.
          </p>

          <p>
            After processing the dataset, the filtered sequences are returned
            as a clean FASTA file containing only the entries that match the
            specified criteria. A summary report shows the number of sequences
            analyzed, the number retained, and the number removed by the
            filtering rules. For additional dataset cleanup you may also use
            the{" "}
            <Link to="/tools/fasta-deduplicator">FASTA Deduplicator</Link>{" "}
            or extract specific records using the{" "}
            <Link to="/tools/fasta-sequence-extractor">
              FASTA Sequence Extractor
            </Link>.
          </p>

          <p>
            FASTA filtering is widely used in genome assembly pipelines,
            metagenomics analysis, transcriptomics datasets, and sequence
            database preparation. Removing unwanted sequences improves
            dataset quality and ensures that only relevant entries are
            included in downstream bioinformatics analysis.
          </p>

          <p>
            Because the entire filtering process runs locally in your browser,
            no sequence data is transmitted to external servers. This ensures
            complete privacy for sensitive biological datasets and
            unpublished sequencing results.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a FASTA dataset into the input field.</li>
          <li>Set the minimum and maximum sequence length if needed.</li>
          <li>Optionally define GC percentage limits.</li>
          <li>Enter a keyword to filter sequences by header annotation.</li>
          <li>Click <strong>Filter Sequences</strong>.</li>
          <li>The filtered FASTA dataset will appear in the output panel along with a filtering report.</li>
          <li>Copy or download the filtered sequences for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is FASTA sequence filtering?",
          answer:
            "FASTA filtering is the process of selecting sequences from a FASTA dataset that meet specific criteria such as sequence length, GC content, or annotation keywords."
        },
        {
          question: "Can I filter sequences by GC content?",
          answer:
            "Yes. The tool allows you to define minimum and maximum GC percentage thresholds to keep only sequences within the desired GC range."
        },
        {
          question: "Can I filter sequences using header keywords?",
          answer:
            "Yes. You can provide a keyword to keep only FASTA entries whose headers contain the specified text."
        },
        {
          question: "Does this tool support multi-FASTA datasets?",
          answer:
            "Yes. The filter works with multi-FASTA input containing multiple sequences in a single dataset."
        },
        {
          question: "Is my FASTA data uploaded anywhere?",
          answer:
            "No. All filtering operations run locally in your browser to ensure your sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Filters */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Minimum Length
            </label>

            <input
              type="number"
              value={minLength}
              onChange={(e) => setMinLength(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Maximum Length
            </label>

            <input
              type="number"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Header Keyword
            </label>

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Optional"
            />

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Minimum GC %
            </label>

            <input
              type="number"
              value={minGC}
              onChange={(e) => setMinGC(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Maximum GC %
            </label>

            <input
              type="number"
              value={maxGC}
              onChange={(e) => setMaxGC(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
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
            title="Filtered FASTA"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {report && (

          <div className="p-6 border-t border-gray-200 bg-gray-50">

            <h3 className="font-semibold mb-2">
              Filtering Report
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
            aria-label="Filter Sequences 1"
            onClick={filter}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Filter Sequences
          </button>

          <button
            aria-label="Clear Filter Sequences 1"
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