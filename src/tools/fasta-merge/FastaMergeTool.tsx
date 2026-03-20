import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceOutput from "../../components/SequenceOutput"
import SequenceInput from "../../components/SequenceInput";


export default function FastaMergeTool() {

  const [input1, setInput1] = useState("")
  const [input2, setInput2] = useState("")
  const [output, setOutput] = useState("")
  const [report, setReport] = useState("")

  const [removeDuplicates, setRemoveDuplicates] = useState(false)
  const [prefix, setPrefix] = useState("")
  const [suffix, setSuffix] = useState("")

  const [error, setError] = useState("")

  function parseFasta(text: string) {

    return text
      .trim()
      .split(/\n(?=>)/)

  }

  function merge() {

    setError("")
    setOutput("")
    setReport("")

    if (!input1.trim() && !input2.trim()) {
      setError("Please paste at least one FASTA dataset")
      return
    }

    const fasta1 = parseFasta(input1)
    const fasta2 = parseFasta(input2)

    let merged = [...fasta1, ...fasta2]

    if (removeDuplicates) {

      const seen = new Set<string>()

      merged = merged.filter(entry => {

        const seq = entry
          .split("\n")
          .slice(1)
          .join("")
          .replace(/\s/g, "")

        if (seen.has(seq)) {
          return false
        }

        seen.add(seq)
        return true

      })

    }

    if (prefix || suffix) {

      merged = merged.map(entry => {

        const lines = entry.split("\n")

        let header = lines[0].replace(/^>/, "")

        header = `${prefix}${header}${suffix}`

        return `>${header}\n${lines.slice(1).join("\n")}`

      })

    }

    const fastaOut = merged.join("\n")

    setOutput(fastaOut)

    setReport(
      `Dataset 1 sequences: ${fasta1.length}
Dataset 2 sequences: ${fasta2.length}
Merged sequences: ${merged.length}`
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
    a.download = "merged_sequences.fasta"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const loadExample = () => {

    setInput1(`>seq1
ATGCGTACGT
>seq2
ATGCGTAGCT`)

    setInput2(`>seq3
ATGCGTACGA
>seq4
ATGCGTAGGA`)

    setOutput("")
    setReport("")
    setError("")

  }

  const clearAll = () => {

    setInput1("")
    setInput2("")
    setOutput("")
    setReport("")
    setError("")
    setPrefix("")
    setSuffix("")

  }

  return (

    <ToolLayout
      badge="FASTA Tool"
      slug="fasta-merge"
      category="FASTA"

      seoContent={
        <>
          <h2>Merge Multiple FASTA Files into a Single Dataset</h2>

          <p>
            FASTA files are widely used in bioinformatics to store nucleotide
            and protein sequence data. In many analysis workflows researchers
            need to combine multiple FASTA datasets into a single file before
            performing downstream analyses such as sequence alignment,
            phylogenetic reconstruction, genome annotation, or database
            indexing. Consolidating sequence datasets ensures that all
            sequences can be processed together by bioinformatics software.
          </p>

          <p>
            This FASTA merge tool allows users to quickly combine multiple
            FASTA datasets into one consolidated FASTA file. The tool preserves
            the original nucleotide or protein sequences while appending all
            entries into a single dataset suitable for downstream analysis
            pipelines.
          </p>

          <p>
            Additional options allow users to remove duplicate sequences and
            modify FASTA headers by adding prefixes or suffixes. These features
            are particularly useful when merging datasets from different
            experiments, sequencing runs, or biological databases. If you need
            to remove redundant entries before merging, you can also use the{" "}
            <Link to="/tools/fasta-deduplicator">FASTA Deduplicator</Link>{" "}
            or edit identifiers using the{" "}
            <Link to="/tools/fasta-header-editor">FASTA Header Editor</Link>.
          </p>

          <p>
            FASTA merging is frequently used when integrating datasets from
            multiple experiments, combining genome assemblies, or preparing
            sequence collections for large-scale genomics analyses. Because
            this tool runs entirely in your browser, your biological sequence
            data remains private and is never transmitted to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste the first FASTA dataset into the first input panel.</li>
          <li>Paste the second FASTA dataset into the second input panel.</li>
          <li>Optionally add a prefix or suffix to FASTA headers.</li>
          <li>Enable duplicate removal if you want to eliminate identical sequences.</li>
          <li>Click <strong>Merge FASTA</strong>.</li>
          <li>The merged FASTA dataset will appear in the output panel.</li>
          <li>Copy or download the combined FASTA file for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What does a FASTA merge tool do?",
          answer:
            "A FASTA merge tool combines multiple FASTA sequence datasets into a single FASTA file while preserving the original sequence entries."
        },
        {
          question: "Can duplicate sequences be removed during merging?",
          answer:
            "Yes. The tool includes an option to remove duplicate sequences when merging FASTA datasets."
        },
        {
          question: "Will the sequences be modified during merging?",
          answer:
            "No. The nucleotide or protein sequences remain unchanged. Only optional header modifications such as prefixes or suffixes may be applied."
        },
        {
          question: "Can I merge multi-FASTA files?",
          answer:
            "Yes. The tool supports merging multi-FASTA datasets containing multiple sequence entries."
        },
        {
          question: "Is my sequence data uploaded anywhere?",
          answer:
            "No. All FASTA merging operations are performed locally in your browser to ensure that your biological sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Header Prefix
            </label>

            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Optional"
            />

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Header Suffix
            </label>

            <input
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Optional"
            />

          </div>

          <label className="flex items-center gap-2 mt-8">

            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={() => setRemoveDuplicates(!removeDuplicates)}
            />

            Remove duplicate sequences

          </label>

        </div>

        {/* Input */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          {/* <div className="p-6">

            <label className="block font-semibold mb-2">
              FASTA Dataset 1
            </label>

            <textarea
              value={input1}
              onChange={(e)=>setInput1(e.target.value)}
              className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
            />

          </div>

          <div className="p-6">

            <label className="block font-semibold mb-2">
              FASTA Dataset 2
            </label>

            <textarea
              value={input2}
              onChange={(e)=>setInput2(e.target.value)}
              className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
            />

          </div> */}

          <SequenceInput
            value={input1}
            onChange={setInput1}
            label="FASTA Input"
            onLoadExample={loadExample}
          />

          <SequenceInput
            value={input2}
            onChange={setInput2}
            label="FASTA Input"
            onLoadExample={loadExample}
          />
        </div>

        {/* Output */}

        <div className="border-t border-gray-200">

          <SequenceOutput
            value={output}
            title="Merged FASTA"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {report && (

          <div className="p-6 border-t border-gray-200 bg-gray-50">

            <h3 className="font-semibold mb-2">
              Merge Report
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
            aria-label="Merge FASTA 1"
            onClick={merge}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Merge FASTA
          </button>

          <button
            aria-label="Clear Merge FASTA 1"
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