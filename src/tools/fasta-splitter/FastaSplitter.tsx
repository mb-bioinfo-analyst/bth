import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import JSZip from "jszip"

type Mode = "perFile" | "numFiles"

export default function FastaSplitter(){

  const [input,setInput] = useState("")
  const [mode,setMode] = useState<Mode>("perFile")
  const [value,setValue] = useState("10")
  const [report,setReport] = useState("")
  const [error,setError] = useState("")

  function parseFasta(text:string){

    return text
      .trim()
      .split(/\n(?=>)/)

  }

  async function split(){

    setError("")
    setReport("")

    if(!input.trim()){
      setError("Please paste FASTA sequences")
      return
    }

    const entries = parseFasta(input)

    if(entries.length === 0){
      setError("No FASTA sequences detected")
      return
    }

    const zip = new JSZip()

    let chunks:string[][] = []

    if(mode === "perFile"){

      const perFile = Number(value)

      for(let i=0;i<entries.length;i+=perFile){

        chunks.push(entries.slice(i,i+perFile))

      }

    }

    if(mode === "numFiles"){

      const numFiles = Number(value)

      const size = Math.ceil(entries.length / numFiles)

      for(let i=0;i<entries.length;i+=size){

        chunks.push(entries.slice(i,i+size))

      }

    }

    chunks.forEach((chunk,i)=>{

      const content = chunk.join("\n")

      zip.file(`fasta_part_${i+1}.fasta`,content)

    })

    const blob = await zip.generateAsync({type:"blob"})

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")

    a.href = url
    a.download = "fasta_split.zip"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

    setReport(
`Total sequences: ${entries.length}
Files created: ${chunks.length}`
    )

  }

  const loadExample = ()=>{

    setInput(`>seq1
ATGCGTACGT
>seq2
ATGCGTACGT
>seq3
ATGCGTACGT
>seq4
ATGCGTACGT
>seq5
ATGCGTACGT`)

    setReport("")
    setError("")

  }

  const clearAll = ()=>{

    setInput("")
    setReport("")
    setError("")

  }

  return(

    <ToolLayout
  title="FASTA Splitter"
  description="Split large FASTA files into smaller chunks for analysis or parallel processing."
  badge="FASTA Tool"
  slug="fasta-splitter"
  category="FASTA"

  seoContent={
  <>
    <h2>Split Large FASTA Files into Smaller Datasets</h2>

    <p>
      Large FASTA files containing thousands or millions of sequences are
      common in genomics, transcriptomics, and metagenomics research.
      Working with very large FASTA datasets can be challenging because
      many bioinformatics tools and computational pipelines perform more
      efficiently when sequences are divided into smaller files. Splitting
      FASTA datasets is therefore a common preprocessing step in many
      sequence analysis workflows.
    </p>

    <p>
      This FASTA splitter tool allows users to divide large multi-FASTA
      datasets into multiple smaller FASTA files. Sequences can be split
      either by specifying the number of sequences per file or by defining
      the total number of output files. The tool automatically distributes
      sequence entries and generates separate FASTA files that can be used
      in downstream analyses or parallel processing pipelines.
    </p>

    <p>
      Splitting FASTA datasets is particularly useful for distributing
      computational workloads across high-performance computing clusters,
      managing large genome assemblies, or preparing sequence collections
      for tools with file size limitations. If you need to organize FASTA
      entries before splitting, you can also use the{" "}
      <Link to="/tools/fasta-sequence-sorter">FASTA Sequence Sorter</Link>{" "}
      or combine datasets using the{" "}
      <Link to="/tools/fasta-merge">FASTA Merge Tool</Link>.
    </p>

    <p>
      All FASTA processing in this tool occurs directly in your browser.
      Sequence data is never transmitted to external servers, ensuring
      that sensitive genomic or experimental sequence datasets remain
      completely private during analysis.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a multi-FASTA dataset into the input field.</li>
    <li>Select how the FASTA file should be split.</li>
    <li>Choose either sequences per file or the total number of output files.</li>
    <li>Enter the desired value for splitting.</li>
    <li>Click <strong>Split FASTA</strong>.</li>
    <li>The tool will generate a downloadable ZIP file containing the split FASTA files.</li>
  </ol>
}

faq={[
  {
    question: "What does a FASTA splitter do?",
    answer:
      "A FASTA splitter divides a large FASTA dataset into multiple smaller FASTA files to make sequence collections easier to process or analyze."
  },
  {
    question: "Can I split sequences evenly across multiple files?",
    answer:
      "Yes. When splitting by the number of output files, the tool distributes sequences as evenly as possible across the generated FASTA files."
  },
  {
    question: "Can I specify how many sequences should be in each file?",
    answer:
      "Yes. You can define the number of sequences per file, and the tool will create multiple FASTA files containing that number of sequences."
  },
  {
    question: "Why split FASTA files for bioinformatics analysis?",
    answer:
      "Splitting FASTA datasets enables parallel computing, improves pipeline performance, and helps manage very large genomic or protein sequence collections."
  },
  {
    question: "Are my sequences uploaded to a server?",
    answer:
      "No. All FASTA processing occurs locally in your browser so your biological sequence data remains completely private."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Split Mode
            </label>

            <select
              value={mode}
              onChange={(e)=>setMode(e.target.value as Mode)}
              className="px-4 py-2 border rounded-lg"
            >

              <option value="perFile">
                Sequences per file
              </option>

              <option value="numFiles">
                Number of output files
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
              onChange={(e)=>setValue(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full"
            />

          </div>

        </div>

        {/* Input */}

        <div className="p-6 border-t border-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="FASTA Input"
            onLoadExample={loadExample}
          />

        </div>

        {report &&(

          <div className="p-6 border-t border-gray-200 bg-gray-50">

            <h3 className="font-semibold mb-2">
              Split Report
            </h3>

            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {report}
            </pre>

          </div>

        )}

        {error &&(

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-600"/>

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        {/* Buttons */}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Split FASTA 1"
            onClick={split}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Split FASTA
          </button>

          <button
          aria-label="Clear Split FASTA 1"
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