import type { GeneAnnotation, Variant } from "../types"

const API_BASE = "https://revel-api.biotoolshub-api.workers.dev"

type BatchItemResponse = {
  input?: string
  variant?: Variant | null
  score?: number | null
  gene?: GeneAnnotation | null
  source?: string | null
  error?: string
}

export async function lookupRevelScore(variant: Variant): Promise<number | null> {
  const params = new URLSearchParams({
    chr: variant.chr,
    pos: String(variant.pos),
    ref: variant.ref,
    alt: variant.alt,
  })

  try {
    const res = await fetch(`${API_BASE}/revel?${params.toString()}`)
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.score === "number" ? data.score : null
  } catch {
    return null
  }
}

export async function lookupGeneAnnotation(variant: Variant): Promise<GeneAnnotation | null> {
  const params = new URLSearchParams({
    chr: variant.chr,
    pos: String(variant.pos),
  })

  try {
    const res = await fetch(`${API_BASE}/gene?${params.toString()}`)
    if (!res.ok) return null
    const data = await res.json()

    return {
      symbol: data.symbol ?? null,
      geneId: data.geneId ?? null,
      biotype: data.biotype ?? null,
    }
  } catch {
    return null
  }
}

export async function lookupRevelBatch(
  variants: Array<{ input: string; variant: Variant }>,
  annotateGenes: boolean
): Promise<BatchItemResponse[]> {
  try {
    const res = await fetch(`${API_BASE}/revel/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variants,
        annotateGenes,
      }),
    })

    if (!res.ok) {
      throw new Error(`Batch lookup failed: ${res.status}`)
    }

    const data = await res.json()
    return Array.isArray(data.results) ? data.results : []
  } catch (error) {
    console.error(error)
    return []
  }
}