import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

type Mode = "sequence" | "id" | "entry"

export default function FastaDeduplicator() {

  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [report, setReport] = useState("")
  const [mode, setMode] = useState<Mode>("sequence")
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

      const id = header.replace(/^>/, "").split(/\s+/)[0]

      return { header, seq, id }

    })

  }

  function deduplicate() {

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

    const seen = new Set<string>()
    const kept: any[] = []
    let removed = 0

    for (const e of entries) {

      let key = ""

      if (mode === "sequence") key = e.seq
      if (mode === "id") key = e.id
      if (mode === "entry") key = `${e.header}_${e.seq}`

      if (seen.has(key)) {
        removed++
        continue
      }

      seen.add(key)
      kept.push(e)

    }

    const fastaOut = kept
      .map(k => `${k.header}\n${k.seq}`)
      .join("\n")

    setOutput(fastaOut)

    setReport(
      `Total sequences: ${entries.length}
Unique sequences: ${kept.length}
Duplicates removed: ${removed}`
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
    a.download = "deduplicated_sequences.fasta"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const loadExample = () => {

    setInput(`>seq1
ATGCGTACGT
>seq2
ATGCGTACGT
>seq3
TTGCGTACGA`)

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
      slug="fasta-deduplicator"
      category="FASTA"

      seoContent={
        <>
          <h2>Remove Duplicate Sequences from FASTA Datasets</h2>

          <p>
            FASTA datasets frequently contain duplicate sequences that can affect
            downstream bioinformatics analyses. Duplicate entries may appear due
            to sequencing artifacts, redundant database records, or the merging
            of datasets from multiple sources. Removing duplicates helps ensure
            that sequence collections remain clean, consistent, and suitable for
            reliable computational analysis.
          </p>

          <p>
            This FASTA deduplication tool allows researchers to quickly detect
            and remove duplicate entries from FASTA files directly in the browser.
            The tool supports multiple deduplication strategies, including
            removing duplicates by sequence content, by sequence identifier,
            or by identical FASTA entries.
          </p>

          <p>
            After processing the dataset, the tool generates a cleaned FASTA
            output along with a summary report showing the total number of
            sequences analyzed, the number of unique entries retained, and
            the number of duplicates removed. If additional dataset cleanup
            is required, you may also use the{" "}
            <Link to="/tools/sequence-cleaner">Sequence Cleaner</Link>{" "}
            or extract specific records using the{" "}
            <Link to="/tools/fasta-sequence-extractor">
              FASTA Sequence Extractor
            </Link>.
          </p>

          <p>
            FASTA deduplication is widely used in genome assembly pipelines,
            transcriptomics datasets, protein sequence databases, and
            metagenomics workflows. Removing redundant entries improves
            dataset quality and prevents bias in downstream sequence
            analysis or clustering tasks.
          </p>

          <p>
            Because the entire deduplication process runs locally in your
            browser, no sequence data is transmitted to external servers.
            This ensures complete privacy for sensitive biological datasets
            and unpublished sequencing results.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a FASTA dataset into the input field.</li>
          <li>Select the deduplication method such as sequence, sequence ID, or full FASTA entry.</li>
          <li>Click <strong>Remove Duplicates</strong>.</li>
          <li>The cleaned FASTA dataset will appear in the output panel.</li>
          <li>Review the deduplication report showing total sequences and duplicates removed.</li>
          <li>Copy or download the deduplicated FASTA file for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is FASTA deduplication?",
          answer:
            "FASTA deduplication is the process of removing identical or redundant entries from FASTA sequence datasets so that each unique sequence appears only once."
        },
        {
          question: "What is the difference between sequence and ID deduplication?",
          answer:
            "Sequence deduplication removes entries with identical nucleotide or protein sequences, while ID deduplication removes entries with identical sequence identifiers."
        },
        {
          question: "Can this tool process multi-FASTA files?",
          answer:
            "Yes. The deduplicator supports multi-FASTA input containing multiple sequences within a single dataset."
        },
        {
          question: "Does this tool modify the sequences?",
          answer:
            "No. The tool only removes duplicate entries and preserves the original sequence data and FASTA headers."
        },
        {
          question: "Is my FASTA dataset uploaded anywhere?",
          answer:
            "No. All deduplication processing happens locally in your browser to ensure that your sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Mode selector */}

        <div className="p-6 border-b border-gray-200 bg-gray-50">

          <label className="block text-gray-700 font-semibold mb-2">
            Deduplication Mode
          </label>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="px-4 py-2 border rounded-lg"
          >

            <option value="sequence">
              Remove duplicates by sequence
            </option>

            <option value="id">
              Remove duplicates by sequence ID
            </option>

            <option value="entry">
              Remove identical FASTA entries
            </option>

          </select>

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
            title="Deduplicated FASTA"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {/* Report */}

        {report && (

          <div className="p-6 border-t border-gray-200 bg-gray-50">

            <h3 className="font-semibold mb-2">
              Deduplication Report
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
            aria-label="Remove Duplicates 1"
            onClick={deduplicate}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Remove Duplicates
          </button>

          <button
            aria-label="Clear Remove Duplicates 1"
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