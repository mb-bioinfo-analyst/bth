import { tools } from "../../data/tools"
import { Link } from "react-router-dom"
import ToolLayout from "../../components/ToolLayout"

function categoryToSlug(category: string) {
  return category
    .toLowerCase()
    .replace("bioinformatics tools", "")
    .replace("tools", "")
    .trim()
    .replace(/\s+/g, "-")
}

export default function ToolsIndex() {

  const categories = [...new Set(tools.map(t => t.category))]

  return (
    <ToolLayout
      slug="tools-index"
  title="Bioinformatics Tools Directory"
  description="Browse all bioinformatics tools for DNA, RNA and protein analysis including sequence analysis, FASTA tools, and genomics utilities."
  badge="Tools Directory"
    >

      <div className="grid md:grid-cols-3 gap-6">

        {categories.map(cat => {

          const slug = categoryToSlug(cat)

          return (
            <Link
              key={cat}
              to={`/tools/${slug}`}
              className="p-6 border rounded-xl hover:border-cyan-400 transition"
            >

              <h2 className="text-xl font-semibold">
                {cat}
              </h2>

              <p className="text-sm text-slate-600 mt-2">
                Explore {slug.replace("-", " ")} tools for DNA, RNA and protein analysis.
              </p>

            </Link>
          )
        })}

      </div>

    </ToolLayout>
  )
}