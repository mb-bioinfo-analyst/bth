import { Link } from "react-router-dom"
import ToolSearch from "./ToolSearch"
import { useEffect, useMemo, useState } from "react"
import { tools } from "../data/tools"
import { Menu, X } from "lucide-react"
import { categoryToSlug } from "../utils/categoryToSlug"

export default function Navbar() {

  const [mobileOpen, setMobileOpen] = useState(false)

  const [show, setShow] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Group tools by category (memoized for performance)
  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, typeof tools> = {}

    tools.forEach(tool => {
      if (!grouped[tool.category]) grouped[tool.category] = []
      grouped[tool.category].push(tool)
    })

    return grouped
  }, [])

  useEffect(() => {

    const handleScroll = () => {

      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShow(false)
      } else {
        setShow(true)
      }

      setLastScrollY(currentScrollY)

    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)

  }, [lastScrollY])


  return (

    <header
      className={`fixed top-0 left-0 w-full z-50 border-b border-white/10 backdrop-blur-md bg-slate-950/70 shadow-lg shadow-black/20 transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-full"
        }`}
    >

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}

        <Link to="/" className="flex items-center gap-3">

          {/* <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500">
            <span className="text-sm font-bold text-slate-950">BTH</span>
          </div> */}

          <img
            src="/logo.svg"
            alt="Bioinformatics Tools Hub logo"
            className="h-10 w-10"
          />

          <div>
            <p className="text-sm font-semibold text-white">
              Bioinfo Tools Hub
            </p>
            <p className="text-xs text-slate-400">
              Browser-based bioinformatics utilities
            </p>
          </div>

        </Link>


        {/* Navigation */}

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">

          <ToolSearch />

          {/* Search shortcut button */}

          <button
            aria-label="Open tool search"
            onClick={() => window.dispatchEvent(new Event("open-tool-search"))}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
          >
            Search
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px]">
              ⌘K
            </span>
          </button>


          {/* Tools Mega Menu */}

          <div className="relative group inline-block">

            <button aria-label="Open tools menu" className="hover:text-cyan-300">
              Tools
            </button>

            <div className="absolute left-1/2 top-full w-[700px] -translate-x-1/2 -translate-y-1 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur p-6 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-200">

              <div className="grid grid-cols-3 gap-8">

                {Object.entries(toolsByCategory).map(([category, categoryTools]) => (

                  <div key={category}>

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {category} ({categoryTools.length})
                    </p>

                    {/* <ul className="space-y-1">

                      {categoryTools.slice(0, 6).map(tool => (
                        <li key={tool.path}>
                          <Link
                            to={tool.path}
                            className="block text-sm text-slate-300 hover:text-cyan-300"
                          >
                            {tool.name}
                          </Link>
                        </li>
                      ))}

                    </ul> */}

                    <ul className="space-y-1">

                      {categoryTools.slice(0, 5).map(tool => (
                        <li key={tool.path}>
                          <Link
                            to={tool.path}
                            className="block text-sm text-slate-300 hover:text-cyan-300"
                          >
                            {tool.name}
                          </Link>
                        </li>
                      ))}

                      {/* VIEW ALL LINK */}
                      <li className="pt-1">
                        <Link
                          to={`/tools/${categoryToSlug(category)}`}
                          className="block text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          View all →
                        </Link>
                      </li>

                    </ul>

                  </div>

                ))}

              </div>

            </div>

          </div>


          <Link to="/" className="hover:text-cyan-300">
            Home
          </Link>

          <Link to="/about" className="hover:text-cyan-300">
            About
          </Link>

          <Link to="/documentation" className="hover:text-cyan-300">
            Documentation
          </Link>


        </nav>

        <button
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>


        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-96 border-t border-white/10" : "max-h-0"
            }`}
        >
          <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-sm">

            <div className="flex flex-col gap-4 px-6 py-6 text-sm text-slate-300">

              <Link to="/" onClick={() => setMobileOpen(false)} className="hover:text-cyan-300">
                Home
              </Link>

              <Link to="/documentation" onClick={() => setMobileOpen(false)} className="hover:text-cyan-300">
                Documentation
              </Link>

              <Link to="/about" onClick={() => setMobileOpen(false)} className="hover:text-cyan-300">
                About
              </Link>

              <Link to="/citations" onClick={() => setMobileOpen(false)} className="hover:text-cyan-300">
                Citations
              </Link>

              <button
                aria-label="Open tool search"
                onClick={() => {
                  setMobileOpen(false)
                  window.dispatchEvent(new Event("open-tool-search"))
                }}
                className="text-left hover:text-cyan-300"
              >
                Search tools
              </button>

            </div>

          </div>

        </div>


      </div>

    </header>

  )

}