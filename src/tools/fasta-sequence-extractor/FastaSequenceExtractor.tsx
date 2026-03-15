import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

type Mode = "id" | "keyword"

export default function FastaSequenceExtractor(){

  const [fasta,setFasta] = useState("")
  const [query,setQuery] = useState("")
  const [output,setOutput] = useState("")

  const [mode,setMode] = useState<Mode>("id")

  const [error,setError] = useState("")

  function parseFasta(text:string){

    const entries = text
      .trim()
      .split(/\n(?=>)/)

    return entries.map(entry=>{

      const lines = entry.split("\n")
      const header = lines[0]
      const seq = lines.slice(1).join("")

      return {
        header,
        seq
      }

    })

  }

  function extract(){

    setError("")
    setOutput("")

    if(!fasta.trim()){
      setError("Please paste FASTA sequences")
      return
    }

    const entries = parseFasta(fasta)

    if(entries.length === 0){
      setError("No FASTA sequences detected")
      return
    }

    let results:any[] = []

    if(mode === "id"){

      const ids = query
        .split(/\n|,/)
        .map(i=>i.trim())
        .filter(Boolean)

      if(ids.length === 0){
        setError("Please enter sequence IDs")
        return
      }

      results = entries.filter(e=>{
        const id = e.header.replace(/^>/,"").split(/\s+/)[0]
        return ids.includes(id)
      })

    }

    if(mode === "keyword"){

      const keyword = query.trim().toLowerCase()

      if(!keyword){
        setError("Please enter a keyword")
        return
      }

      results = entries.filter(e =>
        e.header.toLowerCase().includes(keyword)
      )

    }

    if(results.length === 0){
      setError("No sequences matched your query")
      return
    }

    const fastaOut = results
      .map(r => `${r.header}\n${r.seq}`)
      .join("\n")

    setOutput(fastaOut)

  }

  const handleCopy = async ()=>{

    await navigator.clipboard.writeText(output)

  }

  const handleDownload = ()=>{

    const blob = new Blob([output],{type:"text/plain"})
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "extracted_sequences.fasta"

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const loadExample = ()=>{

    setFasta(`>seq1 human_gene
ATGCGTACGTAG
>seq2 mouse_gene
ATGCGTAGCTAG
>seq3 plant_gene
ATGCCCGTAGCT`)

    setQuery("seq1\nseq3")

    setOutput("")
    setError("")

  }

  const clearAll = ()=>{

    setFasta("")
    setQuery("")
    setOutput("")
    setError("")

  }

  return(

    <ToolLayout
  title="FASTA Sequence Extractor"
  description="Extract specific sequences from FASTA files using sequence IDs or header keywords."
  badge="FASTA Tool"
  slug="fasta-sequence-extractor"
  category="FASTA"

  seoContent={
  <>
    <h2>Extract Specific Sequences from FASTA Files</h2>

    <p>
      FASTA files often contain large collections of biological
      sequences such as DNA, RNA, or proteins. In many bioinformatics
      workflows researchers need to retrieve only a subset of
      sequences from a multi-FASTA dataset based on sequence
      identifiers, gene names, species annotations, or other
      metadata present in FASTA headers.
    </p>

    <p>
      This FASTA sequence extractor allows users to quickly retrieve
      specific entries from FASTA datasets using either sequence IDs
      or keywords found within FASTA headers. The tool scans the entire
      FASTA dataset and returns only the sequences that match the
      provided query, making it easy to isolate relevant biological
      sequences for downstream analysis.
    </p>

    <p>
      Multiple sequence identifiers can be provided simultaneously,
      allowing batch extraction of selected sequences from large
      datasets. Researchers can also perform keyword-based searches
      to retrieve sequences belonging to specific organisms, genes,
      annotations, or experimental conditions. If FASTA headers need
      to be standardized before extraction, you can use the{" "}
      <Link to="/tools/fasta-header-editor">FASTA Header Editor</Link>{" "}
      or extract identifier lists using the{" "}
      <Link to="/tools/fasta-header-extractor">FASTA Header Extractor</Link>.
    </p>

    <p>
      FASTA sequence extraction is commonly used when preparing
      datasets for phylogenetic analysis, genome annotation,
      transcriptomics studies, and comparative genomics workflows.
      Because all processing occurs locally in your browser, your
      biological sequence data remains private and is never uploaded
      to external servers.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a multi-FASTA dataset into the FASTA input panel.</li>
    <li>Select the extraction method: sequence ID or header keyword.</li>
    <li>Enter one or more sequence IDs or a keyword to search.</li>
    <li>Click <strong>Extract Sequences</strong>.</li>
    <li>The matching FASTA entries will appear in the output panel.</li>
    <li>Copy or download the extracted FASTA sequences.</li>
  </ol>
}

faq={[
  {
    question: "What does a FASTA sequence extractor do?",
    answer:
      "A FASTA sequence extractor retrieves specific sequence entries from a multi-FASTA dataset based on sequence identifiers or header keywords."
  },
  {
    question: "Can I extract multiple sequence IDs at once?",
    answer:
      "Yes. The tool supports multiple sequence identifiers entered on separate lines or separated by commas."
  },
  {
    question: "What is keyword extraction in FASTA files?",
    answer:
      "Keyword extraction searches FASTA header lines and returns sequences whose headers contain the specified text."
  },
  {
    question: "Does the tool modify the sequences?",
    answer:
      "No. The extractor simply retrieves matching FASTA entries and preserves the original nucleotide or protein sequences."
  },
  {
    question: "Is my FASTA dataset uploaded anywhere?",
    answer:
      "No. All sequence extraction operations run locally in your browser to ensure complete privacy of your biological data."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Extraction options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50">

          <label className="block text-gray-700 font-semibold mb-2">
            Extraction Mode
          </label>

          <select
            value={mode}
            onChange={(e)=>setMode(e.target.value as Mode)}
            className="px-4 py-2 border rounded-lg"
          >

            <option value="id">
              Extract by Sequence ID
            </option>

            <option value="keyword">
              Extract by Header Keyword
            </option>

          </select>

        </div>

        {/* FASTA + Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={fasta}
            onChange={setFasta}
            label="FASTA Input"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Extracted FASTA"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {/* Query box */}

        <div className="p-6 border-t border-gray-200">

          <label className="block text-gray-700 font-semibold mb-2">
            {mode === "id"
              ? "Sequence IDs (one per line or comma separated)"
              : "Keyword to search in headers"}
          </label>

          <textarea
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            className="w-full p-3 border rounded-lg h-24"
            placeholder={
              mode === "id"
                ? "seq1\nseq2"
                : "keyword"
            }
          />

        </div>

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
          aria-label="Extract Sequences 1"
            onClick={extract}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Extract Sequences
          </button>

          <button
          aria-label="Clear Extract Sequences 1"
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