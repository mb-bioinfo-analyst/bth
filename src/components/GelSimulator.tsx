// src/components/GelSimulator.tsx

import { useMemo, useRef } from "react"

interface GelLane {
  enzyme: string
  fragments: number[]
}

interface GelSimulatorProps {
  lanes: GelLane[]
  selectedEnzymes: string[]
  onToggleLane: (enzyme: string) => void
}

const DEFAULT_LADDER = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 750, 500, 250, 100, 75, 50, 20, 1]

export default function GelSimulator({
  lanes,
  selectedEnzymes,
  onToggleLane
}: GelSimulatorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  const visibleLanes = useMemo(() => {
    return lanes.filter((lane) => selectedEnzymes.includes(lane.enzyme))
  }, [lanes, selectedEnzymes])

  const allFragments = useMemo(() => {
    return [...DEFAULT_LADDER, ...visibleLanes.flatMap((l) => l.fragments)]
  }, [visibleLanes])

  if (!lanes.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        No digestion patterns available
      </div>
    )
  }

  const maxFragment = Math.max(...allFragments, 100)
  const minFragment = Math.min(...allFragments, 100)

  const getBandY = (size: number) => {
    const maxLog = Math.log10(maxFragment)
    const minLog = Math.log10(minFragment)
    const value = Math.log10(size)
    const normalized = (maxLog - value) / (maxLog - minLog || 1)
    return 40 + normalized * 320
  }

  const exportSvg = () => {
    if (!svgRef.current) return

    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "gel-simulation.svg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }


  const exportPng = async () => {
    if (!svgRef.current) return

    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width || 1200
      canvas.height = img.height || 420

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (!blob) return
        const pngUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = pngUrl
        a.download = "gel-simulation.png"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(pngUrl)
      }, "image/png")

      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  const getBandOpacity = (size: number, fragments: number[]) => {
    const total = fragments.reduce((a, b) => a + b, 0) || 1
    const fraction = size / total
    return Math.min(1, Math.max(0.25, 0.25 + fraction * 2.5))
  }


  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {lanes.map((lane) => {
            const active = selectedEnzymes.includes(lane.enzyme)
            return (
              <button
                key={lane.enzyme}
                type="button"
                aria-label={`Toggle restriction enzyme lane ${lane.enzyme}`}
                aria-pressed={active}
                onClick={() => onToggleLane(lane.enzyme)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                }`}
              >
                {lane.enzyme}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          aria-label="Download gel electrophoresis image as SVG"
          onClick={exportSvg}
          className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-slate-800 hover:bg-gray-300"
        >
          Export Gel Image SVG
        </button>
        <button
          type="button"
           aria-label="Download gel electrophoresis image as PNG"
          onClick={exportPng}
          className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-slate-800 hover:bg-gray-300"
        >
          Export Gel Image PNG
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 overflow-x-auto">
        <svg
          ref={svgRef}
          width={Math.max(220 + (visibleLanes.length + 1) * 90, 520)}
          height={420}
          viewBox={`0 0 ${Math.max(220 + (visibleLanes.length + 1) * 90, 520)} 420`}
        >
          <rect x="0" y="0" width="100%" height="100%" fill="#0f172a" rx="16" />

          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={40}
              x2={Math.max(220 + (visibleLanes.length + 1) * 90, 520) - 20}
              y1={40 + i * 80}
              y2={40 + i * 80}
              stroke="#334155"
              strokeWidth="1"
            />
          ))}

          {/* Ladder lane */}
          <g>
            <text x={70} y={24} textAnchor="middle" fill="#cbd5e1" fontSize="12">
              Ladder
            </text>
            <rect x={50} y={30} width={40} height={340} fill="#020617" stroke="#334155" rx="6" />

            {DEFAULT_LADDER.map((frag, i) => (
              <g key={`ladder-${frag}-${i}`}>
                <line
                  x1={54}
                  x2={86}
                  y1={getBandY(frag)}
                  y2={getBandY(frag)}
                  stroke="#22d3ee"
                  strokeWidth="3"
                />
                <text x={95} y={getBandY(frag) + 4} fill="#94a3b8" fontSize="10">
                  {frag}
                </text>
              </g>
            ))}
          </g>

          {/* Sample lanes */}
          {visibleLanes.map((lane, index) => {
            const laneX = 150 + index * 90

            return (
              <g key={lane.enzyme}>
                <text x={laneX + 20} y={24} textAnchor="middle" fill="#cbd5e1" fontSize="12">
                  {lane.enzyme}
                </text>

                <rect
                  x={laneX}
                  y={30}
                  width={40}
                  height={340}
                  fill="#020617"
                  stroke="#334155"
                  rx="6"
                />

                {lane.fragments.map((frag, i) => (
                  <line
                    key={`${lane.enzyme}-${frag}-${i}`}
                    x1={laneX + 4}
                    x2={laneX + 36}
                    y1={getBandY(frag)}
                    y2={getBandY(frag)}
                    stroke="#22d3ee"
                    strokeWidth="3"
                  />
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}