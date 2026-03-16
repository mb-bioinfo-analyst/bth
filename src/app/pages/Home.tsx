import { Link } from "react-router-dom"
import { tools } from "../../data/tools"
import { useMemo } from "react"
import Navbar from "../../components/Navbar"
import { Helmet } from "react-helmet-async"
import Footer from "../../components/Footer"

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

export default function Home() {

  const randomizedTools = useMemo(() => shuffle(tools), [])

  return (


    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">

      <Navbar />

      <Helmet>

        <title>Bioinformatics Tools Hub</title>

        

        {/* <meta
          name="description"
          content="Free online bioinformatics tools for DNA, RNA, and Protein data including ORF finder, FASTA tools, motif search and codon analysis."
        /> */}

        {/* <link rel="canonical" href="https://biotoolshub.org/" /> */}

        {/* <!-- Open Graph --> */}
        <meta property="og:title" content="Bioinformatics Tools Hub" />
        <meta
          property="og:description"
          content="Modern browser-based bioinformatics tools for researchers and students."
          />
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://biotoolshub.org/"/>
        <meta property="og:image" content="https://biotoolshub.org/preview.png"/>
        <meta property="og:site_name" content="Bioinformatics Tools Hub"/>


        {/* <!-- Twitter --> */}
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content="Bioinformatics Tools Hub"/>
        <meta name="twitter:description"
            content="Free online bioinformatics tools for DNA, RNA, and Protein data including ORF finder, FASTA tools, motif search and codon analysis."/>
        <meta name="twitter:image" content="https://biotoolshub.org/preview.png"/>

        {/* ItemList schema */}

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Bioinformatics Tools",
            description: "Browser-based tools for DNA, RNA and protein sequence analysis",
            numberOfItems: tools.length,
            itemListElement: tools.map((tool, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `https://biotoolshub.org${tool.path}`,
              name: tool.name
            }))
          })}
        </script>

      </Helmet>

      {/* HERO */}


      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16">

        <div className="max-w-3xl">

          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            Scientific utilities for modern bioinformatics
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight">

            Bioinformatics Tools Hub

          </h1>

          <p className="mt-6 text-lg text-slate-300 leading-8">

            A collection of fast, privacy-friendly bioinformatics tools for
            sequence analysis, conversion and exploration.
            All tools run directly in your browser.

          </p>

        </div>

        {/* STATS */}

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-3xl font-bold text-cyan-300">
              {tools.length}
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Available tools
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-3xl font-bold text-cyan-300">
              100%
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Client-side processing
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-3xl font-bold text-cyan-300">
              Open
            </p>
            <p className="text-sm text-slate-300 mt-1">
              For researchers and students
            </p>
          </div>

        </div>

      </section>


      {/* TOOL GRID */}

      <section className="mx-auto max-w-7xl px-6 pb-20">

        <h2 className="text-2xl font-semibold mb-8">
          Available Tools
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {randomizedTools.map(tool => (

            <Link
              key={tool.path}
              to={tool.path}
              className="group rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md hover:bg-white/20 transition"
            >

              <h3 className="text-lg font-semibold group-hover:text-cyan-300">
                {tool.name}
              </h3>

              <p className="mt-3 text-sm text-slate-300 leading-6">
                {tool.description}
              </p>

            </Link>

          ))}

        </div>

      </section>


      {/* WHY THIS PLATFORM */}

      <section className="mx-auto max-w-7xl px-6 pb-24">

        <div className="grid gap-8 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">

            <h3 className="font-semibold text-cyan-300">
              Privacy-first
            </h3>

            <p className="mt-3 text-sm text-slate-300">
              All computations run locally in your browser.
              No sequence data is transmitted to any server.
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">

            <h3 className="font-semibold text-cyan-300">
              Lightweight tools
            </h3>

            <p className="mt-3 text-sm text-slate-300">
              Designed for quick everyday bioinformatics tasks without
              installing software or running command-line tools.
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">

            <h3 className="font-semibold text-cyan-300">
              Research friendly
            </h3>

            <p className="mt-3 text-sm text-slate-300">
              Built for scientists, students and bioinformaticians who
              need fast utilities during analysis workflows.
            </p>

          </div>

        </div>

      </section>
      {/* Footer */}
      
      <Footer />
    </div>

  )

}