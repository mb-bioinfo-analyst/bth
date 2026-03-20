import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";

const aaWeights: Record<string, number> = {
  A: 89.09,
  R: 174.20,
  N: 132.12,
  D: 133.10,
  C: 121.15,
  Q: 146.15,
  E: 147.13,
  G: 75.07,
  H: 155.16,
  I: 131.17,
  L: 131.17,
  K: 146.19,
  M: 149.21,
  F: 165.19,
  P: 115.13,
  S: 105.09,
  T: 119.12,
  W: 204.23,
  Y: 181.19,
  V: 117.15
};

const pKa = {
  K: 10.5,
  R: 12.4,
  H: 6.0,
  D: 3.9,
  E: 4.1,
  C: 8.3,
  Y: 10.1,
  Nterm: 9.6,
  Cterm: 2.4
};

export default function ProteinMwPiCalculator() {

  const [sequence, setSequence] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  function cleanSequence(seq: string) {

    return seq
      .replace(/^>.*$/gm, "")
      .replace(/\s/g, "")
      .toUpperCase();

  }

  function molecularWeight(seq: string) {

    let mw = 18.015;

    for (const aa of seq) {
      mw += aaWeights[aa] || 0;
    }

    return mw;
  }

  function aminoAcidCounts(seq: string) {

    const counts: Record<string, number> = {};

    for (const aa of seq) {
      counts[aa] = (counts[aa] || 0) + 1;
    }

    return counts;
  }

  function estimatePI(seq: string) {

    let ph = 7;
    let step = 3.5;

    const counts = aminoAcidCounts(seq);

    for (let i = 0; i < 20; i++) {

      const charge =
        (counts.K || 0) / (1 + 10 ** (ph - pKa.K)) +
        (counts.R || 0) / (1 + 10 ** (ph - pKa.R)) +
        (counts.H || 0) / (1 + 10 ** (ph - pKa.H)) +
        1 / (1 + 10 ** (ph - pKa.Nterm))
        -
        (counts.D || 0) / (1 + 10 ** (pKa.D - ph)) -
        (counts.E || 0) / (1 + 10 ** (pKa.E - ph)) -
        (counts.C || 0) / (1 + 10 ** (pKa.C - ph)) -
        (counts.Y || 0) / (1 + 10 ** (pKa.Y - ph)) -
        1 / (1 + 10 ** (pKa.Cterm - ph));

      if (charge > 0) {
        ph += step;
      } else {
        ph -= step;
      }

      step /= 2;

    }

    return ph;

  }

  function extinctionCoefficient(seq: string) {

    const W = (seq.match(/W/g) || []).length;
    const Y = (seq.match(/Y/g) || []).length;
    const C = (seq.match(/C/g) || []).length;

    return W * 5500 + Y * 1490 + C * 125;

  }

  function analyze() {

    setError("");
    setResult(null);

    if (!sequence.trim()) {
      setError("Please enter a protein sequence");
      return;
    }

    const clean = cleanSequence(sequence);

    if (!/^[ACDEFGHIKLMNPQRSTVWY]+$/.test(clean)) {
      setError("Sequence contains invalid amino acids");
      return;
    }

    const mw = molecularWeight(clean);
    const pi = estimatePI(clean);
    const counts = aminoAcidCounts(clean);
    const ext = extinctionCoefficient(clean);

    setResult({
      length: clean.length,
      mw,
      pi,
      ext,
      counts
    });

  }

  const loadExample = () => {

    setSequence(`>example_protein
MKWVTFISLLFLFSSAYS`);

    setError("");
    setResult(null);

  };

  const clearAll = () => {

    setSequence("");
    setResult(null);
    setError("");

  };

  return (

    <ToolLayout
      badge="Protein Tool"
      slug="protein-mw"
      category="Protein Analysis"

      seoContent={
        <>
          <h2>Protein Molecular Weight and Isoelectric Point (pI) Calculator</h2>

          <p>
            Protein molecular weight and isoelectric point (pI) are fundamental
            biochemical properties used in protein characterization, purification,
            and proteomics analysis. Molecular weight represents the total mass
            of a protein derived from the combined masses of its amino acid
            residues, while the isoelectric point is the pH at which the protein
            carries no net electrical charge.
          </p>

          <p>
            This protein molecular weight and pI calculator analyzes amino acid
            sequences to estimate key biochemical parameters including sequence
            length, molecular weight, theoretical isoelectric point, extinction
            coefficient, and amino acid composition. These metrics are commonly
            used in workflows such as protein purification, electrophoresis,
            chromatography, and mass spectrometry experiments.
          </p>

          <p>
            Molecular weight is calculated using standard amino acid residue
            masses, while the theoretical pI is estimated by iteratively
            determining the pH at which the protein`s net charge approaches zero
            based on the pKa values of ionizable amino acids and terminal groups.
            The extinction coefficient estimates protein absorbance at 280 nm,
            which is frequently used to measure protein concentration in UV
            spectrophotometry experiments.
          </p>

          <p>
            These sequence-derived properties are essential for protein
            characterization, expression construct design, and experimental
            planning. You may also analyze structural properties using the{" "}
            <Link to="/tools/protein-hydrophobicity-kyte-doolittle">
              Protein Hydrophobicity (Kyte-Doolittle)
            </Link>{" "}
            tool or identify functional sequence motifs using the{" "}
            <Link to="/tools/motif-pattern-finder">
              Motif / Pattern Finder
            </Link>.
            All calculations run locally in your browser so protein sequences
            remain private and are never uploaded to external servers.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a protein sequence or FASTA entry into the input panel.</li>
          <li>Click <strong>Analyze Protein</strong> to compute sequence statistics.</li>
          <li>View calculated properties including molecular weight and theoretical pI.</li>
          <li>Review the extinction coefficient and amino acid composition.</li>
          <li>Copy or download the results for downstream analysis.</li>
        </ol>
      }

      faq={[
        {
          question: "What is the molecular weight of a protein?",
          answer:
            "Protein molecular weight is the total mass of a protein calculated from the combined masses of its amino acid residues and is typically expressed in Daltons (Da)."
        },
        {
          question: "What is the isoelectric point (pI)?",
          answer:
            "The isoelectric point is the pH at which a protein carries no net electrical charge. At this pH, proteins often have minimal solubility."
        },
        {
          question: "Why is the extinction coefficient important?",
          answer:
            "The extinction coefficient estimates how strongly a protein absorbs ultraviolet light at 280 nm, allowing researchers to estimate protein concentration using spectrophotometry."
        },
        {
          question: "How accurate are theoretical pI calculations?",
          answer:
            "Theoretical pI values are estimates derived from amino acid composition and known pKa values. Actual pI values may differ depending on protein structure and environmental conditions."
        },
        {
          question: "Is my protein sequence uploaded anywhere?",
          answer:
            "No. All protein property calculations are performed locally in your browser, ensuring that sequence data remains private."
        }
      ]}
    >

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        <div className="p-6">

          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label="Protein Sequence"
            onLoadExample={loadExample}
          />

        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">

          {result ? (

            <div className="grid md:grid-cols-4 gap-6 text-center">

              <div>
                <p className="text-sm text-gray-500">Length</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.length} aa
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Molecular Weight</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.mw.toFixed(2)} Da
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Isoelectric Point (pI)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.pi.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Extinction Coefficient</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.ext}
                </p>
              </div>

            </div>

          ) : (

            <p className="text-center text-gray-500">
              Protein statistics will appear here
            </p>

          )}

        </div>

        {error && (

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-600" />

            <p className="text-red-700 text-sm">{error}</p>

          </div>

        )}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
            aria-label="Clear Analyze Protein 1"
            onClick={analyze}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Analyze Protein
          </button>

          <button
            aria-label="Clear Analyze Protein 1"
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