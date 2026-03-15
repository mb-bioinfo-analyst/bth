import { speciesCodonUsage, Species } from "../data/codonTables"

export type InputMode = "dna" | "protein"
export type OptimizationStrategy = "max" | "balanced" | "gc-low" | "gc-high"

export type ParsedSequence = {
  header: string
  sequence: string
}

export type CodonChoice = {
  aminoAcid: string
  originalCodon?: string
  optimizedCodon: string
  originalFrequency?: number
  optimizedFrequency: number
  position: number
}

const DNA_CODON_TABLE: Record<string, string> = {
  TTT: "F", TTC: "F",
  TTA: "L", TTG: "L", CTT: "L", CTC: "L", CTA: "L", CTG: "L",
  ATT: "I", ATC: "I", ATA: "I",
  ATG: "M",
  GTT: "V", GTC: "V", GTA: "V", GTG: "V",

  TCT: "S", TCC: "S", TCA: "S", TCG: "S", AGT: "S", AGC: "S",
  CCT: "P", CCC: "P", CCA: "P", CCG: "P",
  ACT: "T", ACC: "T", ACA: "T", ACG: "T",
  GCT: "A", GCC: "A", GCA: "A", GCG: "A",

  TAT: "Y", TAC: "Y",
  TAA: "*", TAG: "*", TGA: "*",
  CAT: "H", CAC: "H",
  CAA: "Q", CAG: "Q",
  AAT: "N", AAC: "N",
  AAA: "K", AAG: "K",
  GAT: "D", GAC: "D",
  GAA: "E", GAG: "E",

  TGT: "C", TGC: "C",
  TGG: "W",
  CGT: "R", CGC: "R", CGA: "R", CGG: "R", AGA: "R", AGG: "R",
  GGT: "G", GGC: "G", GGA: "G", GGG: "G"
}

const AA_TO_CODONS: Record<string, string[]> = Object.entries(DNA_CODON_TABLE).reduce(
  (acc, [codon, aa]) => {
    if (!acc[aa]) acc[aa] = []
    acc[aa].push(codon)
    return acc
  },
  {} as Record<string, string[]>
)

export function parseInputRecords(input: string, mode: InputMode): ParsedSequence[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  if (!trimmed.startsWith(">")) {
    return [
      {
        header: `${mode}_1`,
        sequence: cleanInputSequence(trimmed, mode)
      }
    ]
  }

  return trimmed
    .split(/^>/m)
    .filter(Boolean)
    .map((entry, idx) => {
      const lines = entry.split("\n")
      return {
        header: lines[0]?.trim() || `${mode}_${idx + 1}`,
        sequence: cleanInputSequence(lines.slice(1).join(""), mode)
      }
    })
    .filter((r) => r.sequence.length > 0)
}

export function cleanInputSequence(seq: string, mode: InputMode) {
  const clean = seq.replace(/\s/g, "").toUpperCase()

  if (mode === "dna") {
    return clean.replace(/U/g, "T")
  }

  return clean
}

export function isValidDna(seq: string) {
  return /^[ACGTN]+$/.test(seq)
}

export function isValidProtein(seq: string) {
  return /^[ACDEFGHIKLMNPQRSTVWY*]+$/i.test(seq)
}

export function translateDna(seq: string) {
  const usableLength = seq.length - (seq.length % 3)
  let protein = ""

  for (let i = 0; i < usableLength; i += 3) {
    const codon = seq.slice(i, i + 3)
    protein += DNA_CODON_TABLE[codon] || "X"
  }

  return protein
}

export function gcPercent(seq: string) {
  if (!seq.length) return 0
  const gc = (seq.match(/[GC]/g) || []).length
  return (gc / seq.length) * 100
}

export function countHomopolymerMax(seq: string) {
  let maxRun = 0
  let currentRun = 0
  let prev = ""

  for (const ch of seq) {
    if (ch === prev) {
      currentRun += 1
    } else {
      currentRun = 1
      prev = ch
    }
    if (currentRun > maxRun) maxRun = currentRun
  }

  return maxRun
}

function codonGc(codon: string) {
  return (codon.match(/[GC]/g) || []).length
}

function sortedCodonsForAa(aa: string, species: Species) {
  const usage = speciesCodonUsage[species] as Record<string, number>
  const codons = AA_TO_CODONS[aa] || []

  return [...codons].sort((a, b) => (usage[b] || 0) - (usage[a] || 0))
}

function chooseBalancedCodon(aa: string, species: Species, cycleIndex: number) {
  const sorted = sortedCodonsForAa(aa, species)
  if (sorted.length === 0) return ""

  const top = Math.min(sorted.length, 3)
  return sorted[cycleIndex % top]
}

function chooseGcAwareCodon(
  aa: string,
  species: Species,
  prefer: "low" | "high"
) {
  const usage = speciesCodonUsage[species] as Record<string, number>
  const codons = AA_TO_CODONS[aa] || []

  return [...codons]
    .sort((a, b) => {
      const gcDiff = prefer === "high"
        ? codonGc(b) - codonGc(a)
        : codonGc(a) - codonGc(b)

      if (gcDiff !== 0) return gcDiff

      return (usage[b] || 0) - (usage[a] || 0)
    })[0] || ""
}

export function optimizeProteinSequence(
  protein: string,
  species: Species,
  strategy: OptimizationStrategy
) {
  const usage = speciesCodonUsage[species] as Record<string, number>
  let optimized = ""
  const choices: CodonChoice[] = []

  const aaCycleCount: Record<string, number> = {}

  for (let i = 0; i < protein.length; i++) {
    const aa = protein[i]
    if (!AA_TO_CODONS[aa]) continue

    aaCycleCount[aa] = (aaCycleCount[aa] || 0) + 1

    let selected = ""

    if (strategy === "max") {
      selected = sortedCodonsForAa(aa, species)[0]
    } else if (strategy === "balanced") {
      selected = chooseBalancedCodon(aa, species, aaCycleCount[aa] - 1)
    } else if (strategy === "gc-low") {
      selected = chooseGcAwareCodon(aa, species, "low")
    } else {
      selected = chooseGcAwareCodon(aa, species, "high")
    }

    optimized += selected

    choices.push({
      aminoAcid: aa,
      optimizedCodon: selected,
      optimizedFrequency: usage[selected] || 0,
      position: i + 1
    })
  }

  return { optimized, choices }
}

export function optimizeDnaSequence(
  dna: string,
  species: Species,
  strategy: OptimizationStrategy
) {
  const usage = speciesCodonUsage[species] as Record<string, number>
  const usableLength = dna.length - (dna.length % 3)
  let optimized = ""
  const choices: CodonChoice[] = []

  const aaCycleCount: Record<string, number> = {}

  for (let i = 0; i < usableLength; i += 3) {
    const codon = dna.slice(i, i + 3)
    const aa = DNA_CODON_TABLE[codon] || "X"

    if (!AA_TO_CODONS[aa]) continue

    aaCycleCount[aa] = (aaCycleCount[aa] || 0) + 1

    let selected = ""

    if (strategy === "max") {
      selected = sortedCodonsForAa(aa, species)[0]
    } else if (strategy === "balanced") {
      selected = chooseBalancedCodon(aa, species, aaCycleCount[aa] - 1)
    } else if (strategy === "gc-low") {
      selected = chooseGcAwareCodon(aa, species, "low")
    } else {
      selected = chooseGcAwareCodon(aa, species, "high")
    }

    optimized += selected

    choices.push({
      aminoAcid: aa,
      originalCodon: codon,
      optimizedCodon: selected,
      originalFrequency: usage[codon] || 0,
      optimizedFrequency: usage[selected] || 0,
      position: i / 3 + 1
    })
  }

  return { optimized, choices }
}

export function estimateAdaptationScore(seq: string, species: Species) {
  const usage = speciesCodonUsage[species] as Record<string, number>
  const usableLength = seq.length - (seq.length % 3)
  const values: number[] = []

  for (let i = 0; i < usableLength; i += 3) {
    const codon = seq.slice(i, i + 3)
    if (usage[codon] !== undefined) {
      values.push(usage[codon])
    }
  }

  if (values.length === 0) return 0

  const maxValue = Math.max(...Object.values(usage))
  if (maxValue === 0) return 0

  const normalized = values.map(v => v / maxValue)
  const mean = normalized.reduce((a, b) => a + b, 0) / normalized.length

  return mean
}

export function wrapFasta(header: string, sequence: string) {
  const wrapped = sequence.match(/.{1,60}/g)?.join("\n") || sequence
  return `>${header}\n${wrapped}`
}

export function reverseTranslateProtein(protein: string, species: Species) {
  return optimizeProteinSequence(protein, species, "max")
}