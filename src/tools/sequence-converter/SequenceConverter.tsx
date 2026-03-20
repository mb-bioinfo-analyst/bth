import { Link } from "react-router-dom"
import { useState } from 'react';
import { Copy, Download, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import ToolLayout from "../../components/ToolLayout";
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"

type SequenceFormat = 'fasta' | 'genbank' | 'embl' | 'raw' | 'phylip' | 'nexus';

interface FormatOption {
  value: SequenceFormat;
  label: string;
  description: string;
}

interface ParsedSequence {
  name: string
  description: string
  sequence: string
}

function parseFasta(input: string): ParsedSequence[] {

  const entries: ParsedSequence[] = []

  const parts = input
    .trim()
    .split(/^>/m)
    .filter(Boolean)

  for (const part of parts) {

    const lines = part.split("\n")

    const header = lines[0].trim()

    const seq = lines
      .slice(1)
      .join("")
      .replace(/\s/g, "")
      .toUpperCase()

    const [name, ...desc] = header.split(/\s+/)

    entries.push({
      name: name || "sequence",
      description: desc.join(" "),
      sequence: seq
    })

  }

  return entries

}

const formats: FormatOption[] = [
  { value: 'fasta', label: 'FASTA', description: 'Standard sequence format' },
  { value: 'genbank', label: 'GenBank', description: 'NCBI GenBank format' },
  { value: 'embl', label: 'EMBL', description: 'European Molecular Biology Laboratory' },
  { value: 'phylip', label: 'PHYLIP', description: 'Phylogenetic analysis format' },
  { value: 'nexus', label: 'NEXUS', description: 'Systematic biology format' },
  { value: 'raw', label: 'Raw Sequence', description: 'Plain sequence only' },
];

export default function SequenceConverter() {
  const [inputSequence, setInputSequence] = useState('');
  const [outputSequence, setOutputSequence] = useState('');
  const [inputFormat, setInputFormat] = useState<SequenceFormat>('fasta');
  const [outputFormat, setOutputFormat] = useState<SequenceFormat>('genbank');
  const [error, setError] = useState('');
  const [sequenceName, setSequenceName] = useState('sequence_1');

  const parseSequence = (input: string, format: SequenceFormat) => {
    const lines = input.trim().split('\n');
    let sequence = '';
    let name = sequenceName;
    let description = '';

    if (format === 'fasta') {
      if (lines[0]?.startsWith('>')) {
        const header = lines[0].substring(1).trim();
        const parts = header.split(/\s+/);
        name = parts[0] || sequenceName;
        description = parts.slice(1).join(' ');
        sequence = lines.slice(1).join('').replace(/\s/g, '').toUpperCase();
      } else {
        sequence = input.replace(/\s/g, '').toUpperCase();
      }
    } else if (format === 'raw') {
      sequence = input.replace(/\s/g, '').toUpperCase();
    } else if (format === 'genbank') {
      let inSequence = false;
      for (const line of lines) {
        if (line.startsWith('LOCUS')) {
          name = line.split(/\s+/)[1] || sequenceName;
        } else if (line.startsWith('DEFINITION')) {
          description = line.substring(10).trim();
        } else if (line.startsWith('ORIGIN')) {
          inSequence = true;
        } else if (line === '//') {
          break;
        } else if (inSequence) {
          sequence += line.replace(/[^a-zA-Z]/g, '').toUpperCase();
        }
      }
    } else if (format === 'embl') {
      let inSequence = false;
      for (const line of lines) {
        if (line.startsWith('ID')) {
          name = line.split(/\s+/)[1] || sequenceName;
        } else if (line.startsWith('DE')) {
          description = line.substring(2).trim();
        } else if (line.startsWith('SQ')) {
          inSequence = true;
        } else if (line === '//') {
          break;
        } else if (inSequence) {
          sequence += line.replace(/[^a-zA-Z]/g, '').toUpperCase();
        }
      }
    } else {
      // For phylip and nexus, just extract raw sequence
      sequence = input.replace(/[^a-zA-Z]/g, '').toUpperCase();
    }

    return { sequence, name, description };
  };

  const formatSequence = (seq: string, name: string, description: string, format: SequenceFormat) => {
    if (!seq) return '';

    switch (format) {
      case 'fasta':
        return `>${name}${description ? ' ' + description : ''}\n${seq.match(/.{1,60}/g)?.join('\n') || seq}`;

      case 'genbank':
        const date = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        let gb = `LOCUS       ${name.padEnd(16)} ${seq.length} bp    DNA     linear   UNK ${date}\n`;
        gb += `DEFINITION  ${description || 'Converted sequence'}.\n`;
        gb += `ACCESSION   ${name}\n`;
        gb += `VERSION     ${name}.1\n`;
        gb += `KEYWORDS    .\n`;
        gb += `SOURCE      .\n`;
        gb += `  ORGANISM  .\n`;
        gb += `ORIGIN\n`;

        const chunks = seq.match(/.{1,10}/g) || [];
        let pos = 1;
        for (let i = 0; i < chunks.length; i += 6) {
          const lineChunks = chunks.slice(i, i + 6);
          gb += `${pos.toString().padStart(9)} ${lineChunks.join(' ').toLowerCase()}\n`;
          pos += lineChunks.join('').length;
        }
        gb += '//';
        return gb;

      case 'embl':
        const emblDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        let embl = `ID   ${name}; SV 1; linear; DNA; STD; UNK; ${seq.length} BP.\n`;
        embl += `XX\n`;
        embl += `AC   ${name};\n`;
        embl += `XX\n`;
        embl += `DE   ${description || 'Converted sequence'}\n`;
        embl += `XX\n`;
        embl += `KW   .\n`;
        embl += `XX\n`;
        embl += `DT   ${emblDate} (Rel. 1, Created)\n`;
        embl += `XX\n`;
        embl += `SQ   Sequence ${seq.length} BP; ${seq.split('A').length - 1} A; ${seq.split('C').length - 1} C; ${seq.split('G').length - 1} G; ${seq.split('T').length - 1} T; 0 other;\n`;

        const emblChunks = seq.toLowerCase().match(/.{1,10}/g) || [];
        for (let i = 0; i < emblChunks.length; i += 6) {
          const lineChunks = emblChunks.slice(i, i + 6);
          embl += `     ${lineChunks.join(' ').padEnd(66)}${((i + 6) * 10).toString().padStart(9)}\n`;
        }
        embl += '//';
        return embl;

      case 'phylip':
        const formattedSeq = seq.match(/.{1,10}/g)?.join(' ') || seq;
        return `1 ${seq.length}\n${name.padEnd(10)}  ${formattedSeq}`;

      case 'nexus':
        let nexus = `#NEXUS\n\n`;
        nexus += `BEGIN DATA;\n`;
        nexus += `  DIMENSIONS NTAX=1 NCHAR=${seq.length};\n`;
        nexus += `  FORMAT DATATYPE=DNA MISSING=? GAP=-;\n`;
        nexus += `  MATRIX\n`;
        nexus += `    ${name}  ${seq}\n`;
        nexus += `  ;\n`;
        nexus += `END;`;
        return nexus;

      case 'raw':
        return seq;

      default:
        return seq;
    }
  };

  const handleConvert = () => {

    setError("")
    setOutputSequence("")

    if (!inputSequence.trim()) {
      setError("Please enter a sequence to convert")
      return
    }

    try {

      const sequences =
        inputFormat === "fasta"
          ? parseFasta(inputSequence)
          : [{ name: sequenceName, description: "", sequence: inputSequence }]

      const outputs: string[] = []

      for (const entry of sequences) {

        const cleanSeq = entry.sequence.replace(/\s/g, "").toUpperCase()

        if (!/^[ACGTRYSWKMBDHVNU-]+$/i.test(cleanSeq)) {
          setError("Sequence contains invalid characters")
          return
        }

        const formatted = formatSequence(
          cleanSeq,
          entry.name,
          entry.description,
          outputFormat
        )

        outputs.push(formatted)

      }

      setOutputSequence(outputs.join("\n\n"))

    } catch (err) {

      setError("Error converting sequence")

    }

  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputSequence);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputSequence], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // a.download = `sequence.${outputFormat}`;
    a.download = `${sequenceName || "sequence"}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSwapFormats = () => {
    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);
    setInputSequence(outputSequence);
    setOutputSequence('');
  };

  const loadExample = () => {
    const example = `>Example_Gene_1 Homo sapiens hemoglobin subunit beta
ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAA
CGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCC
AGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCT
AAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCT
GGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACG
TGGATCCTGAGAACTTCAGGCTCCTGGGCAACGTGCTGGTCTGTGTGCTGGCCCATCAC
TTTGGCAAAGAATTCACCCCACCAGTGCAGGCTGCCTATCAGAAAGTGGTGGCTGGTGT
GGCTAATGCCCTGGCCCACAAGTATCACTAA`;
    setInputSequence(example);
    setInputFormat('fasta');
  };

  return (

    <ToolLayout
      badge="Sequence Tool"
      slug="sequence-converter"
      category="Sequence"

      seoContent={
        <>
          <h2>DNA and RNA Sequence Format Converter</h2>

          <p>
            Biological sequence data is stored in many different file formats
            depending on the database, sequencing platform, or analysis software
            used. Converting between sequence formats is a common task in
            bioinformatics workflows, particularly when preparing datasets for
            phylogenetic analysis, genome annotation, or sequence alignment tools.
            A sequence format converter allows researchers to quickly transform
            sequence data between widely used bioinformatics formats.
          </p>

          <p>
            This sequence converter supports several popular formats including
            FASTA, GenBank, EMBL, PHYLIP, NEXUS, and raw sequence format. FASTA is
            the most widely used format for storing nucleotide and protein
            sequences, while GenBank and EMBL formats provide rich annotation
            metadata. PHYLIP and NEXUS formats are commonly used in phylogenetic
            analysis software such as PHYLIP, MrBayes, and PAUP.
          </p>

          <p>
            The converter automatically parses sequence headers, descriptions,
            and sequence data while validating nucleotide characters to ensure
            the output remains compatible with downstream bioinformatics tools.
            This makes it easy to prepare sequence files for alignment programs,
            phylogenetic inference tools, genome browsers, and molecular biology
            pipelines.
          </p>

          <p>
            After converting your sequence format, you may also want to clean or
            preprocess sequences using tools such as the{" "}
            <Link to="/tools/sequence-cleaner">
              Sequence Cleaner / Sanitizer
            </Link>{" "}
            or calculate nucleotide composition using the{" "}
            <Link to="/tools/nucleotide-composition-calculator">
              Nucleotide Composition Calculator
            </Link>.
          </p>

          <p>
            All sequence conversion is performed locally in your browser to ensure
            data privacy. Your sequences are never uploaded to external servers,
            making the tool safe to use with sensitive research datasets.
          </p>
        </>
      }

      howTo={
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste or upload your sequence data into the input panel.</li>
          <li>Select the input sequence format.</li>
          <li>Select the desired output format.</li>
          <li>Optionally adjust the sequence name.</li>
          <li>Click <strong>Convert Sequence</strong> to generate the formatted output.</li>
          <li>Copy or download the converted sequence file.</li>
        </ol>
      }

      faq={[
        {
          question: "What sequence formats are supported?",
          answer:
            "This converter supports FASTA, GenBank, EMBL, PHYLIP, NEXUS, and raw sequence formats."
        },
        {
          question: "What is the FASTA format?",
          answer:
            "FASTA is a simple text-based format where sequences are preceded by a header line beginning with the '>' character followed by the sequence itself."
        },
        {
          question: "Why convert between sequence formats?",
          answer:
            "Different bioinformatics tools require different input formats. Converting formats ensures compatibility with alignment tools, phylogenetic programs, and genome analysis pipelines."
        },
        {
          question: "Does the converter validate sequences?",
          answer:
            "Yes. The tool validates nucleotide characters to ensure sequences are compatible with standard DNA or RNA alphabets."
        },
        {
          question: "Is my sequence data uploaded anywhere?",
          answer:
            "No. All sequence processing happens locally in your browser, ensuring complete privacy for your data."
        }
      ]}
    >

      {/* Main Converter Interface */}
      {/* <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"> */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        {/* Format Selection Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Input Format */}
            <div className="flex-1 w-full">
              <label className="block text-white text-sm font-semibold mb-2">
                Input Format
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value as SequenceFormat)}
                className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
              >
                {formats.map((format) => (
                  <option key={format.value} value={format.value} className="text-gray-900">
                    {format.label} - {format.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              aria-label="Swap 1"
              onClick={handleSwapFormats}
              className="mt-6 md:mt-0 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 active:scale-95"
              title="Swap formats"
            >
              <RefreshCw className="w-6 h-6" />
            </button>

            {/* Output Format */}
            <div className="flex-1 w-full">
              <label className="block text-white text-sm font-semibold mb-2">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as SequenceFormat)}
                className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
              >
                {formats.map((format) => (
                  <option key={format.value} value={format.value} className="text-gray-900">
                    {format.label} - {format.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sequence Name Input */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <label className="block text-gray-700 font-semibold mb-2">
            Sequence Name (optional)
          </label>
          <input
            type="text"
            value={sequenceName}
            onChange={(e) => setSequenceName(e.target.value)}
            placeholder="sequence_1"
            className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Input/Output Areas */}
        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          {/* Input Area */}


          <SequenceInput
            value={inputSequence}
            onChange={setInputSequence}
            label="Input Sequence"
            onLoadExample={loadExample}
          />

          {/* Output Area */}


          <SequenceOutput
            value={outputSequence}
            title="Output Sequence"
            onCopy={handleCopy}
            onDownload={handleDownload}
          />

        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Convert Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            aria-label="Convert Sequence 1"
            onClick={handleConvert}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Convert Sequence
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Supported Formats</h3>
          <p className="text-gray-600 text-sm">
            FASTA, GenBank, EMBL, PHYLIP, NEXUS, and raw sequence formats
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Validation</h3>
          <p className="text-gray-600 text-sm">
            Automatic validation of nucleotide sequences with detailed error messages
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
          <p className="text-gray-600 text-sm">
            All conversions happen locally in your browser - no data is sent to servers
          </p>
        </div>
        {/* </div> */}
        {/* </div> */}
      </div>
    </ToolLayout>
  );
}
