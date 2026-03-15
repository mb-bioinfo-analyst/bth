import fs from "fs-extra"
import path from "path"

const ROOT =
  path.join(process.cwd(), "data", "data")

const MAX_ORGANISMS = 150

// Always include these
const REQUIRED_ORGANISMS = [
  "Escherichia coli",
  "Bacillus subtilis",
  "Saccharomyces cerevisiae",
  "Komagataella phaffii",      // Pichia pastoris
  "Homo sapiens",
  "Mus musculus",
  "Arabidopsis thaliana",
  "Oryza sativa",
  "Zea mays",
  "Danio rerio"
]

type OrganismRecord = {
  name: string
  geneCount: number
  codons: Record<string, number>
}

function extractHeaderInfo(lines: string[]) {

  let organism = ""
  let geneCount = 0

  for (const line of lines) {

    if (line.startsWith("Organism"))
      organism = line.split("=")[1].trim()

    if (line.startsWith("Total nuclear genes"))
      geneCount = parseInt(line.split("=")[1])
  }

  return { organism, geneCount }
}

async function parseCodonFile(filePath: string) {

  const lines =
    (await fs.readFile(filePath, "utf8"))
      .split("\n")

  const { organism, geneCount } =
    extractHeaderInfo(lines)

  if (!organism || !geneCount)
    return null

  const table: Record<string, number> = {}

  for (const line of lines) {

    if (!line.includes("\t")) continue
    if (line.startsWith("CODON")) continue

    const cols = line.split("\t")

    if (cols.length < 7) continue

    const codon = cols[0].trim()
    const fraction = parseFloat(cols[5])

    if (!codon.match(/^[ACGTU]{3}$/))
      continue

    const dnaCodon =
      codon.replace(/U/g, "T")

    table[dnaCodon] = fraction
  }

  if (Object.keys(table).length !== 64)
    return null

  return {
    name: organism,
    geneCount,
    codons: table
  }
}

async function run() {

  const dirs =
    await fs.readdir(ROOT)

  const organisms: OrganismRecord[] = []

  for (const dir of dirs) {

    const statFile =
      path.join(ROOT, dir,
        "nuclear_codon_statistics.tsv")

    if (!(await fs.pathExists(statFile)))
      continue

    const result =
      await parseCodonFile(statFile)

    if (!result) continue

    organisms.push(result)
  }

  // sort by gene count
  organisms.sort(
    (a,b) => b.geneCount - a.geneCount
  )

  // top N
  const top =
    organisms.slice(0, MAX_ORGANISMS)

  // add required organisms
  const required =
    organisms.filter(org =>
      REQUIRED_ORGANISMS.some(r =>
        org.name.startsWith(r)
      )
    )

  const combined =
    [...top, ...required]

  // deduplicate
  const map = new Map<string, OrganismRecord>()

  for (const org of combined) {
    map.set(org.name, org)
  }

  const dataset: Record<string, any> = {}

  for (const org of map.values()) {

    const key =
      org.name.replace(/\s+/g,"_")

    dataset[key] = org.codons
  }

  await fs.writeJSON(
    "./data/codonUsage_top150.json",
    dataset,
    { spaces: 2 }
  )

  console.log(
    "Dataset built:",
    Object.keys(dataset).length,
    "organisms"
  )
}

run()