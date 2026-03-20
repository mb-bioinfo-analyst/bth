import { Link } from "react-router-dom"
import { useState } from "react";
import { Copy, Download, RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

const codonTable: Record<string, string> = {
  TTT: "F", TTC: "F", TTA: "L", TTG: "L",
  TCT: "S", TCC: "S", TCA: "S", TCG: "S",
  TAT: "Y", TAC: "Y", TAA: "*", TAG: "*",
  TGT: "C", TGC: "C", TGA: "*", TGG: "W",

  CTT: "L", CTC: "L", CTA: "L", CTG: "L",
  CCT: "P", CCC: "P", CCA: "P", CCG: "P",
  CAT: "H", CAC: "H", CAA: "Q", CAG: "Q",
  CGT: "R", CGC: "R", CGA: "R", CGG: "R",

  ATT: "I", ATC: "I", ATA: "I", ATG: "M",
  ACT: "T", ACC: "T", ACA: "T", ACG: "T",
  AAT: "N", AAC: "N", AAA: "K", AAG: "K",
  AGT: "S", AGC: "S", AGA: "R", AGG: "R",

  GTT: "V", GTC: "V", GTA: "V", GTG: "V",
  GCT: "A", GCC: "A", GCA: "A", GCG: "A",
  GAT: "D", GAC: "D", GAA: "E", GAG: "E",
  GGT: "G", GGC: "G", GGA: "G", GGG: "G"
};

export default function DnaTranslate() {

  const [inputSeq, setInputSeq] = useState("");
  const [protein, setProtein] = useState("");
  const [error, setError] = useState("");

  const translate = () => {

    setError("");

    if (!inputSeq.trim()) {
      setError("Please enter a DNA sequence");
      return;
    }

    const clean = inputSeq.replace(/\s/g, "").toUpperCase();

    if (!/^[ACGT]+$/.test(clean)) {
      setError("Sequence contains invalid characters");
      return;
    }

    let aa = "";

    for (let i = 0; i < clean.length; i += 3) {

      const codon = clean.slice(i, i + 3);

      if (codon.length === 3) {
        aa += codonTable[codon] || "X";
      }

    }

    setProtein(aa);

  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(protein);
  };

  const handleDownload = () => {

    const blob = new Blob([protein], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "protein_translation.txt";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  const clearAll = () => {
    setInputSeq("");
    setProtein("");
    setError("");
  };

  const loadExample = () => {

    setInputSeq(
      `ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG`
    );

  };

  return (

    <ToolLayout
      badge="Sequence Tool"
      slug="dna-translate"
      category="Sequence"

      seoContent={
        <>
          <h2>DNA to Protein Translation Using the Genetic Code</h2>

          <p>
            DNA to protein translation is a central process in molecular biology
            where nucleotide sequences are converted into amino acid sequences
            according to the genetic code. During translation, groups of three
            nucleotides called <strong>codons</strong> specify individual amino acids,
            which are assembled to form a protein. This process represents the
            final step of gene expression following transcription.
          </p>

          <p>
            This DNA to protein translator allows researchers, students, and
            bioinformaticians to quickly convert nucleotide sequences into
            amino acid sequences using the standard genetic code. The tool
            reads DNA codons and produces the corresponding protein sequence,
            enabling rapid identification of coding regions and predicted
            protein products.
          </p>

          <p>
            Translation analysis is often performed alongside other sequence
            utilities. For example, researchers may first generate RNA
            transcripts using the{" "}
            <Link to="/tools/dna-to-rna">DNA → RNA Transcription Tool</Link>{" "}
            or analyze nucleotide composition using the{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>. These
            complementary tools help researchers better understand gene
            structure and sequence properties before translating coding
            regions.
          </p>

          <p>
            DNA translation tools are widely used for gene annotation,
            protein prediction, mutation analysis, and synthetic biology
            workflows. Translating nucleotide sequences allows scientists
            to examine protein structure, functional domains, and amino
            acid substitutions resulting from genetic variants.
          </p>

          <p>
            Because this translator runs entirely in your browser, your
            sequences remain private and are never transmitted to external
            servers. This makes the tool safe for analyzing unpublished
            genomic sequences or proprietary datasets.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste or upload a DNA sequence.</li>
          <li>Ensure the sequence contains valid nucleotides (A, T, C, G).</li>
          <li>Click <strong>Translate DNA</strong>.</li>
          <li>The amino acid sequence will appear instantly.</li>
          <li>Copy or download the translated protein sequence.</li>
        </ol>
      }

      faq={[
        {
          question: "What is DNA translation?",
          answer:
            "DNA translation is the biological process where nucleotide codons are interpreted by the genetic code and converted into amino acids to form a protein sequence."
        },
        {
          question: "What genetic code does this tool use?",
          answer:
            "This translator uses the standard genetic code, the most widely used codon table in molecular biology and genomics."
        },
        {
          question: "Does the tool support long sequences?",
          answer:
            "Yes. The translator works with both short DNA fragments and long genomic sequences."
        },
        {
          question: "Is my sequence uploaded to a server?",
          answer:
            "No. All translation calculations run locally in your browser to ensure your sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          {/* INPUT */}

          <SequenceInput
            value={inputSeq}
            onChange={setInputSeq}
            label="DNA Sequence"
            onLoadExample={loadExample}
          />


          <SequenceOutput
            value={protein}
            title="Protein Sequence"
            onCopy={handleCopy}
            onDownload={handleDownload}
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
            aria-label="Clear Translate DNA 1"
            onClick={translate}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Translate DNA
          </button>

          <button
            aria-label="Clear Translate DNA 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>

        </div>

      </div>

    </ToolLayout>

  );
}