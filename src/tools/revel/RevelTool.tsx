import { useMemo, useState } from "react"
import ToolLayout from "../../components/ToolLayout"

import { parseVariant } from "./utils/parser"
import { exportCSV } from "./utils/export"
import { interpretRevel, DEFAULT_THRESHOLDS, sanitizeThresholds } from "./utils/interpretation"
import { lookupGeneAnnotation, lookupRevelBatch, lookupRevelScore } from "./utils/revelLookup"

import type { RevelResult, Thresholds, Variant } from "./types"

function ScoreDistribution({ results }: { results: RevelResult[] }) {
  const scores = results
    .map(r => r.score)
    .filter((s): s is number => typeof s === "number")

  if (scores.length === 0) return null

  const bins = new Array(10).fill(0)
  for (const score of scores) {
    const idx = Math.min(9, Math.floor(score * 10))
    bins[idx] += 1
  }

  const max = Math.max(...bins, 1)

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-2 text-sm font-semibold">Score distribution</div>
      <div className="flex h-40 items-end gap-2">
        {bins.map((count, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t bg-blue-500"
              style={{ height: `${(count / max) * 100}%` }}
              title={`${i / 10}–${(i + 1) / 10}: ${count}`}
            />
            <div className="text-[10px] text-slate-500">
              {i / 10}-{(i + 1) / 10}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RevelTool() {
  const [input, setInput] = useState("")
  const [results, setResults] = useState<RevelResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [annotateGenes, setAnnotateGenes] = useState(true)
  const [useBatchEndpoint, setUseBatchEndpoint] = useState(true)

  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS)

  const stats = useMemo(() => {
    const total = results.length
    const found = results.filter(r => r.score !== null).length
    const pathogenic = results.filter(r => r.classification.label === "Pathogenic-range").length
    const benign = results.filter(r => r.classification.label === "Likely benign-range").length
    return { total, found, pathogenic, benign }
  }, [results])

  async function handleAnalyze() {
    setLoading(true)
    setError(null)

    try {
      const lines = input
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)

      if (lines.length === 0) {
        setError("Please enter at least one variant.")
        return
      }

      const cleanedThresholds = sanitizeThresholds(thresholds)

      const parsed = lines.map((line) => ({
        input: line,
        variant: parseVariant(line),
      }))

      const invalid: RevelResult[] = parsed
        .filter(x => !x.variant)
        .map(x => ({
          input: x.input,
          variant: null,
          score: null,
          gene: null,
          classification: {
            label: "Invalid input",
            color: "text-red-500",
            evidence: "Could not parse variant format",
          },
          error: "Invalid input",
        }))

      const valid = parsed
        .filter((x): x is { input: string; variant: Variant } => x.variant !== null)

      let successful: RevelResult[] = []

      if (useBatchEndpoint && valid.length > 0) {
        const batch = await lookupRevelBatch(valid, annotateGenes)

        successful = batch.map((item, idx) => {
          const variant = item.variant ?? valid[idx]?.variant ?? null
          const score = typeof item.score === "number" ? item.score : null

          return {
            input: item.input ?? valid[idx]?.input ?? "",
            variant,
            score,
            gene: item.gene ?? null,
            classification: interpretRevel(score, cleanedThresholds),
            error: item.error,
          }
        })
      } else {
        successful = await Promise.all(
          valid.map(async ({ input, variant }): Promise<RevelResult> => {
            const [score, gene] = await Promise.all([
              lookupRevelScore(variant),
              annotateGenes ? lookupGeneAnnotation(variant) : Promise.resolve(null),
            ])

            return {
              input,
              variant,
              score,
              gene,
              classification: interpretRevel(score, cleanedThresholds),
            }
          })
        )
      }

      setResults([...invalid, ...successful])
    } catch (err) {
      console.error(err)
      setError("Analysis failed.")
    } finally {
      setLoading(false)
    }
  }
  const exampleInput = `chr2:132010664 G>C
chrx:200855 A>C
2 213872152 . C T`

  function clearAll() {
    setInput("")
    setResults([])
    setError(null)
  }

  return (
    <ToolLayout
      slug="revel-variant-predictor"
      category="Variant Analysis Tools"
      badge="REVEL Predictor"

      seoContent={
  <>
    <h2>REVEL Score Lookup for Missense Variant Pathogenicity</h2>

    <p>
      The REVEL (Rare Exome Variant Ensemble Learner) score is a widely used
      computational predictor for assessing the pathogenicity of missense
      variants in human genomes. It integrates multiple individual prediction
      tools and conservation metrics into a single ensemble score ranging from
      0 to 1, where higher values indicate a greater likelihood that a variant
      is disease-causing.
    </p>

    <p>
      This REVEL lookup tool allows researchers to quickly retrieve pathogenicity
      scores for genomic variants using chromosome position, reference allele,
      and alternate allele. The tool is based on REVEL v1.3 and uses the hg19
      (GRCh37) genome build, ensuring compatibility with many legacy datasets
      and widely used annotation pipelines.
    </p>

    <p>
      REVEL is specifically designed for missense variants and has been shown
      to outperform many individual prediction tools such as SIFT, PolyPhen-2,
      and MutationAssessor by combining their outputs using machine learning.
      It is commonly used in variant prioritization workflows, rare disease
      studies, and clinical genomics research.
    </p>

    <p>
      Typical interpretation thresholds include:
    </p>

    <ul className="list-disc pl-6 space-y-1">
      <li><strong>&gt; 0.8</strong> – Strong evidence for pathogenicity</li>
      <li><strong>0.5 – 0.8</strong> – Likely pathogenic</li>
      <li><strong>0.4 – 0.5</strong> – Uncertain significance</li>
      <li><strong>&lt; 0.4</strong> – Likely benign</li>
    </ul>

    <p>
      This tool is ideal for integrating into variant filtering pipelines,
      especially when combined with other annotations such as allele frequency,
      conservation scores, and clinical databases.
    </p>

    <p>
      All computations are performed via a lightweight API backed by indexed
      REVEL datasets, enabling fast batch queries directly in the browser.
      No variant data is stored or persisted.
    </p>
  </>
}

howTo={
  <ol className="list-decimal pl-6 space-y-2">
    <li>Enter variants using format: <code>chr1:12345 A&gt;G</code></li>
    <li>You can also paste multiple variants (one per line)</li>
    <li>Click <strong>Analyze</strong> to retrieve REVEL scores</li>
    <li>Review pathogenicity classification and score distribution</li>
    <li>Export results as CSV for downstream analysis</li>
  </ol>
}

faq={[
  {
    question: "What is a REVEL score?",
    answer:
      "REVEL (Rare Exome Variant Ensemble Learner) is an ensemble method that predicts the pathogenicity of missense variants by combining multiple computational tools into a single score between 0 and 1."
  },
  {
    question: "What variants does REVEL support?",
    answer:
      "REVEL is specifically designed for missense variants (single amino acid substitutions). It does not support synonymous variants, indels, or structural variants."
  },
  {
    question: "Which genome build is used?",
    answer:
      "This tool uses REVEL v1.3 based on the hg19 (GRCh37) genome build. Coordinates must match this reference for accurate results."
  },
  {
    question: "How should I interpret REVEL scores?",
    answer:
      "Higher scores indicate higher likelihood of pathogenicity. Scores above 0.8 are typically considered strong evidence for pathogenic variants, while scores below 0.4 suggest benign effects."
  },
  {
    question: "Is REVEL sufficient for clinical diagnosis?",
    answer:
      "No. REVEL is a computational prediction tool and should not be used alone for clinical decisions. It must be interpreted alongside clinical evidence, population frequency, and functional data."
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Variant queries are processed in real-time and not stored. No personal or genomic data is retained."
  }
]}



    >
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-4 text-sm text-slate-700 space-y-2">
          <p>
            This tool performs REVEL v1.3 lookup for missense variants using hg19 / GRCh37 coordinates.
          </p>
          <p>
            REVEL scores range from 0 to 1, with higher values indicating greater predicted pathogenicity in this model. Thresholds below are user-adjustable for exploratory interpretation.
          </p>
          <p className="text-xs text-slate-500">
            Supported input formats: <code>chr1:12345 A&gt;G</code>, VCF-like lines, CSV/TSV <code>chr,pos,ref,alt</code>.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <div className="text-sm font-semibold">Thresholds</div>

            <label className="block text-sm">
              Pathogenic
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={thresholds.pathogenic}
                onChange={(e) =>
                  setThresholds((t) => ({ ...t, pathogenic: Number(e.target.value) }))
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>

            <label className="block text-sm">
              Likely pathogenic
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={thresholds.likelyPathogenic}
                onChange={(e) =>
                  setThresholds((t) => ({ ...t, likelyPathogenic: Number(e.target.value) }))
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>

            <label className="block text-sm">
              Uncertain cutoff
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={thresholds.uncertain}
                onChange={(e) =>
                  setThresholds((t) => ({ ...t, uncertain: Number(e.target.value) }))
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
          </div>

          <div className="rounded-lg border bg-white p-4 space-y-3">
            <div className="text-sm font-semibold">Options</div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={annotateGenes}
                onChange={(e) => setAnnotateGenes(e.target.checked)}
              />
              Add lightweight gene annotation
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useBatchEndpoint}
                onChange={(e) => setUseBatchEndpoint(e.target.checked)}
              />
              Use batch endpoint
            </label>

            <div className="text-xs text-slate-500">
              Gene annotation uses Ensembl GRCh37 region overlap for nearby overlapping genes.
            </div>
          </div>
        </div>

        {/* <div className="mb-3 text-sm bg-gray-50 border rounded p-3">

          <div className="flex items-center justify-between mb-2">

            <span className="font-medium text-gray-700">
              Example input formats
            </span>

            <button
              onClick={() => setInput(exampleInput)}
              className="text-blue-600 hover:underline text-xs"
            >
              Load example
            </button>

          </div>

          <pre className="text-xs font-mono whitespace-pre-wrap text-gray-600">
            {exampleInput}
          </pre>

        </div> */}

        <button
          onClick={() => setInput(exampleInput)}
          className="text-blue-600 hover:underline text-xs"
        >
          Load example
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-48 rounded-lg border p-3 font-mono text-sm"
          placeholder={`Examples (One variant per line):
chr2:213872152 C>T
x:200855 A>C
2 213872152 . C T`}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Running..." : "Analyze"}
          </button>

          <button
            onClick={clearAll}
            className="rounded border px-4 py-2"
          >
            Clear
          </button>

          <button
            onClick={() => exportCSV(results)}
            disabled={!results.length}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Export CSV
          </button>

          {/* <a
            href="https://revel-api.biotoolshub-api.workers.dev/docs"
            target="_blank"
            rel="noreferrer"
            className="rounded border px-4 py-2"
          >
            API Docs
          </a> */}
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
            Total: {stats.total} | Found: {stats.found} | Pathogenic-range: {stats.pathogenic} | Benign-range: {stats.benign}
          </div>
        )}

        <ScoreDistribution results={results} />

        {results.length > 0 && (
          <div className="overflow-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border p-2 text-left">Input</th>
                  <th className="border p-2 text-left">Variant</th>
                  <th className="border p-2 text-left">REVEL</th>
                  <th className="border p-2 text-left">Gene</th>
                  <th className="border p-2 text-left">Classification</th>
                  <th className="border p-2 text-left">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="align-top">
                    <td className="border p-2 font-mono text-xs">{r.input}</td>

                    <td className="border p-2 font-mono">
                      {r.variant
                        ? `${r.variant.chr}:${r.variant.pos} ${r.variant.ref}>${r.variant.alt}`
                        : "—"}
                    </td>

                    <td className="border p-2">
                      {r.score !== null ? (
                        <div className="flex min-w-[150px] items-center gap-2">
                          <span className="tabular-nums">{r.score.toFixed(3)}</span>
                          <div className="h-2 w-24 rounded bg-slate-200">
                            <div
                              className="h-2 rounded bg-blue-500"
                              style={{ width: `${Math.max(0, Math.min(100, r.score * 100))}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="border p-2 text-xs">
                      {r.gene?.symbol ? (
                        <div className="space-y-1">
                          <div className="font-medium">{r.gene.symbol}</div>
                          {r.gene.biotype && <div className="text-slate-500">{r.gene.biotype}</div>}
                          {r.gene.geneId && <div className="text-slate-500">{r.gene.geneId}</div>}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className={`border p-2 ${r.classification.color}`}>
                      {r.classification.label}
                    </td>

                    <td className="border p-2 text-xs text-slate-700">
                      {r.classification.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

<div className="text-xs text-slate-500 mt-4">
        Data source: REVEL v1.3 (hg19 / GRCh37).
      </div>

      <div className="mt-8 text-sm text-gray-600 border-t pt-4">
        <h3 className="font-semibold text-gray-800 mb-2">
          References
        </h3>

        <p>
          Ioannidis NM, Rothstein JH, et al.{" "}
          <em>
            REVEL: An Ensemble Method for Predicting the Pathogenicity of Rare Missense Variants
          </em>.{" "}
          The American Journal of Human Genetics, 2016.
        </p>

        <p className="mt-2">
          DOI:{" "}
          <a
            href="https://doi.org/10.1016/j.ajhg.2016.08.016"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            10.1016/j.ajhg.2016.08.016
          </a>
        </p>
      </div>


        <div className="text-xs text-slate-500">
          Data source: REVEL v1.3 (hg19 / GRCh37). Gene overlap annotation is lightweight and based on genomic overlap rather than transcript-specific consequence modeling. Ensembl documents region-based overlap queries for genes on both the main REST API and the GRCh37 REST server.
        </div>
        
      </div>

    </ToolLayout>
  )
}