import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function FastaFormatter() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const wrapLength = 60;

  const formatFasta = () => {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a sequence");
      return;
    }

    const lines = input.trim().split("\n");

    let header = "";
    let sequence = "";

    if (lines[0].startsWith(">")) {
      header = lines[0];
      sequence = lines.slice(1).join("");
    } else {
      header = ">formatted_sequence";
      sequence = lines.join("");
    }

    const clean = sequence.replace(/\s/g, "").toUpperCase();

    if (!/^[A-Z]+$/.test(clean)) {
      setError("Sequence contains invalid characters");
      return;
    }

    const wrapped = clean.match(new RegExp(`.{1,${wrapLength}}`, "g"))?.join("\n") || clean;

    const formatted = `${header}\n${wrapped}`;

    setOutput(formatted);

  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.fasta";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  const loadExample = () => {

    setInput(`>example_sequence
atggccattgtaatgggccgctgaaagggtgcccgatag
`);

  };

  const clearAll = () => {

    setInput("");
    setOutput("");
    setError("");

  };

  return (

    <ToolLayout
      badge="Sequence Tool"
      slug="fasta-formatter"
      category="Sequence"

      seoContent={
        <>
          <h2>Format Biological Sequences into Standard FASTA Format</h2>

          <p>
            The FASTA formatter converts raw nucleotide or protein sequences
            into properly structured FASTA format. FASTA is one of the most
            widely used file formats in bioinformatics and molecular biology
            for representing biological sequences such as DNA, RNA, and
            proteins. Many sequence analysis tools require sequences to be
            provided in valid FASTA format before they can be processed.
          </p>

          <p>
            Sequence data copied from spreadsheets, databases, or sequencing
            outputs often contains inconsistent formatting. This FASTA
            formatting tool automatically cleans sequence input, removes
            whitespace and invalid characters, standardizes capitalization,
            and wraps sequence lines to a consistent length to produce a
            properly formatted FASTA file.
          </p>

          <p>
            The tool can detect whether a FASTA header already exists or
            automatically generate one if necessary. After formatting,
            sequences are returned with evenly wrapped lines suitable for
            compatibility with common bioinformatics software. If additional
            preprocessing is required, you may also use the{" "}
            <Link to="/tools/sequence-cleaner">Sequence Cleaner</Link>{" "}
            or filter datasets using the{" "}
            <Link to="/tools/fasta-filter">FASTA Filter</Link>.
          </p>

          <p>
            FASTA formatting is commonly required before performing sequence
            alignment, genome annotation, phylogenetic analysis, and many
            other bioinformatics workflows. Ensuring consistent formatting
            helps avoid parsing errors and improves compatibility with
            downstream analysis tools.
          </p>

          <p>
            Because this formatter runs entirely in your browser, your
            biological sequences are processed locally and are never
            transmitted to external servers. This guarantees full privacy
            for sensitive genomic or protein sequence data.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a nucleotide or protein sequence into the input field.</li>
          <li>If the sequence does not include a FASTA header, the tool will automatically create one.</li>
          <li>Click <strong>Format FASTA</strong>.</li>
          <li>The cleaned FASTA sequence will appear in the output panel.</li>
          <li>Copy or download the formatted FASTA file for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is FASTA format?",
          answer:
            "FASTA is a standard text-based format used to represent nucleotide or protein sequences. Each sequence begins with a header line starting with '>' followed by the sequence data."
        },
        {
          question: "What does this FASTA formatter do?",
          answer:
            "The formatter cleans sequence input, removes whitespace, standardizes capitalization, and wraps sequence lines into a properly structured FASTA format."
        },
        {
          question: "Can the tool handle sequences without FASTA headers?",
          answer:
            "Yes. If no header is present, the tool automatically generates a default FASTA header for the formatted sequence."
        },
        {
          question: "Can this tool format protein sequences as well as DNA?",
          answer:
            "Yes. The formatter works with both nucleotide and protein sequences."
        },
        {
          question: "Is my sequence uploaded to a server?",
          answer:
            "No. All sequence formatting operations run locally in your browser to ensure your data remains private."
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
            value={output}
            title="Formatted FASTA"
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
            aria-label="Format FASTA 1"
            onClick={formatFasta}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Format FASTA
          </button>

          <button
            aria-label="Clear Format FASTA 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>

        </div>

      </div>

      <div className="mt-10 p-6 md:p-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-sm">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* LEFT CONTENT */}
          <div className="space-y-4 max-w-xl">

            <h3 className="text-xl font-semibold text-gray-900">
              Explore the Complete FASTA Toolkit
            </h3>

            <p className="text-sm text-gray-600">
              Go beyond basic sequence handling. Manage, clean, and analyze FASTA files with a full suite of powerful tools — all in one place.
            </p>

            {/* FEATURES */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">

              <span>• Header extraction & editing</span>
              <span>• Filtering & deduplication</span>
              <span>• Sorting & random sampling</span>
              <span>• FASTA splitting & merging</span>
              <span>• Sequence formatting</span>
              <span>• Dataset statistics</span>

            </div>

          </div>

          {/* CTA */}
          <Link
            to="/tools/fasta-toolkit"
            className="group flex flex-col items-center justify-center min-w-[180px] px-8 py-5 rounded-2xl 
                 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg 
                 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 
                 hover:scale-[1.03]"
          >

            <span className="text-base">
              Open Toolkit
            </span>

            <span className="text-2xl leading-none mt-2 transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>

          </Link>

        </div>

      </div>

    </ToolLayout>
    

  );
}