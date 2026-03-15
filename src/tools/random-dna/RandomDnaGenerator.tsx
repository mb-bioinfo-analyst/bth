import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceOutput from "../../components/SequenceOutput";

type Format = "raw" | "fasta";

export default function RandomDnaGenerator() {

  const [length, setLength] = useState(100);
  const [count, setCount] = useState(1);
  const [gc, setGc] = useState(50);
  const [format, setFormat] = useState<Format>("fasta");
  const [prefix, setPrefix] = useState("sequence");
  const [avoidHomopolymer, setAvoidHomopolymer] = useState(false);
  const [output, setOutput] = useState("");

  function randomBase(gc:number){

    const r = Math.random()*100;

    if(r < gc/2) return "G";
    if(r < gc) return "C";

    return Math.random()<0.5 ? "A" : "T";
  }

  function generateSequence(){

    let seq = "";

    for(let i=0;i<length;i++){

      let base = randomBase(gc);

      if(avoidHomopolymer && seq.endsWith(base.repeat(4))){
        base = base === "A" ? "T" : "A";
      }

      seq += base;
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

    setOutput("");
    setLength(100);
    setCount(1);
    setGc(50);

  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {

    const blob = new Blob([output],{type:"text/plain"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = format==="fasta" ? "random_sequences.fasta" : "random_sequences.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (

    <ToolLayout
  title="Random DNA Sequence Generator"
  description="Generate random DNA sequences with customizable length, GC content, and FASTA output."
  badge="Sequence Tool"
  slug="random-dna"
  category="Sequence"

  seoContent={
  <>
    <h2>Random DNA Sequence Generator</h2>

    <p>
      Random DNA sequence generation is commonly used in bioinformatics,
      synthetic biology, and computational genomics. Researchers often
      require artificial nucleotide sequences to benchmark bioinformatics
      pipelines, simulate sequencing experiments, design control datasets,
      or test sequence analysis algorithms. A random DNA generator produces
      nucleotide sequences composed of the four canonical bases (A, T, G,
      and C) according to user-defined parameters.
    </p>

    <p>
      This random DNA sequence generator allows users to create one or
      multiple nucleotide sequences with customizable sequence length,
      GC content, and output format. Sequences can be exported in FASTA
      format for compatibility with common bioinformatics tools or as
      plain nucleotide strings for quick testing and simulations.
    </p>

    <p>
      The generator also includes options to limit long homopolymer runs,
      which are stretches of identical nucleotides that may interfere with
      sequencing technologies or computational analyses. Adjusting GC
      content allows researchers to simulate sequences resembling the
      composition of specific genomes or genomic regions. Generated
      sequences can then be analyzed using tools such as the{" "}
      <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
      or the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      Random nucleotide sequences are widely used in simulation studies,
      synthetic gene design, PCR primer testing, genome assembly
      benchmarking, and algorithm validation. All sequence generation
      occurs locally in your browser, ensuring that no sequence data is
      transmitted to external servers and maintaining complete privacy.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Enter the desired sequence length.</li>
    <li>Specify how many sequences you want to generate.</li>
    <li>Adjust the GC content percentage if needed.</li>
    <li>Select the output format (FASTA or plain sequence).</li>
    <li>Click <strong>Generate Sequences</strong> to create random DNA sequences.</li>
    <li>Copy or download the generated sequences for further analysis.</li>
  </ol>
}

faq={[
  {
    question: "What is a random DNA sequence?",
    answer:
      "A random DNA sequence is an artificially generated nucleotide sequence composed of A, T, G, and C bases. These sequences are often used for simulation studies, benchmarking bioinformatics tools, and algorithm testing."
  },
  {
    question: "What is GC content in DNA?",
    answer:
      "GC content refers to the percentage of nucleotides in a DNA sequence that are guanine (G) or cytosine (C). It affects DNA stability, melting temperature, and genome composition."
  },
  {
    question: "Why avoid homopolymers in DNA sequences?",
    answer:
      "Homopolymers are long stretches of identical bases such as AAAA or GGGGG. They can cause sequencing errors and may interfere with some computational analyses."
  },
  {
    question: "Can I generate multiple sequences at once?",
    answer:
      "Yes. The generator allows you to create multiple random DNA sequences by specifying the number of sequences to generate."
  },
  {
    question: "Is the sequence generation performed online?",
    answer:
      "No. All random sequence generation is performed locally in your browser, ensuring that no data is transmitted to external servers."
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
              GC Content (%)
            </label>
            <input
              type="number"
              value={gc}
              onChange={(e)=>setGc(Number(e.target.value))}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            />
          </div>

        </div>

        {/* Additional options */}

        <div className="p-6 grid md:grid-cols-3 gap-6">

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
            title="Generated Sequences"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {/* Buttons */}

        <div className="p-6 border-t border-gray-200 flex gap-4">

          <button
          aria-label="Generate Sequences 1"
            onClick={generate}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Generate Sequences
          </button>

          <button
          aria-label="Clear Generate Sequences 1"
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