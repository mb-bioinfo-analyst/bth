import React from "react"

type CodonStat = {
  codon: string
  aminoAcid: string
  rscu: number
}

const getColor = (value: number) => {
  if (value === 0) return "#f1f5f9"
  if (value < 0.5) return "#fee2e2"
  if (value < 1) return "#fecaca"
  if (value < 1.5) return "#c7d2fe"
  return "#6366f1"
}

export default function CodonHeatmap({ data }: { data: CodonStat[] }) {

  const grouped: Record<string, CodonStat[]> = {}

  data.forEach((d) => {
    if (!grouped[d.aminoAcid]) grouped[d.aminoAcid] = []
    grouped[d.aminoAcid].push(d)
  })

  const aminoAcids = Object.keys(grouped).sort()

  return (
    <div className="overflow-x-auto">

      <div className="inline-block border rounded-lg overflow-hidden">

        {aminoAcids.map((aa) => (

          <div key={aa} className="flex border-b">

            <div className="w-16 flex items-center justify-center text-xs font-semibold bg-gray-50 border-r">
              {aa}
            </div>

            {grouped[aa]
              .sort((a, b) => a.codon.localeCompare(b.codon))
              .map((codon) => (

                <div
                  key={codon.codon}
                  className="w-14 h-14 flex flex-col items-center justify-center text-xs border-r"
                  style={{
                    background: getColor(codon.rscu)
                  }}
                >
                  <div className="font-mono">{codon.codon}</div>
                  <div>{codon.rscu.toFixed(2)}</div>
                </div>

              ))}

          </div>

        ))}

      </div>

    </div>
  )
}