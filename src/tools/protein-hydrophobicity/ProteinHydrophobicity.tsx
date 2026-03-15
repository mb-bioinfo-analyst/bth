import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const kdScale: Record<string, number> = {
  A: 1.8,
  R: -4.5,
  N: -3.5,
  D: -3.5,
  C: 2.5,
  Q: -3.5,
  E: -3.5,
  G: -0.4,
  H: -3.2,
  I: 4.5,
  L: 3.8,
  K: -3.9,
  M: 1.9,
  F: 2.8,
  P: -1.6,
  S: -0.8,
  T: -0.7,
  W: -0.9,
  Y: -1.3,
  V: 4.2
};

export default function ProteinHydrophobicity(){

  const [sequence,setSequence] = useState("");
  const [windowSize,setWindowSize] = useState(9);
  const [data,setData] = useState<any[]>([]);
  const [avg,setAvg] = useState<number | null>(null);
  const [error,setError] = useState("");

  function cleanSequence(seq:string){

    return seq
      .replace(/^>.*$/gm,"")
      .replace(/\s/g,"")
      .toUpperCase();

  }

  function calculate(){

    setError("");
    setData([]);
    setAvg(null);

    if(!sequence.trim()){
      setError("Please enter a protein sequence");
      return;
    }

    const clean = cleanSequence(sequence);

    if(!/^[ACDEFGHIKLMNPQRSTVWY]+$/.test(clean)){
      setError("Sequence contains invalid amino acids");
      return;
    }

    const scores = clean.split("").map(a=>kdScale[a]);

    const profile = [];

    for(let i=0;i<=scores.length-windowSize;i++){

      const window = scores.slice(i,i+windowSize);

      const avgScore = window.reduce((a,b)=>a+b,0)/windowSize;

      profile.push({
        position: i+1,
        hydrophobicity: Number(avgScore.toFixed(3))
      });

    }

    const overall = scores.reduce((a,b)=>a+b,0)/scores.length;

    setAvg(Number(overall.toFixed(3)));
    setData(profile);

  }

  const loadExample = ()=>{

    setSequence(`>example_protein
MKWVTFISLLFLFSSAYS`);

    setData([]);
    setError("");

  }

  const clearAll = ()=>{

    setSequence("");
    setData([]);
    setAvg(null);
    setError("");

  }

  return(

    <ToolLayout
  title="Protein Hydrophobicity (Kyte-Doolittle)"
  description="Analyze protein hydrophobicity profiles using the Kyte-Doolittle scale with sliding window analysis."
  badge="Protein Tool"
  slug="protein-hydrophobicity"
  category="Protein Analysis"

  seoContent={
  <>
    <h2>Protein Hydrophobicity Calculator Using the Kyte-Doolittle Scale</h2>

    <p>
      Protein hydrophobicity analysis is widely used to study how hydrophobic
      and hydrophilic amino acids are distributed along a protein sequence.
      The Kyte-Doolittle hydrophobicity scale assigns a numerical value to
      each amino acid that reflects its tendency to interact with water or
      lipid environments. By evaluating hydrophobicity across a sliding
      window, researchers can identify structural and functional regions
      within proteins.
    </p>

    <p>
      This protein hydrophobicity calculator generates a Kyte-Doolittle
      hydropathy profile from an input amino acid sequence. The tool
      computes average hydrophobicity values across a user-defined sliding
      window and visualizes the results as an interactive hydrophobicity
      plot. Peaks in the profile often represent hydrophobic regions,
      while valleys correspond to hydrophilic segments.
    </p>

    <p>
      Hydrophobicity profiles are commonly used to predict membrane-spanning
      helices, identify surface-exposed residues, and study structural
      domains in proteins. Researchers frequently use hydropathy analysis
      when investigating membrane proteins, peptide design, and protein
      engineering workflows. You may also analyze amino acid sequences
      using related tools such as the{" "}
      <Link to="/tools/motif-pattern-finder">
        Motif / Pattern Finder
      </Link>{" "}
      to identify conserved sequence motifs.
    </p>

    <p>
      All calculations are performed locally within your browser. Protein
      sequences are never uploaded to external servers, ensuring complete
      privacy for sensitive or unpublished sequence data.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a protein sequence or FASTA entry into the input field.</li>
    <li>Select a sliding window size for the hydrophobicity calculation.</li>
    <li>Click <strong>Calculate Hydrophobicity</strong>.</li>
    <li>View the hydrophobicity profile generated from the sequence.</li>
    <li>Interpret peaks and valleys to identify hydrophobic and hydrophilic regions.</li>
  </ol>
}

faq={[
  {
    question: "What is the Kyte-Doolittle hydrophobicity scale?",
    answer:
      "The Kyte-Doolittle scale assigns hydrophobicity values to amino acids and is commonly used to analyze hydrophobic regions of proteins, particularly transmembrane segments."
  },
  {
    question: "What does a hydrophobicity plot show?",
    answer:
      "A hydrophobicity plot shows how hydrophobic or hydrophilic different regions of a protein are along its sequence, helping identify structural or functional domains."
  },
  {
    question: "What sliding window size should I use?",
    answer:
      "Typical window sizes range from 7 to 19 residues. Smaller windows reveal local variation while larger windows highlight broader hydrophobic regions."
  },
  {
    question: "Can hydrophobicity analysis identify membrane proteins?",
    answer:
      "Yes. Strongly hydrophobic segments in the plot often correspond to transmembrane helices in membrane proteins."
  },
  {
    question: "Is my protein sequence uploaded anywhere?",
    answer:
      "No. All hydrophobicity calculations run locally in your browser and no sequence data is transmitted to external servers."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Controls */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Sliding Window Size
            </label>

            <input
              type="number"
              value={windowSize}
              onChange={(e)=>setWindowSize(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />

          </div>

        </div>

        {/* Input */}

        <div className="p-6">

          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label="Protein Sequence"
            onLoadExample={loadExample}
          />

        </div>

        {/* Plot */}

        <div className="p-6 border-t border-gray-200 bg-gray-50">

          {data.length>0 ?(

            <div className="space-y-6">

              <div className="text-center">

                <p className="text-sm text-gray-500">
                  Average Hydrophobicity
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {avg}
                </p>

              </div>

              <div className="w-full h-80">

                <ResponsiveContainer>

                  <LineChart data={data}>

                    <CartesianGrid strokeDasharray="3 3"/>

                    <XAxis dataKey="position"/>

                    <YAxis/>

                    <Tooltip/>

                    <Line
                      type="monotone"
                      dataKey="hydrophobicity"
                      stroke="#2563eb"
                      dot={false}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>

          ):(
            <p className="text-center text-gray-500">
              Hydrophobicity plot will appear here
            </p>
          )}

        </div>

        {error &&(

          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-600"/>

            <p className="text-red-700 text-sm">
              {error}
            </p>

          </div>

        )}

        {/* Buttons */}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Clear Calculate Hydrophobicity 1"
            onClick={calculate}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Calculate Hydrophobicity
          </button>

          <button
          aria-label="Clear Calculate Hydrophobicity 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4"/>
            Clear
          </button>

        </div>

      </div>

    </ToolLayout>

  )

}