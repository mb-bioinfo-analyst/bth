import { Link } from "react-router-dom"
import { useState } from "react"
import { RefreshCw } from "lucide-react"

import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"

import GenomeWebGLViewer from "../../components/GenomeWebGLViewer"
import { parseRegion } from "../../utils/genomeUtils"
import { readBam, parseSamReads } from "../../utils/bamUtils"



import {
    parseBED,
    parseGFF,
    detectFormat,
    GenomeFeature
} from "../../utils/genomeUtils"

export default function GenomeBrowser() {

    const [tracks, setTracks] = useState({
        genes: true,
        exons: true,
        snps: true,
        reads: true,
        reference: true
    })

    const [reference, setReference] = useState("")
    const [input, setInput] = useState("")
    const [features, setFeatures] = useState<GenomeFeature[]>([])
    const [chromosome, setChromosome] = useState("chr1")

    const [regionInput, setRegionInput] = useState("chr1:1-1000")
    const [regionStart, setRegionStart] = useState(1)
    const [regionEnd, setRegionEnd] = useState(1000)
    const [alignments, setAlignments] = useState<any[]>([])
    const [geneQuery, setGeneQuery] = useState("")

    const visualize = () => {

        const format = detectFormat(input)

        let feats: GenomeFeature[] = []

        if (format === "bed") feats = parseBED(input)
        else feats = parseGFF(input)

        setFeatures(feats)

    }

    const loadExample = () => {

        setInput(`chr1 100 500 gene
chr1 150 200 exon
chr1 220 260 exon
chr1 320 330 SNP
chr1 400 480 exon`)

    }

    const clearAll = () => {

        setInput("")
        setFeatures([])

    }

    const chromosomes =
        [...new Set(features.map(f => f.seqid))]

    return (

        <ToolLayout
            badge="Genome Analysis"
            slug="genome-browser"
            category="Genome Analysis"

            seoContent={
                <>
                    <h2>Interactive Genome Browser for BED, GFF, and GTF Annotations</h2>

                    <p>
                        Genome browsers are essential tools in modern genomics and
                        bioinformatics, allowing researchers to visually explore genomic
                        regions, annotations, and sequencing data. By displaying genomic
                        features along genomic coordinates, genome browsers help scientists
                        interpret gene structures, regulatory elements, mutations, and
                        sequencing coverage across chromosomes.
                    </p>

                    <p>
                        This lightweight genome browser provides an interactive visualization
                        environment for exploring genomic annotations in formats such as BED,
                        GFF, and GTF. Users can load genomic feature files, navigate to
                        specific chromosomal regions, and visualize biological elements such
                        as genes, exons, transcripts, and genomic variants along the genome.
                    </p>

                    <p>
                        In addition to annotation tracks, the viewer can optionally display
                        sequencing alignments from SAM or BAM files and visualize reference
                        sequences when provided. This enables researchers to inspect read
                        coverage, explore genomic variants, and examine gene structures
                        within specific genomic intervals. Sequence regions extracted from
                        genome annotations can also be analyzed using other utilities such
                        as the{" "}
                        <Link to="/tools/gc-content">GC Content Calculator</Link>{" "}
                        or explored further with the{" "}
                        <Link to="/tools/sequence-similarity-matrix">
                            Sequence Similarity Matrix
                        </Link>.
                    </p>

                    <p>
                        The genome viewer runs directly in your browser using efficient
                        client-side rendering to display genomic tracks smoothly. All
                        uploaded genomic files remain on your local machine and are never
                        transmitted to external servers, ensuring privacy when working
                        with sensitive sequencing or annotation datasets.
                    </p>
                </>
            }

            howTo={
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Paste genome annotation data in BED, GFF, or GTF format.</li>
                    <li>Select a chromosome or genomic region to visualize.</li>
                    <li>Click <strong>Visualize Genome</strong> to load the features.</li>
                    <li>Optionally upload BAM or SAM files to view sequencing alignments.</li>
                    <li>Enable or disable tracks such as genes, exons, SNPs, or reads.</li>
                    <li>Use the search box to navigate directly to specific genes.</li>
                </ol>
            }

            faq={[
                {
                    question: "What is a genome browser?",
                    answer:
                        "A genome browser is a visualization tool used to explore genomic features such as genes, exons, regulatory elements, and sequencing alignments along chromosomes."
                },
                {
                    question: "Which annotation formats are supported?",
                    answer:
                        "This genome viewer supports common genome annotation formats including BED, GFF, and GTF files."
                },
                {
                    question: "Can I visualize sequencing reads?",
                    answer:
                        "Yes. The browser allows uploading SAM or BAM alignment files to display sequencing reads along genomic coordinates."
                },
                {
                    question: "Can I search for specific genes?",
                    answer:
                        "Yes. If gene names are available in the annotation attributes, you can search for them and jump directly to the corresponding genomic region."
                },
                {
                    question: "Is my genomic data uploaded anywhere?",
                    answer:
                        "No. All genome visualization and processing occurs locally in your browser to ensure complete privacy of your sequencing and annotation data."
                }
            ]}
        >

            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">

                {/* OPTIONS */}

                <div className="p-6 border-b bg-gray-50 flex gap-6">

                    <div>

                        <label className="text-sm font-semibold text-gray-700">

                            Chromosome

                        </label>

                        <select
                            value={chromosome}
                            onChange={(e) => setChromosome(e.target.value)}
                            className="px-3 py-2 border rounded text-sm"
                        >

                            {chromosomes.map(c => (
                                <option key={c}>{c}</option>
                            ))}

                        </select>

                    </div>

                </div>

                <div className="p-6 border-b bg-gray-50 flex gap-4 items-end">

                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Genome Region
                        </label>

                        <input
                            value={regionInput}
                            onChange={(e) => setRegionInput(e.target.value)}
                            className="px-3 py-2 border rounded text-sm w-64"
                        />

                    </div>

                    <button
                        aria-label="Genome Region Go 1"
                        onClick={() => {
                            const r = parseRegion(regionInput)
                            if (!r) return
                            setChromosome(r.chr)
                            setRegionStart(r.start)
                            setRegionEnd(r.end)
                        }}
                        className="px-4 py-2 border rounded"
                    >
                        Go
                    </button>

                </div>


                <div className="px-6 pb-4 bg-gray-50 flex flex-wrap gap-6 text-sm">

                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={tracks.genes}
                            onChange={() => setTracks(t => ({ ...t, genes: !t.genes }))}
                        />
                        Genes
                    </label>

                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={tracks.exons}
                            onChange={() => setTracks(t => ({ ...t, exons: !t.exons }))}
                        />
                        Exons
                    </label>

                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={tracks.snps}
                            onChange={() => setTracks(t => ({ ...t, snps: !t.snps }))}
                        />
                        SNPs
                    </label>

                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={tracks.reads}
                            onChange={() => setTracks(t => ({ ...t, reads: !t.reads }))}
                        />
                        Reads
                    </label>

                    <label className="flex gap-2 items-center">
                        <input
                            type="checkbox"
                            checked={tracks.reference}
                            onChange={() => setTracks(t => ({ ...t, reference: !t.reference }))}
                        />
                        Reference
                    </label>

                </div>


                {/* INPUT */}

                <SequenceInput
                    value={input}
                    onChange={setInput}
                    label="Genome Annotation"
                    onLoadExample={loadExample}
                    fileLabel="Drag & drop BED / GFF / GTF"
                    accept=".bed,.gff,.gtf,.txt"
                    placeholder="Paste BED/GFF/GTF annotations..."
                />


                <div className="p-6 border-t">

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reference FASTA (optional)
                    </label>

                    <textarea
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Paste reference FASTA sequence"
                        className="w-full h-32 p-4 font-mono text-sm border rounded"
                    />

                </div>

                <div className="p-6 border-t">

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Upload BAM / SAM
                    </label>

                    <input
                        type="file"
                        accept=".bam,.sam"
                        onChange={async (e) => {

                            const file = e.target.files?.[0]

                            if (!file) return

                            const samLines = await readBam(file)

                            const reads = parseSamReads(samLines)

                            setAlignments(reads)

                        }}
                    />

                </div>

                {/* BUTTONS */}

                <div className="p-6 border-t bg-gray-50 flex gap-4">

                    <button
                        aria-label="Visualize Genome 1"
                        onClick={visualize}
                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
                    >
                        Visualize Genome
                    </button>

                    <button
                        aria-label="Clear Visualize Genome 1"
                        onClick={clearAll}
                        className="px-6 py-4 bg-gray-200 rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Clear
                    </button>

                </div>

                {/* RESULTS */}

                {features.length > 0 && (

                    <div className="p-6 border-t bg-gray-50">

                        <h2 className="text-xl font-semibold mb-4">
                            Genome Visualization
                        </h2>

                        <div className="p-6 border-t bg-gray-50 flex gap-4">

                            <input
                                value={geneQuery}
                                onChange={(e) => setGeneQuery(e.target.value)}
                                placeholder="Search gene name"
                                className="px-3 py-2 border rounded text-sm w-64"
                            />

                            <button
                                aria-label="Search Genome 1"
                                onClick={() => {

                                    const gene = features.find(f => {

                                        const name =
                                            f.attributes?.Name ||
                                            f.attributes?.gene ||
                                            f.attributes?.ID

                                        return name?.toLowerCase() === geneQuery.toLowerCase()

                                    })

                                    if (!gene) return

                                    setChromosome(gene.seqid)
                                    setRegionStart(gene.start - 500)
                                    setRegionEnd(gene.end + 500)

                                }}
                                className="px-4 py-2 border rounded"
                            >
                                Search
                            </button>

                        </div>

                        <GenomeWebGLViewer
                            features={features}
                            chromosome={chromosome}
                            regionStart={regionStart}
                            regionEnd={regionEnd}
                            alignments={alignments}
                        />


                    </div>


                )}

            </div>

        </ToolLayout>

    )

}