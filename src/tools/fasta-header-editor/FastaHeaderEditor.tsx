import { Link } from "react-router-dom"
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput";
import SequenceOutput from "../../components/SequenceOutput";

export default function FastaHeaderEditor(){

  const [input,setInput] = useState("");
  const [output,setOutput] = useState("");

  const [prefix,setPrefix] = useState("");
  const [suffix,setSuffix] = useState("");

  const [replaceSpaces,setReplaceSpaces] = useState(false);
  const [idOnly,setIdOnly] = useState(false);
  const [autoNumber,setAutoNumber] = useState(false);

  const [error,setError] = useState("");

  function process(){

    setError("");
    setOutput("");

    if(!input.trim()){
      setError("Please enter FASTA data");
      return;
    }

    const lines = input.split("\n");

    let counter = 1;

    const edited = lines.map(line=>{

      if(!line.startsWith(">")){
        return line;
      }

      let header = line.replace(/^>/,"");

      if(idOnly){
        header = header.split(/\s+/)[0];
      }

      if(replaceSpaces){
        header = header.replace(/\s+/g,"_");
      }

      if(autoNumber){
        header = `${header}_${counter}`;
        counter++;
      }

      header = `${prefix}${header}${suffix}`;

      return `>${header}`;

    });

    setOutput(edited.join("\n"));

  }

  const handleCopy = async ()=>{
    await navigator.clipboard.writeText(output);
  }

  const handleDownload = ()=>{

    const blob = new Blob([output],{type:"text/plain"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "edited_fasta_headers.fasta";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }

  const loadExample = ()=>{

    setInput(`>seq1 Homo sapiens gene A
ATGCGTACGTAG
>seq2 Mus musculus gene B
ATGCGTAGGCTA
>seq3 Example protein
ATGCGTAGCTAG`);

    setOutput("");
    setError("");

  }

  const clearAll = ()=>{

    setInput("");
    setOutput("");
    setError("");
    setPrefix("");
    setSuffix("");

  }

  return(

    <ToolLayout
  title="FASTA Header Editor"
  description="Edit FASTA headers by adding prefixes, suffixes, numbering sequences, or modifying identifiers."
  badge="FASTA Tool"
  slug="fasta-header-editor"
  category="FASTA"

  seoContent={
  <>
    <h2>Edit and Standardize FASTA Sequence Headers</h2>

    <p>
      FASTA headers contain important metadata about biological sequences,
      including sequence identifiers, species names, gene annotations,
      or database references. However, FASTA headers are often inconsistent
      or contain characters that can interfere with downstream
      bioinformatics pipelines. Editing and standardizing FASTA headers
      is therefore an important preprocessing step before sequence analysis.
    </p>

    <p>
      This FASTA header editor allows users to quickly modify sequence
      headers by adding prefixes or suffixes, replacing spaces with
      underscores, extracting only sequence identifiers, or automatically
      numbering entries. These operations help create clean and consistent
      FASTA datasets that are easier to process with bioinformatics tools
      and analysis pipelines.
    </p>

    <p>
      The editor works with multi-FASTA files and preserves the original
      sequence data while modifying only the header lines. If additional
      dataset preparation is required, you can also clean sequences using
      the{" "}
      <Link to="/tools/sequence-cleaner">Sequence Cleaner</Link>{" "}
      or filter FASTA datasets with the{" "}
      <Link to="/tools/fasta-filter">FASTA Filter</Link>.
    </p>

    <p>
      FASTA header editing is commonly required when preparing sequence
      datasets for genome annotation pipelines, sequence alignment tools,
      phylogenetic analyses, and biological database submissions. Clean
      identifiers also improve reproducibility and help maintain consistent
      naming conventions across datasets.
    </p>

    <p>
      Because the editor runs entirely in your browser, your sequence
      data is processed locally and never transmitted to external
      servers. This guarantees complete privacy for sensitive genomic
      or protein sequence datasets.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a FASTA dataset into the input field.</li>
    <li>Optionally add a prefix or suffix to all sequence headers.</li>
    <li>Enable options such as replacing spaces, keeping only IDs, or auto-numbering sequences.</li>
    <li>Click <strong>Edit Headers</strong>.</li>
    <li>The modified FASTA dataset will appear in the output panel.</li>
    <li>Copy or download the edited FASTA file for use in downstream analyses.</li>
  </ol>
}

faq={[
  {
    question: "What is a FASTA header?",
    answer:
      "A FASTA header is the line beginning with '>' that identifies a sequence and may contain metadata such as gene names, species information, or database identifiers."
  },
  {
    question: "Can this tool modify multiple FASTA entries?",
    answer:
      "Yes. The editor supports multi-FASTA files and can update headers for all sequences in the dataset."
  },
  {
    question: "Does editing headers change the sequence data?",
    answer:
      "No. The tool only modifies the header lines while preserving the original nucleotide or protein sequences."
  },
  {
    question: "What does the auto-numbering option do?",
    answer:
      "Auto-numbering appends an incremental number to each FASTA header to ensure that sequence identifiers remain unique."
  },
  {
    question: "Is my FASTA data uploaded anywhere?",
    answer:
      "No. All header editing operations run locally in your browser to ensure that your sequence data remains private."
  }
]}
>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

        {/* Options */}

        <div className="p-6 border-b border-gray-200 bg-gray-50 grid md:grid-cols-3 gap-6">

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Prefix
            </label>

            <input
              value={prefix}
              onChange={(e)=>setPrefix(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Optional prefix"
            />

          </div>

          <div>

            <label className="block text-gray-700 font-semibold mb-2">
              Suffix
            </label>

            <input
              value={suffix}
              onChange={(e)=>setSuffix(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Optional suffix"
            />

          </div>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={replaceSpaces}
              onChange={()=>setReplaceSpaces(!replaceSpaces)}
            />

            Replace spaces with "_"

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={idOnly}
              onChange={()=>setIdOnly(!idOnly)}
            />

            Keep ID only

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={autoNumber}
              onChange={()=>setAutoNumber(!autoNumber)}
            />

            Auto-number sequences

          </label>

        </div>

        {/* Input Output */}

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">

          <SequenceInput
            value={input}
            onChange={setInput}
            label="FASTA Input"
            onLoadExample={loadExample}
          />

          <SequenceOutput
            value={output}
            title="Edited FASTA"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

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
          aria-label="Edit Headers FASTA 1"
            onClick={process}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Edit Headers
          </button>

          <button
          aria-label="Clear Edit Headers FASTA 1"
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