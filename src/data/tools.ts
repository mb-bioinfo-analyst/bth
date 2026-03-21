export interface Tool {
  name: string
  path: string
  uiDescription: string
  metaDescription: string
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

    uiDescription:
      "Convert DNA, RNA, and protein sequences between FASTA, GenBank, EMBL, and other bioinformatics formats quickly and accurately.",

    metaDescription:
      "Free sequence format converter for FASTA, GenBank, and EMBL files. Convert DNA, RNA, and protein sequences instantly for bioinformatics analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/sequence-converter/SequenceConverter"),

    tags: [
      "sequence format converter",
      "fasta to genbank",
      "genbank to fasta",
      "embl to fasta",
      "fasta converter",
      "genbank converter",
      "embl converter",
      "sequence file converter",
      "dna sequence converter",
      "rna sequence converter",
      "protein sequence converter",
      "bioinformatics converter",
      "sequence format tool",
      "convert sequence formats"
    ]
  },

  {
    name: "Reverse Complement Calculator",
    slug: "reverse-complement",
    path: "/tools/reverse-complement",

    uiDescription:
      "Generate the reverse complement of DNA sequences instantly. Convert nucleotide sequences into complementary strands for bioinformatics analysis.",

    metaDescription:
      "Free reverse complement calculator for DNA and RNA sequences. Generate complementary strands instantly for sequence analysis and bioinformatics workflows.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/reverse-complement/ReverseComplement"),

    tags: [
      "reverse complement",
      "reverse complement calculator",
      "dna reverse complement",
      "rna reverse complement",
      "dna complement",
      "nucleotide complement",
      "sequence reverse complement",
      "dna sequence tool",
      "bioinformatics tool",
      "genomics analysis",
      "sequence analysis tool",
      "complementary dna strand"
    ]
  },

  {
    name: "DNA to Protein Translator",
    slug: "dna-translate",
    path: "/tools/dna-translate",

    uiDescription:
      "Translate DNA sequences into protein sequences using the standard genetic code and codon table for accurate amino acid conversion.",

    metaDescription:
      "Free DNA to protein translator. Convert DNA sequences into amino acid sequences using the genetic code and codon table for bioinformatics analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/dna-translate/DnaTranslate"),

    tags: [
      "dna to protein",
      "dna to protein translator",
      "translate dna sequence",
      "dna translation tool",
      "codon translator",
      "genetic code translator",
      "dna codon translation",
      "protein sequence translation",
      "amino acid translation",
      "codon table",
      "dna sequence analysis",
      "bioinformatics translation tool",
      "sequence translation"
    ]
  },

  {
    name: "ORF Finder (Open Reading Frame Finder)",
    slug: "orf-finder",
    path: "/tools/orf-finder",

    uiDescription:
      "Identify open reading frames (ORFs) in DNA sequences and detect potential protein-coding regions across all six reading frames.",

    metaDescription:
      "Free ORF finder to identify open reading frames in DNA sequences. Detect protein-coding regions across all reading frames for genomics analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/orf-finder/OrfFinder"),

    tags: [
      "orf finder",
      "open reading frame finder",
      "find orf",
      "dna orf finder",
      "orf detection",
      "coding sequence finder",
      "cds finder",
      "gene prediction tool",
      "find open reading frames",
      "six reading frames",
      "protein coding region",
      "dna sequence analysis",
      "genomics analysis",
      "bioinformatics tool"
    ]
  },

  {
    name: "GC Content Calculator",
    slug: "gc-content",
    path: "/tools/gc-content",

    uiDescription:
      "Calculate GC content percentage and nucleotide composition of DNA sequences for genomics analysis and sequence characterization.",

    metaDescription:
      "Free GC content calculator for DNA sequences. Compute GC percentage and nucleotide composition instantly for genomics and bioinformatics analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/gc-content/GcContent"),

    tags: [
      "gc content",
      "gc content calculator",
      "calculate gc content",
      "dna gc content",
      "gc percentage",
      "gc ratio",
      "nucleotide composition",
      "dna base composition",
      "sequence composition",
      "genomics gc content",
      "dna sequence analysis",
      "bioinformatics tool",
      "gc content analysis"
    ]
  },

  {
    name: "FASTA Formatter",
    slug: "fasta-formatter",
    path: "/tools/fasta-formatter",

    uiDescription:
      "Clean, validate, and format DNA, RNA, or protein sequences into standard FASTA format for accurate bioinformatics analysis.",

    metaDescription:
      "Free FASTA formatter to clean, validate, and format DNA, RNA, or protein sequences into standard FASTA format for bioinformatics workflows.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/fasta-formatter/FastaFormatter"),

    tags: [
      "fasta formatter",
      "format fasta sequence",
      "fasta format tool",
      "fasta file formatter",
      "clean fasta file",
      "fasta validator",
      "fasta sequence cleaner",
      "sequence fasta formatting",
      "dna fasta format",
      "rna fasta format",
      "protein fasta format",
      "bioinformatics fasta tool",
      "sequence formatting tool"
    ]
  },

  {
    name: "Sequence Length Calculator",
    slug: "sequence-length",
    path: "/tools/sequence-length",

    uiDescription:
      "Calculate the length of DNA, RNA, or protein sequences instantly in base pairs or amino acids for quick bioinformatics analysis.",

    metaDescription:
      "Free sequence length calculator for DNA, RNA, and protein sequences. Compute sequence length instantly in bp or amino acids for analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/sequence-length/SequenceLength"),

    tags: [
      "sequence length calculator",
      "calculate sequence length",
      "dna sequence length",
      "rna sequence length",
      "protein sequence length",
      "dna length calculator",
      "protein length calculator",
      "sequence length tool",
      "nucleotide sequence length",
      "amino acid sequence length",
      "bp length calculator",
      "sequence analysis tool",
      "bioinformatics tool"
    ]
  },

  {
    name: "FASTA Statistics Calculator",
    slug: "fasta-stats",
    path: "/tools/fasta-stats",

    uiDescription:
      "Calculate FASTA sequence statistics including sequence length, GC content, and nucleotide composition for DNA and RNA analysis.",

    metaDescription:
      "Free FASTA statistics calculator to analyze sequence length, GC content, and nucleotide composition for DNA and RNA sequences online.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/fasta-stats/FastaStats"),

    tags: [
      "fasta statistics",
      "fasta statistics calculator",
      "fasta sequence statistics",
      "fasta analysis tool",
      "fasta gc content",
      "nucleotide composition fasta",
      "sequence statistics",
      "dna sequence statistics",
      "fasta sequence analysis",
      "fasta base composition",
      "genomics sequence statistics",
      "bioinformatics fasta tool",
      "sequence analysis tool"
    ]
  },

  {
    name: "Multi-sequence FASTA Statistics",
    slug: "multi-fasta-stats",
    path: "/tools/multi-fasta-stats",

    uiDescription:
      "Analyze multiple FASTA sequences simultaneously and compute sequence length, GC content, and nucleotide composition for batch bioinformatics analysis.",

    metaDescription:
      "Free multi-FASTA statistics tool to analyze multiple sequences. Compute GC content, sequence length, and nucleotide composition in batch.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/multi-fasta-stats/MultiFastaStats"),

    tags: [
      "multi fasta statistics",
      "multi fasta stats",
      "multiple fasta analysis",
      "batch fasta analysis",
      "multi sequence fasta tool",
      "multiple sequence statistics",
      "fasta dataset analysis",
      "fasta gc content analysis",
      "dna fasta analysis",
      "fasta sequence statistics",
      "genomics sequence statistics",
      "bioinformatics fasta tool",
      "batch sequence analysis"
    ]
  },

  {
    name: "DNA to RNA Transcription",
    slug: "dna-to-rna",
    path: "/tools/dna-to-rna",

    uiDescription:
      "Transcribe DNA sequences into RNA by converting thymine (T) to uracil (U) using standard transcription rules for molecular biology analysis.",

    metaDescription:
      "Free DNA to RNA transcription tool. Convert DNA sequences into RNA instantly by replacing T with U for bioinformatics and molecular biology workflows.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/dna-to-rna/DnaToRna"),

    tags: [
      "dna to rna",
      "dna to rna transcription",
      "dna transcription",
      "transcribe dna sequence",
      "dna to rna converter",
      "convert dna to rna",
      "rna transcription tool",
      "rna sequence generator",
      "dna rna transcription",
      "nucleotide transcription",
      "molecular biology transcription",
      "bioinformatics transcription tool",
      "sequence transcription"
    ]
  },

  {
    name: "RNA to DNA Reverse Transcription",
    slug: "rna-to-dna",
    path: "/tools/rna-to-dna",

    uiDescription:
      "Convert RNA sequences into DNA (cDNA) using reverse transcription and generate complementary DNA strands for molecular biology analysis.",

    metaDescription:
      "Free RNA to DNA reverse transcription tool. Convert RNA sequences into cDNA instantly for bioinformatics and molecular biology workflows.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/rna-to-dna/RnaToDna"),

    tags: [
      "rna to dna",
      "rna to dna converter",
      "reverse transcription",
      "reverse transcription tool",
      "cdna generator",
      "cdna sequence generator",
      "convert rna to cdna",
      "reverse transcribe rna",
      "rna dna conversion",
      "cDNA synthesis",
      "molecular biology reverse transcription",
      "bioinformatics transcription tool",
      "sequence conversion tool"
    ]
  },

  {
    name: "Sequence Reverse Tool",
    slug: "reverse-sequence",
    path: "/tools/reverse-sequence",

    uiDescription:
      "Reverse DNA, RNA, or protein sequences instantly without generating complementary strands for quick sequence manipulation and analysis.",

    metaDescription:
      "Free sequence reverse tool for DNA, RNA, and protein sequences. Reverse nucleotide or amino acid sequences instantly for bioinformatics workflows.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/reverse-sequence/ReverseSequence"),

    tags: [
      "reverse sequence",
      "sequence reverse tool",
      "reverse dna sequence",
      "reverse rna sequence",
      "reverse protein sequence",
      "reverse nucleotide sequence",
      "reverse amino acid sequence",
      "reverse dna string",
      "sequence manipulation tool",
      "bioinformatics sequence tool",
      "dna sequence analysis",
      "protein sequence analysis",
      "reverse sequence online"
    ]
  },

  {
    name: "Complement Sequence Generator",
    slug: "complement-sequence",
    path: "/tools/complement-sequence",

    uiDescription:
      "Generate complementary DNA or RNA sequences using base pairing rules without reversing the sequence for accurate nucleotide analysis.",

    metaDescription:
      "Free DNA and RNA complement generator. Create complementary nucleotide sequences instantly using base pairing rules for bioinformatics analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/complement-sequence/ComplementSequence"),

    tags: [
      "complement sequence",
      "complement sequence generator",
      "dna complement",
      "rna complement",
      "nucleotide complement",
      "dna complementary strand",
      "rna complementary strand",
      "generate dna complement",
      "generate rna complement",
      "sequence complement tool",
      "dna base pairing",
      "nucleotide sequence analysis",
      "bioinformatics sequence tool"
    ]
  },

  {
    name: "Primer Melting Temperature (Tm) Calculator",
    slug: "tm-calculator",
    path: "/tools/tm-calculator",

    uiDescription:
      "Calculate PCR primer melting temperature (Tm) from DNA sequences to optimize primer design and annealing conditions in PCR experiments.",

    metaDescription:
      "Free primer Tm calculator to compute DNA melting temperature for PCR primer design and annealing optimization using sequence-based analysis.",

    category: "PCR Analysis Tools",

    component: () => import("../tools/tm-calculator/TmCalculator"),

    tags: [
      "primer tm calculator",
      "melting temperature calculator",
      "primer melting temperature",
      "pcr primer tm",
      "dna primer tm",
      "calculate primer tm",
      "oligo tm calculator",
      "dna oligo melting temperature",
      "primer annealing temperature",
      "pcr primer design tool",
      "pcr primer analysis",
      "bioinformatics primer tool",
      "tm calculation dna"
    ]
  },

  {
    name: "Primer Analyzer",
    slug: "primer-analyzer",
    path: "/tools/primer-analyzer",

    uiDescription:
      "Analyze PCR primer sequences for GC content, melting temperature (Tm), GC clamp, and structural properties to optimize primer design.",

    metaDescription:
      "Free primer analyzer to evaluate PCR primers for Tm, GC content, GC clamp, and secondary structures for optimal primer design and validation.",

    category: "PCR Analysis Tools",

    component: () => import("../tools/primer-analyzer/PrimerAnalyzer"),

    tags: [
      "primer analyzer",
      "pcr primer analysis",
      "primer analysis tool",
      "primer design tool",
      "primer checker",
      "dna primer analysis",
      "oligo analysis",
      "primer gc content",
      "primer tm calculator",
      "gc clamp primer",
      "primer secondary structure",
      "primer hairpin checker",
      "primer quality check",
      "pcr primer checker"
    ]
  },

  {
    name: "Random DNA Sequence Generator",
    slug: "random-dna-generator",
    path: "/tools/random-dna-generator",

    uiDescription:
      "Generate random DNA sequences with customizable length and GC content, with optional FASTA output for simulation and testing workflows.",

    metaDescription:
      "Free random DNA sequence generator. Create synthetic DNA sequences with custom length and GC content, with FASTA output for bioinformatics testing.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/random-dna-generator/RandomDnaGenerator"),

    tags: [
      "random dna generator",
      "dna sequence generator",
      "generate random dna sequence",
      "random nucleotide generator",
      "dna sequence simulator",
      "synthetic dna generator",
      "dna fasta generator",
      "random dna sequence tool",
      "genomics sequence generator",
      "dna simulation tool",
      "bioinformatics dna generator",
      "random nucleotide sequence",
      "generate dna sequence online"
    ]
  },

  {
    name: "Random Protein Sequence Generator",
    slug: "random-protein-generator",
    path: "/tools/random-protein-generator",

    uiDescription:
      "Generate random protein sequences composed of amino acids with customizable length for bioinformatics simulation, testing, and algorithm benchmarking.",

    metaDescription:
      "Free random protein sequence generator. Create amino acid sequences for simulation, testing, and bioinformatics workflows with customizable length.",

    category: "Protein Analysis Tools",

    component: () => import("../tools/random-protein-generator/RandomProteinGenerator"),

    tags: [
      "random protein generator",
      "protein sequence generator",
      "random amino acid sequence",
      "generate protein sequence",
      "amino acid sequence generator",
      "random peptide generator",
      "protein fasta generator",
      "synthetic protein sequence",
      "protein simulation tool",
      "protein sequence simulator",
      "bioinformatics protein generator",
      "amino acid generator",
      "generate protein sequence online"
    ]
  },

  {
    name: "Protein Molecular Weight & pI Calculator",
    slug: "protein-mw",
    path: "/tools/protein-mw",

    uiDescription:
      "Calculate protein molecular weight, isoelectric point (pI), and amino acid composition from protein sequences for biochemical and bioinformatics analysis.",

    metaDescription:
      "Free protein molecular weight and pI calculator. Compute isoelectric point, molecular weight, and amino acid composition from protein sequences.",

    category: "Protein Analysis Tools",

    component: () => import("../tools/protein-mw/ProteinMwPiCalculator"),

    tags: [
      "protein molecular weight calculator",
      "protein mw calculator",
      "protein pi calculator",
      "isoelectric point calculator",
      "calculate protein molecular weight",
      "calculate protein pi",
      "protein sequence analysis",
      "amino acid composition calculator",
      "protein analysis tool",
      "protein biochemistry calculator",
      "protein sequence properties",
      "bioinformatics protein tool",
      "protein mw pi calculator"
    ]
  },

  {
    name: "Protein to DNA Back Translation",
    slug: "protein-back-translation",
    path: "/tools/protein-back-translation",

    uiDescription:
      "Convert protein sequences into possible DNA sequences using codon tables and the genetic code for reverse translation and sequence design.",

    metaDescription:
      "Free protein to DNA back translation tool. Convert amino acid sequences into DNA using codon tables for cloning and bioinformatics workflows.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/protein-back-translation/ProteinBackTranslation"),

    tags: [
      "protein to dna",
      "protein back translation",
      "back translation",
      "amino acid to dna",
      "protein to dna converter",
      "reverse translation",
      "codon back translation",
      "protein sequence to dna",
      "codon table translation",
      "genetic code translation",
      "sequence back translation",
      "bioinformatics translation tool",
      "dna sequence design"
    ]
  },

  {
    name: "Protein Hydrophobicity (Kyte-Doolittle) Calculator",
    slug: "protein-hydrophobicity",
    path: "/tools/protein-hydrophobicity",

    uiDescription:
      "Calculate protein hydrophobicity profiles using the Kyte-Doolittle scale to identify hydrophobic and hydrophilic regions in protein sequences.",

    metaDescription:
      "Free Kyte-Doolittle hydrophobicity calculator. Analyze protein hydropathy profiles and identify hydrophobic regions in protein sequences.",

    category: "Protein Analysis Tools",

    component: () => import("../tools/protein-hydrophobicity/ProteinHydrophobicity"),

    tags: [
      "protein hydrophobicity",
      "kyte doolittle hydrophobicity",
      "hydropathy plot",
      "hydropathy plot calculator",
      "protein hydrophobicity calculator",
      "kyte doolittle plot",
      "hydrophobicity profile",
      "protein hydropathy analysis",
      "protein hydropathy tool",
      "amino acid hydrophobicity",
      "protein sequence hydrophobicity",
      "protein sequence analysis",
      "bioinformatics protein tool"
    ]
  },

  {
    name: "Sequence Case Converter",
    slug: "sequence-case-converter",
    path: "/tools/sequence-case-converter",

    uiDescription:
      "Convert DNA, RNA, or protein sequences between uppercase and lowercase for FASTA formatting, preprocessing, and bioinformatics workflows.",

    metaDescription:
      "Free sequence case converter to change DNA, RNA, or protein sequences between uppercase and lowercase for FASTA formatting and preprocessing.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/sequence-case-converter/SequenceCaseConverter"),

    tags: [
      "sequence case converter",
      "convert sequence uppercase",
      "convert sequence lowercase",
      "fasta case converter",
      "dna uppercase lowercase",
      "rna uppercase lowercase",
      "protein sequence case",
      "sequence formatting tool",
      "sequence preprocessing tool",
      "bioinformatics sequence formatting",
      "dna sequence formatting",
      "sequence cleanup tool",
      "sequence text formatting"
    ]
  },

  {
    name: "Remove Gaps Tool",
    slug: "remove-gaps",
    path: "/tools/remove-gaps",

    uiDescription:
      "Remove alignment gaps and formatting characters from DNA, RNA, or protein sequences for clean preprocessing and downstream bioinformatics analysis.",

    metaDescription:
      "Free tool to remove gaps from DNA, RNA, or protein sequences. Clean FASTA alignments by removing dashes and gap characters for analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/remove-gaps/RemoveGapsTool"),

    tags: [
      "remove gaps sequence",
      "remove sequence gaps",
      "alignment gap remover",
      "sequence gap remover",
      "remove fasta gaps",
      "remove dash gaps fasta",
      "alignment cleanup tool",
      "sequence cleaning tool",
      "sequence preprocessing tool",
      "dna sequence cleaning",
      "protein alignment cleanup",
      "bioinformatics sequence tool",
      "gap removal tool"
    ]
  },

  {
    name: "Sequence Cleaner",
    slug: "sequence-cleaner",
    path: "/tools/sequence-cleaner",

    uiDescription:
      "Clean DNA, RNA, or protein sequences by removing invalid characters, numbers, whitespace, and gaps for accurate preprocessing and analysis.",

    metaDescription:
      "Free sequence cleaner and sanitizer to remove invalid characters, gaps, and formatting issues from DNA, RNA, or protein sequences for analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/sequence-cleaner/SequenceCleaner"),

    tags: [
      "sequence cleaner",
      "sequence sanitizer",
      "clean dna sequence",
      "clean fasta sequence",
      "sequence cleanup tool",
      "remove invalid characters sequence",
      "sequence preprocessing tool",
      "dna sequence preprocessing",
      "fasta cleaning tool",
      "sequence data cleaning",
      "sequence formatting cleaner",
      "bioinformatics sequence cleaner",
      "sanitize sequence"
    ]
  },

  {
    name: "FASTA Line Wrapper",
    slug: "sequence-line-wrapper",
    path: "/tools/sequence-line-wrapper",

    uiDescription:
      "Wrap DNA, RNA, or protein sequences to a fixed line length for proper FASTA formatting, improved readability, and downstream bioinformatics workflows.",

    metaDescription:
      "Free FASTA line wrapper to format DNA, RNA, or protein sequences to fixed line lengths for proper FASTA formatting and analysis.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/sequence-line-wrapper/SequenceLineWrapper"),

    tags: [
      "fasta line wrapper",
      "wrap fasta sequence",
      "sequence line wrapper",
      "fasta line wrap tool",
      "format fasta line length",
      "fasta formatting tool",
      "sequence formatting tool",
      "dna fasta line wrap",
      "rna fasta formatting",
      "protein fasta formatting",
      "bioinformatics fasta tool",
      "sequence preprocessing tool",
      "fasta line length formatter"
    ]
  },

  {
    name: "Sequence Entropy Calculator",
    slug: "sequence-entropy",
    path: "/tools/sequence-entropy",

    uiDescription:
      "Calculate Shannon entropy and sequence complexity for DNA, RNA, or protein sequences to measure information content and variability.",

    metaDescription:
      "Free sequence entropy calculator to compute Shannon entropy and sequence complexity for DNA, RNA, and protein sequences.",

    category: "Sequence Bioinformatics Tools",

    component: () => import("../tools/sequence-entropy/SequenceEntropyCalculator"),

    tags: [
      "sequence entropy calculator",
      "shannon entropy sequence",
      "sequence complexity calculator",
      "dna entropy",
      "rna entropy",
      "protein entropy",
      "nucleotide entropy",
      "amino acid entropy",
      "entropy bioinformatics",
      "information theory sequence",
      "sequence complexity analysis",
      "bioinformatics entropy tool",
      "sequence variability analysis"
    ]
  },

  {
    name: "FASTA Header Extractor",
    slug: "fasta-header-extractor",
    path: "/tools/fasta-header-extractor",

    uiDescription:
      "Extract sequence IDs or full headers from FASTA files for downstream analysis, filtering, and bioinformatics data processing workflows.",

    metaDescription:
      "Free FASTA header extractor to extract sequence IDs or headers from FASTA files for bioinformatics analysis and data processing.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-header-extractor/FastaHeaderExtractor"),

    tags: [
      "fasta header extractor",
      "extract fasta headers",
      "fasta id extractor",
      "fasta sequence ids",
      "fasta header parser",
      "extract fasta identifiers",
      "fasta metadata extractor",
      "fasta header tool",
      "fasta file processing",
      "sequence header extraction",
      "bioinformatics fasta tool",
      "extract sequence ids fasta",
      "fasta header extraction"
    ]
  },

  {
    name: "FASTA Header Editor",
    slug: "fasta-header-editor",
    path: "/tools/fasta-header-editor",

    uiDescription:
      "Edit FASTA headers by adding prefixes, suffixes, renaming, or numbering sequence identifiers for streamlined bioinformatics workflows.",

    metaDescription:
      "Free FASTA header editor to rename, modify, and format sequence headers with prefixes, suffixes, or numbering for bioinformatics preprocessing.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-header-editor/FastaHeaderEditor"),

    tags: [
      "fasta header editor",
      "edit fasta headers",
      "rename fasta headers",
      "fasta header rename tool",
      "modify fasta headers",
      "fasta header formatter",
      "fasta sequence header editing",
      "fasta id renaming",
      "sequence header editor",
      "fasta metadata editing",
      "fasta preprocessing tool",
      "bioinformatics fasta tool",
      "fasta header modification"
    ]
  },

  {
    name: "FASTA Sequence Extractor",
    slug: "fasta-sequence-extractor",
    path: "/tools/fasta-sequence-extractor",

    uiDescription:
      "Extract specific sequences from FASTA files using sequence IDs or header keywords for targeted filtering and bioinformatics analysis.",

    metaDescription:
      "Free FASTA sequence extractor to extract sequences by ID or keywords from FASTA files for bioinformatics filtering and analysis.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-sequence-extractor/FastaSequenceExtractor"),

    tags: [
      "fasta sequence extractor",
      "extract fasta sequences",
      "extract sequences from fasta",
      "fasta id extraction",
      "fasta sequence filter by id",
      "fasta sequence parser",
      "fasta subset extractor",
      "fasta sequence selection tool",
      "fasta sequence id filter",
      "bioinformatics fasta extraction",
      "sequence extraction tool",
      "fasta data processing",
      "filter fasta sequences"
    ]
  },

  {
    name: "FASTA Deduplicator",
    slug: "fasta-deduplicator",
    path: "/tools/fasta-deduplicator",

    uiDescription:
      "Remove duplicate sequences from FASTA files to generate unique sequence datasets for clean preprocessing and downstream bioinformatics analysis.",

    metaDescription:
      "Free FASTA deduplicator to remove duplicate sequences and create unique FASTA datasets for bioinformatics analysis and preprocessing.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-deduplicator/FastaDeduplicator"),

    tags: [
      "fasta deduplicator",
      "remove duplicate fasta sequences",
      "fasta duplicate remover",
      "deduplicate fasta file",
      "fasta sequence deduplication",
      "remove duplicate sequences fasta",
      "unique fasta sequences",
      "fasta duplicate filter",
      "sequence duplicate removal",
      "fasta dataset deduplication",
      "bioinformatics fasta cleaning",
      "fasta preprocessing tool",
      "deduplicate sequences"
    ]
  },

  {
    name: "FASTA Filter",
    slug: "fasta-filter",
    path: "/tools/fasta-filter",

    uiDescription:
      "Filter FASTA sequences by length, GC content, or header keywords to create targeted and high-quality datasets for bioinformatics analysis.",

    metaDescription:
      "Free FASTA filter to select sequences by length, GC content, or headers for targeted bioinformatics analysis and dataset preparation.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-filter/FastaFilter"),

    tags: [
      "fasta filter",
      "filter fasta sequences",
      "fasta sequence filter",
      "filter fasta by length",
      "filter fasta by gc content",
      "fasta header filter",
      "fasta sequence selection",
      "fasta dataset filtering",
      "bioinformatics fasta filtering",
      "sequence filtering tool",
      "fasta preprocessing tool",
      "genomics fasta filter",
      "filter sequences fasta"
    ]
  },

  {
    name: "FASTA Splitter",
    slug: "fasta-splitter",
    path: "/tools/fasta-splitter",

    uiDescription:
      "Split large FASTA files into smaller datasets by sequence count or file size for efficient bioinformatics processing and analysis.",

    metaDescription:
      "Free FASTA splitter to divide large FASTA files by sequence count or size for easier bioinformatics processing and dataset management.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-splitter/FastaSplitter"),

    tags: [
      "fasta splitter",
      "split fasta file",
      "split fasta sequences",
      "fasta file splitter",
      "divide fasta dataset",
      "split fasta by sequence count",
      "split fasta dataset",
      "large fasta file splitter",
      "sequence dataset splitter",
      "fasta dataset processing",
      "bioinformatics fasta tool",
      "fasta preprocessing tool",
      "split fasta online"
    ]
  },

  {
    name: "FASTA Random Sampler",
    slug: "fasta-random-sampler",
    path: "/tools/fasta-random-sampler",

    uiDescription:
      "Randomly sample sequences from FASTA files to generate subset datasets for bioinformatics analysis, testing, and benchmarking workflows.",

    metaDescription:
      "Free FASTA random sampler to select random sequences from FASTA files and create subset datasets for bioinformatics analysis and testing.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-random-sampler/FastaRandomSampler"),

    tags: [
      "fasta random sampler",
      "sample fasta sequences",
      "random fasta subset",
      "fasta sequence sampling",
      "random subset fasta",
      "fasta sampling tool",
      "random fasta extractor",
      "fasta dataset sampler",
      "bioinformatics fasta sampling",
      "sequence subset generator",
      "random sequence selection fasta",
      "fasta preprocessing tool",
      "sample sequences fasta"
    ]
  },

  {
    name: "FASTA Sequence Sorter",
    slug: "fasta-sequence-sorter",
    path: "/tools/fasta-sequence-sorter",

    uiDescription:
      "Sort FASTA sequences by length, GC content, or alphabetically to organize and prepare sequence datasets for bioinformatics analysis.",

    metaDescription:
      "Free FASTA sequence sorter to sort sequences by length, GC content, or alphabetically for bioinformatics analysis and dataset organization.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-sequence-sorter/FastaSequenceSorter"),

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
      "genomics fasta sorter",
      "sort sequences fasta"
    ]
  },

  {
    name: "FASTA Merge Tool",
    slug: "fasta-merge",
    path: "/tools/fasta-merge",

    uiDescription:
      "Merge multiple FASTA files into a single dataset to combine sequences for streamlined bioinformatics analysis and processing workflows.",

    metaDescription:
      "Free FASTA merge tool to combine multiple FASTA files into one dataset for bioinformatics analysis and sequence processing.",

    category: "FASTA File Tools",

    component: () => import("../tools/fasta-merge/FastaMergeTool"),

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
      "genomics fasta merger",
      "merge sequences fasta"
    ]
  },

  {
    name: "k-mer Counter",
    slug: "kmer-counter",
    path: "/tools/kmer-counter",

    uiDescription:
      "Count k-mer frequencies in DNA or RNA sequences with options for reverse-complement collapsing to analyze sequence composition and patterns.",

    metaDescription:
      "Free k-mer counter to calculate k-mer frequencies in DNA and RNA sequences with reverse-complement options for genomics analysis.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/kmer-counter/kmerCounter"),

    tags: [
      "kmer counter",
      "k-mer counter",
      "kmer frequency",
      "k-mer counting",
      "kmer frequency calculator",
      "dna kmer analysis",
      "rna kmer analysis",
      "genomics kmer analysis",
      "sequence kmer analysis",
      "oligonucleotide frequency",
      "bioinformatics kmer tool",
      "kmer analysis tool",
      "kmer frequency analysis"
    ]
  },

  {
    name: "k-mer Frequency Analyzer",
    slug: "kmer-frequency-analyzer",
    path: "/tools/kmer-frequency-analyzer",

    uiDescription:
      "Analyze normalized k-mer frequencies, diversity, and distribution across DNA or RNA FASTA sequences for advanced sequence analysis.",

    metaDescription:
      "Free k-mer frequency analyzer to compute normalized k-mer frequencies, diversity, and statistics for DNA and RNA FASTA sequences.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/kmer-frequency-analyzer/KmerFrequencyAnalyzer"),

    tags: [
      "kmer frequency analyzer",
      "k-mer frequency analysis",
      "kmer frequency",
      "dna kmer frequency",
      "rna kmer frequency",
      "kmer diversity analysis",
      "kmer statistics",
      "kmer distribution analysis",
      "genomics kmer analysis",
      "sequence kmer analysis",
      "fasta kmer analysis",
      "oligonucleotide frequency analysis",
      "kmer analysis tool"
    ]
  },
  {
    name: "k-mer Frequency Calculator",
    slug: "kmer-frequency-calculator",
    path: "/tools/kmer-frequency-calculator",

    uiDescription:
      "Calculate normalized k-mer frequencies, expected probabilities, and enrichment scores in DNA or RNA sequences for advanced sequence analysis.",

    metaDescription:
      "Free k-mer frequency calculator to compute normalized frequencies, expected probabilities, and enrichment scores in DNA and RNA sequences.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/kmer-frequency-calculator/KmerFrequencyCalculator"),

    tags: [
      "kmer frequency calculator",
      "k-mer frequency calculator",
      "kmer analysis tool",
      "dna kmer frequency",
      "rna kmer frequency",
      "kmer enrichment analysis",
      "kmer probability calculator",
      "oligonucleotide frequency calculator",
      "genomics kmer analysis",
      "sequence kmer analysis",
      "kmer statistics calculator",
      "bioinformatics kmer tool",
      "kmer enrichment calculator"
    ]
  },

  {
    name: "Sequence Identity Calculator",
    slug: "sequence-identity-calculator",
    path: "/tools/sequence-identity-calculator",

    uiDescription:
      "Calculate pairwise sequence identity between DNA, RNA, or protein sequences to compare similarity and evaluate sequence alignment results.",

    metaDescription:
      "Free sequence identity calculator to compute pairwise identity between DNA, RNA, or protein sequences for bioinformatics comparison.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/sequence-identity-calculator/SequenceIdentityCalculator"),

    tags: [
      "sequence identity calculator",
      "pairwise sequence identity",
      "dna sequence identity",
      "protein sequence identity",
      "rna sequence identity",
      "sequence similarity calculator",
      "pairwise sequence comparison",
      "sequence comparison tool",
      "alignment identity calculator",
      "sequence similarity analysis",
      "genomics sequence comparison",
      "bioinformatics sequence identity",
      "sequence identity analysis"
    ]
  },

  {
    name: "Visual Alignment Viewer",
    slug: "visual-alignment-viewer",
    path: "/tools/visual-alignment-viewer",

    uiDescription:
      "Perform global or local pairwise sequence alignment and visualize DNA, RNA, or protein alignments with customizable scoring and clear alignment display.",

    metaDescription:
      "Free sequence alignment viewer to perform global or local DNA, RNA, and protein alignments with interactive visualization and scoring.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/visual-alignment-viewer/VisualAlignmentViewer"),

    tags: [
      "sequence alignment viewer",
      "pairwise sequence alignment",
      "global sequence alignment",
      "local sequence alignment",
      "dna sequence alignment",
      "protein sequence alignment",
      "rna sequence alignment",
      "alignment visualization tool",
      "pairwise alignment tool",
      "bioinformatics alignment viewer",
      "sequence similarity alignment",
      "needleman wunsch",
      "smith waterman"
    ]
  },

  {
    name: "Restriction Enzyme Finder",
    slug: "restriction-site-finder",
    path: "/tools/restriction-site-finder",

    uiDescription:
      "Find restriction enzyme recognition sites and cut positions in DNA sequences for cloning, plasmid analysis, and restriction mapping workflows.",

    metaDescription:
      "Free restriction enzyme finder to identify DNA restriction sites and cut positions for cloning, plasmid analysis, and mapping.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/restriction-site-finder/RestrictionSiteFinder"),

    tags: [
      "restriction enzyme finder",
      "restriction site finder",
      "dna restriction sites",
      "restriction enzyme analysis",
      "restriction enzyme cut sites",
      "restriction map generator",
      "plasmid restriction map",
      "dna digestion tool",
      "cloning restriction analysis",
      "restriction enzyme scanner",
      "plasmid enzyme finder",
      "restriction mapping tool",
      "bioinformatics restriction tool"
    ]
  },

  {
    name: "Codon Usage Calculator",
    slug: "codon-usage-calculator",
    path: "/tools/codon-usage-calculator",

    uiDescription:
      "Calculate codon usage, codon frequencies, RSCU values, and GC3 content from coding DNA sequences for gene expression and bias analysis.",

    metaDescription:
      "Free codon usage calculator to analyze codon frequencies, RSCU values, and GC3 content in coding DNA sequences.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/codon-usage-calculator/CodonUsageCalculator"),

    tags: [
      "codon usage calculator",
      "codon usage analysis",
      "codon bias analysis",
      "rscu calculator",
      "codon frequency calculator",
      "gc3 codon analysis",
      "coding sequence codon usage",
      "dna codon statistics",
      "gene expression codon bias",
      "genomics codon analysis",
      "bioinformatics codon tool",
      "cds codon analysis",
      "codon bias calculator"
    ]
  },

  {
    name: "Motif Pattern Finder",
    slug: "motif-pattern-finder",
    path: "/tools/motif-pattern-finder",

    uiDescription:
      "Find sequence motifs and patterns in DNA, RNA, or protein sequences using exact match, IUPAC motifs, or regex-based searches.",

    metaDescription:
      "Free motif finder to search DNA, RNA, and protein sequences using exact match, IUPAC motifs, or regex pattern analysis.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/motif-pattern-finder/MotifPatternFinder"),

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
      "motif detection tool",
      "sequence motif analysis"
    ]
  },

  {
    name: "Nucleotide Composition Calculator",
    slug: "nucleotide-composition-calculator",
    path: "/tools/nucleotide-composition-calculator",

    uiDescription:
      "Analyze nucleotide composition including GC/AT content, dinucleotide frequencies, CpG ratio, and positional base bias in DNA or RNA sequences.",

    metaDescription:
      "Free nucleotide composition calculator to analyze GC content, AT content, dinucleotide frequencies, and CpG ratio in DNA and RNA sequences.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/nucleotide-composition-calculator/NucleotideCompositionCalculator"),

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
      "genomics base composition",
      "nucleotide frequency analysis"
    ]
  },

  {
    name: "Sequence Similarity Matrix",
    slug: "sequence-similarity-matrix",
    path: "/tools/sequence-similarity-matrix",

    uiDescription:
      "Compute pairwise sequence identity and similarity matrices for multiple DNA, RNA, or protein sequences with heatmap visualization and clustering insights.",

    metaDescription:
      "Free sequence similarity matrix tool to compute pairwise identity and similarity for DNA, RNA, or protein sequences with heatmap visualization.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/sequence-similarity-matrix/SequenceSimilarityMatrix"),

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
      "pairwise alignment matrix",
      "sequence similarity analysis"
    ]
  },

  {
    name: "Genome Browser (Mini IGV)",
    slug: "genome-browser",
    path: "/tools/genome-browser",

    uiDescription:
      "Interactive genome browser to visualize BED, GFF, and GTF annotations with zoomable tracks for genes, exons, SNPs, and genomic features.",

    metaDescription:
      "Free genome browser (Mini IGV) to visualize BED, GFF, and GTF annotations with interactive tracks for genes and genomic features.",

    category: "Genome Analysis Tools",

    component: () => import("../tools/genome-browser/GenomeBrowser"),

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
      "sequence annotation viewer",
      "genome track viewer"
    ]
  },

  {
    name: "Codon Optimization Tool",
    slug: "codon-optimization",
    path: "/tools/codon-optimization",

    uiDescription:
      "Optimize coding DNA or reverse translate protein sequences using host-specific codon usage with GC balance, CAI scoring, and codon-level comparison.",

    metaDescription:
      "Free codon optimization tool to optimize DNA sequences for host expression using codon usage, GC balance, and CAI scoring.",

    category: "Sequence Engineering Tools",

    component: () => import("../tools/codon-optimization/CodonOptimizationTool"),

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
      "bioinformatics codon tool",
      "codon optimization tool"
    ]
  },
  {
    name: "Sequence Toolkit (All-in-One)",
    slug: "sequence-toolkit",
    path: "/tools/sequence-toolkit",

    uiDescription:
      "All-in-one sequence toolkit to reverse, complement, convert DNA ↔ RNA, clean sequences, and compute GC content and length with multi-FASTA support.",

    metaDescription:
      "Free online sequence toolkit for reverse complement, DNA to RNA conversion, sequence cleaning, GC content, and FASTA processing. Runs locally in your browser.",

    category: "Sequence Analysis Tools",

    component: () => import("../tools/sequence-toolkit/SequenceToolkit"),

    tags: [
      "sequence toolkit",
      "bioinformatics sequence tools",
      "reverse complement",
      "dna to rna converter",
      "rna to dna converter",
      "sequence cleaner",
      "remove gaps sequence",
      "sequence length calculator",
      "gc content calculator",
      "fasta sequence tools",
      "nucleotide sequence analysis",
      "sequence processing tool",
      "dna sequence utilities",
      "rna sequence tools",
      "bioinformatics toolkit"
    ]
  },

  {
  name: "FASTA Toolkit",
  slug: "fasta-toolkit",
  path: "/tools/fasta-toolkit",

  uiDescription:
    "All-in-one FASTA toolkit to extract and edit headers, filter, deduplicate, sort, sample, split, merge, format, and analyze multi-FASTA datasets.",

  metaDescription:
    "Free online FASTA toolkit for header extraction, filtering, deduplication, sorting, sampling, formatting, splitting, merging, and FASTA statistics.",

  category: "FASTA File Tools",

  component: () => import("../tools/fasta-toolkit/FASTAToolkit"),

  tags: [
    "fasta toolkit",
    "fasta tools",
    "fasta splitter",
    "fasta merge",
    "fasta filter",
    "fasta deduplicator",
    "fasta header extractor",
    "fasta header editor",
    "multi fasta tools",
    "fasta formatter",
    "fasta statistics",
    "fasta sorter",
    "fasta random sampler",
    "bioinformatics fasta tool"
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