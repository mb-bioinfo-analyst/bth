// src/utils/restrictionUtils.ts

import type { RestrictionEnzyme } from "../data/restrictionEnzymes"



export interface RestrictionHit {
  enzyme: string
  site: string
  position: number
  cutPosition: number
  fragment: string
  cutIndex: number
}

export interface DigestPattern {
  enzyme: string
  cuts: number[]
  fragments: number[]
}



const IUPAC: Record<string, string> = {
  A: "A",
  C: "C",
  G: "G",
  T: "T",
  R: "[AG]",
  Y: "[CT]",
  S: "[GC]",
  W: "[AT]",
  K: "[GT]",
  M: "[AC]",
  B: "[CGT]",
  D: "[AGT]",
  H: "[ACT]",
  V: "[ACG]",
  N: "[ACGT]"
}



export function buildMultiDigestPattern(
  sequenceLength: number,
  hits: RestrictionHit[],
  selectedEnzymes: string[],
  circular = false
): DigestPattern {
  const cuts = hits
    .filter((h) => selectedEnzymes.includes(h.enzyme))
    .map((h) => h.cutPosition)

  const uniqueCuts = [...new Set(cuts)].sort((a, b) => a - b)
  const fragments: number[] = []

  if (uniqueCuts.length === 0) {
    return {
      enzyme: selectedEnzymes.join(" + "),
      cuts: [],
      fragments: [sequenceLength]
    }
  }

  if (circular) {
    for (let i = 0; i < uniqueCuts.length; i++) {
      const current = uniqueCuts[i]
      const next = i === uniqueCuts.length - 1 ? uniqueCuts[0] + sequenceLength : uniqueCuts[i + 1]
      fragments.push(next - current)
    }
  } else {
    fragments.push(uniqueCuts[0] - 1)
    for (let i = 1; i < uniqueCuts.length; i++) {
      fragments.push(uniqueCuts[i] - uniqueCuts[i - 1])
    }
    fragments.push(sequenceLength - uniqueCuts[uniqueCuts.length - 1] + 1)
  }

  return {
    enzyme: selectedEnzymes.join(" + "),
    cuts: uniqueCuts,
    fragments: fragments.filter((x) => x > 0).sort((a, b) => b - a)
  }
}




export function cleanDnaSequence(input: string) {
  return input
    .replace(/^>.*$/gm, "")
    .replace(/\s/g, "")
    .toUpperCase()
}

export function siteToRegex(site: string) {
  return new RegExp(
    site
      .split("")
      .map((c) => IUPAC[c] || c)
      .join(""),
    "g"
  )
}

export function reverseComplement(seq: string) {
  const comp: Record<string, string> = {
    A: "T",
    T: "A",
    C: "G",
    G: "C",
    R: "Y",
    Y: "R",
    S: "S",
    W: "W",
    K: "M",
    M: "K",
    B: "V",
    V: "B",
    D: "H",
    H: "D",
    N: "N"
  }

  return seq
    .split("")
    .reverse()
    .map((b) => comp[b] || "N")
    .join("")
}

export function findRestrictionSites(
  seq: string,
  enzymes: RestrictionEnzyme[],
  circular = false
): RestrictionHit[] {
  const results: RestrictionHit[] = []

  for (const enzyme of enzymes) {
    const motifLength = enzyme.site.length
    if (motifLength > seq.length && !circular) continue

    const regex = siteToRegex(enzyme.site)
    const extended = circular ? seq + seq.slice(0, motifLength - 1) : seq

    let match: RegExpExecArray | null
    regex.lastIndex = 0

    while ((match = regex.exec(extended)) !== null) {
      const start = match.index
      if (start >= seq.length) break

      const cutPosition = ((start + enzyme.cutIndex) % seq.length) + 1
      const fragment = extended.slice(start, start + motifLength)

      results.push({
        enzyme: enzyme.name,
        site: enzyme.site,
        position: start + 1,
        cutPosition,
        cutIndex: enzyme.cutIndex,
        fragment
      })

      if (regex.lastIndex === match.index) regex.lastIndex++
    }
  }

  const unique = new Map<string, RestrictionHit>()
  for (const hit of results) {
    const key = `${hit.enzyme}-${hit.position}-${hit.cutPosition}`
    if (!unique.has(key)) unique.set(key, hit)
  }

  return Array.from(unique.values()).sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position
    return a.enzyme.localeCompare(b.enzyme)
  })
}

export function buildDigestPatterns(
  sequenceLength: number,
  hits: RestrictionHit[],
  circular = false
): DigestPattern[] {
  const byEnzyme = new Map<string, number[]>()

  for (const hit of hits) {
    if (!byEnzyme.has(hit.enzyme)) byEnzyme.set(hit.enzyme, [])
    byEnzyme.get(hit.enzyme)!.push(hit.cutPosition)
  }

  const patterns: DigestPattern[] = []

  for (const [enzyme, cutsRaw] of byEnzyme.entries()) {
    const cuts = [...new Set(cutsRaw)].sort((a, b) => a - b)
    const fragments: number[] = []

    if (cuts.length === 0) continue

    if (circular) {
      for (let i = 0; i < cuts.length; i++) {
        const current = cuts[i]
        const next = i === cuts.length - 1 ? cuts[0] + sequenceLength : cuts[i + 1]
        fragments.push(next - current)
      }
    } else {
      fragments.push(cuts[0] - 1)
      for (let i = 1; i < cuts.length; i++) {
        fragments.push(cuts[i] - cuts[i - 1])
      }
      fragments.push(sequenceLength - cuts[cuts.length - 1] + 1)
    }

    patterns.push({
      enzyme,
      cuts,
      fragments: fragments.filter((x) => x > 0).sort((a, b) => b - a)
    })
  }

  return patterns.sort((a, b) => a.enzyme.localeCompare(b.enzyme))
}

export function compareDigestPatterns(patternsBySequence: DigestPattern[][]) {
  const scoreMap = new Map<string, number>()

  for (const patterns of patternsBySequence) {
    for (const p of patterns) {
      if (!scoreMap.has(p.enzyme)) scoreMap.set(p.enzyme, 0)
    }
  }

  const allEnzymes = Array.from(scoreMap.keys())

  return allEnzymes
    .map((enzyme) => {
      const fingerprints = patternsBySequence.map((set) => {
        const found = set.find((p) => p.enzyme === enzyme)
        if (!found) return "no-cut"
        return found.fragments.join("-")
      })

      const distinct = new Set(fingerprints).size
      return {
        enzyme,
        distinctPatterns: distinct,
        fingerprints
      }
    })
    .sort((a, b) => b.distinctPatterns - a.distinctPatterns || a.enzyme.localeCompare(b.enzyme))
}