import { useState } from "react"
import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceOutput from "../../components/SequenceOutput"
import { RefreshCw, AlertCircle } from "lucide-react"

type SeqEntry = {
    header: string | null
    seq: string
}

type SeqStats = {
    header: string | null
    length: number
    gc: number
    type: string
}

export default function SequenceToolkit() {

    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [error, setError] = useState("")

    const [stats, setStats] = useState<SeqStats[]>([])

    const [options, setOptions] = useState({
        removeGaps: true,
        removeSpaces: true,
        dnaToRna: false,
        rnaToDna: false,
        complement: false,
        reverse: false,
        reverseComplement: false,
        uppercase: true,
        lowercase: false,
        strictValidation: false
    })

    const [outputFormat, setOutputFormat] = useState<"fasta" | "raw">("fasta")

    const complementMap: Record<string, string> = {
        A: "T", T: "A", C: "G", G: "C",
        R: "Y", Y: "R", S: "S", W: "W",
        K: "M", M: "K", B: "V", D: "H",
        H: "D", V: "B", N: "N"
    }

    const loadExample = () => {
        setInput(`>seq1
ATG-CGTAAGCTTAGC
>seq2
AUGGCCAUUGUAAUGGGC---CGCUGAAAGGGUGCCCGAUAG`)
        setOutput("")
        setStats([])
        setError("")
    }

    // ---------------------------
    // FASTA PARSER
    // ---------------------------
    function parseInput(input: string): SeqEntry[] {
        if (input.includes(">")) {
            return input
                .split(/^>/gm)
                .filter(Boolean)
                .map(entry => {
                    const lines = entry.split("\n")
                    return {
                        header: lines[0].trim(),
                        seq: lines.slice(1).join("")
                    }
                })
        }
        return [{ header: null, seq: input }]
    }

    // ---------------------------
    // CLEAN
    // ---------------------------
    function clean(seq: string) {
        let s = seq.toUpperCase()

        if (options.removeSpaces) s = s.replace(/\s/g, "")
        if (options.removeGaps) s = s.replace(/[-.]/g, "")

        return s
    }

    // ---------------------------
    // DETECT TYPE
    // ---------------------------
    function detectType(seq: string) {
        if (/U/.test(seq)) return "RNA"
        if (/^[ACGTN]+$/.test(seq)) return "DNA"
        return "Protein/Unknown"
    }

    // ---------------------------
    // STATS
    // ---------------------------
    function computeStats(seq: string) {
        const length = seq.length

        const counts: Record<string, number> = {
            A: 0, T: 0, G: 0, C: 0, U: 0, N: 0
        }

        for (const c of seq) {
            if (counts[c] !== undefined) counts[c]++
        }

        const gc = length
            ? ((counts.G + counts.C) / length * 100)
            : 0

        return { length, gc }
    }

    // ---------------------------
    // PIPELINE
    // ---------------------------
    function processSequence(seq: string) {

        let s = clean(seq)

        if (options.strictValidation && !/^[ACGTURYSWKMBDHVN]+$/.test(s)) {
            throw new Error("Invalid characters detected in sequence")
        }

        if (options.reverseComplement) {
            return s.split("").reverse().map(c => complementMap[c] || c).join("")
        }

        if (options.dnaToRna) s = s.replace(/T/g, "U")
        if (options.rnaToDna) s = s.replace(/U/g, "T")

        if (options.complement) {
            s = s.split("").map(c => complementMap[c] || c).join("")
        }

        if (options.reverse) {
            s = s.split("").reverse().join("")
        }

        if (options.uppercase) s = s.toUpperCase()
        if (options.lowercase) s = s.toLowerCase()

        return s
    }

    // ---------------------------
    // MAIN RUN
    // ---------------------------
    const runToolkit = () => {

        setError("")
        setOutput("")
        setStats([])

        if (!input.trim()) {
            setError("Please enter a sequence")
            return
        }

        try {

            const entries = parseInput(input)

            const results: string[] = []
            const statsArr: SeqStats[] = []

            for (const { header, seq } of entries) {

                const processed = processSequence(seq)
                if (!processed) continue

                const { length, gc } = computeStats(processed)

                statsArr.push({
                    header,
                    length,
                    gc: Number(gc.toFixed(2)),
                    type: detectType(processed)
                })

                const wrapped =
                    processed.match(/.{1,80}/g)?.join("\n") || processed

                if (outputFormat === "fasta" && header) {
                    results.push(`>${header}\n${wrapped}`)
                } else {
                    results.push(processed)
                }
            }

            setOutput(results.join("\n"))
            setStats(statsArr)

        } catch (err: any) {
            setError(err.message || "Processing error")
        }
    }

    const clearAll = () => {
        setInput("")
        setOutput("")
        setStats([])
        setError("")
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(output)
    }

    const handleDownload = () => {
        const blob = new Blob([output], { type: "text/plain" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "sequence_toolkit_output.txt"
        a.click()

        URL.revokeObjectURL(url)
    }

    return (

        <ToolLayout
            badge="Sequence Toolkit"
            slug="sequence-toolkit"
            category="Sequence"

            seoContent={
                <>
                    <h2>Sequence Toolkit: Reverse, Complement, DNA ↔ RNA & Cleaning</h2>

                    <p>
                        The Sequence Toolkit is an all-in-one bioinformatics utility designed to
                        perform common sequence transformations and analysis tasks in a single
                        interface. Researchers often need to reverse sequences, compute reverse
                        complements, convert DNA to RNA, clean alignment artifacts, or calculate
                        sequence statistics such as GC content and length. This tool combines all
                        these operations into a unified workflow.
                    </p>

                    <p>
                        Unlike traditional single-purpose tools, this toolkit allows composable
                        transformations where multiple operations can be applied sequentially.
                        For example, users can remove gaps, convert DNA to RNA, compute the
                        complement, and reverse the sequence in a single step. This significantly
                        improves efficiency in bioinformatics pipelines and exploratory analysis.
                    </p>

                    <p>
                        The tool supports both plain sequences and FASTA-formatted input,
                        including multi-sequence datasets. All processing is performed locally in
                        the browser, ensuring complete privacy of biological data without any
                        server-side transmission.
                    </p>

                    <p>
                        This toolkit is useful for sequence preprocessing, primer design,
                        transcript analysis, alignment cleanup, and general nucleotide sequence
                        manipulation workflows. It is suitable for DNA, RNA, and partially for
                        protein sequences depending on selected operations.
                    </p>
                </>
            }

            howTo={
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Paste a DNA, RNA, or FASTA sequence into the input panel.</li>
                    <li>Select the operations you want to apply (e.g., reverse, complement, convert).</li>
                    <li>Click <strong>Run Sequence Toolkit</strong> to process the sequence.</li>
                    <li>The transformed sequence will appear in the output panel.</li>
                    <li>Review sequence statistics such as length and GC content below.</li>
                    <li>Copy or download the processed sequence for further analysis.</li>
                </ol>
            }

            faq={[
                {
                    question: "What does this sequence toolkit do?",
                    answer:
                        "This toolkit performs multiple sequence operations including reverse, complement, DNA to RNA conversion, sequence cleaning, and statistical analysis in a single interface."
                },
                {
                    question: "Can I process FASTA files with multiple sequences?",
                    answer:
                        "Yes. The tool supports multi-FASTA input and processes each sequence individually while preserving headers."
                },
                {
                    question: "What is the difference between complement and reverse complement?",
                    answer:
                        "Complement replaces each nucleotide with its pair (A↔T, C↔G), while reverse complement also reverses the sequence direction after complementing."
                },
                {
                    question: "Does this tool support RNA sequences?",
                    answer:
                        "Yes. RNA sequences can be converted to DNA or processed through other transformations such as reverse or cleaning."
                },
                {
                    question: "Is my sequence data uploaded anywhere?",
                    answer:
                        "No. All processing happens locally in your browser, ensuring complete privacy and data security."
                },
                {
                    question: "What statistics are calculated?",
                    answer:
                        "The toolkit calculates sequence length, GC content percentage, and nucleotide counts (A, T, G, C)."
                }
            ]}
        >

            {/* OPTIONS */}

            <div className="p-6 bg-gray-50 border-b grid md:grid-cols-4 gap-4">

                {Object.entries(options).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={() =>
                                setOptions(prev => ({
                                    ...prev,
                                    [key]: !prev[key]
                                }))
                            }
                        />
                        {key.replace(/([A-Z])/g, " $1")}
                    </label>
                ))}

            </div>

            {/* INPUT OUTPUT */}

            <div className="grid md:grid-cols-2">

                <SequenceInput
                    value={input}
                    onChange={setInput}
                    label="Input Sequence (FASTA supported)"
                    onLoadExample={loadExample}
                />

                <SequenceOutput
                    value={output}
                    title="Processed Sequence"
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                />

            </div>



            {/* BUTTONS */}

            <div className="p-6 flex gap-4">

                <button
                    onClick={runToolkit}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
                >
                    Run Sequence Toolkit
                </button>

                <button
                    onClick={clearAll}
                    className="px-6 py-4 bg-gray-200 rounded-lg flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Clear
                </button>

            </div>

            {/* STATS TABLE */}

            {stats.length > 0 && (

                <div className="p-6 border-t bg-gray-50">

                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Sequence Statistics
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {stats.map((s, i) => (

                            <div
                                key={i}
                                className="rounded-xl border bg-white shadow-sm p-4 hover:shadow-md transition"
                            >

                                {/* Header */}
                                <div className="flex justify-between items-center mb-3">
                                    <p className="font-semibold text-gray-800 truncate">
                                        {s.header || `Sequence ${i + 1}`}
                                    </p>

                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                                        {s.type}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 text-sm">

                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <p className="text-gray-500 text-xs">Length</p>
                                        <p className="font-bold text-blue-600">{s.length}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <p className="text-gray-500 text-xs">GC %</p>
                                        <p className="font-bold text-green-600">{s.gc}</p>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}


            {/* ERROR */}

            {error && (

                <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">

                    <AlertCircle className="w-5 h-5 text-red-600" />

                    <p className="text-red-700 text-sm">{error}</p>

                </div>

            )}

        </ToolLayout>
    )
}