import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";

export default function SequenceEntropyCalculator() {

  const [input, setInput] = useState("");
  const [entropy, setEntropy] = useState<number | null>(null);
  const [normalized, setNormalized] = useState<number | null>(null);
  const [frequencies, setFrequencies] = useState<Record<string, number>>({});
  const [length, setLength] = useState<number | null>(null);
  const [error, setError] = useState("");

  function cleanSequence(seq: string) {

    return seq
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();

  }

  function calculate() {

    setError("");
    setEntropy(null);

    if (!input.trim()) {
      setError("Please enter a sequence");
      return;
    }

    const seq = cleanSequence(input);

    if (seq.length === 0) {
      setError("No sequence detected");
      return;
    }

    const counts: Record<string, number> = {};

    for (const c of seq) {
      counts[c] = (counts[c] || 0) + 1;
    }

    const freqs: Record<string, number> = {};
    const len = seq.length;

    for (const key in counts) {
      freqs[key] = counts[key] / len;
    }

    let H = 0;

    for (const key in freqs) {
      const p = freqs[key];
      H -= p * Math.log2(p);
    }

    const alphabetSize = Object.keys(freqs).length;

    const maxEntropy = Math.log2(alphabetSize);

    setEntropy(Number(H.toFixed(4)));
    setNormalized(Number((H / maxEntropy).toFixed(4)));
    setFrequencies(freqs);
    setLength(len);

  }

  const loadExample = () => {

    setInput(`>example
ATGCGTACGTAGCTAGCTAG`);

    setError("");
    setEntropy(null);

  }

  const clearAll = () => {

    setInput("");
    setEntropy(null);
    setNormalized(null);
    setFrequencies({});
    setLength(null);
    setError("");

  }

  return (

    <ToolLayout
      badge="Sequence Tool"
      slug="sequence-entropy"
      category="Sequence"

      seoContent={
        <>
          <h2>Sequence Entropy and Sequence Complexity Calculator</h2>

          <p>
            Shannon entropy is a mathematical measure used to quantify the
            information content and complexity of biological sequences. In
            bioinformatics, sequence entropy is often used to assess nucleotide
            diversity, detect conserved regions, and identify low-complexity or
            repetitive sequences within DNA, RNA, or protein datasets. High
            entropy values indicate more diverse and complex sequences, while
            low entropy values suggest repetitive or biased sequence composition.
          </p>

          <p>
            This sequence entropy calculator computes the Shannon entropy of DNA,
            RNA, or protein sequences based on the observed frequencies of each
            residue. The tool also reports normalized entropy, which allows
            comparison between sequences with different alphabet sizes or
            compositions. Normalized entropy ranges from 0 to 1, where values
            closer to 1 represent highly diverse sequences.
          </p>

          <p>
            Sequence entropy analysis is widely used in genomics, proteomics,
            motif discovery, evolutionary biology, and sequence alignment
            evaluation. It can help identify conserved functional regions,
            repetitive motifs, or biased composition patterns in genomes and
            proteins. Researchers also use entropy calculations to assess sequence
            complexity before performing downstream analyses such as alignment,
            assembly, or machine learning feature extraction.
          </p>

          <p>
            After evaluating sequence complexity you may also analyze nucleotide
            composition using the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>{" "}
            or search for conserved motifs using the{" "}
            <Link to="/tools/motif-pattern-finder">
              Motif / Pattern Finder
            </Link>.
          </p>

          <p>
            All calculations are performed directly in your browser to ensure that
            sequence data remains private and is never transmitted to external
            servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a DNA, RNA, or protein sequence into the input panel.</li>
          <li>Click <strong>Calculate Entropy</strong>.</li>
          <li>The Shannon entropy and normalized entropy values will be displayed.</li>
          <li>View residue frequency statistics for each character in the sequence.</li>
          <li>Use the results to evaluate sequence complexity or compositional bias.</li>
        </ol>
      }

      faq={[
        {
          question: "What is Shannon entropy in sequence analysis?",
          answer:
            "Shannon entropy measures the uncertainty or diversity of characters in a sequence. Higher entropy indicates more diverse composition, while lower entropy suggests repetitive or biased sequences."
        },
        {
          question: "What does normalized entropy mean?",
          answer:
            "Normalized entropy scales the Shannon entropy value relative to the maximum possible entropy for the observed alphabet size, producing a value between 0 and 1."
        },
        {
          question: "Why is sequence entropy useful in bioinformatics?",
          answer:
            "Entropy analysis helps identify conserved regions, repetitive sequences, compositional biases, and sequence complexity before downstream analyses such as alignment or motif detection."
        },
        {
          question: "Can this tool analyze protein sequences?",
          answer:
            "Yes. The entropy calculation works for DNA, RNA, and protein sequences because it only depends on character frequencies."
        },
        {
          question: "Is my sequence uploaded anywhere?",
          answer:
            "No. All sequence processing happens locally in your browser to ensure complete privacy for your biological data."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="p-6">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Sequence Input"
            onLoadExample={loadExample}
          />

        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">

          {entropy !== null ? (

            <div className="space-y-6">

              <div className="grid md:grid-cols-3 gap-6 text-center">

                <div>
                  <p className="text-sm text-gray-500">Sequence Length</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {length}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Shannon Entropy</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {entropy}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Normalized Entropy</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {normalized}
                  </p>
                </div>

              </div>

              <div>

                <h3 className="font-semibold mb-3">
                  Residue Frequencies
                </h3>

                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">

                  {Object.entries(frequencies).map(([residue, value]) => (
                    <div
                      key={residue}
                      className="p-3 border rounded-lg text-center"
                    >
                      <p className="font-semibold">{residue}</p>
                      <p className="text-sm text-gray-600">
                        {(value * 100).toFixed(2)}%
                      </p>
                    </div>
                  ))}

                </div>

              </div>

            </div>

          ) : (
            <p className="text-center text-gray-500">
              Entropy results will appear here
            </p>
          )}

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-600" />

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
            aria-label="Calculate Entropy 1"
            onClick={calculate}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Calculate Entropy
          </button>

          <button
            aria-label="Clear Calculate Entropy 1"
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