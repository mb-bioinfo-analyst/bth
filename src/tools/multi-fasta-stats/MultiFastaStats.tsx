import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

export default function MultiFastaStats(){

  const [input,setInput] = useState("")
  const [rows,setRows] = useState<any[]>([])
  const [error,setError] = useState("")

  const parseFasta = () => {

    setError("")
    setRows([])

    if(!input.trim()){
      setError("Please paste FASTA sequences")
      return
    }

    const entries = input.split(">").filter(Boolean)

    const results = entries.map(entry => {

      const lines = entry.split("\n")

      const name = lines[0].trim()

      const seq = lines.slice(1).join("").replace(/\s/g,"").toUpperCase()

      const A = (seq.match(/A/g)||[]).length
      const C = (seq.match(/C/g)||[]).length
      const G = (seq.match(/G/g)||[]).length
      const T = (seq.match(/T/g)||[]).length

      const length = seq.length
      const gc = ((G+C)/length*100).toFixed(2)

      return {
        name,
        length,
        gc,
        A,C,G,T
      }

    })

    setRows(results)

  }

  const loadExample = () => {

    setInput(`>seq1
ATGGTGCACCTGACTCCTGAG

>seq2
ATGCCCGGGTTTAAAACCCGGG`)

  }

  const clearAll = () => {

    setInput("")
    setRows([])
    setError("")

  }

  return (

    <ToolLayout
  title="Multi-Sequence FASTA Statistics"
  description="Calculate statistics for multiple FASTA sequences."
  badge="Sequence Tool"
  slug="multi-fasta-stats"
  category="Sequence"

  seoContent={
  <>
    <h2>Calculate Statistics for Multi-FASTA Sequence Datasets</h2>

    <p>
      FASTA files often contain multiple biological sequences such as
      genes, transcripts, contigs, or genomic regions. When working with
      multi-FASTA datasets, researchers frequently need summary
      statistics for each sequence in order to evaluate dataset quality,
      compare sequence composition, or prepare data for downstream
      bioinformatics analyses.
    </p>

    <p>
      This multi-sequence FASTA statistics calculator analyzes every
      entry in a FASTA dataset and reports key metrics including
      sequence length, GC percentage, and nucleotide counts for
      A, C, G, and T. The results are displayed in a structured
      table, allowing quick comparison of nucleotide composition
      across all sequences in the dataset.
    </p>

    <p>
      These statistics are commonly used during genome annotation,
      transcriptomics analysis, primer design preparation, and general
      exploratory analysis of genomic datasets. GC composition can help
      identify gene-rich regions, detect unusual sequence biases, and
      compare sequence characteristics across samples. For individual
      sequence analysis you can also use the{" "}
      <Link to="/tools/fasta-stats">FASTA Statistics</Link>{" "}
      tool or compute GC percentages separately using the{" "}
      <Link to="/tools/gc-content">GC Content Calculator</Link>.
    </p>

    <p>
      All calculations run directly in your browser using client-side
      processing. Your FASTA sequences are never uploaded to external
      servers, ensuring complete privacy when analyzing genomic data.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste one or more sequences in FASTA format into the input panel.</li>
    <li>Click <strong>Compute Statistics</strong>.</li>
    <li>Review the table showing sequence length, GC content, and nucleotide counts.</li>
    <li>Compare nucleotide composition across all sequences in the dataset.</li>
    <li>Copy or download the statistics table if needed.</li>
  </ol>
}

faq={[
  {
    question: "What is a multi-FASTA file?",
    answer:
      "A multi-FASTA file contains multiple biological sequences in FASTA format, where each sequence begins with a header line starting with the '>' symbol."
  },
  {
    question: "What statistics does this tool calculate?",
    answer:
      "The tool calculates sequence length, GC percentage, and nucleotide counts for A, C, G, and T for every sequence in the FASTA dataset."
  },
  {
    question: "Why is GC content important?",
    answer:
      "GC content reflects the proportion of guanine and cytosine nucleotides in a sequence and can indicate genome composition, gene density, or sequencing bias."
  },
  {
    question: "Can I analyze multiple sequences at once?",
    answer:
      "Yes. The tool accepts multi-FASTA input and computes statistics for each sequence independently."
  },
  {
    question: "Are my sequences uploaded anywhere?",
    answer:
      "No. All FASTA analysis is performed locally in your browser to ensure complete data privacy."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <SequenceInput
          value={input}
          onChange={setInput}
          label="FASTA Input"
          onLoadExample={loadExample}
        />

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600"/>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {rows.length > 0 && (

          <div className="p-6 overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b font-semibold">

                <tr>
                  <th className="text-left p-2">Sequence</th>
                  <th className="text-left p-2">Length</th>
                  <th className="text-left p-2">GC%</th>
                  <th className="text-left p-2">A</th>
                  <th className="text-left p-2">C</th>
                  <th className="text-left p-2">G</th>
                  <th className="text-left p-2">T</th>
                </tr>

              </thead>

              <tbody>

                {rows.map((r,i)=>(

                  <tr key={i} className="border-b">

                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.length}</td>
                    <td className="p-2">{r.gc}</td>
                    <td className="p-2">{r.A}</td>
                    <td className="p-2">{r.C}</td>
                    <td className="p-2">{r.G}</td>
                    <td className="p-2">{r.T}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        <div className="p-6 bg-gray-50 border-t flex gap-4">

          <button
          aria-label="Compute Statistics parseFasta 1"
            onClick={parseFasta}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Compute Statistics
          </button>

          <button
          aria-label="Clear Compute Statistics parseFasta 1"
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