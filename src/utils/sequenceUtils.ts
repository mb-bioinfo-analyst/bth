export interface FastaRecord {
  header: string
  sequence: string
}

/*
---------------------------------------
Parse FASTA
---------------------------------------
Supports:
- multi FASTA
- raw sequences
- mixed whitespace
*/
export function parseFasta(text: string): FastaRecord[] {

  const trimmed = text.trim()

  if (!trimmed) return []

  if (!trimmed.startsWith(">")) {
    return [{
      header: "sequence_1",
      sequence: cleanSequence(trimmed)
    }]
  }

  const records: FastaRecord[] = []

  const entries = trimmed.split(/^>/gm).filter(Boolean)

  for (const entry of entries) {

    const lines = entry.split("\n")

    const header = lines[0].trim()

    const seq = cleanSequence(lines.slice(1).join(""))

    records.push({
      header,
      sequence: seq
    })

  }

  return records

}

/*
---------------------------------------
Clean Sequence
---------------------------------------
Removes:
- whitespace
- numbers
- formatting artifacts
*/
export function cleanSequence(seq: string): string {

  return seq
    .replace(/\s/g, "")
    .replace(/[0-9]/g, "")
    .toUpperCase()

}

/*
---------------------------------------
Count Bases
---------------------------------------
Works for DNA or RNA
*/
export function countBases(seq: string) {

  const counts = {
    A: 0,
    C: 0,
    G: 0,
    T: 0,
    U: 0,
    N: 0,
    other: 0
  }

  for (const base of seq) {

    if (base in counts) {
      counts[base as keyof typeof counts]++
    } else {
      counts.other++
    }

  }

  return counts

}

/*
---------------------------------------
Detect Sequence Type
---------------------------------------
Returns:
DNA
RNA
PROTEIN
UNKNOWN
*/
export function detectProtein(seq: string): string {

  const dnaRegex = /^[ACGTN]+$/
  const rnaRegex = /^[ACGUN]+$/
  const proteinRegex = /^[ACDEFGHIKLMNPQRSTVWYBXZ*]+$/i

  if (dnaRegex.test(seq)) return "DNA"

  if (rnaRegex.test(seq)) return "RNA"

  if (proteinRegex.test(seq)) return "PROTEIN"

  return "UNKNOWN"

}

/*
---------------------------------------
GC Content
---------------------------------------
Reusable helper
*/
export function gcContent(seq: string): number {

  if (!seq.length) return 0

  const gc = (seq.match(/[GC]/gi) || []).length

  return (gc / seq.length) * 100

}

/*
---------------------------------------
Reverse Complement
---------------------------------------
*/
export function reverseComplement(seq: string): string {

  const comp: Record<string,string> = {
    A: "T",
    T: "A",
    C: "G",
    G: "C",
    U: "A",
    N: "N"
  }

  return seq
    .split("")
    .reverse()
    .map(b => comp[b] || "N")
    .join("")

}



/*
---------------------------------------
for sequence toolkit
---------------------------------------
*/


export const cleanInput = (input: string) =>
  input.replace(/^>.*$/gm, "").replace(/\s/g, "").toUpperCase()

export const reverse = (seq: string) =>
  seq.split("").reverse().join("")

export const complementDNA = (seq: string) => {
  const map: Record<string, string> = {
    A: "T", T: "A", C: "G", G: "C",
    R: "Y", Y: "R", S: "S", W: "W",
    K: "M", M: "K", B: "V", D: "H",
    H: "D", V: "B", N: "N"
  }
  return seq.split("").map(c => map[c] || c).join("")
}

export const dnaToRna = (seq: string) =>
  seq.replace(/T/g, "U")

export const rnaToDna = (seq: string) =>
  seq.replace(/U/g, "T")

export const removeGaps = (seq: string) =>
  seq.replace(/[-.\s]/g, "")

export const toUpper = (seq: string) => seq.toUpperCase()
export const toLower = (seq: string) => seq.toLowerCase()

export const getLength = (seq: string) => seq.length



/*
---------------------------------------
for sequence toolkit END
---------------------------------------
*/