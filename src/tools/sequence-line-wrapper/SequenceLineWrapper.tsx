import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function SequenceLineWrapper() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [lineWidth, setLineWidth] = useState(60);
  const [removeSpaces, setRemoveSpaces] = useState(true);
  const [uppercase, setUppercase] = useState(true);

  const [error, setError] = useState("");

  function wrapSequence(seq: string) {

    const chunks = seq.match(new RegExp(`.{1,${lineWidth}}`, "g"));

    return chunks ? chunks.join("\n") : seq;

  }

  function process() {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter sequence data");
      return;
    }

    const lines = input.split("\n");

    const result = lines.map(line => {

      if (line.startsWith(">")) return line;

      let seq = line;

      if (removeSpaces) {
        seq = seq.replace(/\s/g, "");
      }

      if (uppercase) {
        seq = seq.toUpperCase();
      }

      return wrapSequence(seq);

    });

    setOutput(result.join("\n"));

  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  }

  const handleDownload = () => {

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "wrapped_sequence.fasta";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }

  const loadExample = () => {

    setInput(`>example_sequence
ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG`);

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
      slug="sequence-line-wrapper"
      category="Sequence"

      seoContent={
        <>
          <h2>FASTA Sequence Line Wrapper</h2>

          <p>
            FASTA sequence files typically follow formatting conventions where
            sequence lines are wrapped to a fixed width, most commonly 60 or 80
            characters per line. Proper line wrapping improves readability,
            ensures compatibility with many bioinformatics tools, and follows
            formatting standards used by sequence databases such as GenBank,
            EMBL, and UniProt.
          </p>

          <p>
            This sequence line wrapper tool allows researchers to automatically
            format DNA, RNA, or protein sequences into properly wrapped FASTA
            lines. The tool removes unnecessary whitespace, optionally converts
            sequences to uppercase, and splits the sequence into evenly sized
            lines based on the chosen line width.
          </p>

          <p>
            Line wrapping is commonly required when preparing sequences for
            alignment programs, genome assembly pipelines, phylogenetic analysis,
            or sequence submission to public databases. Many legacy tools and
            sequence parsers expect properly formatted FASTA files with consistent
            line lengths.
          </p>

          <p>
            After formatting sequences you may also want to clean them using the{" "}
            <Link to="/tools/sequence-cleaner">
              Sequence Cleaner / Sanitizer
            </Link>{" "}
            or convert between formats using the{" "}
            <Link to="/tools/sequence-format-converter">
              Sequence Format Converter
            </Link>.
          </p>

          <p>
            All formatting operations are performed directly in your browser to
            ensure that sequence data remains private and is never transmitted
            to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste your DNA, RNA, or protein sequence into the input panel.</li>
          <li>Choose the desired line width for FASTA formatting.</li>
          <li>Optionally remove whitespace or convert sequences to uppercase.</li>
          <li>Click <strong>Wrap Sequence</strong>.</li>
          <li>The formatted FASTA sequence will appear in the output panel.</li>
          <li>Copy or download the wrapped sequence file.</li>
        </ol>
      }

      faq={[
        {
          question: "What is a sequence line wrapper?",
          answer:
            "A sequence line wrapper formats biological sequences into fixed-length lines, typically used in FASTA files for readability and compatibility with bioinformatics tools."
        },
        {
          question: "Why are FASTA sequences wrapped at 60 characters?",
          answer:
            "Many biological databases and sequence analysis tools historically used 60-character lines for FASTA formatting, which remains a common convention today."
        },
        {
          question: "Can this tool format protein sequences?",
          answer:
            "Yes. The line wrapper works with DNA, RNA, and protein sequences because it only reformats the sequence characters without altering them."
        },
        {
          question: "Will FASTA headers be preserved?",
          answer:
            "Yes. Lines starting with the '>' character are preserved and only sequence lines are wrapped."
        },
        {
          question: "Is my sequence uploaded anywhere?",
          answer:
            "No. All sequence formatting happens locally in your browser, ensuring complete privacy for your biological data."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Line Width
            </label>

            <input
              type="number"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />

          </div>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeSpaces}
              onChange={() => setRemoveSpaces(!removeSpaces)}
            />

            Remove whitespace

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={uppercase}
              onChange={() => setUppercase(!uppercase)}
            />

            Convert to uppercase

          </label>

        </div>

        {/* Input Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Input Sequence"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Wrapped Sequence"
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

        {/* Buttons */}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
            aria-label="Wrap Sequence 1"
            onClick={process}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Wrap Sequence
          </button>

          <button
            aria-label="Clear Wrap Sequence 1"
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