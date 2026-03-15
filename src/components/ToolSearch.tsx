import { useState, useEffect, useMemo } from "react"
import { tools } from "../data/tools"
import { useNavigate } from "react-router-dom"
import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { createPortal } from "react-dom"
import { useRef } from "react"

function saveRecentTool(path:string){

  const existing =
    JSON.parse(localStorage.getItem("recentTools") || "[]")

  const updated =
    [path, ...existing.filter((p:string)=>p!==path)]
      .slice(0,5)

  localStorage.setItem(
    "recentTools",
    JSON.stringify(updated)
  )
}

export default function ToolSearch() {

  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const navigate = useNavigate()

  // Fuse search index
  const fuse = useMemo(() => {

    return new Fuse(tools, {
      keys: [
        "name",
        "description",
        "category"
      ],
      threshold: 0.35,
      ignoreLocation: true
    })

  }, [])

  useEffect(() => {

  const el = itemRefs.current[selectedIndex]

  if (el) {
    el.scrollIntoView({
      block: "nearest"
    })
  }

}, [selectedIndex])

  // fuzzy results
  // const results = useMemo(()=>{

  //   if(!query) return tools.slice(0,10)

  //   return fuse
  //     .search(query)
  //     .slice(0,12)
  //     .map(r=>r.item)

  // },[query,fuse])

  const MAX_RESULTS = 10

  const results = useMemo(() => {

    if (!query) {
      const recent = JSON.parse(localStorage.getItem("recentTools") || "[]")

      const recentTools = recent
        .map((path: string) => tools.find(t => t.path === path))
        .filter(Boolean)

      const remaining = tools.filter(
        t => !recent.includes(t.path)
      )

      return [...recentTools, ...remaining].slice(0, MAX_RESULTS)
    }

    return fuse
      .search(query)
      .slice(0, MAX_RESULTS)
      .map(r => r.item)

  }, [query, fuse])

  useEffect(() => {
    const openSearch = () => setOpen(true)

    window.addEventListener("open-tool-search", openSearch)

    return () => window.removeEventListener("open-tool-search", openSearch)
  }, [])


  useEffect(() => {

    const handler = (e: KeyboardEvent) => {

      // if(
      //   (e.key==="k" && (e.metaKey || e.ctrlKey)) ||
      //   e.key === "/"
      // ){
      //   e.preventDefault()
      //   setOpen(true)
      // }

      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        e.key === "/"
      ) {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => {
          const input = document.getElementById("tool-search-input")
          input?.focus()
        }, 10)
      }

      if (!open) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        )
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : 0
        )
      }

      // if (e.key === "Enter") {
      //   if (results[selectedIndex]) {
      //     navigate(results[selectedIndex].path)
      //     setOpen(false)
      //     setQuery("")
      //   }
      // }
      if(e.key==="Enter"){
        const tool = results[selectedIndex]

        if(tool){
          saveRecentTool(tool.path)
          navigate(tool.path)
          setOpen(false)
          setQuery("")
        }
      }

      if (e.key === "Escape") {
        setOpen(false)
      }

    }

    window.addEventListener("keydown", handler)

    return () => window.removeEventListener("keydown", handler)

  }, [open, results, selectedIndex, navigate])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* backdrop */}

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* modal */}

      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">

        {/* search bar */}

        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">

          <Search className="h-4 w-4 text-slate-400" />

          <input
            id="tool-search-input"
            autoFocus
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none"
          />

          <span className="text-xs text-slate-400">
            ESC
          </span>

        </div>

        {/* results */}

        <div 
          ref={listRef} 
          className="max-h-[420px] overflow-y-auto">

          {results.length === 0 && (

            <div className="p-6 text-sm text-slate-400">
              No tools found
            </div>

          )}

          {results.map((tool, index) => (

            <div
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              key={tool.path}
              onClick={() => {
                saveRecentTool(tool.path)
                navigate(tool.path)
                setOpen(false)
                setQuery("")
              }}
              className={`cursor-pointer border-b border-white/5 px-4 py-3 ${index === selectedIndex
                  ? "bg-white/10"
                  : "hover:bg-white/5"
                }`}
            >

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-white">
                  {tool.name}
                </p>

                <span className="text-xs text-cyan-300">
                  {tool.category}
                </span>

              </div>

              <p className="text-xs text-slate-400">
                {tool.description}
              </p>

            </div>

          ))}

        </div>

        {/* footer */}

        <div className="flex justify-between border-t border-white/10 px-4 py-2 text-xs text-slate-400">

          <span>↑ ↓ navigate</span>

          <span>Enter open</span>

          <span>Esc close</span>

        </div>

      </div>

    </div>,
    document.body
  )

}