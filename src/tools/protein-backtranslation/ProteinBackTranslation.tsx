import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

type Mode = "random" | "optimal";
type Format = "raw" | "fasta";

const codonTable: Record<string, string[]> = {
  A: ["GCT", "GCC", "GCA", "GCG"],
  R: ["CGT", "CGC", "CGA", "CGG", "AGA", "AGG"],
  N: ["AAT", "AAC"],
  D: ["GAT", "GAC"],
  C: ["TGT", "TGC"],
  Q: ["CAA", "CAG"],
  E: ["GAA", "GAG"],
  G: ["GGT", "GGC", "GGA", "GGG"],
  H: ["CAT", "CAC"],
  I: ["ATT", "ATC", "ATA"],
  L: ["TTA", "TTG", "CTT", "CTC", "CTA", "CTG"],
  K: ["AAA", "AAG"],
  M: ["ATG"],
  F: ["TTT", "TTC"],
  P: ["CCT", "CCC", "CCA", "CCG"],
  S: ["TCT", "TCC", "TCA", "TCG", "AGT", "AGC"],
  T: ["ACT", "ACC", "ACA", "ACG"],
  W: ["TGG"],
  Y: ["TAT", "TAC"],
  V: ["GTT", "GTC", "GTA", "GTG"],
  "*": ["TAA", "TAG", "TGA"]
};

const optimalCodons: Record<string, string> = {
  A: "GCT",
  R: "CGT",
  N: "AAT",
  D: "GAT",
  C: "TGT",
  Q: "CAA",
  E: "GAA",
  G: "GGT",
  H: "CAT",
  I: "ATT",
  L: "CTG",
  K: "AAA",
  M: "ATG",
  F: "TTT",
  P: "CCT",
  S: "TCT",
  T: "ACT",
  W: "TGG",
  Y: "TAT",
  V: "GTT",
  "*": "TAA"
};

export default function ProteinBackTranslation() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("random");
  const [format, setFormat] = useState<Format>("fasta");
  const [error, setError] = useState("");

  function cleanSequence(seq: string) {

    return seq
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();

  }

  function randomCodon(aa: string) {

    const codons = codonTable[aa];
    if (!codons) return "";
    return codons[Math.floor(Math.random() * codons.length)];

  }

  function translateProtein() {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a protein sequence");
      return;
    }

    const protein = cleanSequence(input);

    if (!/^[ACDEFGHIKLMNPQRSTVWY*]+$/.test(protein)) {
      setError("Sequence contains invalid amino acids");
      return;
    }

    let dna = "";

    for (const aa of protein) {

      if (mode === "optimal") {
        dna += optimalCodons[aa];
      } else {
        dna += randomCodon(aa);
      }

    }

    if (format === "fasta") {

      const wrapped = dna.match(/.{1,60}/g)?.join("\n") || dna;

      setOutput(`>back_translated_dna\n${wrapped}`);

    } else {

      setOutput(dna);

    }

  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  }

  const handleDownload = () => {

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = format === "fasta" ? "dna.fasta" : "dna.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }

  const loadExample = () => {

    setInput(`>example_protein
MKWVTFISLLFLFSSAYS`);

    setOutput("");
    setError("");

  }

  const clearAll = () => {

    setInput("");
    setOutput("");
    setError("");

  }

  return (

    <ToolLayout
      badge="Sequence Tool"
      slug="protein-backtranslation"
      category="Sequence"

      seoContent={
        <>
          <h2>Protein to DNA Back Translation Tool</h2>

          <p>
            Back translation is the process of converting an amino acid sequence
            (protein) into a corresponding DNA sequence using the genetic code.
            Because most amino acids are encoded by multiple codons, a single
            protein sequence can correspond to many possible nucleotide
            sequences. Back translation is therefore commonly used in synthetic
            biology, gene design, and molecular cloning workflows when starting
            from a known protein sequence.
          </p>

          <p>
            This protein to DNA back translation tool converts amino acid
            sequences into possible DNA sequences using the standard codon
            table. Users can select different codon selection strategies,
            including random codon assignment or preferred codon selection,
            which uses commonly observed codons for each amino acid.
            The generated DNA sequence can be exported as plain text or
            FASTA format for downstream bioinformatics analysis.
          </p>

          <p>
            Back translation is often used when designing synthetic genes,
            preparing expression constructs, or exploring candidate DNA
            sequences that encode a known protein. After generating the DNA
            sequence, researchers may further refine it using the{" "}
            <Link to="/tools/codon-optimization">
              Codon Optimization Tool
            </Link>{" "}
            or translate nucleotide sequences back to protein using the{" "}
            <Link to="/tools/dna-translate">
              DNA → Protein Translator
            </Link>.
          </p>

          <p>
            All sequence processing is performed locally in your browser.
            Protein sequences are never uploaded to external servers,
            ensuring complete privacy when working with experimental or
            proprietary data.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a protein sequence or FASTA entry into the input panel.</li>
          <li>Select the codon selection mode (random or preferred).</li>
          <li>Choose the output format such as plain DNA sequence or FASTA.</li>
          <li>Click <strong>Back Translate</strong> to generate the DNA sequence.</li>
          <li>Review the generated nucleotide sequence.</li>
          <li>Copy or download the resulting DNA sequence for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is back translation in bioinformatics?",
          answer:
            "Back translation converts an amino acid sequence into a DNA sequence using the genetic code. Because many amino acids are encoded by multiple codons, several DNA sequences can produce the same protein."
        },
        {
          question: "What is the difference between random and preferred codon selection?",
          answer:
            "Random codon selection assigns synonymous codons randomly, while preferred codon selection uses commonly observed codons for each amino acid."
        },
        {
          question: "Why is back translation useful?",
          answer:
            "Back translation is useful for gene synthesis, cloning experiments, codon optimization workflows, and designing DNA constructs based on known protein sequences."
        },
        {
          question: "Can one protein correspond to multiple DNA sequences?",
          answer:
            "Yes. Because the genetic code is degenerate, most amino acids are encoded by multiple codons, meaning a protein can be represented by many possible DNA sequences."
        },
        {
          question: "Is my sequence data uploaded anywhere?",
          answer:
            "No. All back translation calculations run locally in your browser to ensure that sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Codon Selection Mode
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >

              <option value="random">
                Random Codon Selection
              </option>

              <option value="optimal">
                Most Common Codon
              </option>

            </select>

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Output Format
            </label>

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as Format)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >

              <option value="raw">Plain DNA</option>
              <option value="fasta">FASTA DNA</option>

            </select>

          </div>

        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Protein Sequence"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="DNA Sequence"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-600" />

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">

          <button
            aria-label="Back Translate 1"
            onClick={translateProtein}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Back Translate
          </button>

          <button
            aria-label="Clear Back Translate 1"
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