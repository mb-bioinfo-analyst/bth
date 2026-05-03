import { ClusterNode } from "../types"

function collectLeaves(node: ClusterNode | undefined): number[] {
  if (!node) return []

  if (!node.left && !node.right) {
    return [node.indices[0]]
  }

  return [
    ...collectLeaves(node.left),
    ...collectLeaves(node.right),
  ]
}

function maxHeight(node: ClusterNode | undefined): number {
  if (!node) return 0

  return Math.max(
    node.height,
    maxHeight(node.left),
    maxHeight(node.right)
  )
}

function rowNodeY(
  node: ClusterNode,
  leafPosition: Map<number, number>,
  cellSize: number
): number {
  if (!node.left && !node.right) {
    const index = node.indices[0]
    return (leafPosition.get(index) ?? 0) * cellSize + cellSize / 2
  }

  const leftY = node.left ? rowNodeY(node.left, leafPosition, cellSize) : 0
  const rightY = node.right ? rowNodeY(node.right, leafPosition, cellSize) : 0

  return (leftY + rightY) / 2
}

function colNodeX(
  node: ClusterNode,
  leafPosition: Map<number, number>,
  cellSize: number
): number {
  if (!node.left && !node.right) {
    const index = node.indices[0]
    return (leafPosition.get(index) ?? 0) * cellSize + cellSize / 2
  }

  const leftX = node.left ? colNodeX(node.left, leafPosition, cellSize) : 0
  const rightX = node.right ? colNodeX(node.right, leafPosition, cellSize) : 0

  return (leftX + rightX) / 2
}

function scaleHeight(height: number, max: number, size: number): number {
  if (max <= 0) return 0
  return (height / max) * size
}

function buildRowPath(
  node: ClusterNode,
  leafPosition: Map<number, number>,
  cellSize: number,
  dendrogramSize: number,
  treeMaxHeight: number
): string {
  if (!node.left || !node.right) return ""

  const nodeX =
    dendrogramSize -
    scaleHeight(node.height, treeMaxHeight, dendrogramSize)

  const leftX =
    node.left.left || node.left.right
      ? dendrogramSize -
        scaleHeight(node.left.height, treeMaxHeight, dendrogramSize)
      : dendrogramSize

  const rightX =
    node.right.left || node.right.right
      ? dendrogramSize -
        scaleHeight(node.right.height, treeMaxHeight, dendrogramSize)
      : dendrogramSize

  const leftY = rowNodeY(node.left, leafPosition, cellSize)
  const rightY = rowNodeY(node.right, leafPosition, cellSize)

  const current = [
    `M ${leftX} ${leftY}`,
    `H ${nodeX}`,
    `V ${rightY}`,
    `H ${rightX}`,
  ].join(" ")

  return [
    current,
    buildRowPath(node.left, leafPosition, cellSize, dendrogramSize, treeMaxHeight),
    buildRowPath(node.right, leafPosition, cellSize, dendrogramSize, treeMaxHeight),
  ]
    .filter(Boolean)
    .join(" ")
}

function buildColPath(
  node: ClusterNode,
  leafPosition: Map<number, number>,
  cellSize: number,
  dendrogramSize: number,
  treeMaxHeight: number
): string {
  if (!node.left || !node.right) return ""

  const nodeY =
    dendrogramSize -
    scaleHeight(node.height, treeMaxHeight, dendrogramSize)

  const leftY =
    node.left.left || node.left.right
      ? dendrogramSize -
        scaleHeight(node.left.height, treeMaxHeight, dendrogramSize)
      : dendrogramSize

  const rightY =
    node.right.left || node.right.right
      ? dendrogramSize -
        scaleHeight(node.right.height, treeMaxHeight, dendrogramSize)
      : dendrogramSize

  const leftX = colNodeX(node.left, leafPosition, cellSize)
  const rightX = colNodeX(node.right, leafPosition, cellSize)

  const current = [
    `M ${leftX} ${leftY}`,
    `V ${nodeY}`,
    `H ${rightX}`,
    `V ${rightY}`,
  ].join(" ")

  return [
    current,
    buildColPath(node.left, leafPosition, cellSize, dendrogramSize, treeMaxHeight),
    buildColPath(node.right, leafPosition, cellSize, dendrogramSize, treeMaxHeight),
  ]
    .filter(Boolean)
    .join(" ")
}

export function rowDendrogramPath(
  tree: ClusterNode | undefined,
  leafCount: number,
  cellSize: number,
  dendrogramSize: number
): string {
  if (!tree || leafCount <= 1) return ""

  const leaves = collectLeaves(tree)
  const leafPosition = new Map<number, number>()

  leaves.forEach((leafIndex, position) => {
    leafPosition.set(leafIndex, position)
  })

  return buildRowPath(
    tree,
    leafPosition,
    cellSize,
    dendrogramSize,
    Math.max(maxHeight(tree), 1)
  )
}

export function colDendrogramPath(
  tree: ClusterNode | undefined,
  leafCount: number,
  cellSize: number,
  dendrogramSize: number
): string {
  if (!tree || leafCount <= 1) return ""

  const leaves = collectLeaves(tree)
  const leafPosition = new Map<number, number>()

  leaves.forEach((leafIndex, position) => {
    leafPosition.set(leafIndex, position)
  })

  return buildColPath(
    tree,
    leafPosition,
    cellSize,
    dendrogramSize,
    Math.max(maxHeight(tree), 1)
  )
}