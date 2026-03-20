import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

type OutputFormat = "raw" | "fasta";

export default function DnaToRna() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("raw");
  const [error, setError] = useState("");

  const transcribe = () => {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a DNA sequence");
      return;
    }

    const clean = input
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();

    if (!clean) {
      setError("No DNA sequence detected");
      return;
    }

    if (!/^[ACGTN]+$/.test(clean)) {
      setError("Sequence contains invalid characters");
      return;
    }

    const rna = clean.replace(/T/g, "U");

    if (format === "fasta") {

      const wrapped = rna.match(/.{1,60}/g)?.join("\n") || rna;

      setOutput(`>transcribed_rna\n${wrapped}`);

    } else {

      setOutput(rna);

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
    a.download = format === "fasta" ? "rna.fasta" : "rna.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  const loadExample = () => {

    setInput(`>example_dna
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
      badge="Sequence Tool"
      slug="dna-to-rna"
      category="Sequence"

      seoContent={
        <>
          <h2>DNA to RNA Transcription Tool</h2>

          <p>
            DNA to RNA transcription is a fundamental biological process in which
            a DNA sequence is converted into a corresponding RNA molecule.
            During transcription, thymine (T) nucleotides in DNA are replaced
            with uracil (U) in RNA while the nucleotide order remains the same.
            This transformation represents the first step of gene expression
            in molecular biology and genomics.
          </p>

          <p>
            This DNA to RNA transcription tool allows researchers, students,
            and bioinformaticians to quickly convert DNA sequences into RNA
            sequences directly in the browser. The tool automatically removes
            FASTA headers, cleans formatting artifacts, and generates accurate
            RNA transcripts from nucleotide sequences.
          </p>

          <p>
            The transcription generator supports both plain sequence output
            and FASTA formatted RNA output for compatibility with common
            bioinformatics software. If you need to analyze sequence properties
            after transcription you can also evaluate nucleotide composition
            using the{" "}
            <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
            or examine base distributions with the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
          </p>

          <p>
            DNA to RNA conversion is widely used in gene annotation,
            transcript analysis, RNA structure studies, and synthetic
            biology workflows. Researchers often transcribe coding DNA
            sequences before performing downstream RNA-based analysis
            or computational transcript modeling.
          </p>

          <p>
            Because the entire transcription process runs locally in
            your browser, no sequence data is transmitted to external
            servers. This ensures complete privacy for sensitive
            nucleotide sequences such as unpublished genes or
            proprietary constructs.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a DNA sequence or FASTA record into the input field.</li>
          <li>Select the desired output format such as plain RNA sequence or FASTA.</li>
          <li>Click <strong>Transcribe to RNA</strong>.</li>
          <li>The RNA transcript will be generated instantly.</li>
          <li>Copy or download the RNA sequence for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is DNA to RNA transcription?",
          answer:
            "DNA transcription is the biological process where a DNA sequence is used as a template to produce an RNA molecule, replacing thymine (T) with uracil (U)."
        },
        {
          question: "What is the difference between DNA and RNA sequences?",
          answer:
            "DNA contains thymine (T) while RNA contains uracil (U). During transcription, thymine bases are replaced by uracil in the resulting RNA molecule."
        },
        {
          question: "Does this tool support FASTA sequences?",
          answer:
            "Yes. The tool automatically detects FASTA headers and can output RNA sequences in FASTA format."
        },
        {
          question: "Can this tool handle long DNA sequences?",
          answer:
            "Yes. The transcription tool can process both short DNA fragments and long nucleotide sequences."
        },
        {
          question: "Is my DNA sequence uploaded anywhere?",
          answer:
            "No. All transcription processing occurs locally in your browser to ensure complete data privacy."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Output Format Selector */}

        <div className="p-6 border-b border-gray-200 bg-gray-50">

          <label className="block text-gray-700 font-semibold mb-2">
            Output Format
          </label>

          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option value="raw">
              Plain RNA sequence
            </option>

            <option value="fasta">
              FASTA RNA format
            </option>

          </select>

        </div>


        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="DNA Sequence"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="RNA Sequence"
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
            aria-label="Transcribe to RNA 1"
            onClick={transcribe}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Transcribe to RNA
          </button>

          <button
            aria-label="Clear Transcribe to RNA 1"
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