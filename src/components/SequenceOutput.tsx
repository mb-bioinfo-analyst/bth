import { Copy, Download } from "lucide-react";

interface SequenceOutputProps {
  value: string;
  title?: string;
  onCopy?: () => void;
  onDownload?: () => void;
}

export default function SequenceOutput({
  value,
  title = "Output",
  onCopy,
  onDownload,
}: SequenceOutputProps) {
  return (
    <div className="p-6 bg-gray-50 flex flex-col h-full">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">{title}</h2>

        <div className="flex gap-2">
          {onCopy && (
            <button
            aria-label= "Copy sequence"
              onClick={onCopy}
              disabled={!value}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy to clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
          )}

          {onDownload && (
            <button
            aria-label= "Download sequence"
              onClick={onDownload}
              disabled={!value}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Output area */}
      <textarea
        value={value}
        readOnly
        placeholder="Result will appear here..."
        className="flex-1 w-full min-h-[300px] p-4 font-mono text-sm border border-gray-300 rounded-lg bg-white resize-none"
      />

      {/* Footer */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>
          Characters: {value.length.toLocaleString()}
        </span>

        <span>
          Ready for copy or download
        </span>
      </div>

    </div>
  );
}