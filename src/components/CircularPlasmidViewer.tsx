// src/components/CircularPlasmidViewer.tsx
import React, { useRef } from "react"




interface PlasmidCutSite {
  enzyme: string
  position: number
}

interface PlasmidAnnotation {
  label: string
  start: number
  end: number
  color?: string
}

interface CircularPlasmidViewerProps {
  length: number
  sites: PlasmidCutSite[]
  annotations?: PlasmidAnnotation[]
}




export default function CircularPlasmidViewer({
  length,
  sites
}: CircularPlasmidViewerProps) {
  if (!length || sites.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        No circular restriction map available
      </div>
    )
  }
  const svgRef = useRef<SVGSVGElement>(null)
  const size = 320
  const center = size / 2
  const radius = 110

  const polarToCartesian = (angleDeg: number, r: number) => {
    const angle = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    }
  }

  const annotations = [
    { label: "MCS", start: 10, end: 80, color: "#10b981" },
    { label: "ori", start: 300, end: 900, color: "#f59e0b" },
    { label: "AmpR", start: 1200, end: 2100, color: "#8b5cf6" }
  ]


  const downloadSVG = () => {

  if (!svgRef.current) return

  const svg = svgRef.current
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svg)

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "restriction_map.svg"

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)

}

const downloadPNG = () => {

  if (!svgRef.current) return

  const svg = svgRef.current
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svg)

  const img = new Image()
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  img.onload = () => {

    const canvas = document.createElement("canvas")
    canvas.width = svg.clientWidth * 2
    canvas.height = svg.clientHeight * 2

    const ctx = canvas.getContext("2d")

    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

    const png = canvas.toDataURL("image/png")

    const a = document.createElement("a")
    a.href = png
    a.download = "restriction_map.png"
    a.click()

    URL.revokeObjectURL(url)

  }

  img.src = url

}

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* Download buttons */}
    <div className="flex justify-end gap-2 mb-4">

      <button
      aria-label="Download plasmid map as SVG image"

        onClick={downloadSVG}
        className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
      >
        Download SVG
      </button>

      <button
      aria-label="Download plasmid map as PNG image"

        onClick={downloadPNG}
        className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
      >
        Download PNG
      </button>

    </div>
{/* PLASMID MAP */}
      <div className="flex justify-center overflow-x-auto">
       

          <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>

            {/* plasmid backbone */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="8"
            />

            {/* annotations */}
            {(annotations || []).map((ann, index) => {

              const startAngle = (ann.start / length) * 360
              const endAngle = (ann.end / length) * 360

              const start = polarToCartesian(startAngle, radius - 18)
              const end = polarToCartesian(endAngle, radius - 18)

              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

              const d = [
                `M ${start.x} ${start.y}`,
                `A ${radius - 18} ${radius - 18} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
              ].join(" ")

              return (
                <path
                  key={`${ann.label}-${index}`}
                  d={d}
                  fill="none"
                  stroke={ann.color || "#10b981"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.85"
                >
                  <title>
                    {ann.label} ({ann.start}–{ann.end} bp)
                  </title>
                </path>
              )

            })}

            {/* restriction sites */}
            {sites.map((site, index) => {

              const angle = (site.position / length) * 360

              const inner = polarToCartesian(angle, radius - 8)
              const outer = polarToCartesian(angle, radius + 12)
              const label = polarToCartesian(angle, radius + 28)

              return (

                <g key={`${site.enzyme}-${site.position}-${index}`}>

                  <line
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#ef4444"
                    strokeWidth="2"
                  />

                  <text
                    x={label.x}
                    y={label.y}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#334155"
                  >
                    {site.enzyme}
                  </text>

                </g>

              )

            })}

            {/* center label */}
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill="#0f172a"
            >
              Circular Map
            </text>

            <text
              x={center}
              y={center + 16}
              textAnchor="middle"
              fontSize="12"
              fill="#475569"
            >
              {length} bp
            </text>


          </svg>

        </div>


        {/* LEGEND */}
        <div className="min-w-[160px] space-y-2 text-sm">

          <h4 className="font-semibold text-slate-700">
            Features
          </h4>

          {(annotations || []).map((ann, index) => (

            <div
              key={index}
              className="flex items-center gap-2"
            >

              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: ann.color || "#10b981" }}
              />

              <span className="text-slate-700">
                {ann.label}
              </span>

            </div>

          ))}

        </div>

      </div>

    // </div>
  )
}