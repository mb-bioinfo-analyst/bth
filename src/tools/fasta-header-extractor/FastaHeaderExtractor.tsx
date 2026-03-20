import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

type Mode = "full" | "id";

export default function FastaHeaderExtractor() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [mode, setMode] = useState<Mode>("full");
  const [removeSymbol, setRemoveSymbol] = useState(true);
  const [csv, setCsv] = useState(false);

  const [error, setError] = useState("");

  function extract() {

    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter FASTA data");
      return;
    }

    const lines = input.split("\n");

    const headers = lines
      .filter(line => line.startsWith(">"))
      .map(header => {

        let h = header;

        if (removeSymbol) {
          h = h.replace(/^>/, "");
        }

        if (mode === "id") {
          h = h.split(/\s+/)[0];
        }

        return h;

      });

    if (headers.length === 0) {
      setError("No FASTA headers detected");
      return;
    }

    const result = csv
      ? headers.join(",")
      : headers.join("\n");

    setOutput(result);

  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  }

  const handleDownload = () => {

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = csv
      ? "fasta_headers.csv"
      : "fasta_headers.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }

  const loadExample = () => {

    setInput(`>seq1 Homo sapiens gene A
ATGCGTACGTAG
>seq2 Mus musculus gene B
ATGCGTAGGCTA
>seq3 Example protein
ATGCGTAGCTAG`);

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
      badge="FASTA Tool"
      slug="fasta-header-extractor"
      category="FASTA"

      seoContent={
        <>
          <h2>Extract Sequence Identifiers from FASTA Files</h2>

          <p>
            FASTA headers contain important metadata about biological sequences,
            including sequence identifiers, organism names, gene annotations,
            and database references. In many bioinformatics workflows it is
            useful to extract these headers separately from the sequence data
            for tasks such as dataset indexing, annotation processing, or
            metadata analysis.
          </p>

          <p>
            This FASTA header extractor allows researchers to quickly retrieve
            either complete FASTA headers or only sequence identifiers from
            multi-FASTA datasets. The tool scans the FASTA input and collects
            all header lines that begin with the standard <code>&gt;</code>
            symbol while leaving the sequence data unchanged.
          </p>

          <p>
            Users can optionally remove the <code>&gt;</code> symbol, extract
            only the primary identifier portion of each header, or export the
            result as comma-separated values (CSV). These options make it easy
            to generate lists of sequence identifiers for spreadsheet analysis,
            scripting workflows, or integration with other tools. If you need
            to modify FASTA identifiers before extraction, you can use the{" "}
            <Link to="/tools/fasta-header-editor">FASTA Header Editor</Link>{" "}
            or preprocess sequence datasets with the{" "}
            <Link to="/tools/fasta-filter">FASTA Filter</Link>.
          </p>

          <p>
            FASTA header extraction is commonly used in genome annotation
            pipelines, transcriptomics datasets, sequence database management,
            and phylogenetic analysis workflows. Because the tool runs entirely
            in your browser, your biological sequence data is processed locally
            and never uploaded to external servers, ensuring complete privacy.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a FASTA dataset into the input field.</li>
          <li>Select whether to extract full headers or sequence IDs only.</li>
          <li>Optionally remove the <code>&gt;</code> symbol from headers.</li>
          <li>Enable CSV output if you want the results in comma-separated format.</li>
          <li>Click <strong>Extract Headers</strong>.</li>
          <li>The extracted headers will appear in the output panel.</li>
          <li>Copy or download the extracted header list for further analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is a FASTA header?",
          answer:
            "A FASTA header is the first line of a FASTA entry beginning with the '>' symbol and containing the sequence identifier and optional annotation information."
        },
        {
          question: "What does extracting sequence IDs mean?",
          answer:
            "Extracting sequence IDs returns only the primary identifier portion of each FASTA header, typically the first word following the '>' symbol."
        },
        {
          question: "Can this tool process multi-FASTA files?",
          answer:
            "Yes. The extractor supports FASTA files containing multiple sequence entries."
        },
        {
          question: "Can the output be exported as CSV?",
          answer:
            "Yes. The tool can output extracted headers as comma-separated values, which can be easily imported into spreadsheets or scripts."
        },
        {
          question: "Is my FASTA data uploaded anywhere?",
          answer:
            "No. All header extraction is performed locally in your browser to ensure that your sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Extraction Mode
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full px-4 py-2 border rounded-lg"
            >

              <option value="full">
                Full Header
              </option>

              <option value="id">
                Sequence ID Only
              </option>

            </select>

          </div>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeSymbol}
              onChange={() => setRemoveSymbol(!removeSymbol)}
            />

            Remove {">"} symbol

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={csv}
              onChange={() => setCsv(!csv)}
            />

            Output as CSV

          </label>

        </div>

        {/* Input Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="FASTA Input"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Extracted Headers"
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
            aria-label="Extract Headers FASTA 1"
            onClick={extract}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Extract Headers
          </button>

          <button
            aria-label="Clear Extract Headers FASTA 1"
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