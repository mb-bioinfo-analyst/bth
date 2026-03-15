import { Link } from "react-router-dom"
import { Dna } from "lucide-react"
import { tools } from "../../data/tools"
import PageLayout from "../../components/PageLayout"

export default function NotFound() {

  const suggestions = [...tools]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  return (

    <PageLayout
      title="404 – Page Not Found"
      description="The page you are looking for could not be found."
    >

      <div className="flex flex-col items-center text-center py-12">

        {/* 404 header */}

        <div className="flex items-center gap-3 text-cyan-400">

          <Dna size={36} />

          <span className="text-6xl font-bold">
            404
          </span>

        </div>


        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          Sequence Not Found
        </h2>


        <p className="mt-3 max-w-xl text-slate-600">
          The sequence or page you are looking for may have mutated,
          been deleted, or never existed in this genome assembly.
        </p>


        {/* navigation buttons */}

        <div className="mt-8 flex gap-4">

          <Link
            to="/"
            className="rounded-lg bg-cyan-500 px-6 py-2 text-sm font-medium text-black hover:bg-cyan-400"
          >
            Return to Homepage
          </Link>

        </div>


        {/* tool suggestions */}

        <div className="mt-12 max-w-lg">

          <p className="mb-4 text-sm text-slate-500">
            Perhaps you were looking for one of these tools:
          </p>

          <div className="flex flex-wrap justify-center gap-3">

            {suggestions.map(tool => (

              <Link
                key={tool.path}
                to={tool.path}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition"
              >
                {tool.name}
              </Link>

            ))}

          </div>

        </div>

      </div>

    </PageLayout>

  )
}