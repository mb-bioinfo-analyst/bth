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
}

export default function SequenceInput({
  value,
  onChange,
  label = "Input Sequence",
  onLoadExample,

  fileLabel = "Drag & drop FASTA / TXT / GB files",
  accept = ".fasta,.fa,.fna,.faa,.txt,.gb,.gbff",
  placeholder = "Paste sequences or FASTA data..."
}: SequenceInputProps) {

  const fileRef = useRef<HTMLInputElement>(null)

  const [dragging,setDragging] = useState(false)
  const [fileNames,setFileNames] = useState<string[]>([])
  const [fileSize,setFileSize] = useState<number>(0)

  const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB streaming

  async function readFileStream(file:File){

    let offset = 0
    let text = ""

    while(offset < file.size){

      const blob = file.slice(offset, offset + CHUNK_SIZE)
      const chunk = await blob.text()

      text += chunk

      offset += CHUNK_SIZE

      await new Promise(r=>setTimeout(r,0)) // keep UI responsive

    }

    return text

  }

  async function readFiles(files:FileList){

    let combined = ""

    const names:string[] = []

    let totalSize = 0

    for(const file of Array.from(files)){

      const text = await readFileStream(file)

      combined += "\n" + text

      names.push(file.name)

      totalSize += file.size

    }

    onChange(value ? value + "\n" + combined : combined)

    setFileNames(names)

    setFileSize(totalSize)

  }

  function handleUpload(e:React.ChangeEvent<HTMLInputElement>){

    const files = e.target.files

    if(!files) return

    readFiles(files)

  }

  function handleDrop(e:React.DragEvent<HTMLDivElement>){

    e.preventDefault()

    setDragging(false)

    const files = e.dataTransfer.files

    if(files) readFiles(files)

  }

  function clearInput(){

    onChange("")

    setFileNames([])

    setFileSize(0)

  }

  function countSequences(text:string){

    const matches = text.match(/^>/gm)

    return matches ? matches.length : text.trim() ? 1 : 0

  }

  const seqCount = countSequences(value)

  const baseCount = value
    .replace(/^>.*$/gm,"")
    .replace(/\s/g,"").length

  return(

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
              <Trash2 className="w-4 h-4"/>
              Clear
            </button>
          )}

        </div>

      </div>

      {/* DRAG DROP */}

      <div
        onDrop={handleDrop}
        onDragOver={(e)=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        className={`mb-4 flex items-center justify-between rounded-lg border border-dashed p-3 text-sm transition
        ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
      >

        <div className="flex items-center gap-2 text-gray-600">

          <FileText className="w-4 h-4"/>

          <span>
            {fileLabel}
          </span>

        </div>

        <button
        aria-label="Upload example sequence"

          onClick={()=>fileRef.current?.click()}
          className="flex items-center gap-2 rounded border px-3 py-1 hover:bg-gray-100"
        >
          <Upload className="w-4 h-4"/>
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
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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