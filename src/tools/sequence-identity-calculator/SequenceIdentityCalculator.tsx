import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

interface IdentityStats {
  matches: number
  mismatches: number
  gaps: number
  length: number
  identity: number
}

export default function SequenceIdentityCalculator() {

  const [seq1, setSeq1] = useState("")
  const [seq2, setSeq2] = useState("")
  const [stats, setStats] = useState<IdentityStats | null>(null)
  const [error, setError] = useState("")

  const clean = (s: string) =>
    s
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase()

  const calculateIdentity = () => {

    setError("")
    setStats(null)

    if (!seq1.trim() || !seq2.trim()) {
      setError("Please enter both sequences")
      return
    }

    const s1 = clean(seq1)
    const s2 = clean(seq2)

    if (!s1 || !s2) {
      setError("Invalid sequence input")
      return
    }

    const maxLen = Math.max(s1.length, s2.length)

    const padded1 = s1.padEnd(maxLen, "-")
    const padded2 = s2.padEnd(maxLen, "-")

    let matches = 0
    let mismatches = 0
    let gaps = 0

    for (let i = 0; i < maxLen; i++) {

      const a = padded1[i]
      const b = padded2[i]

      if (a === "-" || b === "-") {
        gaps++
      }
      else if (a === b) {
        matches++
      }
      else {
        mismatches++
      }

    }

    const identity = (matches / maxLen) * 100

    setStats({
      matches,
      mismatches,
      gaps,
      length: maxLen,
      identity
    })

  }

  const loadExample = () => {

    setSeq1("ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG")

    setSeq2("ATGGCCATTGTTATGGGCCGCTGAATGGGTGCCCGATAG")

  }

  const clearAll = () => {

    setSeq1("")
    setSeq2("")
    setStats(null)
    setError("")

  }

  return (

    <ToolLayout
      badge="Sequence Analysis"
      slug="sequence-identity-calculator"
      category="Sequence"

      seoContent={
        <>
          <h2>Sequence Identity Calculator</h2>

          <p>
            Sequence identity is a commonly used metric in bioinformatics that
            measures the similarity between two biological sequences. It represents
            the percentage of positions where the residues (nucleotides or amino
            acids) are identical between two aligned sequences. Sequence identity
            is widely used when comparing DNA, RNA, or protein sequences to assess
            evolutionary relationships, identify homologous genes, and evaluate
            sequence conservation.
          </p>

          <p>
            This sequence identity calculator performs a simple pairwise comparison
            between two sequences and reports the percentage identity, number of
            matches, mismatches, gaps, and the total alignment length. The tool
            automatically removes FASTA headers and whitespace before performing
            the comparison, making it easy to analyze sequences copied directly
            from biological databases or alignment tools.
          </p>

          <p>
            Sequence identity analysis is commonly used in genomics, transcriptomics,
            protein homology searches, and evolutionary studies. Researchers often
            compare sequences to determine whether two genes or proteins share a
            common origin or to evaluate the similarity between orthologs and
            paralogs across species.
          </p>

          <p>
            After comparing sequences, you may also want to explore sequence
            complexity using the{" "}
            <Link to="/tools/sequence-entropy-calculator">
              Sequence Entropy Calculator
            </Link>{" "}
            or analyze nucleotide composition using the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
          </p>

          <p>
            All calculations are performed locally in your browser, ensuring that
            sequence data remains private and is never uploaded to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste the first biological sequence into the first input panel.</li>
          <li>Paste the second sequence into the second input panel.</li>
          <li>Click <strong>Calculate Identity</strong>.</li>
          <li>The tool will display sequence identity percentage and statistics.</li>
          <li>Review matches, mismatches, gaps, and alignment length.</li>
        </ol>
      }

      faq={[
        {
          question: "What is sequence identity?",
          answer:
            "Sequence identity is the percentage of positions where two sequences contain the same nucleotide or amino acid after alignment."
        },
        {
          question: "What is the difference between identity and similarity?",
          answer:
            "Identity measures exact matches between residues, while similarity can include conservative substitutions where residues share similar biochemical properties."
        },
        {
          question: "Does this tool perform sequence alignment?",
          answer:
            "This calculator performs a simple position-by-position comparison after padding sequences. For full alignment algorithms, tools like Needleman–Wunsch or BLAST are typically used."
        },
        {
          question: "Can this tool compare protein sequences?",
          answer:
            "Yes. The calculator works with DNA, RNA, or protein sequences because it simply compares characters at each position."
        },
        {
          question: "Is my sequence uploaded anywhere?",
          answer:
            "No. All sequence analysis happens locally in your browser, ensuring full privacy of your biological data."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={seq1}
            onChange={setSeq1}
            label="Sequence 1"
            onLoadExample={loadExample}
          />

          <SequenceInput
            value={seq2}
            onChange={setSeq2}
            label="Sequence 2"
          />

        </div>

        {/* Results */}

        <div className="p-6 border-t border-gray-200 bg-gray-50">

          {stats ? (

            <div className="grid md:grid-cols-5 gap-6 text-center">

              <div>
                <p className="text-sm text-gray-500">
                  Identity
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {stats.identity.toFixed(2)} %
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Matches
                </p>

                <p className="text-xl font-semibold">
                  {stats.matches}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Mismatches
                </p>

                <p className="text-xl font-semibold">
                  {stats.mismatches}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Gaps
                </p>

                <p className="text-xl font-semibold">
                  {stats.gaps}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Alignment Length
                </p>

                <p className="text-xl font-semibold">
                  {stats.length}
                </p>
              </div>

            </div>

          ) : (

            <p className="text-center text-gray-500">
              Sequence identity statistics will appear here
            </p>

          )}

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
            aria-label="Calculate Identity 1"
            onClick={calculateIdentity}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Calculate Identity
          </button>

          <button
            aria-label="Clear Calculate Identity 1"
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