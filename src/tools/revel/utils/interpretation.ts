import type { Interpretation, Thresholds } from "../types"

export const DEFAULT_THRESHOLDS: Thresholds = {
  pathogenic: 0.8,
  likelyPathogenic: 0.5,
  uncertain: 0.4,
}

export function sanitizeThresholds(input?: Partial<Thresholds>): Thresholds {
  const t = {
    ...DEFAULT_THRESHOLDS,
    ...input,
  }

  const values = [t.pathogenic, t.likelyPathogenic, t.uncertain]
  const valid = values.every(v => typeof v === "number" && v >= 0 && v <= 1)

  if (!valid) return DEFAULT_THRESHOLDS

  // enforce descending order
  const sorted = [...values].sort((a, b) => b - a)
  return {
    pathogenic: sorted[0],
    likelyPathogenic: sorted[1],
    uncertain: sorted[2],
  }
}

export function interpretRevel(
  score: number | null,
  thresholds?: Partial<Thresholds>
): Interpretation {
  const t = sanitizeThresholds(thresholds)

  if (score === null) {
    return {
      label: "Not found",
      color: "text-gray-500",
      evidence: "Variant not present in the REVEL v1.3 dataset",
    }
  }

  if (score >= t.pathogenic) {
    return {
      label: "Pathogenic-range",
      color: "text-red-600",
      evidence: `Score ≥ ${t.pathogenic.toFixed(2)} using current exploratory threshold`,
    }
  }

  if (score >= t.likelyPathogenic) {
    return {
      label: "Likely pathogenic-range",
      color: "text-orange-500",
      evidence: `Score ≥ ${t.likelyPathogenic.toFixed(2)} and < ${t.pathogenic.toFixed(2)}`,
    }
  }

  if (score >= t.uncertain) {
    return {
      label: "Uncertain-range",
      color: "text-yellow-600",
      evidence: `Score ≥ ${t.uncertain.toFixed(2)} and < ${t.likelyPathogenic.toFixed(2)}`,
    }
  }

  return {
    label: "Likely benign-range",
    color: "text-green-600",
    evidence: `Score < ${t.uncertain.toFixed(2)}`,
  }
}