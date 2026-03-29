import type { Variant } from "../types"

function normalizeChr(chr: string): string {
  return chr
    .trim()
    .replace(/^chr/i, "")
    .replace(/^_/, "")
    .replace(/^0+/, "")
    .toUpperCase()
}

function isBase(value: string): boolean {
  return /^[ACGT]$/i.test(value)
}

function buildVariant(chr: string, pos: number, ref: string, alt: string): Variant | null {
  const nChr = normalizeChr(chr)
  const nRef = ref.toUpperCase()
  const nAlt = alt.toUpperCase()

  if (!nChr || !Number.isInteger(pos) || pos <= 0) return null
  if (!isBase(nRef) || !isBase(nAlt)) return null

  return {
    chr: nChr,
    pos,
    ref: nRef,
    alt: nAlt,
  }
}

export function parseVariant(input: string): Variant | null {
  const line = input.trim()

  if (!line) return null
  if (line.startsWith("#")) return null
  if (/^(chrom|chr)[,\t ]/i.test(line) || /^chr\s*,\s*pos/i.test(line)) return null

  // Format 1: chr1:12345 A>G
  const simple = line.match(/^([\w]+):(\d+)\s+([ACGT])>([ACGT])$/i)
  if (simple) {
    return buildVariant(
      simple[1],
      Number(simple[2]),
      simple[3],
      simple[4]
    )
  }

  // Format 2: chr1:12345:C:T
  const colon4 = line.match(/^([\w]+):(\d+):([ACGT]):([ACGT])$/i)
  if (colon4) {
    return buildVariant(
      colon4[1],
      Number(colon4[2]),
      colon4[3],
      colon4[4]
    )
  }

  // Format 3: VCF-like space/tab separated: chr pos id ref alt
  const ws = line.split(/\s+/)
  if (ws.length >= 5) {
    return buildVariant(
      ws[0],
      Number(ws[1]),
      ws[3],
      ws[4].split(",")[0]
    )
  }

  // Format 4: CSV/TSV compact: chr,pos,ref,alt or chr pos ref alt
  const csv = line.split(/[,\t]/).map(x => x.trim()).filter(Boolean)
  if (csv.length === 4) {
    return buildVariant(
      csv[0],
      Number(csv[1]),
      csv[2],
      csv[3]
    )
  }

  // Format 5: whitespace compact: chr pos ref alt
  if (ws.length === 4) {
    return buildVariant(
      ws[0],
      Number(ws[1]),
      ws[2],
      ws[3]
    )
  }

  return null
}