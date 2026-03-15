import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";

type Method = "wallace" | "gc";

export default function TmCalculator() {

  const [sequence, setSequence] = useState("");
  const [tm, setTm] = useState<number | null>(null);
  const [method, setMethod] = useState<Method>("wallace");
  const [error, setError] = useState("");

  const calculateTm = () => {

    setError("");
    setTm(null);

    if (!sequence.trim()) {
      setError("Please enter a primer sequence");
      return;
    }

    const clean = sequence
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();

    if (!/^[ACGT]+$/.test(clean)) {
      setError("Primer must contain only A, C, G, T");
      return;
    }

    const length = clean.length;

    const A = (clean.match(/A/g) || []).length;
    const T = (clean.match(/T/g) || []).length;
    const G = (clean.match(/G/g) || []).length;
    const C = (clean.match(/C/g) || []).length;

    const GC = G + C;

    let result = 0;

    if (method === "wallace") {

      result = 2 * (A + T) + 4 * (G + C);

    } else {

      result = 64.9 + 41 * (GC - 16.4) / length;

    }

    setTm(result);

  };

  const loadExample = () => {

    setSequence("ATGCGTACGTAGCTAGCTAG");

    setTm(null);
    setError("");

  };

  const clearAll = () => {

    setSequence("");
    setTm(null);
    setError("");

  };

  return (

    <ToolLayout
  title="Primer Melting Temperature (Tm) Calculator"
  description="Calculate primer melting temperature using the Wallace rule or GC-based formula."
  badge="PCR Tool"
  slug="tm-calculator"
  category="PCR"

  seoContent={
  <>
    <h2>Primer Melting Temperature (Tm) Calculator</h2>

    <p>
      Primer melting temperature (Tm) is a critical parameter in PCR
      experiments and DNA amplification workflows. The melting temperature
      represents the temperature at which half of the DNA duplex formed by
      the primer and its complementary sequence dissociates into single
      strands. Accurate estimation of primer Tm is essential for designing
      efficient PCR primers and selecting the appropriate annealing
      temperature.
    </p>

    <p>
      This tool calculates the melting temperature of short DNA primers
      using two commonly used methods: the Wallace rule and a GC-content
      based formula. The Wallace rule is a simple approximation commonly
      used for short primers, while the GC formula provides a more refined
      estimate that accounts for primer length and GC composition.
    </p>

    <p>
      Melting temperature is influenced by nucleotide composition,
      particularly the number of guanine (G) and cytosine (C) bases, which
      form stronger hydrogen bonds compared to adenine (A) and thymine (T).
      Primers with higher GC content generally have higher melting
      temperatures and stronger binding to their target sequences.
    </p>

    <p>
      Accurate primer Tm calculation helps researchers optimize PCR
      conditions, improve amplification efficiency, and minimize
      non-specific amplification. You may also want to analyze primer
      properties using the{" "}
      <Link to="/tools/primer-analyzer">
        Primer Analyzer
      </Link>{" "}
      or compute nucleotide composition using the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      This calculator performs all computations locally in your browser to
      ensure complete privacy of your sequence data.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste your DNA primer sequence into the input field.</li>
    <li>Select a calculation method (Wallace rule or GC-based formula).</li>
    <li>Click <strong>Calculate Tm</strong>.</li>
    <li>The estimated melting temperature will be displayed in degrees Celsius.</li>
    <li>Use this value to determine an appropriate PCR annealing temperature.</li>
  </ol>
}

faq={[
  {
    question: "What is primer melting temperature (Tm)?",
    answer:
      "Primer melting temperature is the temperature at which half of the DNA duplex formed by a primer and its complementary sequence dissociates into single strands."
  },
  {
    question: "What is the Wallace rule?",
    answer:
      "The Wallace rule estimates primer melting temperature using the formula Tm = 2 x (A + T) + 4 x (G + C). It is commonly used for short primers around 14-20 nucleotides."
  },
  {
    question: "Why does GC content affect Tm?",
    answer:
      "GC base pairs form three hydrogen bonds, while AT pairs form two. This makes GC-rich sequences more thermally stable, resulting in higher melting temperatures."
  },
  {
    question: "What annealing temperature should I use in PCR?",
    answer:
      "PCR annealing temperature is typically set about 3-5°C below the primer melting temperature to ensure efficient and specific primer binding."
  },
  {
    question: "Can this tool analyze RNA primers?",
    answer:
      "This calculator is designed for DNA primers and requires sequences containing only A, C, G, and T."
  },
  {
    question: "Is my primer sequence uploaded anywhere?",
    answer:
      "No. All calculations are performed locally in your browser and your sequence data is never sent to a server."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Method selector */}

        <div className="p-6 border-b border-gray-200 bg-gray-50">

          <label className="block text-gray-700 font-semibold mb-2">
            Calculation Method
          </label>

          <div className="flex gap-2">

            <button
            aria-label="Wallace Rule select 1"
              onClick={() => setMethod("wallace")}
              className={`px-4 py-2 rounded-lg border text-sm ${
                method === "wallace"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Wallace Rule
            </button>

            <button
            aria-label="GC Formula select 1"
              onClick={() => setMethod("gc")}
              className={`px-4 py-2 rounded-lg border text-sm ${
                method === "gc"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              GC Formula
            </button>

          </div>

          <p className="text-xs text-gray-500 mt-2">
            Wallace rule is best for primers shorter than ~20 bp.
          </p>

        </div>

        {/* Input */}

        <div className="p-6">

          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label="Primer Sequence"
            onLoadExample={loadExample}
          />

        </div>

        {/* Result */}

        <div className="p-6 border-t border-gray-200 bg-gray-50 text-center">

          {tm !== null ? (

            <div>

              <p className="text-gray-600 text-sm">
                Estimated Melting Temperature
              </p>

              <p className="text-4xl font-bold text-blue-600 mt-2">
                {tm.toFixed(2)} °C
              </p>

            </div>

          ) : (

            <p className="text-gray-500">
              Tm will appear here after calculation
            </p>

          )}

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">

            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5"/>

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        {/* Buttons */}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Calculate Tm 1"
            onClick={calculateTm}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Calculate Tm
          </button>

          <button
          aria-label="Clear Calculate Tm 1"
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