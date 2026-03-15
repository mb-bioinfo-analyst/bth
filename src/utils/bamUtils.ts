import Aioli from "@biowasm/aioli"

let CLI: any = null

export async function initSamtools() {

  if (CLI) return CLI

  CLI = await new Aioli(["samtools/1.10"])

  return CLI
}

export async function readBam(file: File) {

  const cli = await initSamtools()

  // mount user file
  await cli.mount(file)

  const result = await cli.exec(`samtools view ${file.name}`)

  return result.stdout.split("\n").filter(Boolean)

}

export function parseSamReads(lines: string[]) {

  return lines
    .filter(line => line && !line.startsWith("@"))
    .map(line => {

      const parts = line.split("\t")

      const start = parseInt(parts[3])
      const seq = parts[9] || ""

      return {
        chr: parts[2],
        start: start,
        end: start + seq.length
      }

    })

}