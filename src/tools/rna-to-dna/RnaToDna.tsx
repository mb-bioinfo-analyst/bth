import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

type OutputFormat = "raw" | "fasta";
type Mode = "coding" | "cdna";

export default function RnaToDna() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("raw");
  const [mode, setMode] = useState<Mode>("coding");
  const [error, setError] = useState("");

  const complement: Record<string, string> = {
    A: "T",
    U: "A",
    G: "C",
    C: "G",
    N: "N"
  };

  const convert = () => {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter an RNA sequence");
      return;
    }

    const clean = input
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();

    if (!clean) {
      setError("No RNA sequence detected");
      return;
    }

    if (!/^[ACGUN]+$/.test(clean)) {
      setError("Sequence contains invalid characters. Only A,C,G,U,N allowed.");
      return;
    }

    let dna = "";

    if (mode === "coding") {

      dna = clean.replace(/U/g, "T");

    } else {

      dna = clean
        .split("")
        .reverse()
        .map(b => complement[b])
        .join("");

    }

    if (format === "fasta") {

      const wrapped = dna.match(/.{1,60}/g)?.join("\n") || dna;

      const header =
        mode === "coding"
          ? ">dna_from_rna"
          : ">cdna_reverse_transcribed";

      setOutput(`${header}\n${wrapped}`);

    } else {

      setOutput(dna);

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
    a.download = format === "fasta" ? "dna_sequence.fasta" : "dna_sequence.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  const loadExample = () => {

    setInput(`>example_rna
AUGGCCAUUGUAAUGGGCCGCUGAAAGGGUGCCCGAUAG`);

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
  title="RNA to cDNA Converter"
  description="Convert RNA sequences to DNA. Choose between simple RNA→DNA conversion (U→T) or biologically correct reverse-transcribed cDNA."
  badge="Sequence Tool"
  slug="rna-to-dna"
  category="Sequence"

  seoContent={
  <>
    <h2>RNA to DNA / cDNA Converter</h2>

    <p>
      RNA to DNA conversion is a common step in molecular biology and
      bioinformatics workflows. RNA molecules contain uracil (U) instead
      of thymine (T), and many sequence analysis tools operate on DNA
      sequences. Converting RNA to DNA therefore helps researchers
      prepare transcript sequences for downstream analyses such as
      cloning, sequence alignment, and primer design.
    </p>

    <p>
      This RNA to DNA converter supports two conversion modes. The first
      performs a simple RNA to DNA transformation by replacing uracil
      (U) with thymine (T). The second mode generates complementary DNA
      (cDNA) by producing the reverse complement of the RNA sequence,
      simulating the biological reverse transcription process used in
      many laboratory experiments.
    </p>

    <p>
      Reverse transcription is widely used in transcriptomics, RNA-seq
      analysis, gene expression studies, and molecular cloning
      workflows. The generated DNA sequence can be used for additional
      analyses such as translation using the{" "}
      <Link to="/tools/dna-translate">DNA → Protein Translator</Link>{" "}
      or nucleotide composition analysis with the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      The converter supports plain sequence output or FASTA formatted
      DNA output with automatic line wrapping. All sequence processing
      runs locally in your browser, ensuring that biological sequence
      data remains private and is never transmitted to external
      servers.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste an RNA sequence into the input panel.</li>
    <li>Select the desired conversion mode.</li>
    <li>Choose the output format (plain DNA or FASTA).</li>
    <li>Click <strong>Convert RNA</strong>.</li>
    <li>Copy or download the generated DNA or cDNA sequence.</li>
  </ol>
}

faq={[
  {
    question: "What is RNA to DNA conversion?",
    answer:
      "RNA to DNA conversion replaces uracil (U) with thymine (T) to produce a DNA sequence corresponding to the RNA sequence."
  },
  {
    question: "What is cDNA?",
    answer:
      "Complementary DNA (cDNA) is DNA synthesized from an RNA template through reverse transcription. It represents the reverse complement of the RNA sequence."
  },
  {
    question: "What is the difference between RNA→DNA and cDNA mode?",
    answer:
      "RNA→DNA simply replaces U with T, while cDNA mode generates the reverse complement DNA strand produced during reverse transcription."
  },
  {
    question: "Can this tool process FASTA formatted RNA sequences?",
    answer:
      "Yes. FASTA headers are automatically ignored during processing and the output can also be generated in FASTA format."
  },
  {
    question: "Is my RNA sequence uploaded anywhere?",
    answer:
      "No. All sequence processing happens locally in your browser, ensuring complete privacy for your biological data."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Mode selector */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Conversion Mode
            </label>

            <div className="flex gap-2">

              <button
              aria-label="RNA to DNA 1"
                onClick={() => setMode("coding")}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  mode === "coding"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                RNA → DNA
              </button>

              <button
              aria-label="Reverse cDNA 1"
                onClick={() => setMode("cdna")}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  mode === "cdna"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Reverse cDNA
              </button>

            </div>

            <p className="text-xs text-gray-500 mt-2">
              RNA → DNA converts U→T. Reverse cDNA generates the reverse complement.
            </p>

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Output Format
            </label>

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="raw">Plain DNA sequence</option>
              <option value="fasta">FASTA DNA format</option>

            </select>

          </div>

        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="RNA Sequence"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="DNA / cDNA Output"
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
          aria-label="Convert RNA 1"
            onClick={convert}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Convert RNA
          </button>

          <button
          aria-label="Clear Convert RNA 1"
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