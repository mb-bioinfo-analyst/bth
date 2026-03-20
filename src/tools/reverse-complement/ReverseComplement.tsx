import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function ReverseComplement() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const complement: Record<string, string> = {
    A: "T",
    T: "A",
    C: "G",
    G: "C",
    R: "Y",
    Y: "R",
    S: "S",
    W: "W",
    K: "M",
    M: "K",
    B: "V",
    D: "H",
    H: "D",
    V: "B",
    N: "N",
  };

  const compute = () => {
    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter a DNA or FASTA sequence");
      return;
    }

    try {
      let entries: { header: string | null; seq: string }[] = [];

      // Detect FASTA anywhere in input
      if (input.includes(">")) {
        const rawEntries = input.split(/^>/gm).filter(Boolean);

        entries = rawEntries.map((entry) => {
          const lines = entry.split("\n");

          const header = lines[0].trim();
          const sequence = lines.slice(1).join("");

          return { header, seq: sequence };
        });
      } else {
        // Plain sequence
        entries = [{ header: null, seq: input }];
      }

      const results: string[] = [];

      for (const { header, seq } of entries) {
        const cleanSeq = seq
          .replace(/\s/g, "")
          .toUpperCase()
          .replace(/U/g, "T"); // RNA support

        if (!cleanSeq) continue;

        if (!/^[ACGTRYSWKMBDHVN]+$/.test(cleanSeq)) {
          throw new Error(
            `Invalid characters in sequence${header ? `: ${header}` : ""}`
          );
        }

        const revComp = cleanSeq
          .split("")
          .reverse()
          .map((n) => complement[n] || n)
          .join("");

        // Wrap at 80 chars
        const wrapped =
          revComp.match(/.{1,80}/g)?.join("\n") || revComp;

        if (header) {
          results.push(`>${header}_reverse_complement\n${wrapped}`);
        } else {
          results.push(wrapped);
        }
      }

      setOutput(results.join("\n"));
    } catch (err: any) {
      setError(err.message || "Error processing sequence");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reverse_complement.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setInput("ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAA");
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
      slug="reverse-complement"
      category="Sequence"

      seoContent={
        <>
          <h2>Reverse Complement Calculator (IUPAC Supported)</h2>

          <p>
            This <strong>DNA reverse complement tool</strong> converts nucleotide sequences
            into their reverse complementary strand by applying base-pairing rules and
            reversing the sequence direction (5' → 3'). In DNA, adenine (A) pairs with
            thymine (T), and cytosine (C) pairs with guanine (G), forming the foundation
            of complementary strand analysis.
          </p>

          <p>
            The reverse complement is essential in <strong>bioinformatics, genomics, and molecular biology</strong>
            because many genes and regulatory elements are encoded on the opposite strand.
            Researchers use reverse complements when analyzing antisense sequences,
            interpreting sequencing reads, designing PCR primers, and scanning motifs
            across both DNA strands.
          </p>

          <p>
            This tool supports <strong>IUPAC ambiguity codes</strong> including R, Y, S, W, K, M,
            B, D, H, V, and N, ensuring accurate handling of real-world sequencing data,
            consensus sequences, and degenerate motifs. It works with both raw DNA input
            and FASTA-formatted sequences, making it suitable for research workflows.
          </p>

          <p>
            The algorithm performs two steps: (1) nucleotide complement mapping and
            (2) sequence reversal. This process runs in linear time <code>O(n)</code>,
            making it efficient even for large genomic sequences.
          </p>

          <p>
            Reverse complements are commonly used in:
          </p>

          <ul className="list-disc pl-6 space-y-1">
            <li>PCR primer and probe design</li>
            <li>Sequence alignment and read mapping</li>
            <li>Motif and regulatory element detection</li>
            <li>Genome annotation and antisense strand analysis</li>
          </ul>

          <p>
            After generating the reverse complement, you can continue your analysis using:
            {" "}
            <Link to="/tools/orf-finder">ORF Finder</Link>,{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>, or explore patterns with a motif analysis tool.
          </p>

          <p>
            <strong>Privacy guaranteed:</strong> all computations are performed locally in
            your browser. No sequences are uploaded or stored, ensuring secure handling
            of sensitive genomic data.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Paste your DNA, RNA or FASTA sequence into the input panel.
          </li>
          <li>
            Click <strong>Compute Reverse Complement</strong> to process the sequence.
          </li>
          <li>
            The tool will generate the complementary strand and reverse it into 5' → 3' orientation.
          </li>
          <li>
            Copy or download the reverse complement for further analysis.
          </li>
        </ol>
      }

      faq={[
        {
          question: "What is a DNA reverse complement?",
          answer:
            "A DNA reverse complement is created by replacing each nucleotide with its complementary base (A↔T, C↔G) and then reversing the sequence to maintain 5′ to 3′ orientation. It represents the opposite strand of a DNA molecule."
        },
        {
          question: "Why is the reverse complement important in bioinformatics?",
          answer:
            "Genes, motifs, and regulatory elements can exist on either DNA strand. Computing the reverse complement allows researchers to analyze antisense sequences, design primers, and interpret sequencing data accurately."
        },
        {
          question: "Does this reverse complement tool support IUPAC ambiguity codes?",
          answer:
            "Yes. This tool supports all standard IUPAC nucleotide codes including R, Y, S, W, K, M, B, D, H, V, and N, enabling accurate analysis of degenerate and consensus sequences."
        },
        {
          question: "Can I reverse complement FASTA sequences?",
          answer:
            "Yes. You can input FASTA-formatted sequences, and the tool will process the nucleotide sequence while preserving the biological structure of the input."
        },
        {
          question: "Does this tool support RNA sequences?",
          answer:
            "This tool is designed for DNA and RNA sequences."
        },
        {
          question: "What happens to unknown bases like N?",
          answer:
            "The base N represents any nucleotide and remains unchanged in the reverse complement, preserving uncertainty in sequencing data."
        },
        {
          question: "Is my DNA sequence uploaded or stored?",
          answer:
            "No. All computations are performed locally in your browser. Your sequences are never uploaded, ensuring complete privacy and data security."
        },
        {
          question: "How is the reverse complement calculated?",
          answer:
            "The algorithm maps each nucleotide to its complement and then reverses the sequence. This process runs in linear time O(n), making it efficient for large sequences."
        }
      ]}
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <SequenceInput
            value={input}
            onChange={setInput}
            onLoadExample={loadExample}
            label="Input Sequence"
          />

          <SequenceOutput
            value={output}
            title="Reverse Complement"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
          <button
            aria-label="Compute Reverse Complement 1"
            onClick={compute}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Compute Reverse Complement
          </button>

          <button
            aria-label="Clear Compute Reverse Complement 1"
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