import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function SequenceLength() {

  const [input, setInput] = useState("");
  const [length, setLength] = useState<number | null>(null);
  const [error, setError] = useState("");

  const calculateLength = () => {

    setError("");
    setLength(null);

    if (!input.trim()) {
      setError("Please enter a sequence");
      return;
    }

    const clean = input
      .replace(/^>.*$/gm, "") // remove FASTA headers
      .replace(/\s/g, "")
      .toUpperCase();

    if (!clean) {
      setError("No sequence characters detected");
      return;
    }

    setLength(clean.length);

  };

  const handleCopy = async () => {

    const text = `Sequence Length: ${length} bp`;

    await navigator.clipboard.writeText(text);

  };

  const handleDownload = () => {

    const text = `Sequence Length: ${length} bp`;

    const blob = new Blob([text], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sequence_length.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  const loadExample = () => {

    setInput(`>example_sequence
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG`);

  };

  const clearAll = () => {

    setInput("");
    setLength(null);
    setError("");

  };

  const outputText =
    length === null
      ? ""
      : `Sequence Length: ${length} bp`;

  return (

    <ToolLayout
  title="Sequence Length Calculator"
  description="Calculate the length of nucleotide or protein sequences."
  badge="Sequence Tool"
  slug="sequence-length"
  category="Sequence"

  seoContent={
  <>
    <h2>DNA, RNA and Protein Sequence Length Calculator</h2>

    <p>
      Determining the length of a biological sequence is one of the most basic
      yet essential operations in bioinformatics. Sequence length represents
      the total number of residues in a DNA, RNA, or protein sequence and is
      often used as a first step in sequence analysis pipelines. Researchers
      frequently need to measure sequence length before performing tasks such
      as genome annotation, sequence alignment, ORF detection, or structural
      prediction.
    </p>

    <p>
      This sequence length calculator allows you to quickly determine the
      number of nucleotides or amino acids in a sequence. The tool accepts
      plain sequences or FASTA formatted input and automatically removes
      headers, whitespace, and formatting characters before computing the
      total sequence length.
    </p>

    <p>
      Sequence length information is commonly used when analyzing genes,
      transcripts, proteins, and genomic regions. It can help researchers
      verify dataset integrity, validate sequence extraction results, or
      calculate downstream metrics such as GC content, sequence complexity,
      or codon usage statistics.
    </p>

    <p>
      After calculating sequence length, you may also want to analyze
      nucleotide composition using the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>{" "}
      or detect coding regions using the{" "}
      <Link to="/tools/orf-finder">
        ORF Finder
      </Link>.
    </p>

    <p>
      All sequence processing is performed locally in your browser, ensuring
      that biological data remains private and is never transmitted to
      external servers.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a DNA, RNA, or protein sequence into the input panel.</li>
    <li>The tool supports both plain sequences and FASTA formatted input.</li>
    <li>Click <strong>Calculate Length</strong>.</li>
    <li>The total sequence length will appear in the output panel.</li>
    <li>You can copy or download the result if needed.</li>
  </ol>
}

faq={[
  {
    question: "What does sequence length mean?",
    answer:
      "Sequence length is the total number of residues in a biological sequence, including nucleotides in DNA or RNA and amino acids in proteins."
  },
  {
    question: "Does the calculator support FASTA format?",
    answer:
      "Yes. FASTA headers beginning with '>' are automatically ignored and only sequence characters are counted."
  },
  {
    question: "Can I calculate protein sequence length?",
    answer:
      "Yes. The tool works with DNA, RNA, and protein sequences because it simply counts the number of characters in the sequence."
  },
  {
    question: "Are whitespace and line breaks included in the length?",
    answer:
      "No. The tool automatically removes whitespace and formatting characters before calculating the sequence length."
  },
  {
    question: "Is my sequence uploaded anywhere?",
    answer:
      "No. All calculations occur locally in your browser, ensuring full privacy for your biological data."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Input Sequence"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={outputText}
            title="Sequence Length"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">

            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5"/>

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Clear Calculate Length 1"
            onClick={calculateLength}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Calculate Length
          </button>

          <button
          aria-label="Clear Calculate Length 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4"/>
            Clear
          </button>

        </div>

      </div>

    </ToolLayout>

  );
}