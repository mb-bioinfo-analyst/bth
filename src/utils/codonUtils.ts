export type CodonUsage = {
  codon: string
  aa: string
  count: number
  freq: number
  rscu: number
}

export type SpeciesCodonTable = Record<string, number>

export function countCodons(seq: string) {

  const counts: Record<string, number> = {}

  for (let i = 0; i < seq.length - 2; i += 3) {
    const codon = seq.slice(i, i + 3)

    if (!counts[codon]) counts[codon] = 0
    counts[codon]++
  }

  return counts
}

export function computeRSCU(
  counts: Record<string, number>,
  codonTable: Record<string, string>
) {

  const aaGroups: Record<string, string[]> = {}

  Object.entries(codonTable).forEach(([codon, aa]) => {
    if (!aaGroups[aa]) aaGroups[aa] = []
    aaGroups[aa].push(codon)
  })

  const rscu: Record<string, number> = {}

  Object.entries(aaGroups).forEach(([aa, codons]) => {

    const total = codons.reduce((sum, c) => sum + (counts[c] || 0), 0)

    const expected = total / codons.length

    codons.forEach(c => {

      rscu[c] =
        expected === 0
          ? 0
          : (counts[c] || 0) / expected

    })

  })

  return rscu
}


export function computeCAI(
  seq: string,
  reference: Record<string, number>
) {

  const weights: number[] = []

  for (let i = 0; i < seq.length - 2; i += 3) {

    const codon = seq.slice(i, i + 3)

    const w = reference[codon]

    if (!w || w <= 0) continue

    weights.push(Math.log(w))

  }

  if (weights.length === 0) return 0

  const mean =
    weights.reduce((a, b) => a + b, 0) / weights.length

  return Math.exp(mean)
}



export function computeENC(counts: Record<string, number>) {

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  if (total === 0) return 0

  const freqs = Object.values(counts).map(c => c / total)

  const homozygosity =
    freqs.reduce((a, b) => a + b * b, 0)

  const enc = 1 / homozygosity

  return enc
}


export function classifyCodons(
  rscu: Record<string, number>
) {

  const preferred: string[] = []
  const rare: string[] = []

  Object.entries(rscu).forEach(([codon, value]) => {

    if (value > 1.5) preferred.push(codon)
    if (value < 0.5) rare.push(codon)

  })

  return { preferred, rare }
}


export function optimizeCodons(
  seq: string,
  preferred: string[]
) {

  const optimized: string[] = []

  for (let i = 0; i < seq.length - 2; i += 3) {

    const codon = seq.slice(i, i + 3)

    if (preferred.includes(codon)) {
      optimized.push(codon)
    } else {
      optimized.push(preferred[0])
    }

  }

  return optimized.join("")
}

export function slidingWindowCodonBias(
  seq: string,
  windowSize = 30,
  step = 3,
  reference: Record<string, number>
) {

  const results: { position: number; cai: number }[] = []

  const codonCount = Math.floor(seq.length / 3)

  if (codonCount < windowSize) return []

  for (let start = 0; start <= codonCount - windowSize; start += step) {

    const startNt = start * 3
    const endNt = (start + windowSize) * 3

    const windowSeq = seq.slice(startNt, endNt)

    const cai = computeCAI(windowSeq, reference)

    results.push({
      position: start + windowSize / 2,
      cai: Number(cai.toFixed(3))
    })

  }

  return results
}