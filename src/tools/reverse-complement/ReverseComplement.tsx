import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function ReverseComplement() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const complement: Record<string, string> = {
    A: "T",
    T: "A",
    C: "G",
    G: "C",
    R: "Y",
    Y: "R",
    S: "S",
    W: "W",
    K: "M",
    M: "K",
    B: "V",
    D: "H",
    H: "D",
    V: "B",
    N: "N",
  };

  const compute = () => {
    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a DNA sequence");
      return;
    }

    const seq = input.replace(/\s/g, "").toUpperCase();

    if (!/^[ACGTRYSWKMBDHVN]+$/.test(seq)) {
      setError("Sequence contains invalid characters");
      return;
    }

    const rev = seq
      .split("")
      .reverse()
      .map((n) => complement[n] || n)
      .join("");

    setOutput(rev);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reverse_complement.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setInput("ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAA");
    setOutput("");
    setError("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    
    <ToolLayout
  title="Reverse Complement"
  description="Generate the reverse complement of DNA sequences."
  badge="Sequence Tool"
  slug="reverse-complement"
  category="Sequence"

  seoContent={
  <>
    <h2>DNA Reverse Complement Calculator</h2>

    <p>
      The reverse complement of a DNA sequence is obtained by reversing the
      nucleotide sequence and replacing each base with its complementary
      nucleotide. In DNA, adenine (A) pairs with thymine (T), while cytosine
      (C) pairs with guanine (G). Reverse complement sequences are widely
      used in bioinformatics, molecular biology, and genomics workflows
      when analyzing features located on the opposite DNA strand.
    </p>

    <p>
      This reverse complement calculator converts DNA sequences into their
      reverse complementary form using standard nucleotide pairing rules.
      The tool also supports IUPAC ambiguous nucleotide symbols such as
      R, Y, S, W, K, M, B, D, H, V, and N, ensuring compatibility with
      real sequencing data, consensus sequences, and genomic datasets.
    </p>

    <p>
      Reverse complements are commonly required when designing PCR primers,
      interpreting sequencing reads, analyzing genes encoded on the
      antisense strand, or searching for motifs that may occur on either
      DNA strand. You can further analyze resulting sequences using tools
      such as the{" "}
      <Link to="/tools/orf-finder">ORF Finder</Link>{" "}
      or examine nucleotide composition with the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      All sequence processing is performed locally within your browser.
      No DNA sequences are uploaded or transmitted to external servers,
      ensuring complete privacy when working with genomic data.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a DNA sequence into the input panel.</li>
    <li>Click <strong>Compute Reverse Complement</strong>.</li>
    <li>The reverse complement sequence will appear in the output panel.</li>
    <li>Copy or download the resulting sequence for downstream analysis.</li>
  </ol>
}

faq={[
  {
    question: "What is a reverse complement in DNA?",
    answer:
      "The reverse complement of a DNA sequence is produced by reversing the order of nucleotides and replacing each base with its complementary base (A↔T and C↔G)."
  },
  {
    question: "Why is the reverse complement important in bioinformatics?",
    answer:
      "Many genomic features occur on the opposite DNA strand, so analyzing the reverse complement allows researchers to examine genes, motifs, and regulatory elements on both strands."
  },
  {
    question: "Does this tool support ambiguous nucleotides?",
    answer:
      "Yes. The tool supports standard IUPAC nucleotide codes including R, Y, S, W, K, M, B, D, H, V, and N."
  },
  {
    question: "Can I use this tool for RNA sequences?",
    answer:
      "This tool is designed for DNA sequences. RNA sequences should typically be converted to DNA (U → T) before computing the reverse complement."
  },
  {
    question: "Is my DNA sequence stored or uploaded?",
    answer:
      "No. The reverse complement calculation runs entirely in your browser and no sequence data is transmitted to external servers."
  }
]}
>
    

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={input}
            onChange={setInput}
            onLoadExample={loadExample}
            label="Input Sequence"
          />

          <SequenceOutput
            value={output}
            title="Reverse Complement"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
          aria-label="Compute Reverse Complement 1"
            onClick={compute}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Compute Reverse Complement
          </button>

          <button
          aria-label="Clear Compute Reverse Complement 1"
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