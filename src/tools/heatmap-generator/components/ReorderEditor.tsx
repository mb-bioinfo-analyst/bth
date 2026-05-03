import { useState } from "react"

type Props = {
  title: string
  labels: string[]
  onChange: (next: string[]) => void
  onReset: () => void
}

export default function ReorderEditor({
  title,
  labels,
  onChange,
  onReset,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  function moveItem(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= labels.length || to >= labels.length) {
      return
    }

    const next = [...labels]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>

        <button
          onClick={onReset}
          className="rounded border px-3 py-2 text-xs"
        >
          Reset
        </button>
      </div>

      <div className="text-xs text-slate-500">
        Drag items to reorder them. This order will be applied when the corresponding order mode is set to <strong>Drag editor</strong>.
      </div>

      <div className="max-h-80 overflow-auto rounded border">
        <ul className="divide-y">
          {labels.map((label, index) => (
            <li
              key={`${label}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) {
                  moveItem(dragIndex, index)
                }
                setDragIndex(null)
              }}
              onDragEnd={() => setDragIndex(null)}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm cursor-move hover:bg-slate-50"
            >
              <span className="truncate">{label}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveItem(index, index - 1)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  ↑
                </button>

                <button
                  onClick={() => moveItem(index, index + 1)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}