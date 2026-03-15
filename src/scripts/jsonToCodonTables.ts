import fs from "fs-extra"
import path from "path"

const inputFile = path.join(
  process.cwd(),
  "src/data/codonUsage_top150.json"
)

const outputFile = path.join(
  process.cwd(),
  "src/data/codonTables.ts"
)

function formatSpeciesName(name: string) {
  const lower = name.toLowerCase()

  if (lower.includes("escherichia_coli")) return "ecoli"
  if (lower.includes("homo_sapiens")) return "human"
  if (lower.includes("saccharomyces_cerevisiae")) return "yeast"
  if (lower.includes("drosophila")) return "drosophila"

  return name
    .toLowerCase()
    .replace(/\./g, "")        // remove dots
    .replace(/[^a-z0-9]+/g, "_") // replace spaces/symbols with _
    .replace(/^_+|_+$/g, "")   // trim underscores
}

async function run() {

  const json =
    await fs.readJSON(inputFile)

  const speciesKeys = Object.keys(json)

  const speciesMap: Record<string,string> = {}

  speciesKeys.forEach(k=>{
    speciesMap[k] = formatSpeciesName(k)
  })

  const uniqueSpecies =
    Object.values(speciesMap)

  let ts = ""

  ts += "export type Species =\n"
  uniqueSpecies.forEach((sp,i)=>{
    ts += `  | "${sp}"\n`
  })

  ts += "\n\nexport const speciesCodonUsage: Record<Species,Record<string,number>> = {\n"

  for(const [originalName,data] of Object.entries(json)){

    const sp =
      speciesMap[originalName]

    ts += `  ${sp}: {\n`

    for(const [codon,value] of Object.entries(data as any)){

      ts += `    ${codon}:${Number(value).toFixed(2)},\n`

    }

    ts += "  },\n\n"
  }

  ts += "}\n"

  await fs.writeFile(outputFile,ts)

  console.log("codonTables.ts generated")
}

run()