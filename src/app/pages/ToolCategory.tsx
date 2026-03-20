import { useParams, Link, Navigate } from "react-router-dom"
import { tools } from "../../data/tools"
import ToolLayout from "../../components/ToolLayout"

function categoryToSlug(category: string) {
  return category
    .toLowerCase()
    .replace("bioinformatics tools", "")
    .replace("tools", "")
    .trim()
    .replace(/\s+/g, "-")
}

export default function ToolCategory() {

  const { category } = useParams()

  const categoryTools = tools.filter(
    t => categoryToSlug(t.category) === category
  )

  if (!categoryTools.length) {
    return <Navigate to="/404" replace />
  }

  const realCategory = categoryTools[0].category

  const cleanCategory = realCategory
    .replace("Bioinformatics Tools", "")
    .replace("Tools", "")
    .trim()

  return (
    <ToolLayout
      slug={`category-${category}`}
  title={`${cleanCategory} Bioinformatics Tools`}
  description={`Explore ${cleanCategory.toLowerCase()} tools for DNA, RNA and protein sequence analysis. Free browser-based bioinformatics utilities.`}
  badge="Tool Category"
    >

      {/* Tool grid */}

      <div className="grid md:grid-cols-2 gap-4">

        {categoryTools.map(tool => (

          <Link
            key={tool.path}
            to={tool.path}
            className="p-4 border rounded-lg hover:border-cyan-400"
          >
            <h3 className="font-semibold">{tool.name}</h3>

            <p className="text-sm text-slate-600">
              {tool.uiDescription}
            </p>

          </Link>

        ))}

      </div>

      {/* SEO CONTENT */}

      <section className="mt-12 max-w-3xl space-y-5 text-slate-700">

        <h2 className="text-xl font-semibold">
          {cleanCategory} Tools for Bioinformatics Analysis
        </h2>

        <p>
          This collection of {cleanCategory.toLowerCase()} tools enables researchers
          to analyze DNA, RNA, and protein sequences directly in the browser.
          These tools support modern genomics and molecular biology workflows.
        </p>

        <p>
          All tools run entirely client-side, ensuring fast performance and complete
          data privacy without uploading sequences to external servers.
        </p>

        <h3 className="text-lg font-semibold">
          Common applications
        </h3>

        <ul className="list-disc ml-6 space-y-1">

          <li>Sequence analysis and processing</li>
          <li>Genomic data preparation</li>
          <li>Bioinformatics workflows</li>
          <li>Educational analysis</li>
          <li>Research data exploration</li>

        </ul>

      </section>

    </ToolLayout>
  )
}