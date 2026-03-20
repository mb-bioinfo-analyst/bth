import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";

type Method = "wallace" | "gc";

type PrimerStats = {
  length: number;
  gc: number;
  tm: number;
  anneal: number;
  gcClamp: boolean;
  hairpin: boolean;
  selfDimer: boolean;
  pairCompatible?: boolean;
};

export default function PrimerAnalyzer() {

  const [forward, setForward] = useState("");
  const [reverse, setReverse] = useState("");
  const [method, setMethod] = useState<Method>("wallace");

  const [stats, setStats] = useState<PrimerStats | null>(null);
  const [error, setError] = useState("");

  const complement: Record<string, string> = {
    A: "T", T: "A", G: "C", C: "G"
  };

  function reverseComplement(seq: string) {
    return seq
      .split("")
      .reverse()
      .map(b => complement[b] || b)
      .join("");
  }

  function detectHairpin(seq: string) {

    const rc = reverseComplement(seq);

    for (let i = 0; i < seq.length - 4; i++) {
      const sub = seq.substring(i, i + 4);
      if (rc.includes(sub)) return true;
    }

    return false;
  }

  function detectSelfDimer(seq: string) {

    const rc = reverseComplement(seq);

    for (let i = 0; i < seq.length - 4; i++) {
      const sub = seq.substring(i, i + 4);
      if (rc.includes(sub)) return true;
    }

    return false;
  }

  function cleanSequence(seq: string) {

    return seq
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();
  }

  const analyzePrimer = () => {

    setError("");
    setStats(null);

    if (!forward.trim()) {
      setError("Please enter a primer sequence");
      return;
    }

    const f = cleanSequence(forward);

    if (!/^[ACGT]+$/.test(f)) {
      setError("Primer must contain only A,C,G,T");
      return;
    }

    const length = f.length;

    const A = (f.match(/A/g) || []).length;
    const T = (f.match(/T/g) || []).length;
    const G = (f.match(/G/g) || []).length;
    const C = (f.match(/C/g) || []).length;

    const gc = ((G + C) / length) * 100;

    let tm = 0;

    if (method === "wallace") {
      tm = 2 * (A + T) + 4 * (G + C);
    } else {
      tm = 64.9 + 41 * ((G + C) - 16.4) / length;
    }

    const anneal = tm - 5;

    const last = f[f.length - 1];
    const gcClamp = last === "G" || last === "C";

    const hairpin = detectHairpin(f);

    const selfDimer = detectSelfDimer(f);

    let pairCompatible = undefined;

    if (reverse.trim()) {

      const r = cleanSequence(reverse);

      if (/^[ACGT]+$/.test(r)) {

        const rc = reverseComplement(r);

        pairCompatible = f.includes(rc.substring(0, 4));

      }

    }

    setStats({
      length,
      gc,
      tm,
      anneal,
      gcClamp,
      hairpin,
      selfDimer,
      pairCompatible
    });

  };

  const loadExample = () => {

    setForward("ATGCGTACGTAGCTAGCTAG");
    setReverse("CTAGCTACGTACGCAT");

    setStats(null);
    setError("");
  };

  const clearAll = () => {

    setForward("");
    setReverse("");
    setStats(null);
    setError("");
  };

  return (

    <ToolLayout
      badge="PCR Tool"
      slug="primer-analyzer"
      category="PCR"

      seoContent={
        <>
          <h2>PCR Primer Analyzer for DNA Primer Design</h2>

          <p>
            Designing effective PCR primers is critical for successful DNA
            amplification in molecular biology experiments. Primers must meet
            several criteria including appropriate length, balanced GC content,
            suitable melting temperature (Tm), and minimal secondary structure
            formation. Poorly designed primers can lead to non-specific
            amplification, primer–dimer artifacts, or failed PCR reactions.
          </p>

          <p>
            This primer analyzer evaluates key characteristics of DNA primers
            used in PCR and related amplification techniques. The tool calculates
            primer length, GC percentage, melting temperature (Tm), and suggested
            annealing temperature ranges. Multiple Tm estimation approaches are
            supported, including the Wallace rule for short primers and
            GC-based formulas for longer oligonucleotides.
          </p>

          <p>
            In addition to thermodynamic properties, the analyzer checks for
            structural issues such as hairpin formation and self-dimer
            interactions. When both forward and reverse primers are supplied,
            the tool also evaluates potential primer-pair interactions that
            could reduce amplification efficiency or produce unintended PCR
            products.
          </p>

          <p>
            These metrics help researchers quickly assess whether primers are
            suitable for PCR, qPCR, cloning, or sequencing experiments.
            You can also estimate melting temperatures separately using the{" "}
            <Link to="/tools/primer-tm-calculator">
              Primer Melting Temperature (Tm) Calculator
            </Link>{" "}
            or examine nucleotide composition with the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
            All calculations run locally in your browser so primer sequences
            remain private and are never uploaded to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter the forward primer sequence.</li>
          <li>Optionally enter the reverse primer sequence.</li>
          <li>Select the melting temperature calculation method.</li>
          <li>Click <strong>Analyze Primer</strong>.</li>
          <li>Review primer length, GC content, melting temperature, and structural warnings.</li>
          <li>Check primer pair compatibility if both primers are provided.</li>
        </ol>
      }

      faq={[
        {
          question: "What is primer melting temperature (Tm)?",
          answer:
            "Melting temperature (Tm) is the temperature at which half of the primer-template duplex dissociates. It helps determine the optimal annealing temperature for PCR reactions."
        },
        {
          question: "What is a GC clamp in primers?",
          answer:
            "A GC clamp refers to the presence of one or more G or C bases at the 3' end of a primer. This improves primer binding stability with the target DNA template."
        },
        {
          question: "Why are hairpins and self-dimers problematic?",
          answer:
            "Hairpins and primer-dimers occur when primers bind to themselves or to each other instead of the template DNA, which can reduce PCR efficiency and generate unwanted amplification products."
        },
        {
          question: "What primer length is recommended for PCR?",
          answer:
            "Most PCR primers are typically between 18 and 25 nucleotides long, providing a balance between specificity and appropriate melting temperature."
        },
        {
          question: "Is my primer sequence uploaded to a server?",
          answer:
            "No. All primer analysis calculations run locally in your browser, ensuring that your sequences remain private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Method selector */}

        <div className="p-6 border-b border-gray-200 bg-gray-50">

          <label className="block text-gray-700 font-semibold mb-2">
            Tm Calculation Method
          </label>

          <div className="flex gap-2">

            <button
              aria-label="Tm Calculation Method Wallace Rule 1"
              onClick={() => setMethod("wallace")}
              className={`px-4 py-2 rounded-lg border text-sm ${method === "wallace"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              Wallace Rule
            </button>

            <button
              aria-label="Tm Calculation Method GC Formula 1"
              onClick={() => setMethod("gc")}
              className={`px-4 py-2 rounded-lg border text-sm ${method === "gc"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              GC Formula
            </button>

          </div>

        </div>

        {/* Inputs */}

        <div className="p-6 grid md:grid-cols-2 gap-6">

          <SequenceInput
            value={forward}
            onChange={setForward}
            label="Forward Primer"
            onLoadExample={loadExample}
          />

          <SequenceInput
            value={reverse}
            onChange={setReverse}
            label="Reverse Primer (optional)"
          />

        </div>

        {/* Results */}

        <div className="p-6 border-t border-gray-200 bg-gray-50">

          {stats ? (

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">

              <div>
                <p className="text-sm text-gray-500">Length</p>
                <p className="text-2xl font-bold text-blue-600">{stats.length} bp</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">GC Content</p>
                <p className="text-2xl font-bold text-blue-600">{stats.gc.toFixed(2)}%</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tm</p>
                <p className="text-2xl font-bold text-blue-600">{stats.tm.toFixed(2)}°C</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Annealing Temp</p>
                <p className="text-2xl font-bold text-blue-600">{stats.anneal.toFixed(2)}°C</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">GC Clamp</p>
                <p className={`text-xl font-bold ${stats.gcClamp ? "text-green-600" : "text-red-600"}`}>
                  {stats.gcClamp ? "Good" : "Weak"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Hairpin Risk</p>
                <p className={`text-xl font-bold ${stats.hairpin ? "text-red-600" : "text-green-600"}`}>
                  {stats.hairpin ? "Possible" : "Low"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Self Dimer</p>
                <p className={`text-xl font-bold ${stats.selfDimer ? "text-red-600" : "text-green-600"}`}>
                  {stats.selfDimer ? "Possible" : "Low"}
                </p>
              </div>

              {stats.pairCompatible !== undefined && (

                <div>
                  <p className="text-sm text-gray-500">Primer Pair</p>
                  <p className={`text-xl font-bold ${stats.pairCompatible ? "text-red-600" : "text-green-600"}`}>
                    {stats.pairCompatible ? "Possible Dimer" : "OK"}
                  </p>
                </div>

              )}

            </div>

          ) : (

            <p className="text-center text-gray-500">
              Primer analysis results will appear here
            </p>

          )}

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-600" />

            <p className="text-red-700 text-sm">{error}</p>

          </div>

        )}

        {/* Buttons */}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">

          <button
            aria-label="Tm Calculation Analyze Primer 1"
            onClick={analyzePrimer}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
          >
            Analyze Primer
          </button>

          <button
            aria-label="Clear Tm Calculation Analyze Primer 1"
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