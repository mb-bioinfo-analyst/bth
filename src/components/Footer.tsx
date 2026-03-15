import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Top section */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">

          {/* Brand */}
          <div className="max-w-sm">

            <p className="text-sm font-semibold text-white">
              Bioinformatics Tools Hub
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Free browser-based tools for DNA, RNA and protein sequence
              analysis designed for researchers, students, and
              bioinformatics workflows.
            </p>

          </div>

          {/* Navigation */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-slate-400">

  {/* Site */}

  <div className="flex flex-col gap-2">

    <p className="font-semibold text-white">
      Site
    </p>

    <Link to="/" className="hover:text-cyan-300">
      Home
    </Link>

    <Link to="/about" className="hover:text-cyan-300">
      About
    </Link>

    <Link to="/documentation" className="hover:text-cyan-300">
      Documentation
    </Link>

  </div>


  {/* Resources */}

  <div className="flex flex-col gap-2">

    <p className="font-semibold text-white">
      Resources
    </p>

    <Link to="/citations" className="hover:text-cyan-300">
      Citations
    </Link>

    <Link to="/contact" className="hover:text-cyan-300">
      Contact
    </Link>

  </div>


  {/* Legal */}

  <div className="flex flex-col gap-2">

    <p className="font-semibold text-white">
      Legal
    </p>

    <Link to="/disclaimer" className="hover:text-cyan-300">
      Disclaimer
    </Link>

    <Link to="/privacy" className="hover:text-cyan-300">
      Privacy Policy
    </Link>

    <Link to="/terms" className="hover:text-cyan-300">
      Terms of Use
    </Link>

  </div>


  {/* Research */}

  <div className="flex flex-col gap-2">

    <p className="font-semibold text-white">
      Research
    </p>

    <Link to="/citations" className="hover:text-cyan-300">
      Tool Citations
    </Link>

  </div>

</div>

        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-500">

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <p>
              © {new Date().getFullYear()} Bioinformatics Tools Hub • MIT Licensed
            </p>

            <p>
              All bioinformatics tools run locally in your browser. 
              No data is uploaded to external servers.
            </p>
            

          </div>

        </div>

      </div>

    </footer>
  )
}