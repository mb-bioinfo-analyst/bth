import React from "react";
import { tools, getRelatedTools } from "../data/tools";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar"
import { Helmet } from "react-helmet-async"

import { useMemo, useState } from "react"
import Footer from "../components/Footer"

type ToolLayoutProps = {

  title?: string
  description?: string

  category?: string;

  slug: string
  badge?: string;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;

  seoContent?: React.ReactNode;
  howTo?: React.ReactNode;
  faq?: { question: string; answer: string }[];

};

export default function ToolLayout({

  

  category,

  slug,
  badge = "Bioinformatics Tool",
  children,
  rightPanel,

  seoContent,
  howTo,
  faq,



}: ToolLayoutProps) {

  const toolMeta = tools.find(t => t.slug === slug)

  const finalTitle = toolMeta?.name || "Bioinformatics Tools"
  const finalDescription = toolMeta?.metaDescription ||
  "Free online bioinformatics tools for DNA, RNA and protein sequence analysis."
  const finalUiDescription = toolMeta?.uiDescription ||
  "Explore bioinformatics tools for sequence analysis."
  const finalTags = toolMeta?.tags

  const fullBrand = "Bioinformatics Tools Hub"
  const mediumBrand = "Bioinformatics Tools"
  const shortBrand = "BioToolshub"

  let seoTitle = `${finalTitle} | ${fullBrand}`

  if (seoTitle.length > 60) {
    seoTitle = `${finalTitle} | ${mediumBrand}`
  }

  if (seoTitle.length > 60) {
    seoTitle = `${finalTitle} | ${shortBrand}`
  }

  if (seoTitle.length > 60) {
    seoTitle = finalTitle
  }


  const location = useLocation();

  const canonicalUrl =
    `https://biotoolshub.org${location.pathname}`.replace(/\/$/, "") ||
    "https://biotoolshub.org"

  const relatedTools = getRelatedTools(slug)

  const currentPath = location.pathname;

  const citationText = `Bioinformatics Tools Hub (${new Date().getFullYear()})
${finalTitle}
https://biotoolshub.org${location.pathname}`

  const bibtex = `@misc{bioinfo-tools-${slug},
  title = {${finalTitle}},
  author = {{Bioinformatics Tools Hub}},
  year = {${new Date().getFullYear()}},
  url = {https://biotoolshub.org${location.pathname}}
}`

  const [copied, setCopied] = useState<string | null>(null)

  const randomTools = tools
    .filter(t => t.path !== currentPath)
    .slice(0, 4)

  const groupedTools = useMemo(() => {
    return tools.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = []
      acc[tool.category].push(tool)
      return acc
    }, {} as Record<string, typeof tools>)
  }, [])

  // const defaultOpenCategories = ["sequence", "fasta"]

  const defaultOpenCategories = ["pcr"]

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.keys(groupedTools).reduce((acc, cat) => {
      acc[cat] = defaultOpenCategories.some(d =>
        cat.toLowerCase().includes(d)
      )
      return acc
    }, {} as Record<string, boolean>)
  )

  const cleanCategory = category
    ? category
      .replace("Bioinformatics Tools", "")
      .replace("Tools", "")
      .trim()
      .toLowerCase()
    : "bioinformatics"

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)

    setTimeout(() => {
      setCopied(null)
    }, 2000)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <Navbar />
      <Helmet>

        {/* Title 
        <title>{finalTitle} | Bioinformatics Tools Hub</title>  */}

        <title>{seoTitle}</title>

        {/* Primary SEO */}
        <meta name="description" content={finalDescription} key="description" />

        {finalTags && (
          <meta name="keywords" content={finalTags.join(", ")} key="keywords" />
        )}

        <meta name="robots" content="index,follow" key="robots" />

        {/* Canonical (CRITICAL FIX) */}
        <link rel="canonical" href={canonicalUrl} key="canonical" />

        {/* Open Graph */}
        {/* <meta property="og:title" content={`${finalTitle} | Bioinformatics Tools Hub`} key="og:title" /> */}
        <meta property="og:title" content={seoTitle} key="og:title" />
        
        <meta property="og:description" content={finalDescription} key="og:description" />
        <meta property="og:type" content="website" key="og:type" />
        <meta property="og:image" content="https://biotoolshub.org/preview.png" key="og:image" />
        <meta property="og:url" content={canonicalUrl} key="og:url" />
        <meta property="og:site_name" content="Bioinformatics Tools Hub" key="og:site_name" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
        {/* <meta name="twitter:title" content={`${finalTitle} | Bioinformatics Tools Hub`} key="twitter:title" /> */}
        <meta name="twitter:title" content={seoTitle} key="twitter:title"  />
        <meta name="twitter:description" content={finalDescription} key="twitter:description" />
        <meta name="twitter:image" content="https://biotoolshub.org/preview.png" key="twitter:image" />

        {/* Structured Data: SoftwareApplication */}
        <script type="application/ld+json" key="software-schema">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: finalTitle,
            description: finalDescription,
            url: canonicalUrl,
            applicationCategory: "ScientificApplication",
            operatingSystem: "Web",
            creator: {
              "@type": "Organization",
              name: "Bioinformatics Tools Hub"
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            }
          })}
        </script>

        {/* Breadcrumb */}
        <script type="application/ld+json" key="breadcrumb-schema">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://biotoolshub.org"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Tools",
                item: "https://biotoolshub.org/tools"
              },
              {
                "@type": "ListItem",
                position: 3,
                name: finalTitle,
                item: canonicalUrl
              }
            ]
          })}
        </script>

        {/* FAQ Schema */}
        {faq?.length > 0 && (
          <script type="application/ld+json" key="faq-schema">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map(f => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.answer
                }
              }))
            })}
          </script>
        )}

      </Helmet>

      {/* Hero / heading */}
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          {badge}
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {finalTitle}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
            {finalUiDescription}
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-md md:p-6">
            <div className="rounded-2xl bg-white p-4 text-slate-900 md:p-6">
              {children}
            </div>
          </section>



          <aside className="lg:sticky lg:top-6 self-start flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)]">
            {rightPanel ?? (
              <>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
                    Why use this tool?
                  </h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                    <li>• Modern interface built for speed and clarity</li>
                    <li>• Works directly in the browser</li>
                    <li>• No sequence data sent to a server</li>
                    <li>• Easy copy and download workflow</li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md flex flex-col min-h-0">

                  <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
                    Tools
                  </h2>

                  <div className="mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">

                    {Object.entries(groupedTools).map(([category, categoryTools]) => (
                      <div key={category} className="mb-4">

                        {/* <h3 className="text-xs font-semibold uppercase text-cyan-300">
                          {category}
                        </h3> */}
                        <button
                          onClick={() => toggleCategory(category)}
                          aria-expanded={openCategories[category]}
                          className="text-xs font-semibold uppercase text-cyan-300 flex items-center justify-between w-full hover:text-cyan-200 transition"
                        >
                          <span>{category}</span>

                          <span className="text-xs">
                            {openCategories[category] ? "−" : "+"}
                          </span>
                        </button>

                        {/* <ul className="mt-2 space-y-2 text-sm text-slate-200">

                          {categoryTools.map(tool => (

                            <li key={tool.path}>

                              <Link
                                to={tool.path}
                                className={`hover:text-cyan-300 transition ${location.pathname === tool.path
                                  ? "text-cyan-300 font-semibold"
                                  : ""
                                  }`}
                              >
                                • {tool.name}
                              </Link>

                            </li>

                          ))}

                        </ul> */}

                        {openCategories[category] && (
                          <ul className="mt-2 space-y-2 text-sm text-slate-200">
                            {categoryTools.map(tool => (
                              <li key={tool.path}>
                                <Link
                                  to={tool.path}
                                  className={`hover:text-cyan-300 transition ${location.pathname === tool.path
                                      ? "text-cyan-300 font-semibold"
                                      : ""
                                    }`}
                                >
                                  • {tool.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}

                      </div>
                    ))}

                  </div>

                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
                    Try another tool
                  </h2>

                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">

                    {randomTools.map(tool => (

                      <li key={tool.path}>

                        <Link
                          to={tool.path}
                          className="hover:text-cyan-300 transition"
                        >
                          • {tool.name}
                        </Link>

                      </li>

                    ))}

                  </ul>
                </div>
              </>
            )}
          </aside>
        </div>


        {/* SEO CONTENT SECTION (FULL WIDTH BELOW GRID) */}

        {(seoContent || howTo || faq) && (

          <section className="mt-16">

            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-md space-y-10">

              {/* SEO EXPLANATION */}

              {seoContent && (
                <div className="prose prose-invert max-w-none text-slate-300">
                  {seoContent}
                </div>
              )}

              {/* HOW TO */}

              {howTo && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    How to use this tool
                  </h2>

                  <div className="text-slate-300">
                    {howTo}
                  </div>
                </div>
              )}

              {relatedTools.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Related Bioinformatics Tools
                  </h2>

                  {/* {relatedTools.length > 0 && (
                    <div> */}
                  {/* <h2 className="text-2xl font-semibold text-white mb-4">
                        Related Bioinformatics Tools
                      </h2> */}

                  <p className="text-slate-300 mb-4">
                    Explore related {cleanCategory} tools for DNA, RNA and protein sequence analysis workflows.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {relatedTools.map(tool => (
                      <Link
                        key={tool.slug}
                        to={tool.path}
                        className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                      >
                        <div className="font-semibold text-cyan-300">
                          {tool.name}
                        </div>

                        <div className="text-sm text-slate-300 mt-1">
                          {tool.uiDescription}
                        </div>
                      </Link>
                    ))}
                  </div>
                  {/* </div>
                  )} */}
                </div>
              )}

              {/* FAQ */}

              {faq && (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Frequently Asked Questions
                  </h2>

                  <div className="space-y-6">

                    {faq.map((f, i) => (

                      <div key={i}>

                        <h3 className="font-semibold text-white">
                          {f.question}
                        </h3>

                        <p className="text-slate-300 mt-2">
                          {f.answer}
                        </p>

                      </div>

                    ))}

                  </div>

                </div>
              )}


              <section className="mt-10">

                <h2 className="text-2xl font-semibold text-white mb-4">
                  How to Cite This Tool
                </h2>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-300">

                  <p className="mb-3">
                    If you use this tool in academic work, please cite:
                  </p>

                  <pre className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
                    {citationText}
                  </pre>

                  <button
                    aria-label="Copy citation"
                    onClick={() => copyToClipboard(citationText, "citation")}
                    className="mt-3 rounded-lg border border-white/20 px-4 py-2 text-sm hover:border-cyan-400 hover:text-cyan-300 transition"
                  >
                    {copied === "citation" ? "Copied ✓" : "Copy Citation"}
                  </button>

                  <p className="mt-6 mb-3">
                    BibTeX
                  </p>

                  <pre className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
                    {bibtex}
                  </pre>

                  <button
                    aria-label="Copy BibTeX citation"
                    onClick={() => copyToClipboard(bibtex, "bibtex")}
                    className="mt-3 rounded-lg border border-white/20 px-4 py-2 text-sm hover:border-cyan-400 hover:text-cyan-300 transition"
                  >
                    {copied === "bibtex" ? "Copied ✓" : "Copy BibTeX"}
                  </button>

                </div>

              </section>

            </div>

          </section>

        )}

      </main>

      {/* Footer */}

      <Footer />
    </div>
  );
}