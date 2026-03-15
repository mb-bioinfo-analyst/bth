import { Link } from "react-router-dom"
import { useRef, useMemo, useState } from "react"
import { RefreshCw, AlertCircle, ChevronRight } from "lucide-react"


import ToolLayout from "../../components/ToolLayout"
import SequenceInput from "../../components/SequenceInput"
import SequenceListOutput from "../../components/SequenceListOutput"
import GelSimulator from "../../components/GelSimulator"
import CircularPlasmidViewer from "../../components/CircularPlasmidViewer"

import { restrictionEnzymes } from "../../data/restrictionEnzymes"

import {
    buildDigestPatterns,
    buildMultiDigestPattern,
    cleanDnaSequence,
    compareDigestPatterns,
    findRestrictionSites,
    type RestrictionHit
} from "../../utils/restrictionUtils"



interface ParsedSeq {
    header: string
    sequence: string
}

function parseMultiFasta(input: string): ParsedSeq[] {
    const trimmed = input.trim()
    if (!trimmed) return []

    if (!trimmed.startsWith(">")) {
        return [{ header: "sequence_1", sequence: cleanDnaSequence(trimmed) }]
    }

    return trimmed
        .split(/^>/m)
        .filter(Boolean)
        .map((entry, idx) => {
            const lines = entry.split("\n")
            return {
                header: lines[0]?.trim() || `sequence_${idx + 1}`,
                sequence: cleanDnaSequence(lines.slice(1).join(""))
            }
        })
        .filter((r) => r.sequence)
}

export default function RestrictionSiteFinder() {

    const mapRef = useRef<SVGSVGElement | null>(null)

    const [analysisComplete, setAnalysisComplete] = useState(false)
    const [sequence, setSequence] = useState("")
    const [hits, setHits] = useState<RestrictionHit[]>([])
    const [error, setError] = useState("")

    const [enzymeMode, setEnzymeMode] = useState<"common" | "all">("common")
    const [onlyUniqueCutters, setOnlyUniqueCutters] = useState(false)
    const [circular, setCircular] = useState(false)
    const [nameFilter, setNameFilter] = useState("")
    const [minSiteLength, setMinSiteLength] = useState(4)
    const [selectedSequenceIndex, setSelectedSequenceIndex] = useState(0)

    const records = useMemo(() => parseMultiFasta(sequence), [sequence])

    const filteredEnzymes = useMemo(() => {
        return restrictionEnzymes.filter((e) => {
            if (enzymeMode === "common" && e.category !== "common") return false
            if (e.site.length < minSiteLength) return false

            const q = nameFilter.trim().toLowerCase()
            if (!q) return true

            return (
                e.name.toLowerCase().includes(q) ||
                e.site.toLowerCase().includes(q)
            )
        })
    }, [enzymeMode, minSiteLength, nameFilter])

    const activeRecord = records[selectedSequenceIndex] || null
    const sequenceLength = activeRecord?.sequence.length || 0

    const hitCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        for (const h of hits) counts[h.enzyme] = (counts[h.enzyme] || 0) + 1
        return counts
    }, [hits])

    const displayedHits = useMemo(() => {
        if (!onlyUniqueCutters) return hits
        return hits.filter((h) => hitCounts[h.enzyme] === 1)
    }, [hits, onlyUniqueCutters, hitCounts])

    const digestPatterns = useMemo(() => {
        return buildDigestPatterns(sequenceLength, displayedHits, circular)
    }, [sequenceLength, displayedHits, circular])


    const [selectedGelEnzymes, setSelectedGelEnzymes] = useState<string[]>([])

    const toggleGelLane = (enzyme: string) => {
        setSelectedGelEnzymes((prev) =>
            prev.includes(enzyme)
                ? prev.filter((e) => e !== enzyme)
                : [...prev, enzyme]
        )
    }

    const gelLanes = useMemo(() => {
        return digestPatterns.map((p) => ({
            enzyme: p.enzyme,
            fragments: p.fragments
        }))
    }, [digestPatterns])


    const multiSequenceComparison = useMemo(() => {
        if (!analysisComplete || records.length < 2) return []
        // if (!analysisComplete) return []
        // if (records.length < 2) return []

        const allPatterns = records.map((r) => {
            const seqHits = findRestrictionSites(r.sequence, filteredEnzymes, circular)
            return buildDigestPatterns(r.sequence.length, seqHits, circular)
        })

        return compareDigestPatterns(allPatterns).slice(0, 20)

    }, [analysisComplete, records, filteredEnzymes, circular])

    const findSites = () => {
        setError("")
        setHits([])

        if (!sequence.trim()) {
            setError("Please enter DNA sequence data")
            return
        }

        if (records.length === 0) {
            setError("No valid DNA sequence detected")
            return
        }

        const current = records[selectedSequenceIndex]

        if (!/^[ACGTRYSWKMBDHVN]+$/.test(current.sequence)) {
            setError("Sequence contains invalid DNA characters")
            return
        }

        const found = findRestrictionSites(current.sequence, filteredEnzymes, circular)

        setHits(found)

        setSelectedGelEnzymes(
            buildDigestPatterns(current.sequence.length, found, circular)
                .map(p => p.enzyme)
                .slice(0, 8)
        )

        setAnalysisComplete(true)
    }

    const handleCopy = async () => {
        const text = displayedHits
            .map(
                (h) =>
                    `${h.enzyme}\t${h.site}\tstart:${h.position}\tcut:${h.cutPosition}\tmatch:${h.fragment}`
            )
            .join("\n")

        await navigator.clipboard.writeText(text)
    }

    const handleDownload = () => {
        const header = "enzyme\trecognition_site\tstart_position\tcut_position\tmatched_sequence\n"
        const text =
            header +
            displayedHits
                .map(
                    (h) =>
                        `${h.enzyme}\t${h.site}\t${h.position}\t${h.cutPosition}\t${h.fragment}`
                )
                .join("\n")

        const blob = new Blob([text], { type: "text/plain" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "restriction_sites.tsv"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        URL.revokeObjectURL(url)
    }

    const downloadLinearSVG = () => {

        if (!mapRef.current) return

        const serializer = new XMLSerializer()
        const source = serializer.serializeToString(mapRef.current)

        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "restriction_map_linear.svg"
        a.click()

        URL.revokeObjectURL(url)

    }

    const downloadLinearPNG = () => {

        if (!mapRef.current) return

        const svg = mapRef.current
        const serializer = new XMLSerializer()
        const source = serializer.serializeToString(svg)

        const img = new Image()
        const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {

            const canvas = document.createElement("canvas")
            canvas.width = 2000
            canvas.height = 400

            const ctx = canvas.getContext("2d")
            ctx?.drawImage(img, 0, 0)

            const png = canvas.toDataURL("image/png")

            const a = document.createElement("a")
            a.href = png
            a.download = "restriction_map_linear.png"
            a.click()

            URL.revokeObjectURL(url)

        }

        img.src = url
    }








    const loadExample = () => {
        setSequence(`>vector_A
ATGGAATTCGGATCCATGAAGCTTATGGCGGCCGCATGGGTACCGCTAGCACTAGTCTCGAGCTGCAGCCCGGGCCATGGTTAACGCGGCCGCTTAATTAA
>vector_B
ATGGAATTCGGATCCATGAAGCTTATGGCGGCCGCATGGGTACCGCTAGCACTAGTCTCGAGCTGCAGCCCGGGCCATGGCGCGCGCTTAATTAA`)
        setSelectedSequenceIndex(0)
    }

    const [selectedDigestEnzymes, setSelectedDigestEnzymes] = useState<string[]>([])

    const toggleDigestEnzyme = (enzyme: string) => {
        setSelectedDigestEnzymes((prev) =>
            prev.includes(enzyme)
                ? prev.filter((e) => e !== enzyme)
                : [...prev, enzyme]
        )
    }


    const multiDigestPattern = useMemo(() => {
        if (!activeRecord || selectedDigestEnzymes.length === 0) return null

        return buildMultiDigestPattern(
            activeRecord.sequence.length,
            displayedHits,
            selectedDigestEnzymes,
            circular
        )
    }, [activeRecord, displayedHits, selectedDigestEnzymes, circular])


    const enzymeLookup = useMemo(() => {
        return Object.fromEntries(restrictionEnzymes.map((e) => [e.name, e]))
    }, [])

    const annotations = [
        { label: "MCS", start: 50, end: 150, color: "#10b981" },
        { label: "AmpR", start: 800, end: 1800, color: "#f59e0b" },
        { label: "ori", start: 2200, end: 2600, color: "#6366f1" }
    ]


    // const clearAll = () => {
    //     setSequence("")
    //     setHits([])
    //     setError("")
    //     setEnzymeMode("common")
    //     setOnlyUniqueCutters(false)
    //     setCircular(false)
    //     setNameFilter("")
    //     setMinSiteLength(4)
    //     setSelectedSequenceIndex(0)
    // }

    const clearAll = () => {
        setSequence("")
        setHits([])
        setError("")
        setAnalysisComplete(false)
    }

    const effectiveSelectedGelEnzymes =
        selectedGelEnzymes.length > 0
            ? selectedGelEnzymes
            : gelLanes.map((l) => l.enzyme).slice(0, 8)

    return (
  
      <ToolLayout
  title="Restriction Enzyme Finder & Restriction Map Generator"
  description="Detect restriction sites, cut positions, fragment patterns, and compare digest fingerprints across linear or circular DNA."
  badge="Sequence Analysis"
  slug="restriction-finder"
  category="Sequence Analysis"

  seoContent={
  <>
    <h2>Restriction Enzyme Finder and Restriction Map Generator</h2>

    <p>
      Restriction enzymes are essential molecular biology tools that
      recognize specific DNA sequences and cleave DNA at defined
      positions. Identifying restriction sites within a DNA sequence is
      an important step in cloning experiments, plasmid construction,
      genome analysis, and diagnostic assays. A restriction site finder
      scans DNA sequences to locate enzyme recognition motifs and
      determines where those enzymes cut the DNA molecule.
    </p>

    <p>
      This restriction enzyme finder analyzes nucleotide sequences and
      detects recognition sites from a curated restriction enzyme
      database. The tool reports enzyme names, recognition sequences,
      cut positions, and predicted digestion fragments. Both linear
      DNA sequences and circular DNA molecules such as plasmids are
      supported, making the tool useful for plasmid design, cloning
      workflows, and genome exploration.
    </p>

    <p>
      In addition to identifying restriction sites, the tool can generate
      graphical restriction maps, simulate digestion fragment patterns,
      and compare digest fingerprints across multiple sequences. These
      features help researchers identify diagnostic enzymes that
      differentiate closely related DNA sequences. You can also prepare
      sequences using utilities such as the{" "}
      <Link to="/tools/fasta-formatter">FASTA Formatter</Link>{" "}
      or analyze nucleotide composition using the{" "}
      <Link to="/tools/nucleotide-composition-calculator">
        Nucleotide Composition Calculator
      </Link>.
    </p>

    <p>
      All restriction site detection and digestion simulations run
      directly in your browser. DNA sequences remain on your local
      machine and are never uploaded to external servers, ensuring
      complete privacy when working with experimental data.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Paste a DNA sequence or multi-FASTA dataset into the input panel.</li>
    <li>Select the restriction enzyme set (common or extended).</li>
    <li>Optionally filter enzymes by name or recognition sequence.</li>
    <li>Choose whether the DNA molecule is linear or circular.</li>
    <li>Click <strong>Find Restriction Sites</strong> to detect enzyme cut sites.</li>
    <li>Explore the restriction map, digestion fragments, and gel simulation.</li>
    <li>Copy or download the restriction site results if needed.</li>
  </ol>
}

faq={[
  {
    question: "What is a restriction enzyme?",
    answer:
      "Restriction enzymes are proteins that recognize specific DNA sequences and cut DNA at or near those recognition sites. They are widely used in molecular cloning and DNA analysis."
  },
  {
    question: "What is a restriction map?",
    answer:
      "A restriction map shows the positions of restriction enzyme cut sites along a DNA sequence and is often used to visualize plasmids or genomic fragments."
  },
  {
    question: "What is a unique cutter enzyme?",
    answer:
      "A unique cutter is a restriction enzyme that cuts a DNA sequence at only one location, which is particularly useful for cloning experiments."
  },
  {
    question: "Can this tool analyze circular DNA such as plasmids?",
    answer:
      "Yes. The tool supports both linear DNA sequences and circular DNA molecules such as plasmids or viral genomes."
  },
  {
    question: "Is my DNA sequence uploaded anywhere?",
    answer:
      "No. All restriction site detection and analysis are performed locally in your browser to ensure complete data privacy."
  }
]}
>
  

    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-wrap items-end gap-6">

  {/* Sequence */}

  <div className="w-[220px]">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Sequence
    </label>

    <select
      value={selectedSequenceIndex}
      onChange={(e) => setSelectedSequenceIndex(Number(e.target.value))}
      className="w-full px-3 py-2 border rounded-lg text-sm"
    >
      {records.length === 0 ? (
        <option value={0}>sequence_1</option>
      ) : (
        records.map((r, i) => (
          <option key={`${r.header}-${i}`} value={i}>
            {r.header}
          </option>
        ))
      )}
    </select>
  </div>


  {/* Enzyme Set */}

  <div className="w-[160px]">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Enzyme Set
    </label>

    <select
      value={enzymeMode}
      onChange={(e) =>
        setEnzymeMode(e.target.value as "common" | "all")
      }
      className="w-full px-3 py-2 border rounded-lg text-sm"
    >
      <option value="common">Common</option>
      <option value="all">Extended</option>
    </select>
  </div>


  {/* Min Site Length */}

  <div className="w-[140px]">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Min Site Length
    </label>

    <input
      type="number"
      min={4}
      max={20}
      value={minSiteLength}
      onChange={(e) => setMinSiteLength(Number(e.target.value))}
      className="w-full px-3 py-2 border rounded-lg text-sm"
    />
  </div>


  {/* Enzyme Filter */}

  <div className="w-[220px]">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Enzyme Filter
    </label>

    <input
      type="text"
      value={nameFilter}
      onChange={(e) => setNameFilter(e.target.value)}
      placeholder="EcoRI / GAATTC"
      className="w-full px-3 py-2 border rounded-lg text-sm"
    />
  </div>


  {/* Checkboxes */}

  <div className="flex items-center gap-6 pb-[6px]">

    <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
      <input
        type="checkbox"
        checked={onlyUniqueCutters}
        onChange={() => setOnlyUniqueCutters(!onlyUniqueCutters)}
      />
      Unique cutters
    </label>

    <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
      <input
        type="checkbox"
        checked={circular}
        onChange={() => setCircular(!circular)}
      />
      Circular DNA
    </label>

  </div>

</div>

      <div className="grid md:grid-cols-2 divide-x divide-gray-200">
        <SequenceInput
          value={sequence}
          onChange={setSequence}
          label="DNA Sequence / Multi-FASTA"
          onLoadExample={loadExample}
        />

        <SequenceListOutput
          title="Restriction Sites"
          items={displayedHits.map((h) => {
            const enzyme = enzymeLookup[h.enzyme]

            const typeLabel =
              enzyme?.type === "IIS"
                ? ` | Type IIS cut +${enzyme.cutOffsetTop}/+${enzyme.cutOffsetBottom}`
                : ""

            const overhangLabel = enzyme?.overhang
              ? ` | ${enzyme.overhang} overhang`
              : ""

            return {
              header: h.enzyme,
              meta: `${h.site} | Start ${h.position} | Cut ${h.cutPosition}${typeLabel}${overhangLabel}`,
              sequence: h.fragment
            }
          })}
          placeholder="Restriction sites will appear here..."
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
        <button
        aria-label="Find Restriction Sites 1"
          onClick={findSites}
          className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
        >
          Find Restriction Sites
        </button>

        <button
        aria-label="Clear Find Restriction Sites 1"
          onClick={clearAll}
          className="px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Clear
        </button>
      </div>

      {analysisComplete && (
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold text-slate-800">
            Analysis Results
          </h2>
        </div>
      )}

      {analysisComplete && sequenceLength > 0 && displayedHits.length > 0 && (
        <>
          <div className="p-6 border-t border-gray-200 bg-gray-50 grid md:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Length</div>
              <div className="text-2xl font-bold text-blue-600">
                {sequenceLength}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Sites</div>
              <div className="text-2xl font-bold text-blue-600">
                {displayedHits.length}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Active Enzymes</div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(hitCounts).length}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Topology</div>
              <div className="text-2xl font-bold text-blue-600">
                {circular ? "Circular" : "Linear"}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Restriction Map</h3>

              {circular ? (
                <CircularPlasmidViewer
                  length={sequenceLength}
                  sites={displayedHits.map((s) => ({
                    enzyme: s.enzyme,
                    position: s.position
                  }))}
                  annotations={annotations}
                />
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="flex justify-end gap-2 mb-4">
                    <button
                    aria-label="Download SVG Find Restriction Sites 1"
                      onClick={downloadLinearSVG}
                      className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                    >
                      Download SVG
                    </button>

                    <button
                    aria-label="Download PNG Find Restriction Sites 1"
                      onClick={downloadLinearPNG}
                      className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                    >
                      Download PNG
                    </button>
                  </div>

                  <svg
                    ref={mapRef}
                    width="100%"
                    height="200"
                    viewBox="0 0 1000 200"
                  >
                    <line
                      x1="20"
                      y1="100"
                      x2="980"
                      y2="100"
                      stroke="#94a3b8"
                      strokeWidth="4"
                    />

                    {displayedHits.map((site, index) => {
                      const enzyme = enzymeLookup[site.enzyme]
                      const x = 20 + (site.position / sequenceLength) * 960
                      const cutX = 20 + (site.cutPosition / sequenceLength) * 960

                      return (
                        <g key={`${site.enzyme}-${site.position}-${index}`}>
                          <line
                            x1={x}
                            y1="80"
                            x2={x}
                            y2="120"
                            stroke="#ef4444"
                            strokeWidth="2"
                          />

                          <text
                            x={x}
                            y="140"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#334155"
                          >
                            {site.enzyme}
                          </text>

                          {enzyme?.type === "IIS" && (
                            <line
                              x1={cutX}
                              y1="90"
                              x2={cutX}
                              y2="110"
                              stroke="#3b82f6"
                              strokeWidth="2"
                            />
                          )}
                        </g>
                      )
                    })}

                    <text x="20" y="170" fontSize="12" fill="#475569">
                      1 bp
                    </text>

                    <text
                      x="960"
                      y="170"
                      textAnchor="end"
                      fontSize="12"
                      fill="#475569"
                    >
                      {sequenceLength} bp
                    </text>
                  </svg>
                </div>
              )}
            </div>

            {digestPatterns.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold mb-4">Digest Patterns</h3>

                <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
                  <div className="grid grid-cols-3 border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
                    <div>Enzyme</div>
                    <div>Cut Positions</div>
                    <div>Fragments</div>
                  </div>

                  {digestPatterns.map((p) => (
                    <div
                      key={p.enzyme}
                      className="grid grid-cols-3 px-4 py-2 text-sm border-b last:border-b-0"
                    >
                      <div>{p.enzyme}</div>
                      <div>{p.cuts.join(", ")}</div>
                      <div>{p.fragments.join(", ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {displayedHits.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold mb-4">Multi-Enzyme Digest</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(hitCounts).map((enzyme) => {
                    const active = selectedDigestEnzymes.includes(enzyme)

                    return (
                      <button
                        key={enzyme}
                        type="button"
                        aria-label={`Toggle restriction enzyme ${enzyme}`}
                        aria-pressed={active}
                        onClick={() => toggleDigestEnzyme(enzyme)}
                        className={`rounded-lg px-3 py-1.5 text-sm transition ${active
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                          }`}
                      >
                        {enzyme}
                      </button>
                    )
                  })}
                </div>

                {multiDigestPattern && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
                    <p>
                      <strong>Digest:</strong> {multiDigestPattern.enzyme}
                    </p>
                    <p>
                      <strong>Cut positions:</strong>{" "}
                      {multiDigestPattern.cuts.join(", ") || "None"}
                    </p>
                    <p>
                      <strong>Fragments:</strong>{" "}
                      {multiDigestPattern.fragments.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {digestPatterns.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold mb-4">
                  Gel Electrophoresis Simulation
                </h3>

                <GelSimulator
                  lanes={gelLanes}
                  selectedEnzymes={effectiveSelectedGelEnzymes}
                  onToggleLane={toggleGelLane}
                />
              </div>
            )}

            {multiSequenceComparison.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 border border-gray-200 hover:bg-gray-50">
                    Advanced Analysis

                    <ChevronRight className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-90" />
                  </summary>

                  <p className="text-xs text-slate-500 mt-3 mb-4">
                    Identify enzymes that best distinguish multiple sequences by
                    fragment pattern.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">
                        Differential Digest Ranking
                      </h3>

                      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
                        <div className="grid grid-cols-3 border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
                          <div>Enzyme</div>
                          <div>Distinct Patterns</div>
                          <div>Fingerprints</div>
                        </div>

                        {multiSequenceComparison.map((row) => (
                          <div
                            key={row.enzyme}
                            className="grid grid-cols-3 px-4 py-2 text-sm border-b last:border-b-0"
                          >
                            <div>{row.enzyme}</div>
                            <div>{row.distinctPatterns}</div>
                            <div
                              className="truncate"
                              title={row.fingerprints.join(" | ")}
                            >
                              {row.fingerprints.join(" | ")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">
                        Recommended Diagnostic Enzymes
                      </h3>

                      <div className="grid gap-3 md:grid-cols-2">
                        {multiSequenceComparison.slice(0, 8).map((row) => (
                          <div
                            key={row.enzyme}
                            className="rounded-lg border border-gray-200 bg-white p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-slate-900">
                                {row.enzyme}
                              </div>

                              <div className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700">
                                {row.distinctPatterns} patterns
                              </div>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                              Distinguishes candidate sequences by fragment
                              pattern
                            </p>

                            <div className="mt-2 text-xs text-slate-700">
                              {row.fingerprints.join(" | ")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  </ToolLayout>
)}