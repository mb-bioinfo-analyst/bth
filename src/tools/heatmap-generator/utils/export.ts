import { HeatmapMatrix } from "../types"

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportMatrixAsCsv(matrix: HeatmapMatrix, filename: string) {
  const header = ["Label", ...matrix.colLabels].join(",")
  const rows = matrix.values.map((row, i) => {
    const values = row.map(v => (v === null ? "" : String(v)))
    return [matrix.rowLabels[i], ...values].join(",")
  })

  const csv = [header, ...rows].join("\n")
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename)
}

function cloneForExport(svgElement: SVGSVGElement) {
  const clone = svgElement.cloneNode(true) as SVGSVGElement

  const exportWidth = Number(svgElement.getAttribute("data-export-width")) || 1800
  const exportHeight = Number(svgElement.getAttribute("data-export-height")) || 1200
  const viewBox = svgElement.getAttribute("viewBox")

  clone.setAttribute("width", String(exportWidth))
  clone.setAttribute("height", String(exportHeight))

  if (viewBox) {
    clone.setAttribute("viewBox", viewBox)
  }

  clone.removeAttribute("class")
  clone.style.width = ""
  clone.style.height = ""

  return { clone, exportWidth, exportHeight }
}

export function exportSvg(svgElement: SVGSVGElement, filename: string) {
  const { clone } = cloneForExport(svgElement)
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(clone)
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
  downloadBlob(blob, filename)
}

export async function exportPng(
  svgElement: SVGSVGElement,
  filename: string,
  scale: number = 2
) {
  const { clone, exportWidth, exportHeight } = cloneForExport(svgElement)

  const serializer = new XMLSerializer()
  const svgText = serializer.serializeToString(clone)
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.decoding = "async"

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error("Failed to render SVG for PNG export."))
    img.src = url
  })

  const exportScale = Math.max(1, Math.min(4, scale))

  const canvas = document.createElement("canvas")
  canvas.width = Math.round(exportWidth * exportScale)
  canvas.height = Math.round(exportHeight * exportScale)

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    URL.revokeObjectURL(url)
    throw new Error("Could not create canvas context for PNG export.")
  }

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.scale(exportScale, exportScale)
  ctx.drawImage(img, 0, 0, exportWidth, exportHeight)

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error("Failed to generate PNG file."))
        return
      }
      downloadBlob(blob, filename)
      resolve()
    }, "image/png")
  })

  URL.revokeObjectURL(url)
}