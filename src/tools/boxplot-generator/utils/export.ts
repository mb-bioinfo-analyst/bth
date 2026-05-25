export function exportSvg(svg: SVGSVGElement, filename: string) {
  const cloned = svg.cloneNode(true) as SVGSVGElement

  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg")

  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(cloned)

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export async function exportPng(
  svg: SVGSVGElement,
  filename: string,
  scale = 2
) {
  const cloned = svg.cloneNode(true) as SVGSVGElement

  const viewBox = cloned.getAttribute("viewBox")
  const viewBoxParts = viewBox?.split(/\s+/).map(Number)

  const width =
    Number(cloned.getAttribute("data-export-width")) ||
    Number(cloned.getAttribute("width")) ||
    viewBoxParts?.[2] ||
    1200

  const height =
    Number(cloned.getAttribute("data-export-height")) ||
    Number(cloned.getAttribute("height")) ||
    viewBoxParts?.[3] ||
    800

  cloned.setAttribute("width", String(width))
  cloned.setAttribute("height", String(height))
  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg")

  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(cloned)
  const svgBlob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  })

  const url = URL.createObjectURL(svgBlob)

  await new Promise<void>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = width * scale
      canvas.height = height * scale

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error("Could not create canvas context."))
        return
      }

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)

        if (!blob) {
          reject(new Error("Could not export PNG."))
          return
        }

        const pngUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")

        link.href = pngUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(pngUrl)
        resolve()
      }, "image/png")
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not load SVG for PNG export."))
    }

    image.src = url
  })
}

export function exportSummaryCsv(rows: Record<string, string | number>[], filename: string) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])

  const csv = [
    headers.join(","),
    ...rows.map(row =>
      headers
        .map(header => {
          const value = String(row[header] ?? "")
          return `"${value.replace(/"/g, '""')}"`
        })
        .join(",")
    ),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}