export type GenomeFeature = {
  seqid: string
  start: number
  end: number
  type: string
  strand?: string
  attributes?: Record<string, string>
}

export function parseBED(text: string): GenomeFeature[] {
  const lines = text.trim().split("\n")
  const features: GenomeFeature[] = []

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue

    const [seqid, start, end, name] = line.split(/\s+/)

    features.push({
      seqid,
      start: parseInt(start),
      end: parseInt(end),
      type: name || "feature"
    })
  }

  return features
}

export function parseGFF(text: string): GenomeFeature[] {
  const lines = text.trim().split("\n")
  const features: GenomeFeature[] = []

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue

    const parts = line.split("\t")
    if (parts.length < 9) continue

    const [seqid, , type, start, end, , strand, , attr] = parts

    const attributes: Record<string, string> = {}

    attr.split(";").forEach(a => {
      const [k, v] = a.split("=")
      if (k && v) attributes[k] = v
    })

    features.push({
      seqid,
      start: parseInt(start),
      end: parseInt(end),
      type,
      strand,
      attributes
    })
  }

  return features
}

export function detectFormat(text: string) {
  if (text.includes("\t") && text.split("\n")[0].split("\t").length >= 9)
    return "gff"

  if (text.split("\n")[0].split(/\s+/).length >= 3)
    return "bed"

  return "unknown"
}

export function parseRegion(region: string) {

  const match = region.match(/(.+):(\d+)-(\d+)/)

  if (!match) return null

  return {
    chr: match[1],
    start: parseInt(match[2]),
    end: parseInt(match[3])
  }

}

export function getGeneName(feature: GenomeFeature) {

  if (!feature.attributes) return null

  return (
    feature.attributes.Name ||
    feature.attributes.gene ||
    feature.attributes.ID ||
    null
  )

}
