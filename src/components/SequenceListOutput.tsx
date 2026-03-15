import { Copy, Download } from "lucide-react"

interface SequenceItem {
  header?: string
  sequence: string
  meta?: string
}

interface SequenceListOutputProps {
  items: SequenceItem[]
  title?: string
  placeholder?: string
  onCopy?: () => void
  onDownload?: () => void
}



export default function SequenceListOutput({
  items,
  title = "Results",
  placeholder = "Results will appear here...",
  onCopy,
  onDownload
}: SequenceListOutputProps) {

  

  return (

    <div className="p-6 bg-gray-50 flex flex-col h-full">

      {/* Header */}

      <div className="flex justify-between items-center mb-3">

        <h2 className="font-semibold text-lg">
          {title}
        </h2>

        <div className="flex gap-2">

          {onCopy && (
            <button
            aria-label= "Copy sequence"
              onClick={onCopy}
              disabled={!items.length}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-40"
            >
              <Copy className="w-5 h-5"/>
            </button>
          )}

          {onDownload && (
            <button
            aria-label= "Download sequence"
              onClick={onDownload}
              disabled={!items.length}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-40"
            >
              <Download className="w-5 h-5"/>
            </button>
          )}

        </div>

      </div>

      {/* Results */}

      <div className="min-h-[300px] max-h-[450px] overflow-y-auto bg-white border border-gray-300 rounded-lg p-4 font-mono text-sm">

        {items.length === 0 && (
          <p className="text-gray-500">
            {placeholder}
          </p>
        )}

        {items.map((item, i) => (

          <div key={i} className="mb-4 border-b pb-2">

            {item.header && (
              <div className="font-semibold">
                {item.header}
              </div>
            )}

            {item.meta && (
              <div className="text-gray-500 text-xs mb-1">
                {item.meta}
              </div>
            )}

            <div className="break-all">
              {item.sequence}
            </div>

          </div>

        ))}

      </div>

      {/* Footer */}

      {items.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {items.length} sequence(s)
        </div>
      )}

    </div>

  )

}