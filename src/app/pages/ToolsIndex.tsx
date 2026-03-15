import { tools } from "../../data/tools"
import { Link } from "react-router-dom"
import ToolLayout from "../../components/ToolLayout"

export default function ToolsIndex() {

  const categories = [...new Set(tools.map(t => t.category))]

  return (
    <ToolLayout
      title="Bioinformatics Tools"
      description="Browse all available bioinformatics tools by category."
      badge="Tools Directory"
      
    >

      <div className="grid md:grid-cols-3 gap-6">

        {categories.map(cat => (

          <Link
            key={cat}
            to={`/tools/${cat.toLowerCase()}`}
            className="p-6 border rounded-xl hover:border-cyan-400 transition"
          >

            <h2 className="text-xl font-semibold">
              {cat}
            </h2>

            <p className="text-sm text-slate-600 mt-2">
              Explore tools related to {cat} sequence analysis.
            </p>

          </Link>

        ))}

      </div>

    </ToolLayout>
  )
}