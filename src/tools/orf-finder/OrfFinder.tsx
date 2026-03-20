import { Link } from "react-router-dom"
import { useState } from "react"
import { Copy, Download, RefreshCw, AlertCircle } from "lucide-react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceListOutput from "../../components/SequenceListOutput"

interface ORF {
  start: number
  end: number
  length: number
  frame: string
  sequence: string
}

export default function OrfFinder() {

  const [inputSeq, setInputSeq] = useState("")
  const [orfs, setOrfs] = useState<ORF[]>([])
  const [error, setError] = useState("")

  const stopCodons = ["TAA", "TAG", "TGA"]

  const reverseComplement = (seq: string) => {

    const comp: Record<string, string> = {
      A: "T",
      T: "A",
      C: "G",
      G: "C"
    }

    return seq
      .split("")
      .reverse()
      .map(n => comp[n] || n)
      .join("")

  }

  const scanFrames = (seq: string, strand: string) => {

    const results: ORF[] = []

    for (let frame = 0; frame < 3; frame++) {

      for (let i = frame; i <= seq.length - 3; i += 3) {

        const codon = seq.slice(i, i + 3)

        if (codon === "ATG") {

          for (let j = i + 3; j <= seq.length - 3; j += 3) {

            const stop = seq.slice(j, j + 3)

            if (stopCodons.includes(stop)) {

              const orfSeq = seq.slice(i, j + 3)

              results.push({
                start: i + 1,
                end: j + 3,
                length: j + 3 - i,
                frame: `${strand}${frame + 1}`,
                sequence: orfSeq
              })

              break

            }

          }

        }

      }

    }

    return results

  }

  const findORFs = () => {

    setError("")
    setOrfs([])

    if (!inputSeq.trim()) {
      setError("Please enter a DNA sequence")
      return
    }

    const seq = inputSeq
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase()

    if (!/^[ACGT]+$/.test(seq)) {
      setError("Sequence contains invalid characters")
      return
    }

    const forwardORFs = scanFrames(seq, "+")
    const reverseSeq = reverseComplement(seq)
    const reverseORFs = scanFrames(reverseSeq, "-")

    setOrfs([...forwardORFs, ...reverseORFs])

  }

  const exportFasta = () => {

    const fasta = orfs.map((o, i) =>
      `>ORF_${i + 1} | frame ${o.frame} | ${o.start}-${o.end} | length ${o.length}
${o.sequence}`
    ).join("\n\n")

    const blob = new Blob([fasta], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "orfs.fasta"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

  }

  const handleCopy = async () => {

    const fasta = orfs.map((o, i) =>
      `>ORF_${i + 1} | frame ${o.frame} | ${o.start}-${o.end} | length ${o.length}
${o.sequence}`
    ).join("\n\n")

    await navigator.clipboard.writeText(fasta)

  }

  const loadExample = () => {

    setInputSeq(
      `ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG`
    )

  }

  const clearAll = () => {

    setInputSeq("")
    setOrfs([])
    setError("")

  }

  return (

    <ToolLayout
      badge="Sequence Tool"
      slug="orf-finder"
      category="Sequence"

      seoContent={
        <>
          <h2>Open Reading Frame (ORF) Finder for DNA Sequences</h2>

          <p>
            Open reading frames (ORFs) are continuous stretches of DNA that
            begin with a start codon and end with a stop codon, representing
            potential protein-coding regions within a nucleotide sequence.
            Identifying ORFs is a fundamental step in genome annotation,
            gene discovery, and sequence analysis workflows.
          </p>

          <p>
            This ORF finder scans DNA sequences across all six possible
            reading frames — three forward frames (+1, +2, +3) and three
            reverse complement frames (-1, -2, -3). By analyzing both DNA
            strands, the tool can detect protein-coding regions regardless
            of orientation within the genome.
          </p>

          <p>
            The algorithm searches for start codons (ATG) and identifies
            the nearest downstream stop codons (TAA, TAG, or TGA). Each
            detected ORF is reported with genomic coordinates, reading
            frame, and nucleotide sequence length. ORFs can be exported
            as FASTA sequences for downstream analysis such as translation
            using the{" "}
            <Link to="/tools/dna-translate">DNA → Protein Translator</Link>{" "}
            or further sequence characterization with the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
          </p>

          <p>
            ORF detection is commonly used in genome annotation, gene
            prediction pipelines, microbial genome analysis, and
            comparative genomics. Because all computations run locally
            in your browser, DNA sequence data remains private and is
            never uploaded to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a DNA sequence or FASTA entry into the input panel.</li>
          <li>Click <strong>Find ORFs</strong> to scan the sequence.</li>
          <li>The tool will analyze all six reading frames.</li>
          <li>Review detected ORFs with their coordinates and lengths.</li>
          <li>Copy or download ORF sequences in FASTA format.</li>
          <li>Use the results for gene prediction or downstream analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is an open reading frame (ORF)?",
          answer:
            "An ORF is a continuous sequence of codons that begins with a start codon (usually ATG) and ends with a stop codon, representing a potential protein-coding region."
        },
        {
          question: "Why analyze six reading frames?",
          answer:
            "DNA is double stranded and can be read in three frames on each strand. Analyzing all six frames ensures that potential coding regions are detected regardless of strand orientation."
        },
        {
          question: "What start and stop codons are used?",
          answer:
            "This tool identifies ORFs beginning with the start codon ATG and ending with the stop codons TAA, TAG, or TGA."
        },
        {
          question: "Can I export the ORFs?",
          answer:
            "Yes. Detected ORFs can be copied or downloaded in FASTA format for further analysis or translation."
        },
        {
          question: "Is my sequence data uploaded to a server?",
          answer:
            "No. All ORF detection runs entirely in your browser to ensure that sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={inputSeq}
            onChange={setInputSeq}
            label="DNA Sequence"
            onLoadExample={loadExample}
          />

          <SequenceListOutput
            title="Detected ORFs"
            items={orfs.map(o => ({
              header: `Frame ${o.frame}`,
              meta: `${o.start}-${o.end} | Length ${o.length}`,
              sequence: o.sequence
            }))}
            placeholder="ORFs will appear here..."
            onCopy={handleCopy}
            onDownload={exportFasta}
          />

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">

            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">

          <button
            aria-label="Find ORFs 1"
            onClick={findORFs}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Find ORFs
          </button>

          <button
            aria-label="Clear Find ORFs 1"
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