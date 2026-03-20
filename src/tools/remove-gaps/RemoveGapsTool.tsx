import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function RemoveGapsTool() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [removeDash, setRemoveDash] = useState(true);
  const [removeDot, setRemoveDot] = useState(true);
  const [removeSpace, setRemoveSpace] = useState(false);

  const [error, setError] = useState("");

  function cleanSequence(line: string) {

    let seq = line;

    if (removeDash) {
      seq = seq.replace(/-/g, "");
    }

    if (removeDot) {
      seq = seq.replace(/\./g, "");
    }

    if (removeSpace) {
      seq = seq.replace(/\s/g, "");
    }

    return seq;
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

      return cleanSequence(line);

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
    a.download = "gap_removed_sequences.fasta";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }

  const loadExample = () => {

    setInput(`>seq1
ATG-C--TA.G
>seq2
ATGGC-TAG.`);

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
      slug="remove-gaps"
      category="Sequence"

      seoContent={
        <>
          <h2>Remove Gaps from Sequence Alignments</h2>

          <p>
            Sequence alignments produced by tools such as multiple sequence
            alignment programs often contain gap characters that represent
            insertions or deletions between sequences. These gaps are usually
            displayed using characters such as hyphens (<code>-</code>) or dots
            (<code>.</code>). While these symbols are useful for visualizing
            evolutionary relationships, many downstream bioinformatics workflows
            require sequences without alignment characters.
          </p>

          <p>
            This remove gaps tool cleans aligned DNA, RNA, or protein sequences
            by removing common alignment characters including dashes, dots, and
            optionally whitespace. The tool preserves FASTA headers and sequence
            structure while producing gap-free sequences suitable for downstream
            analyses.
          </p>

          <p>
            Removing gaps is often necessary when converting alignment results
            into raw sequence datasets for further analysis. Clean sequences can
            then be used for tasks such as sequence translation, motif detection,
            or composition analysis. For example, you may translate nucleotide
            sequences using the{" "}
            <Link to="/tools/dna-translate">DNA → Protein Translator</Link>{" "}
            or examine nucleotide composition using the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
          </p>

          <p>
            All sequence processing occurs locally in your browser. No biological
            sequence data is uploaded to external servers, ensuring full privacy
            when working with experimental datasets.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste aligned DNA, RNA, or protein sequences into the input panel.</li>
          <li>Select which characters should be removed (dash, dot, or whitespace).</li>
          <li>Click <strong>Remove Gaps</strong> to clean the sequences.</li>
          <li>Review the gap-free sequences in the output panel.</li>
          <li>Copy or download the cleaned sequences for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What are gaps in sequence alignments?",
          answer:
            "Gaps are placeholder characters inserted into aligned sequences to represent insertions or deletions when comparing multiple biological sequences."
        },
        {
          question: "Why remove gaps from sequences?",
          answer:
            "Gap removal is often required when preparing sequences for downstream analyses that require raw sequence data without alignment characters."
        },
        {
          question: "Will FASTA headers be preserved?",
          answer:
            "Yes. The tool preserves FASTA headers and removes gap characters only from the sequence lines."
        },
        {
          question: "Can I remove whitespace from sequences?",
          answer:
            "Yes. The tool provides an option to remove whitespace along with other gap characters."
        },
        {
          question: "Is my sequence data uploaded anywhere?",
          answer:
            "No. All sequence processing is performed locally in your browser to ensure complete data privacy."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeDash}
              onChange={() => setRemoveDash(!removeDash)}
            />

            Remove '-' gaps

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeDot}
              onChange={() => setRemoveDot(!removeDot)}
            />

            Remove '.' gaps

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeSpace}
              onChange={() => setRemoveSpace(!removeSpace)}
            />

            Remove whitespace

          </label>

        </div>

        {/* Input / Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Aligned Sequences"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Cleaned Sequences"
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
            aria-label="Remove Gaps 1"
            onClick={process}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Remove Gaps
          </button>

          <button
            aria-label="Clear Remove Gaps 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>

        </div>

      </div>

      <div className="mt-10 p-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Try the Full Sequence Toolkit
            </h3>

            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Access reverse complement, DNA ↔ RNA conversion, sequence cleaning,
              and GC content analysis ~ all in one powerful tool.
            </p>
          </div>

          <Link
            to="/tools/sequence-toolkit"
            className="mt-6 inline-flex flex-col items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition"
          >
            <span>Open Toolkit</span>
            <span className="text-xl leading-none mt-3">→</span>
          </Link>

        </div>
      </div>

    </ToolLayout>

  )

}