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

  const [inputs, setInputs] = useState<string[]>(["", ""])

  const [removeDuplicates, setRemoveDuplicates] = useState(false)
  const [prefix, setPrefix] = useState("")
  const [suffix, setSuffix] = useState("")

  const [error, setError] = useState("")

  function updateInput(index: number, value: string) {
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
  }

  function parseFasta(text: string) {

    return text
      .trim()
      .split(/\n(?=>)/)

  }

  function merge() {

    setError("")
    setOutput("")
    setReport("")

    // 🔥 use dynamic inputs
    const validInputs = inputs.filter(i => i.trim())

    if (validInputs.length === 0) {
      setError("Please paste at least one FASTA dataset")
      return
    }

    const parsed = validInputs.map(parseFasta)

    let merged = parsed.flat()

    const totalSequences = merged.length

    // -------------------------
    // DEDUPLICATION
    // -------------------------
    if (removeDuplicates) {

      const seen = new Set<string>()

      merged = merged.filter(entry => {

        const seq = entry
          .split("\n")
          .slice(1)
          .join("")
          .replace(/\s/g, "")
          .toUpperCase() // 🔥 important fix

        if (seen.has(seq)) return false

        seen.add(seq)
        return true

      })
    }

    // -------------------------
    // HEADER MODIFICATION
    // -------------------------
    if (prefix || suffix) {

      merged = merged.map(entry => {

        const lines = entry.split("\n")

        let header = lines[0].replace(/^>/, "")

        header = `${prefix}${header}${suffix}`

        return `>${header}\n${lines.slice(1).join("\n")}`

      })
    }

    // -------------------------
    // OUTPUT
    // -------------------------
    const fastaOut = merged.join("\n")

    setOutput(fastaOut)

    setReport(
      `Input files: ${validInputs.length}
Total sequences: ${totalSequences}
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

       {/*  <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <div className="p-6">

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
          <div className="space-y-4">

          {inputs.map((input, i) => (

            <div key={i} className="relative">

              <SequenceInput
                value={input}
                onChange={(val) => updateInput(i, val)}
                label={`FASTA Input ${i + 1}`}
              />

              {inputs.length > 1 && (
                <button
                  onClick={() => {
                    const newInputs = inputs.filter((_, idx) => idx !== i)
                    setInputs(newInputs)
                  }}
                  className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded"
                >
                  Remove
                </button>
              )}

            </div>

          ))}

          <button
            onClick={() => setInputs([...inputs, ""])}
            className="w-full py-2 border border-dashed rounded-lg text-gray-600 hover:bg-gray-50"
          >
            + Add another FASTA file
          </button>

        </div>

          {/* <SequenceInput
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
          /> */}
        {/* </div> */}

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