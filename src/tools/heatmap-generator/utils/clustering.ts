import { ClusterNode, DistanceMetric, HeatmapMatrix, ReorderedMatrix } from "../types"

type Cluster = {
  node: ClusterNode
  centroid: number[]
}

function safeNumber(v: number | null): number {
  return v === null ? 0 : v
}

function vectorDistance(a: number[], b: number[], metric: DistanceMetric): number {
  if (metric === "euclidean") {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i]
      sum += d * d
    }
    return Math.sqrt(sum)
  }

  const n = a.length
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n

  let num = 0
  let denA = 0
  let denB = 0

  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denA += da * da
    denB += db * db
  }

  const denom = Math.sqrt(denA) * Math.sqrt(denB)
  if (denom === 0) return 1
  return 1 - (num / denom)
}

function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) return []
  const length = vectors[0].length
  const sums = new Array(length).fill(0)

  for (const vec of vectors) {
    for (let i = 0; i < length; i++) {
      sums[i] += vec[i]
    }
  }

  return sums.map(v => v / vectors.length)
}

function buildTree(vectors: number[][], prefix: string, metric: DistanceMetric): ClusterNode | undefined {
  if (vectors.length === 0) return undefined
  if (vectors.length === 1) {
    return {
      id: `${prefix}-0`,
      indices: [0],
      height: 0,
    }
  }

  let clusters: Cluster[] = vectors.map((vec, i) => ({
    node: {
      id: `${prefix}-${i}`,
      indices: [i],
      height: 0,
    },
    centroid: vec,
  }))

  while (clusters.length > 1) {
    let bestI = 0
    let bestJ = 1
    let bestDistance = Infinity

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = vectorDistance(clusters[i].centroid, clusters[j].centroid, metric)
        if (d < bestDistance) {
          bestDistance = d
          bestI = i
          bestJ = j
        }
      }
    }

    const a = clusters[bestI]
    const b = clusters[bestJ]

    const mergedVectors = [...a.node.indices, ...b.node.indices].map(index => vectors[index])

    const merged: Cluster = {
      node: {
        id: `${prefix}-merge-${clusters.length}-${bestI}-${bestJ}`,
        left: a.node,
        right: b.node,
        indices: [...a.node.indices, ...b.node.indices],
        height: bestDistance,
      },
      centroid: averageVectors(mergedVectors),
    }

    clusters = clusters.filter((_, idx) => idx !== bestI && idx !== bestJ)
    clusters.push(merged)
  }

  return clusters[0].node
}

function leafOrder(node: ClusterNode | undefined): number[] {
  if (!node) return []
  if (!node.left && !node.right) return node.indices
  return [...leafOrder(node.left), ...leafOrder(node.right)]
}

function transpose(values: (number | null)[][]): (number | null)[][] {
  if (values.length === 0) return []
  return values[0].map((_, colIndex) => values.map(row => row[colIndex]))
}

function labelCutGroups(tree: ClusterNode | undefined, totalLeaves: number, targetGroups: number | null): number[] | undefined {
  if (!tree || !targetGroups || targetGroups < 2) return undefined

  let active: ClusterNode[] = [tree]

  while (active.length < targetGroups) {
    let splitIndex = -1
    let maxHeight = -Infinity

    for (let i = 0; i < active.length; i++) {
      const node = active[i]
      if (node.left && node.right && node.height > maxHeight) {
        maxHeight = node.height
        splitIndex = i
      }
    }

    if (splitIndex === -1) break

    const node = active[splitIndex]
    active.splice(splitIndex, 1)
    if (node.left) active.push(node.left)
    if (node.right) active.push(node.right)
  }

  const groups = new Array(totalLeaves).fill(0)

  active.forEach((node, groupIndex) => {
    node.indices.forEach(leafIndex => {
      groups[leafIndex] = groupIndex
    })
  })

  return groups
}

function reorderMatrix(
  matrix: HeatmapMatrix,
  rowOrder: number[],
  colOrder: number[],
  rowTree?: ClusterNode,
  colTree?: ClusterNode,
  rowGroups?: number[],
  colGroups?: number[]
): ReorderedMatrix {
  return {
    rowLabels: rowOrder.map(i => matrix.rowLabels[i]),
    colLabels: colOrder.map(i => matrix.colLabels[i]),
    values: rowOrder.map(i => colOrder.map(j => matrix.values[i][j])),
    rowOrder,
    colOrder,
    rowTree,
    colTree,
    rowGroups: rowGroups ? rowOrder.map(i => rowGroups[i]) : undefined,
    colGroups: colGroups ? colOrder.map(i => colGroups[i]) : undefined,
  }
}

export function clusterMatrix(
  matrix: HeatmapMatrix,
  clusterRows: boolean,
  clusterCols: boolean,
  metric: DistanceMetric,
  rowCutGroups: number | null = null,
  colCutGroups: number | null = null
): ReorderedMatrix {
  const rowVectors = matrix.values.map(row => row.map(safeNumber))
  const colVectors = transpose(matrix.values).map(col => col.map(safeNumber))

  const rowTree = clusterRows ? buildTree(rowVectors, "row", metric) : undefined
  const colTree = clusterCols ? buildTree(colVectors, "col", metric) : undefined

  const rowOrder = clusterRows
    ? leafOrder(rowTree)
    : matrix.rowLabels.map((_, i) => i)

  const colOrder = clusterCols
    ? leafOrder(colTree)
    : matrix.colLabels.map((_, i) => i)

  const rowGroups = clusterRows ? labelCutGroups(rowTree, matrix.rowLabels.length, rowCutGroups) : undefined
  const colGroups = clusterCols ? labelCutGroups(colTree, matrix.colLabels.length, colCutGroups) : undefined

  return reorderMatrix(matrix, rowOrder, colOrder, rowTree, colTree, rowGroups, colGroups)
}