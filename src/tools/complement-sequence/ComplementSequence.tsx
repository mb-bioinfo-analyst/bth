import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

type OutputFormat = "raw" | "fasta";
type Mode = "dna" | "rna";

export default function ComplementSequence() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("raw");
  const [mode, setMode] = useState<Mode>("dna");
  const [error, setError] = useState("");

  const dnaComplement: Record<string,string> = {
    A:"T", T:"A", C:"G", G:"C", N:"N"
  };

  const rnaComplement: Record<string,string> = {
    A:"U", U:"A", C:"G", G:"C", N:"N"
  };

  const generateComplement = () => {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a sequence");
      return;
    }

    const clean = input
      .replace(/^>.*$/gm,"")
      .replace(/\s/g,"")
      .toUpperCase();

    if (!clean) {
      setError("No sequence detected");
      return;
    }

    const complementMap = mode === "dna"
      ? dnaComplement
      : rnaComplement;

    const result = clean
      .split("")
      .map(base => complementMap[base] || "N")
      .join("");

    if (format === "fasta") {

      const wrapped = result.match(/.{1,60}/g)?.join("\n") || result;

      const header =
        mode === "dna"
          ? ">dna_complement"
          : ">rna_complement";

      setOutput(`${header}\n${wrapped}`);

    } else {

      setOutput(result);

    }

  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {

    const blob = new Blob([output], { type:"text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download =
      format === "fasta"
        ? "complement_sequence.fasta"
        : "complement_sequence.txt";

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
  title="Complement Sequence Generator"
  description="Generate the complementary DNA or RNA strand without reversing the sequence."
  badge="Sequence Tool"
  slug="complement-sequence"
  category="Sequence"

  seoContent={
  <>
    <h2>DNA and RNA Complement Sequence Generator</h2>

    <p>
      The complement sequence generator converts a nucleotide sequence
      into its complementary strand using standard base-pairing rules.
      In DNA molecules, adenine pairs with thymine (A–T) and cytosine
      pairs with guanine (C–G). In RNA molecules, adenine pairs with
      uracil (A–U) instead of thymine. Generating complementary strands
      is a common operation in molecular biology, genetics, and
      bioinformatics workflows.
    </p>

    <p>
      This tool allows researchers and students to instantly compute
      complementary DNA or RNA sequences directly in the browser.
      Unlike a{" "}
      <Link to="/tools/reverse-complement">
        Reverse Complement Generator
      </Link>, this utility keeps the original sequence orientation
      while replacing each nucleotide with its complementary base.
      This is useful when examining strand pairing or validating
      nucleotide substitutions.
    </p>

    <p>
      The complement sequence generator supports both plain sequence
      output and FASTA formatted output for compatibility with common
      bioinformatics software. It can process individual sequences
      or FASTA records and automatically format the resulting
      complementary strand for easy copying or downloading. If you
      need to further examine sequence properties you can also use
      the{" "}
      <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
      or analyze nucleotide frequencies with the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      Complementary sequences are frequently used in primer design,
      oligonucleotide analysis, probe design, sequence validation,
      and synthetic biology workflows. These operations are important
      when working with hybridization experiments, PCR primers,
      or sequence verification tasks.
    </p>

    <p>
      Because the entire analysis runs locally in your browser,
      no sequence data is transmitted to external servers. This
      ensures complete privacy for sensitive nucleotide sequences
      such as unpublished genes or proprietary constructs.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a DNA or RNA sequence into the input field.</li>
    <li>Select the sequence type (DNA or RNA).</li>
    <li>Choose the desired output format such as plain sequence or FASTA.</li>
    <li>Click <strong>Generate Complement</strong>.</li>
    <li>The complementary sequence will appear instantly in the output panel.</li>
    <li>Copy or download the generated sequence for further analysis.</li>
  </ol>
}

faq={[
  {
    question: "What is a complement sequence?",
    answer:
      "A complement sequence is generated by replacing each nucleotide with its corresponding base pair, such as adenine with thymine in DNA or adenine with uracil in RNA."
  },
  {
    question: "What is the difference between complement and reverse complement?",
    answer:
      "A complement sequence replaces each base with its pair while keeping the original order. A reverse complement both replaces the bases and reverses the sequence orientation."
  },
  {
    question: "Does this tool support RNA sequences?",
    answer:
      "Yes. The generator supports both DNA and RNA sequences and uses the correct base-pairing rules for each molecule type."
  },
  {
    question: "Can the output be exported as FASTA format?",
    answer:
      "Yes. The tool can format the complementary sequence in FASTA format for compatibility with many bioinformatics programs."
  },
  {
    question: "Is my sequence uploaded to a server?",
    answer:
      "No. All sequence processing runs locally in your browser to ensure your data remains private."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Controls */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          {/* Mode */}

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Sequence Type
            </label>

            <div className="flex gap-2">

              <button
              aria-label="DNA mode"
                onClick={() => setMode("dna")}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  mode === "dna"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                DNA
              </button>

              <button
              aria-label="RNA mode"
                onClick={() => setMode("rna")}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  mode === "rna"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                RNA
              </button>

            </div>

          </div>

          {/* Output format */}

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Output Format
            </label>

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="raw">Plain sequence</option>
              <option value="fasta">FASTA format</option>

            </select>

          </div>

        </div>

        {/* Input / Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Input Sequence"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Complement Sequence"
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

        {/* Buttons */}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Generate Complement 1"
            onClick={generateComplement}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Generate Complement
          </button>

          <button
          aria-label="Clear Complement 1"
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