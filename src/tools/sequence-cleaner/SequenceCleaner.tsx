import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function SequenceCleaner(){

  const [input,setInput] = useState("");
  const [output,setOutput] = useState("");

  const [removeNumbers,setRemoveNumbers] = useState(true);
  const [removeSpaces,setRemoveSpaces] = useState(true);
  const [removeGaps,setRemoveGaps] = useState(true);
  const [uppercase,setUppercase] = useState(true);

  const [beforeLength,setBeforeLength] = useState<number | null>(null);
  const [afterLength,setAfterLength] = useState<number | null>(null);

  const [error,setError] = useState("");

  function cleanLine(line:string){

    if(line.startsWith(">")) return line;

    let seq = line;

    if(removeNumbers){
      seq = seq.replace(/[0-9]/g,"");
    }

    if(removeSpaces){
      seq = seq.replace(/\s/g,"");
    }

    if(removeGaps){
      seq = seq.replace(/[-.]/g,"");
    }

    if(uppercase){
      seq = seq.toUpperCase();
    }

    return seq;

  }

  function cleanSequence(){

    setError("");
    setOutput("");

    if(!input.trim()){
      setError("Please enter sequence data");
      return;
    }

    const lines = input.split("\n");

    let before = 0;
    let after = 0;

    const cleaned = lines.map(line=>{

      if(!line.startsWith(">")){
        before += line.length;
      }

      const processed = cleanLine(line);

      if(!processed.startsWith(">")){
        after += processed.length;
      }

      return processed;

    });

    setBeforeLength(before);
    setAfterLength(after);

    setOutput(cleaned.join("\n"));

  }

  const handleCopy = async ()=>{
    await navigator.clipboard.writeText(output);
  }

  const handleDownload = ()=>{

    const blob = new Blob([output],{type:"text/plain"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned_sequences.fasta";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }

  const loadExample = ()=>{

    setInput(`>seq1
ATG 12CGT-TA..A
>seq2
ATG3GTAG---A`);

    setOutput("");
    setError("");

  }

  const clearAll = ()=>{

    setInput("");
    setOutput("");
    setBeforeLength(null);
    setAfterLength(null);
    setError("");

  }

  return(

    <ToolLayout
  title="Sequence Cleaner / Sanitizer"
  description="Clean sequence data by removing numbers, whitespace, gaps and formatting artifacts."
  badge="Sequence Tool"
  slug="sequence-cleaner"
  category="Sequence"

  seoContent={
  <>
    <h2>Sequence Cleaner and FASTA Sanitizer</h2>

    <p>
      Biological sequence datasets obtained from databases, alignment
      programs, sequencing instruments, or publications often contain
      formatting artifacts such as numbers, whitespace, alignment gaps,
      or inconsistent letter casing. These artifacts can interfere with
      downstream bioinformatics tools that expect clean sequence input.
      A sequence cleaner or FASTA sanitizer helps prepare DNA, RNA, or
      protein sequences by removing unwanted characters and
      standardizing sequence formatting.
    </p>

    <p>
      This sequence cleaner removes common formatting artifacts including
      numbers, whitespace, and alignment gap characters such as hyphens
      (<code>-</code>) or dots (<code>.</code>). FASTA headers are
      automatically preserved while only sequence lines are modified.
      The tool can also convert sequences to uppercase to ensure
      compatibility with many bioinformatics pipelines and command-line
      tools that require standardized sequence formatting.
    </p>

    <p>
      Cleaning sequence data is an important preprocessing step before
      performing tasks such as sequence alignment, motif discovery,
      codon usage analysis, primer design, or genome annotation.
      After cleaning sequences you may further analyze them using tools
      such as the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>{" "}
      or translate coding regions with the{" "}
      <Link to="/tools/dna-translate">
        DNA → Protein Translator
      </Link>.
    </p>

    <p>
      All sequence processing occurs directly in your browser.
      No biological sequence data is transmitted to external servers,
      ensuring complete privacy for sensitive genomic datasets.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste raw sequence data into the input panel.</li>
    <li>Select the cleaning options you want to apply.</li>
    <li>Click <strong>Clean Sequence</strong>.</li>
    <li>The cleaned sequence will appear in the output panel.</li>
    <li>Copy or download the sanitized sequence for further analysis.</li>
  </ol>
}

faq={[
  {
    question: "Why should I clean sequence data?",
    answer:
      "Many bioinformatics tools require sequences without spaces, numbers, or alignment characters. Cleaning sequences ensures compatibility with analysis pipelines."
  },
  {
    question: "Will FASTA headers be preserved?",
    answer:
      "Yes. Lines beginning with the '>' character are preserved exactly as they appear in the input."
  },
  {
    question: "What characters can be removed?",
    answer:
      "The tool can remove numbers, whitespace characters, and alignment gaps such as hyphens or dots."
  },
  {
    question: "Can this tool clean protein sequences?",
    answer:
      "Yes. The tool works with DNA, RNA, and protein sequences because it simply removes unwanted formatting characters."
  },
  {
    question: "Is my sequence uploaded anywhere?",
    answer:
      "No. All processing happens locally in your browser to ensure full privacy for your biological data."
  }
]}
>
    




      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-6">

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeNumbers}
              onChange={()=>setRemoveNumbers(!removeNumbers)}
            />

            Remove numbers

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeSpaces}
              onChange={()=>setRemoveSpaces(!removeSpaces)}
            />

            Remove whitespace

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={removeGaps}
              onChange={()=>setRemoveGaps(!removeGaps)}
            />

            Remove gaps (- .)

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={uppercase}
              onChange={()=>setUppercase(!uppercase)}
            />

            Convert to uppercase

          </label>

        </div>

        {/* Input Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="Raw Sequence Input"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Cleaned Sequence"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {/* Stats */}

        {(beforeLength !== null) &&(

          <div className="p-6 border-t border-gray-200 bg-gray-50 grid grid-cols-2 text-center">

            <div>
              <p className="text-sm text-gray-500">
                Original Length
              </p>
              <p className="text-xl font-bold text-blue-600">
                {beforeLength}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Cleaned Length
              </p>
              <p className="text-xl font-bold text-blue-600">
                {afterLength}
              </p>
            </div>

          </div>

        )}

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
          aria-label="Clean Sequence 1"
            onClick={cleanSequence}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Clean Sequence
          </button>

          <button
          aria-label="Clear Clean Sequence 1"
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