import { useRef, useState } from "react"
import { Upload, Trash2, FileText } from "lucide-react"

interface SequenceInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  onLoadExample?: () => void

  fileLabel?: string
  accept?: string
  placeholder?: string

  height?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB per file
const MAX_TOTAL_SIZE = 15 * 1024 * 1024 // 15 MB total
const MAX_BASES = 2_000_000 // 2 million bases
const MAX_SEQUENCES = 1000

const MAX_FILE_MB = 10
const MAX_TOTAL_MB = 15

const ALLOWED_EXTENSIONS = [
  ".fasta", ".fa", ".fna", ".faa",
  ".txt",
  ".gb", ".gbff",
  ".embl",
  ".phy", ".phylip",
  ".nex", ".nexus"
]

function isValidFileType(file: File): boolean {
  const name = file.name.toLowerCase()
  return ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))
}


function looksLikeSequenceFile(text: string): boolean {
  const sample = text.slice(0, 2000)

  return (
    sample.startsWith(">") ||                // FASTA
    sample.includes("LOCUS") ||              // GenBank
    sample.includes("ORIGIN") ||
    sample.includes("SQ") ||                 // EMBL
    sample.toUpperCase().includes("#NEXUS") ||
    /^\s*\d+\s+\d+/.test(sample) ||          // PHYLIP
    /^[ACGTUN\s]+$/i.test(sample) ||         // DNA
    /^[ABCDEFGHIKLMNPQRSTVWXYZ\*\-\s]+$/i.test(sample) // protein
  )
}


function getBaseCount(text: string) {
  return text.replace(/^>.*$/gm, "").replace(/\s/g, "").length
}

function getSequenceCount(text: string) {
  const matches = text.match(/^>/gm)
  return matches ? matches.length : text.trim() ? 1 : 0
}

export default function SequenceInput({
  value,
  onChange,
  label = "Input Sequence",
  onLoadExample,

  fileLabel = `Drag & drop FASTA / TXT / GB files (max ${MAX_FILE_MB}MB per file)`,
  accept=".fasta,.fa,.fna,.faa,.txt,.gb,.gbff,.embl,.phy,.phylip,.nex,.nexus",
  placeholder = `Paste sequences or FASTA data...
Max: ${MAX_SEQUENCES} sequences | ${MAX_BASES.toLocaleString()} bases`,

  height = "h-64"
}: SequenceInputProps) {

  const fileRef = useRef<HTMLInputElement>(null)

  const [dragging, setDragging] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [fileSize, setFileSize] = useState<number>(0)

  const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB streaming

  async function readFileStream(file: File) {

    let offset = 0
    let text = ""

    while (offset < file.size) {

      const blob = file.slice(offset, offset + CHUNK_SIZE)
      const chunk = await blob.text()

      text += chunk

      offset += CHUNK_SIZE

      await new Promise(r => setTimeout(r, 0)) // keep UI responsive

    }

    return text

  }

  async function readFiles(files: FileList) {

  let combined = value || ""
  const names: string[] = []
  let totalSize = fileSize

  for (const file of Array.from(files)) {

    //  EXTENSION CHECK
    if (!isValidFileType(file)) {
      alert(`❌ ${file.name} is not a supported format`)
      continue
    }

    //  FILE SIZE
    if (file.size > MAX_FILE_SIZE) {
      alert(`❌ ${file.name} exceeds ${MAX_FILE_MB}MB limit`)
      continue
    }

    //  TOTAL SIZE
    if (totalSize + file.size > MAX_TOTAL_SIZE) {
      alert(`❌ Total input exceeds ${MAX_TOTAL_MB}MB limit`)
      break
    }

    //  READ FILE
    const raw = await readFileStream(file)

    //  CONTENT VALIDATION (VERY IMPORTANT)
    if (!looksLikeSequenceFile(raw)) {
      alert(`❌ ${file.name} is not a valid sequence file`)
      continue
    }

    // 🔬 CONVERT
    const converted = detectAndConvertToFasta(raw, file.name)

    const newCombined = combined + "\n" + converted

    //  BASE LIMIT
    const baseCount = getBaseCount(newCombined)
    if (baseCount > MAX_BASES) {
      alert("❌ Sequence too large (>2 million bases)")
      break
    }

    //  SEQUENCE LIMIT
    const seqCount = getSequenceCount(newCombined)
    if (seqCount > MAX_SEQUENCES) {
      alert("❌ Too many sequences (>1000)")
      break
    }

    combined = newCombined
    names.push(file.name)
    totalSize += file.size
  }

  onChange(combined)
  setFileNames(names)
  setFileSize(totalSize)
}

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {

    const files = e.target.files

    if (!files) return

    readFiles(files)

  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {

    e.preventDefault()

    setDragging(false)

    const files = e.dataTransfer.files

    if (files) readFiles(files)

  }

  function clearInput() {

    onChange("")

    setFileNames([])

    setFileSize(0)

  }

  function countSequences(text: string) {

    const matches = text.match(/^>/gm)

    return matches ? matches.length : text.trim() ? 1 : 0

  }

  const seqCount = countSequences(value)

  const baseCount = value
    .replace(/^>.*$/gm, "")
    .replace(/\s/g, "").length

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-3">

        <h2 className="font-semibold text-lg">{label}</h2>

        <div className="flex gap-3">

          {onLoadExample && (
            <button
              aria-label="Load example sequence"
              onClick={onLoadExample}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Load Example
            </button>
          )}

          {value && (
            <button
              aria-label="Clear sequence input"
              onClick={clearInput}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}

        </div>

      </div>

      {/* DRAG DROP */}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`mb-4 flex items-center justify-between rounded-lg border border-dashed p-3 text-sm transition
        ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
      >

        <div className="flex items-center gap-2 text-gray-600">

          <FileText className="w-4 h-4" />

          <span>
            {fileLabel}
          </span>

        </div>

        <button
          aria-label="Upload example sequence"

          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded border px-3 py-1 hover:bg-gray-100"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleUpload}
          className="hidden"
        />

      </div>

      <div className="text-xs text-gray-500 mt-1">
        Limits: {MAX_FILE_MB}MB/file • {MAX_TOTAL_MB}MB total • {MAX_SEQUENCES} sequences • {MAX_BASES.toLocaleString()} bases
      </div>
      <div className="text-xs text-amber-600 mt-1">
        Large inputs may slow down your browser
      </div>

      {/* FILE INFO */}

      {fileNames.length > 0 && (

        <div className="mb-3 text-xs text-gray-600">

          <div>
            Files: {fileNames.join(", ")}
          </div>

          <div>
            Size: {(fileSize / 1024 / 1024).toFixed(2)} MB
          </div>

        </div>

      )}

      {/* TEXTAREA */}

      <textarea
        value={value}
        // onChange={(e) => onChange(e.target.value)}
        onChange={(e) => {
          const newValue = e.target.value

          if (newValue.length > MAX_TOTAL_SIZE) {
            alert("❌ Input too large")
            return
          }

          if (getBaseCount(newValue) > MAX_BASES) {
            alert("❌ Too many bases")
            return
          }

          if (getSequenceCount(newValue) > MAX_SEQUENCES) {
            alert("❌ Too many sequences")
            return
          }

          onChange(newValue)
        }}
        placeholder={placeholder}
        className={`w-full ${height} p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
      />

      {/* FOOTER STATS */}

      <div className="flex justify-between text-xs text-gray-500 mt-2">

        <span>
          Sequences: {seqCount.toLocaleString()}
        </span>

        <span>
          Bases: {baseCount.toLocaleString()}
        </span>

      </div>

    </div>

  )

}

function detectAndConvertToFasta(text: string, fileName?: string): string {

  const trimmed = text.trim()

  // ✅ Already FASTA
  if (trimmed.startsWith(">")) {
    return text
  }

  // ✅ GENBANK FORMAT
  if (trimmed.includes("ORIGIN") && trimmed.includes("//")) {

    const entries = trimmed.split("//")
    let fastaOutput = ""

    for (const entry of entries) {

      const locusMatch = entry.match(/LOCUS\s+(\S+)/)
      const definitionMatch = entry.match(/DEFINITION\s+(.+)/)

      const header =
        (locusMatch?.[1] || definitionMatch?.[1] || fileName || "sequence")
          .replace(/\s+/g, "_")

      const originMatch = entry.match(/ORIGIN([\s\S]*)/)

      if (!originMatch) continue

      const seq = originMatch[1]
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()

      if (seq.length > 0) {
        fastaOutput += `>${header}\n${seq}\n`
      }

    }

    return fastaOutput || text
  }

  //  Plain sequence (no header)
  const clean = trimmed.replace(/\s/g, "")

  if (/^[ACGTUNacgtun]+$/.test(clean)) {
    return `>${fileName || "sequence"}\n${clean.toUpperCase()}`
  }

  // fallback
  return text
}


// function detectAndConvertToFasta(text: string, fileName?: string): string {

//   const trimmed = text.trim()

//   // =========================
//   // 1. FASTA
//   // =========================
//   if (trimmed.startsWith(">")) {
//     return trimmed
//       .split("\n")
//       .map(line => line.startsWith(">")
//         ? line.trim()
//         : line.replace(/[^A-Za-z*\-]/g, "").toUpperCase()
//       )
//       .join("\n")
//   }

//   // =========================
//   // 2. GENBANK
//   // =========================
//   if (/^LOCUS\s+/m.test(trimmed) && trimmed.includes("ORIGIN")) {

//     const entries = trimmed.split(/\n\/\/\s*/)
//     let out = ""

//     for (const entry of entries) {

//       const header =
//         entry.match(/ACCESSION\s+(\S+)/)?.[1] ||
//         entry.match(/LOCUS\s+(\S+)/)?.[1] ||
//         fileName ||
//         "sequence"

//       const seq = entry.match(/ORIGIN([\s\S]*)/)?.[1]
//         ?.replace(/[^a-zA-Z]/g, "")
//         .toUpperCase()

//       if (seq) out += `>${header}\n${seq}\n`
//     }

//     return out || text
//   }

//   // =========================
//   // 3. EMBL
//   // =========================
//   if (/^ID\s+/m.test(trimmed) && trimmed.includes("SQ")) {

//     const entries = trimmed.split(/\n\/\/\s*/)
//     let out = ""

//     for (const entry of entries) {

//       const header =
//         entry.match(/^ID\s+(\S+)/m)?.[1] ||
//         entry.match(/^AC\s+(\S+)/m)?.[1] ||
//         fileName ||
//         "sequence"

//       const seq = entry.match(/SQ[\s\S]*?\n([\s\S]*)/)?.[1]
//         ?.replace(/[^a-zA-Z]/g, "")
//         .toUpperCase()

//       if (seq) out += `>${header}\n${seq}\n`
//     }

//     return out || text
//   }

//   // =========================
//   // 4. PHYLIP
//   // =========================
//   if (/^\s*\d+\s+\d+/.test(trimmed)) {

//     const lines = trimmed.split("\n").slice(1)
//     let out = ""

//     for (const line of lines) {

//       const parts = line.trim().split(/\s+/)

//       if (parts.length < 2) continue

//       const name = parts[0]
//       const seq = parts.slice(1).join("").replace(/[^A-Za-z\-]/g, "").toUpperCase()

//       if (seq) out += `>${name}\n${seq}\n`
//     }

//     return out || text
//   }

//   // =========================
//   // 5. NEXUS
//   // =========================
//   if (trimmed.toUpperCase().startsWith("#NEXUS")) {

//     const matrixMatch = trimmed.match(/MATRIX([\s\S]*?);/i)

//     if (matrixMatch) {

//       const lines = matrixMatch[1].trim().split("\n")
//       let out = ""

//       for (const line of lines) {

//         const parts = line.trim().split(/\s+/)

//         if (parts.length < 2) continue

//         const name = parts[0]
//         const seq = parts.slice(1).join("").replace(/[^A-Za-z\-]/g, "").toUpperCase()

//         if (seq) out += `>${name}\n${seq}\n`
//       }

//       return out || text
//     }
//   }

//   // =========================
//   // 6. RAW DNA / RNA
//   // =========================
//   const clean = trimmed.replace(/\s/g, "")

//   if (/^[ACGTUNacgtun]+$/.test(clean)) {
//     return `>${fileName || "sequence"}\n${clean.toUpperCase()}`
//   }

//   // =========================
//   // 7. PROTEIN
//   // =========================
//   if (/^[ABCDEFGHIKLMNPQRSTVWXYZ\*\-]+$/i.test(clean)) {
//     return `>${fileName || "protein"}\n${clean.toUpperCase()}`
//   }

//   // fallback
//   return text
// }