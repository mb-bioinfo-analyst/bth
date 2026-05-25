import { BoxplotGroupSummary, BoxplotInputRow } from "../types"

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN
  if (sorted.length === 1) return sorted[0]

  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base

  const lower = sorted[base]
  const upper = sorted[base + 1]

  if (upper === undefined) return lower

  return lower + rest * (upper - lower)
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function makeSummary(
  group: string,
  subgroup: string | undefined,
  values: number[]
): BoxplotGroupSummary {
  const sorted = [...values].sort((a, b) => a - b)

  const q1 = quantile(sorted, 0.25)
  const median = quantile(sorted, 0.5)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1

  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr

  const nonOutliers = sorted.filter(value => value >= lowerFence && value <= upperFence)
  const outliers = sorted.filter(value => value < lowerFence || value > upperFence)

  const lowerWhisker = nonOutliers.length ? nonOutliers[0] : sorted[0]
  const upperWhisker = nonOutliers.length ? nonOutliers[nonOutliers.length - 1] : sorted[sorted.length - 1]

  return {
    group,
    subgroup,
    n: sorted.length,
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1],
    mean: mean(sorted),
    iqr,
    lowerWhisker,
    upperWhisker,
    outliers,
    values: sorted,
  }
}

export function summarizeBoxplotGroups(rows: BoxplotInputRow[]): BoxplotGroupSummary[] {
  const grouped = new Map<string, { group: string; subgroup?: string; values: number[] }>()

  for (const row of rows) {
    const key = row.subgroup ? `${row.group}|||${row.subgroup}` : row.group

    if (!grouped.has(key)) {
      grouped.set(key, {
        group: row.group,
        subgroup: row.subgroup,
        values: [],
      })
    }

    grouped.get(key)!.values.push(row.value)
  }

  return Array.from(grouped.values())
    .map(item => makeSummary(item.group, item.subgroup, item.values))
    .sort((a, b) => {
      const groupCompare = a.group.localeCompare(b.group)
      if (groupCompare !== 0) return groupCompare
      return (a.subgroup ?? "").localeCompare(b.subgroup ?? "")
    })
}

export function getValueRange(summaries: BoxplotGroupSummary[]): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const summary of summaries) {
    for (const value of summary.values) {
      if (!Number.isFinite(value)) continue
      if (value < min) min = value
      if (value > max) max = value
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 }
  }

  if (min === max) {
    return { min: min - 1, max: max + 1 }
  }

  const padding = (max - min) * 0.08

  return {
    min: min - padding,
    max: max + padding,
  }
}