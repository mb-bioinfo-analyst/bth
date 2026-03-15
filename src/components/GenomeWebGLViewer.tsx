import { useRef, useEffect, useState } from "react"
import { GenomeFeature } from "../utils/genomeUtils"




interface Props {
    features: GenomeFeature[]
    chromosome: string
    regionStart: number
    regionEnd: number
    alignments?: any[]
}

export default function GenomeWebGLViewer({
    features,
    chromosome,
    regionStart,
    regionEnd,
    alignments = []
}: Props) {



    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState(0)

    const [dragging, setDragging] = useState(false)
    const [dragStart, setDragStart] = useState(0)



    const scale = (pos: number, width: number) =>
        ((pos - regionStart) / (regionEnd - regionStart)) * width * zoom - offset

    useEffect(() => {

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const width = canvas.clientWidth
        canvas.width = width
        canvas.height = 300

        ctx.clearRect(0, 0, width, 300)

        drawRuler(ctx, width)

        const tracks: Record<string, number> = {}

        // DRAW FEATURES
        features.forEach(f => {

            if (f.seqid !== chromosome) return

            if (!(f.type in tracks))
                tracks[f.type] = Object.keys(tracks).length

            const track = tracks[f.type]

            const y = 60 + track * 40

            const x = scale(f.start, width)
            const w = scale(f.end, width) - x

            drawFeature(ctx, f, x, y, w)

        })

        // DRAW BAM READS
        if (alignments && alignments.length > 0) {

            alignments.forEach(a => {

                if (a.chr !== chromosome) return

                const x = scale(a.start, width)
                const w = scale(a.end, width) - x

                ctx.fillStyle = "#f59e0b"

                ctx.fillRect(x, 220, Math.max(w, 3), 8)

            })

        }

    }, [features, zoom, offset, chromosome, alignments])

    function drawRuler(ctx: CanvasRenderingContext2D, width: number) {

        ctx.strokeStyle = "#888"
        ctx.beginPath()
        ctx.moveTo(0, 40)
        ctx.lineTo(width, 40)
        ctx.stroke()

        const step = Math.floor((regionEnd - regionStart) / 10)

        for (let i = 0; i <= 10; i++) {

            const pos = regionStart + i * step

            const x = scale(pos, width)

            ctx.beginPath()
            ctx.moveTo(x, 35)
            ctx.lineTo(x, 45)
            ctx.stroke()

            ctx.fillText(pos.toLocaleString(), x - 20, 30)

        }

    }

    function drawFeature(
        ctx: CanvasRenderingContext2D,
        f: GenomeFeature,
        x: number,
        y: number,
        w: number
    ) {

        if (f.type === "SNP") {

            ctx.fillStyle = "#ef4444"

            ctx.beginPath()
            ctx.arc(x, y + 7, 3, 0, Math.PI * 2)
            ctx.fill()

            return
        }

        // gene line (intron backbone)
        if (f.type === "gene") {

            ctx.strokeStyle = "#2563eb"

            ctx.beginPath()
            ctx.moveTo(x, y + 7)
            ctx.lineTo(x + w, y + 7)
            ctx.stroke()

            if (f.strand) drawArrow(ctx, f.strand, x, y, w)

            return
        }

        // exon block
        if (f.type === "exon") {

            ctx.fillStyle = "#10b981"

            ctx.fillRect(x, y, Math.max(w, 4), 14)

            return
        }

        // default feature
        ctx.fillStyle = "#3b82f6"

        ctx.fillRect(x, y, Math.max(w, 4), 14)

    }

    function drawArrow(
        ctx: CanvasRenderingContext2D,
        strand: string,
        x: number,
        y: number,
        w: number
    ) {

        const arrowSpacing = 12
        const dir = strand === "+" ? 1 : -1


        ctx.strokeStyle = "#111"

        for (let i = 0; i < w; i += arrowSpacing) {

            const ax = dir === 1 ? x + i : x + w - i

            ctx.beginPath()

            ctx.moveTo(ax, y + 7)
            ctx.lineTo(ax + dir * 6, y + 7)

            ctx.stroke()

        }

    }

    //   function wheelZoom(e:React.WheelEvent){

    //     e.preventDefault()

    //     const factor = e.deltaY < 0 ? 1.2 : 0.8

    //     setZoom(z=>z*factor)

    //   }

    function startDrag(e: React.MouseEvent) {

        setDragging(true)
        setDragStart(e.clientX)

    }

    function stopDrag() {

        setDragging(false)

    }

    function drag(e: React.MouseEvent) {

        if (!dragging) return

        const dx = e.clientX - dragStart

        setOffset((o: number) => o - dx)

        setDragStart(e.clientX)

    }

    function exportSVG() {

        const width = 1000
        const height = 300

        const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="white"/>
    <text x="20" y="30" font-size="16">Genome Browser Export</text>
  </svg>
  `

        const blob = new Blob([svg], { type: "image/svg+xml" })

        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")

        link.href = url
        link.download = "genome_view.svg"

        link.click()

    }

    return (

        <div>

            <canvas
                ref={canvasRef}
                className="w-full border rounded bg-white cursor-grab"
                onMouseDown={startDrag}
                onMouseMove={drag}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
            />

            {/* Navigation Controls */}

            <div className="flex gap-3 mt-3 flex-wrap">

                <button
                aria-label="Zoom in genome viewer"
                    onClick={() => setZoom((z: number) => z * 1.5)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Zoom In
                </button>

                <button
                aria-label="Zoom out genome viewer"
                    onClick={() => setZoom((z: number) => z / 1.5)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Zoom Out
                </button>

                <button
                aria-label="Pan left genome viewer"
                    onClick={() => setOffset((o: number) => o - 200)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    ← Pan
                </button>

                <button
                aria-label="Pan right genome viewer"
                    onClick={() => setOffset((o: number) => o + 200)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Pan →
                </button>

                <button
                aria-label="Export PNG"
                    onClick={() => {

                        const canvas = canvasRef.current
                        if (!canvas) return

                        const link = document.createElement("a")

                        link.download = "genome_view.png"
                        link.href = canvas.toDataURL()

                        link.click()

                    }}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Export PNG
                </button>

                <button
                aria-label="Export SVG"
                    onClick={exportSVG}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Export SVG
                </button>

            </div>

        </div>

    )

}