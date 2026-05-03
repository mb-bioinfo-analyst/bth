import { ReorderedMatrix, OrderMode } from "../types"

function buildAlphabeticalOrder(labels: string[]): number[] {
  return labels
    .map((label, index) => ({ label, index }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(item => item.index)
}

function buildReverseOrder(length: number): number[] {
  return Array.from({ length }, (_, i) => length - 1 - i)
}

function buildCustomOrder(labels: string[], customText: string): number[] {
  const requested = customText
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean)

  if (requested.length === 0) {
    return labels.map((_, i) => i)
  }

  const indexMap = new Map<string, number>()
  labels.forEach((label, i) => indexMap.set(label, i))

  const used = new Set<number>()
  const order: number[] = []

  for (const label of requested) {
    const idx = indexMap.get(label)
    if (idx !== undefined && !used.has(idx)) {
      order.push(idx)
      used.add(idx)
    }
  }

  labels.forEach((_, idx) => {
    if (!used.has(idx)) {
      order.push(idx)
    }
  })

  return order
}

function buildDragOrder(labels: string[], dragLabels: string[]): number[] {
  if (!dragLabels.length) {
    return labels.map((_, i) => i)
  }

  const indexMap = new Map<string, number>()
  labels.forEach((label, i) => indexMap.set(label, i))

  const used = new Set<number>()
  const order: number[] = []

  for (const label of dragLabels) {
    const idx = indexMap.get(label)
    if (idx !== undefined && !used.has(idx)) {
      order.push(idx)
      used.add(idx)
    }
  }

  labels.forEach((_, idx) => {
    if (!used.has(idx)) {
      order.push(idx)
    }
  })

  return order
}

function reorderGroups(groups: number[] | undefined, order: number[]): number[] | undefined {
  if (!groups) return undefined
  return order.map(i => groups[i])
}

export function applyManualOrdering(
  matrix: ReorderedMatrix,
  rowOrderMode: OrderMode,
  colOrderMode: OrderMode,
  customRowOrderText: string,
  customColOrderText: string,
  dragRowLabels: string[],
  dragColLabels: string[]
): ReorderedMatrix {
  let rowOrder = matrix.rowLabels.map((_, i) => i)
  let colOrder = matrix.colLabels.map((_, i) => i)

  if (rowOrderMode === "alphabetical") {
    rowOrder = buildAlphabeticalOrder(matrix.rowLabels)
  } else if (rowOrderMode === "reverse") {
    rowOrder = buildReverseOrder(matrix.rowLabels.length)
  } else if (rowOrderMode === "custom") {
    rowOrder = buildCustomOrder(matrix.rowLabels, customRowOrderText)
  } else if (rowOrderMode === "drag") {
    rowOrder = buildDragOrder(matrix.rowLabels, dragRowLabels)
  }

  if (colOrderMode === "alphabetical") {
    colOrder = buildAlphabeticalOrder(matrix.colLabels)
  } else if (colOrderMode === "reverse") {
    colOrder = buildReverseOrder(matrix.colLabels.length)
  } else if (colOrderMode === "custom") {
    colOrder = buildCustomOrder(matrix.colLabels, customColOrderText)
  } else if (colOrderMode === "drag") {
    colOrder = buildDragOrder(matrix.colLabels, dragColLabels)
  }

  return {
    rowLabels: rowOrder.map(i => matrix.rowLabels[i]),
    colLabels: colOrder.map(i => matrix.colLabels[i]),
    values: rowOrder.map(i => colOrder.map(j => matrix.values[i][j])),
    rowOrder: rowOrder.map(i => matrix.rowOrder[i]),
    colOrder: colOrder.map(i => matrix.colOrder[i]),
    rowTree: rowOrderMode === "default" ? matrix.rowTree : undefined,
    colTree: colOrderMode === "default" ? matrix.colTree : undefined,
    rowGroups: reorderGroups(matrix.rowGroups, rowOrder),
    colGroups: reorderGroups(matrix.colGroups, colOrder),
  }
}