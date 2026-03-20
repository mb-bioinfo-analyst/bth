import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

type Mode = "upper" | "lower" | "toggle";

export default function SequenceCaseConverter() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("upper");
  const [removeSpaces, setRemoveSpaces] = useState(false);
  const [error, setError] = useState("");

  function convert() {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a sequence");
      return;
    }

    const lines = input.split("\n");

    const processed = lines.map(line => {

      if (line.startsWith(">")) return line;

      let seq = line;

      if (removeSpaces) {
        seq = seq.replace(/\s/g, "");
      }

      if (mode === "upper") {
        seq = seq.toUpperCase();
      }

      if (mode === "lower") {
        seq = seq.toLowerCase();
      }

      if (mode === "toggle") {
        seq = seq
          .split("")
          .map(c =>
            c === c.toUpperCase()
              ? c.toLowerCase()
              : c.toUpperCase()
          )
          .join("");
      }

      return seq;

    });

    setOutput(processed.join("\n"));

  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  }

  const handleDownload = () => {

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_sequence.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }

  const loadExample = () => {

    setInput(`>example_sequence
atgcGTACgtagctAGCT`);

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
      slug="sequence-case-converter"
      category="Sequence"

      seoContent={
        <>
          <h2>Sequence Case Converter</h2>

          <p>
            Biological sequence data may appear in different letter cases
            depending on the software used to generate it or the conventions
            of a specific analysis pipeline. Some tools expect uppercase DNA
            or protein sequences, while lowercase letters are sometimes used
            to indicate masked regions, low-complexity regions, or annotation
            features. A sequence case converter helps standardize sequences
            by transforming characters into uppercase, lowercase, or toggled
            case formats while preserving the underlying sequence content.
          </p>

          <p>
            This sequence case converter works with DNA, RNA, and protein
            sequences and supports both plain sequence input and FASTA
            formatted datasets. FASTA headers are preserved automatically,
            while only the sequence lines are modified. This ensures that
            the resulting sequences remain compatible with common
            bioinformatics pipelines, alignment tools, and genome browsers.
          </p>

          <p>
            Converting sequence case is often useful when preparing datasets
            for downstream analysis, formatting FASTA files for publication,
            or switching between masked and unmasked sequence representations.
            You can also preprocess sequences using tools such as the{" "}
            <Link to="/tools/remove-gaps">Remove Gaps Tool</Link>{" "}
            or standardize sequence formatting with the{" "}
            <Link to="/tools/fasta-formatter">FASTA Formatter</Link>.
          </p>

          <p>
            All sequence processing occurs locally within your browser. No
            sequence data is transmitted to external servers, ensuring that
            your biological datasets remain completely private.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a DNA, RNA, or protein sequence into the input panel.</li>
          <li>Select the desired case conversion mode (uppercase, lowercase, or toggle).</li>
          <li>Optionally enable whitespace removal if needed.</li>
          <li>Click <strong>Convert Case</strong>.</li>
          <li>Copy or download the formatted sequence.</li>
        </ol>
      }

      faq={[
        {
          question: "Why would I convert sequence case?",
          answer:
            "Different bioinformatics tools expect sequences in specific formats. Converting sequence case helps standardize datasets and ensures compatibility with downstream analysis pipelines."
        },
        {
          question: "Will FASTA headers be modified?",
          answer:
            "No. FASTA headers beginning with the '>' character are preserved exactly as written. Only the sequence lines are converted."
        },
        {
          question: "Can this tool handle protein sequences?",
          answer:
            "Yes. The tool works with DNA, RNA, and protein sequences because it only changes the case of characters without altering the sequence content."
        },
        {
          question: "What does toggle case mean?",
          answer:
            "Toggle case switches uppercase characters to lowercase and lowercase characters to uppercase throughout the sequence."
        },
        {
          question: "Is my sequence uploaded to a server?",
          answer:
            "No. All sequence processing happens locally in your browser, ensuring full privacy for your biological data."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Conversion Mode
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full px-4 py-2 border rounded-lg"
            >

              <option value="upper">Convert to UPPERCASE</option>
              <option value="lower">Convert to lowercase</option>
              <option value="toggle">Toggle Case</option>

            </select>

          </div>

          <div className="flex items-end">

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={removeSpaces}
                onChange={() => setRemoveSpaces(!removeSpaces)}
              />

              Remove whitespace

            </label>

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
            title="Converted Sequence"
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
            aria-label="Convert Case 1"
            onClick={convert}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Convert Case
          </button>

          <button
            aria-label="Clear Convert Case 1"
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