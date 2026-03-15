import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceOutput from "../../components/SequenceOutput";

type Format = "raw" | "fasta";

const STANDARD_AA = "ACDEFGHIKLMNPQRSTVWY";

export default function RandomProteinGenerator() {

  const [length, setLength] = useState(100);
  const [count, setCount] = useState(1);
  const [prefix, setPrefix] = useState("protein");
  const [format, setFormat] = useState<Format>("fasta");
  const [avoidHomopolymer, setAvoidHomopolymer] = useState(false);
  const [alphabet, setAlphabet] = useState(STANDARD_AA);

  const [output, setOutput] = useState("");

  function randomAA() {

    const index = Math.floor(Math.random() * alphabet.length);
    return alphabet[index];

  }

  function generateSequence(){

    let seq = "";

    for(let i=0;i<length;i++){

      let aa = randomAA();

      if(avoidHomopolymer && seq.endsWith(aa.repeat(4))){
        aa = alphabet[Math.floor(Math.random()*alphabet.length)];
      }

      seq += aa;

    }

    return seq;
  }

  function generate(){

    let result = "";

    for(let i=1;i<=count;i++){

      const seq = generateSequence();

      if(format==="fasta"){

        const wrapped = seq.match(/.{1,60}/g)?.join("\n") || seq;

        result += `>${prefix}_${i}\n${wrapped}\n`;

      }else{

        result += seq+"\n";

      }

    }

    setOutput(result.trim());

  }

  function clearAll(){

    setLength(100);
    setCount(1);
    setPrefix("protein");
    setAlphabet(STANDARD_AA);
    setOutput("");

  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {

    const blob = new Blob([output],{type:"text/plain"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = format==="fasta"
      ? "random_proteins.fasta"
      : "random_proteins.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  };

  return (

    <ToolLayout
  title="Random Protein Sequence Generator"
  description="Generate random amino acid sequences for testing, benchmarking, and bioinformatics workflows."
  badge="Protein Tool"
  slug="random-protein"
  category="Protein"

  seoContent={
  <>
    <h2>Random Protein Sequence Generator</h2>

    <p>
      Random protein sequence generation is commonly used in bioinformatics,
      computational biology, and protein engineering research. Artificially
      generated amino acid sequences allow researchers to test sequence
      analysis algorithms, simulate evolutionary models, benchmark protein
      alignment tools, and create control datasets for machine learning
      pipelines.
    </p>

    <p>
      This random protein sequence generator creates artificial amino acid
      sequences using customizable parameters such as sequence length,
      number of sequences, amino acid alphabet, and output format. By
      default, the generator uses the twenty standard amino acids, but
      users can modify the alphabet to simulate specialized datasets,
      restricted residue sets, or experimental protein design scenarios.
    </p>

    <p>
      Generated sequences can be exported in FASTA format, which is widely
      used in bioinformatics workflows such as sequence alignment,
      structural prediction, motif discovery, and protein modeling. You
      can further analyze generated proteins using tools like the{" "}
      <Link to="/tools/protein-hydrophobicity-kyte-doolittle">
        Protein Hydrophobicity (Kyte-Doolittle)
      </Link>{" "}
      calculator or examine functional patterns with the{" "}
      <Link to="/tools/motif-pattern-finder">
        Motif / Pattern Finder
      </Link>.
    </p>

    <p>
      Random protein sequences are useful for simulation studies,
      benchmarking bioinformatics pipelines, and developing new sequence
      analysis methods. All sequence generation is performed locally in
      your browser, ensuring that no sequence data is transmitted to
      external servers and maintaining complete privacy.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Enter the desired protein sequence length.</li>
    <li>Specify how many sequences you want to generate.</li>
    <li>Choose a header prefix for FASTA output.</li>
    <li>Optionally modify the amino acid alphabet.</li>
    <li>Select the output format (FASTA or plain sequence).</li>
    <li>Click <strong>Generate Proteins</strong> to create random sequences.</li>
    <li>Copy or download the generated protein sequences.</li>
  </ol>
}

faq={[
  {
    question: "What is a random protein sequence?",
    answer:
      "A random protein sequence is an artificially generated amino acid sequence created by randomly selecting residues from a defined amino acid alphabet."
  },
  {
    question: "Why generate random protein sequences?",
    answer:
      "Random protein sequences are useful for testing bioinformatics algorithms, benchmarking sequence alignment tools, simulating datasets, and training machine learning models."
  },
  {
    question: "Can I customize the amino acid alphabet?",
    answer:
      "Yes. You can modify the amino acid alphabet to generate sequences with restricted residue sets or simulate specific experimental conditions."
  },
  {
    question: "What is FASTA format?",
    answer:
      "FASTA is a common bioinformatics format used to store biological sequences. Each sequence begins with a header line starting with '>' followed by the sequence on subsequent lines."
  },
  {
    question: "Is sequence generation performed online?",
    answer:
      "No. All protein sequence generation is performed locally in your browser, ensuring that no data is transmitted to external servers."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Controls */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">

          <div>

            <label className="text-sm font-semibold text-gray-700">
              Sequence Length
            </label>

            <input
              type="number"
              value={length}
              onChange={(e)=>setLength(Number(e.target.value))}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            />

          </div>

          <div>

            <label className="text-sm font-semibold text-gray-700">
              Number of Sequences
            </label>

            <input
              type="number"
              value={count}
              onChange={(e)=>setCount(Number(e.target.value))}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            />

          </div>

          <div>

            <label className="text-sm font-semibold text-gray-700">
              Header Prefix
            </label>

            <input
              type="text"
              value={prefix}
              onChange={(e)=>setPrefix(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            />

          </div>

        </div>

        {/* Advanced Options */}

        <div className="p-6 grid md:grid-cols-2 gap-6">

          <div>

            <label className="text-sm font-semibold text-gray-700">
              Amino Acid Alphabet
            </label>

            <input
              type="text"
              value={alphabet}
              onChange={(e)=>setAlphabet(e.target.value.toUpperCase())}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            />

            <p className="text-xs text-gray-500 mt-1">
              Default: 20 standard amino acids
            </p>

          </div>

          <div>

            <label className="text-sm font-semibold text-gray-700">
              Output Format
            </label>

            <select
              value={format}
              onChange={(e)=>setFormat(e.target.value as Format)}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            >

              <option value="fasta">FASTA</option>
              <option value="raw">Plain Sequence</option>

            </select>

          </div>

          <div className="flex items-end">

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={avoidHomopolymer}
                onChange={()=>setAvoidHomopolymer(!avoidHomopolymer)}
              />

              Avoid long homopolymers

            </label>

          </div>

        </div>

        {/* Output */}

        <div className="p-6 border-t border-gray-200">

          <SequenceOutput
            value={output}
            title="Generated Protein Sequences"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {/* Buttons */}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Generate Proteins 1"
            onClick={generate}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Generate Proteins
          </button>

          <button
          aria-label="Clear Generate Proteins 1"
            onClick={clearAll}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4"/>
            Reset
          </button>

        </div>

      </div>

    </ToolLayout>
  );
}