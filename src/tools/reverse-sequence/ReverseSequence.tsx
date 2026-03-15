import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

type OutputFormat = "raw" | "fasta";

export default function ReverseSequence() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("raw");
  const [error, setError] = useState("");

  const reverseSequence = () => {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a sequence");
      return;
    }

    const clean = input
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();

    if (!clean) {
      setError("No sequence detected");
      return;
    }

    const reversed = clean.split("").reverse().join("");

    if (format === "fasta") {

      const wrapped = reversed.match(/.{1,60}/g)?.join("\n") || reversed;

      setOutput(`>reversed_sequence\n${wrapped}`);

    } else {

      setOutput(reversed);

    }

  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = format === "fasta" ? "reversed_sequence.fasta" : "reversed_sequence.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  const loadExample = () => {

    setInput(`>example_sequence
ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG`);

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
  title="Sequence Reverse"
  description="Reverse DNA, RNA, or protein sequences without generating the complement."
  badge="Sequence Tool"
  slug="reverse-sequence"
  category="Sequence"

  seoContent={
  <>
    <h2>Reverse DNA, RNA, or Protein Sequences</h2>

    <p>
      Reversing a biological sequence changes the order of nucleotides or
      amino acids from end to start without altering the characters
      themselves. Unlike a reverse complement operation used in DNA
      analysis, sequence reversal simply flips the orientation of the
      sequence. This can be useful when debugging sequence transformations,
      testing algorithms, or preparing sequence datasets for comparative
      analysis.
    </p>

    <p>
      This sequence reverse tool allows users to quickly reverse DNA, RNA,
      or protein sequences while preserving the original characters. The
      tool automatically cleans common formatting artifacts such as
      whitespace and FASTA headers during processing, then outputs the
      reversed sequence either as a plain string or in FASTA format
      compatible with common bioinformatics pipelines.
    </p>

    <p>
      Sequence reversal is frequently used in algorithm testing, sequence
      processing pipelines, and analysis of palindromic regions in DNA.
      Because the characters themselves are not modified, the reversed
      sequence maintains the same nucleotide or amino acid composition
      as the original input. If you need strand-aware operations you may
      instead use the{" "}
      <Link to="/tools/reverse-complement">Reverse Complement</Link>{" "}
      tool or analyze sequence composition using the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      All sequence processing is performed locally within your browser.
      No biological sequence data is uploaded to external servers,
      ensuring complete privacy when working with DNA, RNA, or protein
      sequences.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a DNA, RNA, or protein sequence into the input panel.</li>
    <li>Select the desired output format (plain sequence or FASTA).</li>
    <li>Click <strong>Reverse Sequence</strong>.</li>
    <li>The reversed sequence will appear in the output panel.</li>
    <li>Copy or download the reversed sequence for further analysis.</li>
  </ol>
}

faq={[
  {
    question: "What does reversing a sequence mean?",
    answer:
      "Reversing a sequence flips the order of nucleotides or amino acids so the last character becomes the first while the characters themselves remain unchanged."
  },
  {
    question: "What is the difference between reverse and reverse complement?",
    answer:
      "Reverse flips the sequence order only, while reverse complement also replaces each DNA base with its complementary nucleotide (A↔T and C↔G)."
  },
  {
    question: "Can this tool reverse protein sequences?",
    answer:
      "Yes. The tool works with DNA, RNA, and protein sequences because it only changes the order of characters without modifying them."
  },
  {
    question: "Does the tool support FASTA format?",
    answer:
      "Yes. The tool can output reversed sequences in FASTA format with appropriate formatting for bioinformatics workflows."
  },
  {
    question: "Is my sequence data uploaded anywhere?",
    answer:
      "No. All sequence processing occurs locally in your browser to ensure full privacy and data security."
  }
]}
>
    




      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Output format */}

        <div className="p-6 border-b border-gray-200 bg-gray-50">

          <label className="block text-gray-700 font-semibold mb-2">
            Output Format
          </label>

          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option value="raw">Plain sequence</option>
            <option value="fasta">FASTA format</option>

          </select>

        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Input Sequence"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Reversed Sequence"
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
          aria-label="Reverse Sequence 1"
            onClick={reverseSequence}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Reverse Sequence
          </button>

          <button
          aria-label="Clear Reverse Sequence 1"
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