export interface Variant {
  chr: string
  pos: number
  ref: string
  alt: string
}

export interface Interpretation {
  label: string
  color: string
  evidence: string
}

export interface Thresholds {
  pathogenic: number
  likelyPathogenic: number
  uncertain: number
}

export interface GeneAnnotation {
  symbol: string | null
  geneId: string | null
  biotype: string | null
}

export interface RevelResult {
  input: string
  variant: Variant | null
  score: number | null
  classification: Interpretation
  gene: GeneAnnotation | null
  error?: string
}