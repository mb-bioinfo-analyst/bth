import { useParams, Link, Navigate } from "react-router-dom"
import { tools } from "../../data/tools"
import ToolLayout from "../../components/ToolLayout"

export default function ToolCategory() {

    const { category } = useParams()

    const categoryTools = tools.filter(
        t => t.category.toLowerCase() === category?.toLowerCase()
    )

    // invalid category → redirect to 404
    if (!categoryTools.length) {
        return <Navigate to="/404" replace />
    }

    const realCategory = categoryTools[0].category

    const title = `${realCategory} | Bioinformatics Tools Hub`

    const description =
        `Collection of ${realCategory.toLowerCase()} for DNA, RNA and protein data analysis.`

    return (
        <ToolLayout
            title={title}
            description={description}
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
                        <p className="text-sm text-slate-600">{tool.description}</p>
                    </Link>

                ))}

            </div>


            {/* SEO explanation text */}

            <section className="mt-12 max-w-3xl space-y-5 text-slate-700">

                <h2 className="text-xl font-semibold">
                    About {category}
                </h2>

                <p>
                    This page contains a collection of browser-based tools designed for
                    {category?.toLowerCase()} used in modern molecular biology,
                    genomics, and bioinformatics research.
                </p>

                <p>
                    These tools allow researchers, students, and laboratory scientists to
                    analyze data (DNA, RNA, and protein) directly in the browser without
                    installing specialized software.
                </p>

                <p>
                    All tools run locally in the browser to ensure fast performance and
                    data privacy. No data is uploaded to external servers.
                </p>

                <h3 className="text-lg font-semibold">
                    Common applications
                </h3>

                <ul className="list-disc ml-6 space-y-1">

                    <li>DNA and RNA sequence processing</li>

                    <li>Genomic data preparation and formatting</li>

                    <li>Molecular biology workflow support</li>

                    <li>Educational bioinformatics analysis</li>

                    <li>Exploratory sequence analysis in research projects</li>

                </ul>

            </section>

        </ToolLayout>
    )
}