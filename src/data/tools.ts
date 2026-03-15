// import SequenceConverter from "../tools/sequence-converter/SequenceConverter"
// import ReverseComplement from "../tools/reverse-complement/ReverseComplement"
// import DnaTranslate from "../tools/dna-translate/DnaTranslate"
// import OrfFinder from "../tools/orf-finder/OrfFinder"
// import GcContent from "../tools/gc-content/GcContent"
// import FastaFormatter from "../tools/fasta-formatter/FastaFormatter";
// import SequenceLength from "../tools/sequence-length/SequenceLength";
// import FastaStats from "../tools/fasta-stats/FastaStats"
// import MultiFastaStats from "../tools/multi-fasta-stats/MultiFastaStats"
// import DnaToRna from "../tools/dna-to-rna/DnaToRna";
// import RnaToDna from "../tools/rna-to-dna/RnaToDna";
// import ReverseSequence from "../tools/reverse-sequence/ReverseSequence";
// import ComplementSequence from "../tools/complement-sequence/ComplementSequence";
// import TmCalculator from "../tools/tm-calculator/TmCalculator";
// import PrimerAnalyzer from "../tools/primer-analyzer/PrimerAnalyzer";
// import RandomDnaGenerator from "../tools/random-dna/RandomDnaGenerator";
// import RandomProteinGenerator from "../tools/random-protein/RandomProteinGenerator";
// import ProteinMwPiCalculator from "../tools/protein-mw/ProteinMwPiCalculator"
// import ProteinBackTranslation from "../tools/protein-backtranslation/ProteinBackTranslation"
// import ProteinHydrophobicity from "../tools/protein-hydrophobicity/ProteinHydrophobicity"
// import SequenceCaseConverter from "../tools/sequence-case-converter/SequenceCaseConverter"
// import RemoveGapsTool from "../tools/remove-gaps/RemoveGapsTool"
// import SequenceCleaner from "../tools/sequence-cleaner/SequenceCleaner"
// import SequenceLineWrapper from "../tools/sequence-line-wrapper/SequenceLineWrapper"
// import SequenceEntropyCalculator from "../tools/sequence-entropy/SequenceEntropyCalculator"
// import FastaHeaderExtractor from "../tools/fasta-header-extractor/FastaHeaderExtractor"
// import FastaHeaderEditor from "../tools/fasta-header-editor/FastaHeaderEditor"
// import FastaSequenceExtractor from "../tools/fasta-sequence-extractor/FastaSequenceExtractor"
// import FastaDeduplicator from "../tools/fasta-deduplicator/FastaDeduplicator"
// import FastaFilter from "../tools/fasta-filter/FastaFilter"
// import FastaSplitter from "../tools/fasta-splitter/FastaSplitter"
// import FastaRandomSampler from "../tools/fasta-random-sampler/FastaRandomSampler"
// import FastaSequenceSorter from "../tools/fasta-sequence-sorter/FastaSequenceSorter"
// import FastaMergeTool from "../tools/fasta-merge/FastaMergeTool"
// import KmerCounter from "../tools/kmer-counter/kmerCounter"
// import KmerFrequencyAnalyzer from "../tools/kmer-frequency-analyzer/KmerFrequencyAnalyzer"
// import KmerFrequencyCalculator from "../tools/kmer-frequency-calculator/KmerFrequencyCalculator"
// import SequenceIdentityCalculator from "../tools/sequence-identity-calculator/SequenceIdentityCalculator"
// import VisualAlignmentViewer from "../tools/visual-alignment-viewer/VisualAlignmentViewer"
// import RestrictionSiteFinder from "../tools/restriction-finder/RestrictionSiteFinder"
// import CodonUsageCalculator from "../tools/codon-usage-calculator/CodonUsageCalculator"
// import MotifPatternFinder from "../tools/motif-pattern-finder/MotifPatternFinder"
// import NucleotideCompositionCalculator from "../tools/nucleotide-composition-calculator/NucleotideCompositionCalculator"
// import SequenceSimilarityMatrix from "../tools/sequence-similarity-matrix/SequenceSimilarityMatrix"
// import GenomeBrowser from "../tools/genome-browser/GenomeBrowser"
// import CodonOptimizationTool from "../tools/codon-optimization/CodonOptimizationTool"


export interface Tool {
  name: string
  path: string
  description: string
  category: string
  component: () => Promise<{ default: React.ComponentType }>
  tags: string[]

  slug: string

  related?: string[]   // contextual links
  weight?: number      // optional SEO priority
}

export const tools: Tool[] = [

  {
    name: "Sequence Format Converter",
    slug: "sequence-converter",
    path: "/tools/sequence-converter",
    description: "Convert DNA, RNA, or protein sequences between FASTA, GenBank, EMBL and other common bioinformatics formats online.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/sequence-converter/SequenceConverter"),
    tags: [
      "sequence format converter",
      "fasta to genbank",
      "genbank to fasta",
      "embl to fasta",
      "sequence file converter",
      "bioinformatics converter",
      "dna sequence format",
      "rna sequence format",
      "protein sequence format",
      "fasta converter",
      "genbank converter",
      "embl converter",
      "sequence format tool",
      "bioinformatics tool"
    ]
  },

  {
    name: "Reverse Complement",
    slug: "reverse-complement",
    path: "/tools/reverse-complement",
    description: "Generate the reverse complement of DNA sequences instantly. Convert nucleotide sequences to their complementary reverse strand for bioinformatics and molecular biology analysis.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/reverse-complement/ReverseComplement")
    ,
    tags: [
      "reverse complement",
      "dna reverse complement",
      "reverse complement calculator",
      "reverse complement tool",
      "dna complement",
      "nucleotide complement",
      "dna sequence tool",
      "sequence reverse complement",
      "bioinformatics tool",
      "genomics tool",
      "dna sequence analysis",
      "complementary dna strand"
    ]

  },

  {
    name: "DNA to Protein Translator",
    slug: "dna-translate",
    path: "/tools/dna-translate",
    description: "Translate DNA sequences into amino acid protein sequences using the standard genetic code and codon table.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/dna-translate/DnaTranslate")
    ,
    tags: [
      "dna to protein",
      "dna translation",
      "dna to protein translator",
      "codon translator",
      "genetic code translator",
      "dna codon translation",
      "translate dna sequence",
      "protein sequence translation",
      "codon table",
      "amino acid translation",
      "dna sequence analysis",
      "bioinformatics tool"
    ]
  },

  {
    name: "ORF Finder",
    slug: "orf-finder",
    path: "/tools/orf-finder",
    description: "Identify open reading frames (ORFs) in DNA sequences and detect potential protein-coding regions across reading frames.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/orf-finder/OrfFinder")
    ,
    tags: [
      "orf finder",
      "open reading frame finder",
      "orf detection",
      "dna orf finder",
      "coding sequence finder",
      "gene prediction tool",
      "find open reading frames",
      "dna translation frames",
      "cds finder",
      "genomics analysis",
      "protein coding region",
      "bioinformatics tool"
    ]
  },

  {
    name: "GC Content Calculator",
    slug: "gc-content",
    path: "/tools/gc-content",
    description: "Calculate GC content percentage and nucleotide composition of DNA sequences for genomics and sequence analysis.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/gc-content/GcContent")
    ,
    tags: [
      "gc content",
      "gc content calculator",
      "dna gc content",
      "gc percentage",
      "calculate gc content",
      "nucleotide composition",
      "dna base composition",
      "gc ratio",
      "sequence gc analysis",
      "genomics gc content",
      "dna sequence analysis",
      "bioinformatics tool"
    ]
  },

  {
    name: "FASTA Formatter",
    slug: "fasta-formatter",
    path: "/tools/fasta-formatter",
    description: "Clean, validate, and format DNA, RNA, or protein sequences into standard FASTA format for bioinformatics analysis.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/fasta-formatter/FastaFormatter")
    ,
    tags: [
      "fasta formatter",
      "fasta format tool",
      "format fasta sequence",
      "fasta file formatter",
      "sequence fasta formatting",
      "clean fasta file",
      "fasta sequence cleaner",
      "bioinformatics fasta tool",
      "dna fasta format",
      "rna fasta format",
      "protein fasta format",
      "sequence formatting tool"
    ]
  },

  {
    name: "Sequence Length Calculator",
    slug: "sequence-length",
    path: "/tools/sequence-length",
    description: "Calculate the length of DNA, RNA, or protein sequences instantly for bioinformatics and sequence analysis.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/sequence-length/SequenceLength")
    ,
    tags: [
      "sequence length calculator",
      "dna sequence length",
      "rna sequence length",
      "protein sequence length",
      "calculate sequence length",
      "sequence length tool",
      "dna length calculator",
      "protein length calculator",
      "nucleotide sequence length",
      "amino acid sequence length",
      "bioinformatics sequence tool",
      "sequence analysis tool"
    ]
  },

  {
    name: "FASTA Statistics",
    slug: "fasta-stats",
    path: "/tools/fasta-stats",
    description: "Calculate FASTA sequence statistics including sequence length, GC content, and nucleotide base composition.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/fasta-stats/FastaStats")
    ,
    tags: [
      "fasta statistics",
      "fasta sequence statistics",
      "fasta analysis tool",
      "sequence statistics",
      "fasta gc content",
      "nucleotide composition fasta",
      "dna sequence statistics",
      "fasta sequence analysis",
      "bioinformatics fasta tool",
      "fasta base composition",
      "sequence analysis tool",
      "genomics sequence statistics"
    ]
  },

  {
    name: "Multi-sequence FASTA Statistics",
    slug: "multi-fasta-stats",
    path: "/tools/multi-fasta-stats",
    description: "Analyze statistics for multiple FASTA sequences including sequence length, GC content, and nucleotide composition.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/multi-fasta-stats/MultiFastaStats")
    ,
    tags: [
      "multi fasta statistics",
      "multiple fasta analysis",
      "fasta sequence statistics",
      "multi sequence fasta tool",
      "batch fasta analysis",
      "fasta gc content analysis",
      "multiple sequence statistics",
      "fasta dataset statistics",
      "dna fasta analysis",
      "bioinformatics fasta tool",
      "genomics sequence statistics",
      "sequence analysis tool"
    ]
  },

  {
    name: "DNA to RNA Transcription",
    slug: "dna-to-rna",
    path: "/tools/dna-to-rna",
    description: "Transcribe DNA sequences into RNA sequences by converting thymine (T) to uracil (U) using the standard transcription process.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/dna-to-rna/DnaToRna")
    ,
    tags: [
      "dna to rna",
      "dna transcription",
      "dna to rna converter",
      "transcribe dna sequence",
      "rna transcription tool",
      "dna rna transcription",
      "convert dna to rna",
      "rna sequence generator",
      "nucleotide transcription",
      "molecular biology transcription",
      "bioinformatics transcription tool",
      "dna sequence analysis"
    ]
  },

  {
    name: "RNA to DNA Reverse Transcription",
    slug: "rna-to-dna",
    path: "/tools/rna-to-dna",
    description: "Convert RNA sequences into DNA (cDNA) by reverse transcription and optionally generate the complementary DNA strand.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/rna-to-dna/RnaToDna")
    ,
    tags: [
      "rna to dna",
      "reverse transcription",
      "rna to dna converter",
      "cdna generator",
      "reverse transcribe rna",
      "rna dna conversion",
      "cdna sequence generator",
      "convert rna to cdna",
      "molecular biology reverse transcription",
      "bioinformatics transcription tool",
      "nucleotide sequence conversion",
      "sequence analysis tool"
    ]
  },

  {
    name: "Sequence Reverse",
    slug: "reverse-sequence",
    path: "/tools/reverse-sequence",
    description: "Reverse DNA, RNA, or protein sequences instantly without generating the complementary strand.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/reverse-sequence/ReverseSequence")
    ,
    tags: [
      "reverse sequence",
      "reverse dna sequence",
      "reverse rna sequence",
      "reverse protein sequence",
      "sequence reverse tool",
      "reverse nucleotide sequence",
      "reverse amino acid sequence",
      "reverse dna string",
      "bioinformatics sequence tool",
      "sequence manipulation tool",
      "dna sequence analysis",
      "protein sequence analysis"
    ]
  },

  {
    name: "Complement Sequence Generator",
    slug: "complement-sequence",
    path: "/tools/complement-sequence",
    description: "Generate complementary DNA or RNA strands from nucleotide sequences without reversing the sequence.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/complement-sequence/ComplementSequence")
    ,
    tags: [
      "dna complement",
      "rna complement",
      "complement sequence generator",
      "nucleotide complement",
      "dna complementary strand",
      "rna complementary strand",
      "generate dna complement",
      "generate rna complement",
      "sequence complement tool",
      "dna base pairing",
      "bioinformatics sequence tool",
      "nucleotide sequence analysis"
    ]
  },

  {
    name: "Primer Melting Temperature (Tm) Calculator",
    slug: "tm-calculator",
    path: "/tools/tm-calculator",
    description: "Calculate PCR primer melting temperature (Tm) from DNA sequences for primer design and PCR optimization.",
    category:  "PCR Analysis Tools",
    component: () => import("../tools/tm-calculator/TmCalculator")
    ,
    tags: [
      "primer tm calculator",
      "melting temperature calculator",
      "pcr primer tm",
      "primer melting temperature",
      "dna primer tm",
      "calculate primer tm",
      "pcr primer design tool",
      "oligo tm calculator",
      "primer annealing temperature",
      "dna oligo melting temperature",
      "pcr primer analysis",
      "bioinformatics primer tool"
    ]
  },

  {
    name: "Primer Analyzer",
    slug: "primer-analyzer",
    path: "/tools/primer-analyzer",
    description: "Analyze PCR primer sequences for GC content, melting temperature (Tm), GC clamp, and other properties for primer design.",
    category:  "PCR Analysis Tools",
    component: () => import("../tools/primer-analyzer/PrimerAnalyzer")
    ,
    tags: [
      "primer analyzer",
      "pcr primer analysis",
      "primer analysis tool",
      "primer design tool",
      "gc clamp primer",
      "primer gc content",
      "primer tm calculator",
      "dna primer analysis",
      "oligo analysis",
      "pcr primer properties",
      "primer quality check",
      "bioinformatics primer tool",
      "PCR primer checker",
      "primer hairpin checker"
    ]
  },

  {
    name: "Random DNA Sequence Generator",
    slug: "random-dna-generator",
    path: "/tools/random-dna-generator",
    description: "Generate random DNA sequences with customizable length, GC content, and FASTA output for genomics simulation and testing.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/random-dna/RandomDnaGenerator")
    ,
    tags: [
      "random dna generator",
      "dna sequence generator",
      "generate random dna sequence",
      "random nucleotide generator",
      "dna sequence simulator",
      "random dna sequence tool",
      "genomics sequence generator",
      "dna fasta generator",
      "synthetic dna generator",
      "dna simulation tool",
      "bioinformatics dna generator",
      "random nucleotide sequence"
    ]
  },

  {
    name: "Random Protein Sequence Generator",
    slug: "random-protein-generator",
    path: "/tools/random-protein-generator",
    description: "Generate random protein sequences composed of amino acids for bioinformatics testing, simulation, and algorithm benchmarking.",
    category:  "Protein Analysis Tools",
    component: () => import("../tools/random-protein/RandomProteinGenerator")
    ,
    tags: [
      "random protein generator",
      "protein sequence generator",
      "random amino acid sequence",
      "generate protein sequence",
      "amino acid sequence generator",
      "protein simulation tool",
      "synthetic protein sequence",
      "random peptide generator",
      "protein fasta generator",
      "bioinformatics protein generator",
      "protein sequence simulator",
      "amino acid generator"
    ]
  },

  {
    name: "Protein Molecular Weight & pI Calculator",
    slug: "protein-mw-pi-calculator",
    path: "/tools/protein-mw-pi-calculator",
    description: "Calculate protein molecular weight, isoelectric point (pI), and amino acid composition from protein sequences.",
    category:  "Protein Analysis Tools",
    component: () => import("../tools/protein-mw/ProteinMwPiCalculator")
    ,
    tags: [
      "protein molecular weight calculator",
      "protein pi calculator",
      "isoelectric point calculator",
      "protein mw calculator",
      "protein sequence analysis",
      "calculate protein molecular weight",
      "calculate protein pi",
      "amino acid composition calculator",
      "protein analysis tool",
      "protein biochemistry calculator",
      "bioinformatics protein tool",
      "protein sequence properties"
    ]
  },

  {
    name: "Protein to DNA Back Translation",
    slug: "protein-back-translation",
    path: "/tools/protein-back-translation",
    description: "Convert protein sequences into possible DNA sequences using codon tables and the genetic code.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/protein-backtranslation/ProteinBackTranslation")
    ,
    tags: [
      "protein to dna",
      "back translation",
      "protein back translation",
      "amino acid to dna",
      "protein to dna converter",
      "reverse translation",
      "codon back translation",
      "genetic code translation",
      "protein sequence to dna",
      "codon table translation",
      "bioinformatics translation tool",
      "sequence back translation"
    ]
  },

  {
    name: "Protein Hydrophobicity (Kyte-Doolittle)",
    slug: "protein-hydrophobicity",
    path: "/tools/protein-hydrophobicity",
    description: "Calculate protein hydrophobicity profiles using the Kyte-Doolittle scale to analyze hydrophobic and hydrophilic regions in protein sequences.",
    category:  "Protein Analysis Tools",
    component: () => import("../tools/protein-hydrophobicity/ProteinHydrophobicity")
    ,
    tags: [
      "protein hydrophobicity",
      "kyte doolittle hydrophobicity",
      "protein hydrophobicity calculator",
      "kyte doolittle plot",
      "hydrophobicity profile",
      "protein hydropathy analysis",
      "amino acid hydrophobicity",
      "protein sequence hydrophobicity",
      "hydropathy plot calculator",
      "protein sequence analysis",
      "bioinformatics protein tool",
      "protein hydropathy tool"
    ]
  },

  {
    name: "Sequence Case Converter",
    slug: "sequence-case-converter",
    path: "/tools/sequence-case-converter",
    description: "Convert DNA, RNA, or protein sequences between uppercase and lowercase for FASTA formatting and sequence preprocessing.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/sequence-case-converter/SequenceCaseConverter")
    ,
    tags: [
      "sequence case converter",
      "dna uppercase lowercase",
      "rna uppercase lowercase",
      "protein sequence case",
      "sequence case tool",
      "fasta case converter",
      "convert sequence uppercase",
      "convert sequence lowercase",
      "sequence formatting tool",
      "bioinformatics sequence formatting",
      "dna sequence formatting",
      "sequence preprocessing tool"
    ]
  },

  {
    name: "Remove Gaps Tool",
    slug: "remove-gaps",
    path: "/tools/remove-gaps",
    description: "Remove alignment gaps and formatting characters from DNA, RNA, or protein sequences for clean sequence analysis.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/remove-gaps/RemoveGapsTool")
    ,
    tags: [
      "remove gaps sequence",
      "alignment gap remover",
      "remove sequence gaps",
      "remove fasta gaps",
      "sequence gap remover",
      "alignment cleanup tool",
      "sequence cleaning tool",
      "remove dash gaps fasta",
      "dna sequence cleaning",
      "protein alignment cleanup",
      "bioinformatics sequence tool",
      "sequence preprocessing tool"
    ]
  },

  {
    name: "Sequence Cleaner / Sanitizer",
    slug: "sequence-cleaner",
    path: "/tools/sequence-cleaner",
    description: "Clean DNA, RNA, or protein sequences by removing numbers, whitespace, gaps, and formatting artifacts.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/sequence-cleaner/SequenceCleaner")
    ,
    tags: [
      "sequence cleaner",
      "sequence sanitizer",
      "clean dna sequence",
      "clean fasta sequence",
      "sequence cleanup tool",
      "remove invalid characters sequence",
      "bioinformatics sequence cleaner",
      "dna sequence preprocessing",
      "sequence formatting cleaner",
      "fasta cleaning tool",
      "sequence data cleaning",
      "sequence preprocessing tool"
    ]
  },

  {
    name: "Sequence Line Wrapper",
    slug: "sequence-line-wrapper",
    path: "/tools/sequence-line-wrapper",
    description: "Wrap DNA, RNA, or protein sequences to a fixed line width for proper FASTA formatting and readability.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/sequence-line-wrapper/SequenceLineWrapper")
    ,
    tags: [
      "sequence line wrapper",
      "fasta line wrapper",
      "wrap fasta sequence",
      "sequence line wrap tool",
      "format fasta line length",
      "fasta formatting tool",
      "sequence formatting tool",
      "dna fasta line wrap",
      "rna fasta formatting",
      "protein fasta formatting",
      "bioinformatics fasta tool",
      "sequence preprocessing tool"
    ]
  },

  {
    name: "Sequence Entropy Calculator",
    slug: "sequence-entropy",
    path: "/tools/sequence-entropy",
    description: "Calculate Shannon entropy and sequence complexity for DNA, RNA, or protein sequences to measure information content.",
    category:  "Sequence Bioinformatics Tools",
    component: () => import("../tools/sequence-entropy/SequenceEntropyCalculator")
    ,
    tags: [
      "sequence entropy calculator",
      "shannon entropy sequence",
      "dna entropy",
      "rna entropy",
      "protein entropy",
      "sequence complexity calculator",
      "information theory sequence",
      "entropy bioinformatics",
      "nucleotide entropy",
      "amino acid entropy",
      "sequence analysis entropy",
      "bioinformatics entropy tool"
    ]
  },

  {
    name: "FASTA Header Extractor",
    slug: "fasta-header-extractor",
    path: "/tools/fasta-header-extractor",
    description: "Extract sequence IDs or full headers from FASTA files for downstream bioinformatics analysis and data processing.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-header-extractor/FastaHeaderExtractor")
    ,
    tags: [
      "fasta header extractor",
      "extract fasta headers",
      "fasta id extractor",
      "fasta sequence ids",
      "fasta header parser",
      "extract fasta identifiers",
      "fasta metadata extractor",
      "fasta header tool",
      "bioinformatics fasta tool",
      "fasta sequence id extraction",
      "fasta file processing",
      "sequence header extraction"
    ]
  },

  {
    name: "FASTA Header Editor",
    slug: "fasta-header-editor",
    path: "/tools/fasta-header-editor",
    description: "Edit FASTA headers by adding prefixes, suffixes, renaming, or numbering sequence identifiers.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-header-editor/FastaHeaderEditor")
    ,
    tags: [
      "fasta header editor",
      "edit fasta headers",
      "rename fasta headers",
      "fasta header rename tool",
      "modify fasta headers",
      "fasta header formatter",
      "fasta sequence header editing",
      "fasta id renaming",
      "bioinformatics fasta tool",
      "fasta metadata editing",
      "sequence header editor",
      "fasta preprocessing tool"
    ]
  },

  {
    name: "FASTA Sequence Extractor",
    slug: "fasta-sequence-extractor",
    path: "/tools/fasta-sequence-extractor",
    description: "Extract specific sequences from FASTA files using sequence IDs or header keywords for targeted bioinformatics analysis.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-sequence-extractor/FastaSequenceExtractor")
    ,
    tags: [
      "fasta sequence extractor",
      "extract fasta sequences",
      "fasta id extraction",
      "extract sequences from fasta",
      "fasta sequence filter by id",
      "fasta sequence parser",
      "fasta sequence selection tool",
      "bioinformatics fasta extraction",
      "fasta subset extractor",
      "fasta sequence id filter",
      "sequence extraction tool",
      "fasta data processing"
    ]
  },

  {
    name: "FASTA Deduplicator",
    slug: "fasta-deduplicator",
    path: "/tools/fasta-deduplicator",
    description: "Remove duplicate sequences from FASTA files to create unique sequence datasets for bioinformatics analysis.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-deduplicator/FastaDeduplicator")
    ,
    tags: [
      "fasta deduplicator",
      "remove duplicate fasta sequences",
      "fasta duplicate remover",
      "deduplicate fasta file",
      "fasta sequence deduplication",
      "remove duplicate sequences fasta",
      "unique fasta sequences",
      "fasta duplicate filter",
      "bioinformatics fasta cleaning",
      "fasta dataset deduplication",
      "sequence duplicate removal",
      "fasta preprocessing tool"
    ]
  },

  {
    name: "FASTA Filter",
    slug: "fasta-filter",
    path: "/tools/fasta-filter",
    description: "Filter FASTA sequences by length, GC content, or header keywords to create targeted sequence datasets.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-filter/FastaFilter")
    ,
    tags: [
      "fasta filter",
      "filter fasta sequences",
      "fasta sequence filter",
      "filter fasta by length",
      "filter fasta by gc content",
      "fasta header filter",
      "fasta sequence selection",
      "bioinformatics fasta filtering",
      "fasta dataset filtering",
      "sequence filtering tool",
      "fasta preprocessing tool",
      "genomics fasta filter"
    ]
  },

  {
    name: "FASTA Splitter",
    slug: "fasta-splitter",
    path: "/tools/fasta-splitter",
    description: "Split large FASTA files into smaller FASTA datasets by sequence count or file size for easier bioinformatics processing.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-splitter/FastaSplitter")
    ,
    tags: [
      "fasta splitter",
      "split fasta file",
      "split fasta sequences",
      "fasta file splitter",
      "divide fasta dataset",
      "split fasta by sequence count",
      "split fasta dataset",
      "bioinformatics fasta tool",
      "fasta dataset processing",
      "large fasta file splitter",
      "sequence dataset splitter",
      "fasta preprocessing tool"
    ]
  },

  {
    name: "FASTA Random Sampler",
    slug: "fasta-random-sampler",
    path: "/tools/fasta-random-sampler",
    description: "Randomly sample sequences from FASTA files to generate subset datasets for bioinformatics analysis and testing.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-random-sampler/FastaRandomSampler")
    ,
    tags: [
      "fasta random sampler",
      "sample fasta sequences",
      "random fasta subset",
      "fasta sequence sampling",
      "random subset fasta",
      "fasta sampling tool",
      "random fasta extractor",
      "bioinformatics fasta sampling",
      "fasta dataset sampler",
      "sequence subset generator",
      "random sequence selection fasta",
      "fasta preprocessing tool"
    ]
  },

  {
    name: "FASTA Sequence Sorter",
    slug: "fasta-sequence-sorter",
    path: "/tools/fasta-sequence-sorter",
    description: "Sort FASTA sequences by length, GC content, or alphabetically to organize sequence datasets for analysis.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-sequence-sorter/FastaSequenceSorter")
    ,
    tags: [
      "fasta sequence sorter",
      "sort fasta sequences",
      "fasta sort by length",
      "fasta sort by gc content",
      "alphabetical fasta sorter",
      "fasta sequence ordering",
      "sort fasta dataset",
      "bioinformatics fasta sorting",
      "fasta dataset organizer",
      "sequence sorting tool",
      "fasta preprocessing tool",
      "genomics fasta sorter"
    ]
  },

  {
    name: "FASTA Merge Tool",
    slug: "fasta-merge",
    path: "/tools/fasta-merge",
    description: "Merge multiple FASTA files into a single FASTA dataset for streamlined bioinformatics analysis and processing.",
    category:  "FASTA File Tools",
    component: () => import("../tools/fasta-merge/FastaMergeTool")
    ,
    tags: [
      "fasta merge tool",
      "merge fasta files",
      "combine fasta sequences",
      "fasta file merger",
      "merge fasta datasets",
      "fasta sequence merger",
      "join fasta files",
      "bioinformatics fasta merge",
      "fasta dataset combination",
      "sequence merge tool",
      "fasta preprocessing tool",
      "genomics fasta merger"
    ]
  },

  {
    name: "k-mer Counter",
    slug: "kmer-counter",
    path: "/tools/kmer-counter",
    description: "Count k-mer frequencies in DNA or RNA sequences with optional reverse-complement collapsing for genomics and sequence analysis.",
    category:  "Sequence Analysis Tools",
    component: () => import("../tools/kmer-counter/kmerCounter")
    ,
    tags: [
      "kmer counter",
      "k-mer counter",
      "kmer frequency",
      "k-mer counting",
      "dna kmer analysis",
      "rna kmer analysis",
      "kmer frequency calculator",
      "genomics kmer analysis",
      "sequence kmer analysis",
      "bioinformatics kmer tool",
      "oligonucleotide frequency",
      "sequence analysis kmer"
    ]
  },

  {
    name: "k-mer Frequency Analyzer",
    slug: "kmer-frequency-analyzer",
    path: "/tools/kmer-frequency-analyzer",
    description: "Analyze normalized k-mer frequencies, diversity, and per-sequence statistics in DNA or RNA FASTA sequences.",
    category:  "Sequence Analysis Tools",
    component: () => import("../tools/kmer-frequency-analyzer/KmerFrequencyAnalyzer")
    ,
    tags: [
      "kmer frequency analyzer",
      "k-mer frequency analysis",
      "dna kmer frequency",
      "rna kmer frequency",
      "kmer diversity analysis",
      "kmer statistics",
      "kmer distribution analysis",
      "genomics kmer analysis",
      "sequence kmer analysis",
      "bioinformatics kmer tool",
      "oligonucleotide frequency analysis",
      "fasta kmer analysis"
    ]
  },
  {
    name: "k-mer Frequency Calculator",
    slug: "kmer-frequency-calculator",
    path: "/tools/kmer-frequency-calculator",
    description: "Calculate normalized k-mer frequencies, expected probabilities, and enrichment scores in DNA or RNA sequences.",
    category:  "Sequence Analysis Tools",
    component: () => import("../tools/kmer-frequency-calculator/KmerFrequencyCalculator")
    ,
    tags: [
      "kmer frequency calculator",
      "k-mer frequency calculator",
      "kmer analysis tool",
      "dna kmer frequency",
      "rna kmer frequency",
      "kmer enrichment analysis",
      "oligonucleotide frequency calculator",
      "kmer probability calculator",
      "genomics kmer analysis",
      "sequence kmer analysis",
      "bioinformatics kmer tool",
      "kmer statistics calculator"
    ]
  },

  {
    name: "Sequence Identity Calculator",
    slug: "sequence-identity-calculator",
    path: "/tools/sequence-identity-calculator",
    description: "Calculate pairwise sequence identity between DNA, RNA, or protein sequences for sequence comparison and analysis.",
    category:  "Sequence Analysis Tools",
    component: () => import("../tools/sequence-identity-calculator/SequenceIdentityCalculator")
    ,
    tags: [
      "sequence identity calculator",
      "pairwise sequence identity",
      "dna sequence identity",
      "protein sequence identity",
      "rna sequence identity",
      "sequence similarity calculator",
      "pairwise sequence comparison",
      "sequence comparison tool",
      "bioinformatics sequence identity",
      "alignment identity calculator",
      "sequence similarity analysis",
      "genomics sequence comparison"
    ]
  },

  {
    name: "Visual Alignment Viewer",
    slug: "visual-alignment-viewer",
    path: "/tools/visual-alignment-viewer",
    description: "Perform global or local pairwise sequence alignment and visualize DNA, RNA, or protein alignments with configurable scoring.",
    category:  "Sequence Analysis Tools",
    component: () => import("../tools/visual-alignment-viewer/VisualAlignmentViewer")
    ,
    tags: [
      "pairwise sequence alignment",
      "sequence alignment viewer",
      "global sequence alignment",
      "local sequence alignment",
      "dna sequence alignment",
      "protein sequence alignment",
      "rna sequence alignment",
      "alignment visualization tool",
      "pairwise alignment tool",
      "bioinformatics alignment viewer",
      "sequence similarity alignment",
      "needleman wunsch smith waterman"
    ]
  },

  {
    name: "Restriction Enzyme Finder",
    slug: "restriction-site-finder",
    path: "/tools/restriction-site-finder",
    description: "Find restriction enzyme recognition sites and cut positions in DNA sequences for cloning, plasmid analysis, and restriction mapping.",
    category:  "Sequence Analysis Tools",
    component: () => import("../tools/restriction-finder/RestrictionSiteFinder")
    ,
    tags: [
      "restriction enzyme finder",
      "restriction site finder",
      "dna restriction sites",
      "restriction map generator",
      "restriction enzyme analysis",
      "dna digestion tool",
      "plasmid restriction map",
      "restriction enzyme cut sites",
      "cloning restriction analysis",
      "molecular biology restriction tool",
      "restriction enzyme scanner",
      "plasmid enzyme finder"
    ]
  },

  {
    name: "Codon Usage Calculator",
    slug: "codon-usage-calculator",
    path: "/tools/codon-usage-calculator",
    description: "Calculate codon usage, frequencies, RSCU values, and GC3 statistics from coding DNA sequences.",
    category:  "Sequence Analysis Tools",
    tags: [
      "codon usage calculator",
      "codon usage analysis",
      "codon bias analysis",
      "rscu calculator",
      "gc3 codon analysis",
      "codon frequency calculator",
      "coding sequence codon usage",
      "dna codon statistics",
      "gene expression codon bias",
      "genomics codon analysis",
      "bioinformatics codon tool",
      "cds codon analysis"
    ],
    component: () => import("../tools/codon-usage-calculator/CodonUsageCalculator")

  },

  {
    name: "Motif / Pattern Finder",
    slug: "motif-pattern-finder",
    path: "/tools/motif-pattern-finder",
    description: "Find sequence motifs and patterns in DNA, RNA, or protein sequences using exact match, IUPAC motifs, or regex search.",
    category:  "Sequence Analysis Tools",
    tags: [
      "motif finder",
      "sequence motif finder",
      "dna motif finder",
      "rna motif finder",
      "protein motif finder",
      "sequence pattern finder",
      "iupac motif search",
      "regex sequence search",
      "motif search tool",
      "sequence pattern search",
      "bioinformatics motif tool",
      "motif detection tool"
    ],
    component: () => import("../tools/motif-pattern-finder/MotifPatternFinder")

  },

  {
    name: "Nucleotide Composition Calculator",
    slug: "nucleotide-composition-calculator",
    path: "/tools/nucleotide-composition-calculator",
    description: "Analyze nucleotide composition including GC content, AT content, dinucleotide frequencies, CpG ratio, and positional base bias.",
    category:  "Sequence Analysis Tools",
    tags: [
      "nucleotide composition calculator",
      "dna base composition",
      "rna base composition",
      "gc content calculator",
      "at content calculator",
      "dinucleotide frequency analysis",
      "cpg ratio calculator",
      "gc1 gc2 gc3 analysis",
      "dna nucleotide composition",
      "sequence composition analysis",
      "bioinformatics nucleotide analysis",
      "genomics base composition"
    ],
    component: () => import("../tools/nucleotide-composition-calculator/NucleotideCompositionCalculator")

  },

  {
    name: "Sequence Similarity Matrix",
    slug: "sequence-similarity-matrix",
    path: "/tools/sequence-similarity-matrix",
    description: "Compute pairwise sequence identity and similarity matrices for multiple DNA, RNA, or protein sequences with heatmap visualization.",
    category:  "Sequence Analysis Tools",
    tags: [
      "sequence similarity matrix",
      "sequence identity matrix",
      "pairwise sequence similarity",
      "multiple sequence similarity",
      "sequence distance matrix",
      "dna sequence similarity",
      "protein sequence similarity",
      "rna sequence similarity",
      "sequence comparison matrix",
      "bioinformatics similarity matrix",
      "sequence clustering matrix",
      "pairwise alignment matrix"
    ],
    component: () => import("../tools/sequence-similarity-matrix/SequenceSimilarityMatrix")

  },

  {
    name: "Genome Browser (Mini IGV)",
    slug: "genome-browser",
    path: "/tools/genome-browser",
    description: "Interactive genome annotation viewer supporting BED, GFF, and GTF formats with zoomable tracks for genes, exons, SNPs and other genomic features.",
    category:  "Genome Analysis Tools",
    component: () => import("../tools/genome-browser/GenomeBrowser")
    ,
    tags: [
      "genome browser",
      "mini igv",
      "genome visualization",
      "gff viewer",
      "gtf viewer",
      "bed viewer",
      "genome annotation viewer",
      "gene track visualization",
      "bioinformatics genome browser",
      "genomic feature viewer",
      "genome annotation tool",
      "sequence annotation viewer"
    ]
  },

  {
    name: "Codon Optimization Tool",
    slug: "codon-optimization",
    path: "/tools/codon-optimization",
    description: "Optimize coding DNA or reverse translate protein sequences for host-specific codon usage, with GC balance, adaptation scoring, and codon-level comparison output.",
    category:  "Sequence Engineering Tools",
    component: () => import("../tools/codon-optimization/CodonOptimizationTool")
    ,
    tags: [
      "codon optimization",
      "codon optimizer",
      "reverse translate protein",
      "host codon usage",
      "gene optimization",
      "expression optimization",
      "dna codon design",
      "protein to dna",
      "codon adaptation index",
      "gc content optimization",
      "synthetic gene design",
      "bioinformatics codon tool"
    ]
  }


]






export function getRelatedTools(slug: string, max = 4): Tool[] {
  const tool = tools.find(t => t.slug === slug)
  if (!tool) return []

  // 1️⃣ If explicit related defined, use it
  if (tool.related && tool.related.length > 0) {
    return tool.related
      .map(s => tools.find(t => t.slug === s))
      .filter(Boolean) as Tool[]
  }

  // 2️⃣ fallback: same category
  const sameCategory = tools.filter(
    t => t.category === tool.category && t.slug !== slug
  )

  return sameCategory.slice(0, max)
}