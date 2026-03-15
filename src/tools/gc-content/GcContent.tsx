import { Link } from "react-router-dom"
import { useState } from "react";
import { Copy, Download, RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";
import StatsOutput from "../../components/StatsOutput"

export default function GcContent() {

  const [sequence, setSequence] = useState("");
  const [gcContent, setGcContent] = useState<number | null>(null);
  const [length, setLength] = useState<number>(0);
  const [error, setError] = useState("");

  const calculateGC = () => {

    setError("");

    if (!sequence.trim()) {
      setError("Please enter a DNA sequence");
      return;
    }

    const clean = sequence.replace(/\s/g, "").toUpperCase();

    if (!/^[ACGT]+$/.test(clean)) {
      setError("Sequence contains invalid characters");
      return;
    }

    const gc = (clean.match(/[GC]/g) || []).length;

    const percent = (gc / clean.length) * 100;

    setGcContent(percent);
    setLength(clean.length);

  };

  const handleCopy = async () => {

    const text = `Length: ${length}\nGC Content: ${gcContent?.toFixed(2)}%`;

    await navigator.clipboard.writeText(text);

  };

  const handleDownload = () => {

    const text = `Length: ${length}\nGC Content: ${gcContent?.toFixed(2)}%`;

    const blob = new Blob([text], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "gc_content.txt";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  const loadExample = () => {

    setSequence(
`ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAA`
    );

  };

  const clearAll = () => {

    setSequence("");
    setGcContent(null);
    setLength(0);
    setError("");

  };

  return (

    <ToolLayout
  title="GC Content Calculator"
  description="Calculate GC percentage and sequence length from DNA sequences."
  badge="Sequence Tool"
  slug="gc-content"
  category="Sequence"

  seoContent={
  <>
    <h2>Calculate GC Content of DNA Sequences</h2>

    <p>
      GC content refers to the percentage of nucleotides in a DNA
      sequence that are either guanine (G) or cytosine (C). This metric
      is widely used in genomics and molecular biology to characterize
      nucleotide composition and analyze sequence properties across
      genes, genomes, and genomic regions.
    </p>

    <p>
      This GC content calculator allows researchers to quickly compute
      the GC percentage of DNA sequences along with the total sequence
      length. GC composition plays an important role in genome
      structure, gene regulation, DNA stability, and evolutionary
      studies. Many bioinformatics analyses rely on GC content to
      compare genomic regions, detect compositional bias, or evaluate
      sequencing datasets.
    </p>

    <p>
      GC-rich regions can indicate important genomic features such as
      CpG islands, regulatory elements, or highly expressed genes in
      certain organisms. Researchers often examine GC composition when
      evaluating genome assemblies or preparing sequences for further
      analysis. For broader nucleotide statistics you can also use the{" "}
      <Link to="/tools/fasta-stats">FASTA Statistics</Link>{" "}
      tool or perform deeper composition analysis with the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      All sequence processing occurs directly in your browser. Your DNA
      sequences are never uploaded to external servers, ensuring that
      sensitive genomic data remains private and secure during
      analysis.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a DNA sequence into the input field.</li>
    <li>Ensure the sequence contains valid nucleotide characters (A, C, G, T).</li>
    <li>Click <strong>Calculate GC Content</strong>.</li>
    <li>The GC percentage and sequence length will be displayed.</li>
    <li>Copy or download the GC content results if needed.</li>
  </ol>
}

faq={[
  {
    question: "What is GC content?",
    answer:
      "GC content is the percentage of nucleotides in a DNA sequence that are either guanine (G) or cytosine (C). It is a common metric used to describe nucleotide composition."
  },
  {
    question: "Why is GC content important in genomics?",
    answer:
      "GC content influences DNA stability, gene expression patterns, genome structure, and sequencing performance in many biological systems."
  },
  {
    question: "Does the calculator support FASTA sequences?",
    answer:
      "Yes. The tool can process DNA sequences that include FASTA headers and will automatically ignore the header lines."
  },
  {
    question: "What types of sequences can be analyzed?",
    answer:
      "The calculator works with standard DNA sequences composed of the nucleotides A, C, G, and T."
  },
  {
    question: "Is my sequence data stored or uploaded?",
    answer:
      "No. All calculations are performed locally in your browser and your sequence data is never transmitted to any server."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          {/* INPUT */}

          

          <SequenceInput
                      value={sequence}
                      onChange={setSequence}
                      label="DNA Sequence"
                      onLoadExample={loadExample}
                    />

          {/* OUTPUT */}

          

           <StatsOutput
                title="GC Content Result"
                stats={
                  gcContent !== null
                    ? [
                        { label: "GC Content", value: `${gcContent.toFixed(2)} %` },
                        { label: "Sequence Length", value: `${length} bp` }
                      ]
                    : []
                }
                placeholder="GC content will appear here..."
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
          aria-label="Calculate GC Content 1"
            onClick={calculateGC}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Calculate GC Content
          </button>

          <button
          aria-label="Clear Calculate GC Content 1"
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