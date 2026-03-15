import PageLayout from "../../components/PageLayout"

export default function About() {

  return (

    <PageLayout
      title="About This Project"
      description="A modern open-access platform providing lightweight bioinformatics utilities for sequence analysis, molecular biology workflows, and genomic data exploration."
      // slug="citations"
    >

      <div className="max-w-4xl mx-auto space-y-12 text-slate-700">

        {/* INTRODUCTION */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Overview
          </h2>

          <p>
            This platform provides a collection of lightweight, browser-based
            bioinformatics tools designed to assist researchers, students,
            and educators working with biological sequence data.
          </p>

          <p>
            The tools cover common molecular biology and bioinformatics tasks
            including sequence manipulation, codon usage analysis,
            k-mer analysis, motif discovery, restriction enzyme analysis,
            and various FASTA utilities.
          </p>

          <p>
            The goal of this project is to provide a fast, reliable,
            and privacy-respecting alternative to traditional web tools
            that often require server-side processing.
          </p>

        </section>

        {/* DESIGN PHILOSOPHY */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Design Philosophy
          </h2>

          <ul className="list-disc pl-6 space-y-2">

            <li>
              <strong>Privacy-first:</strong> All analysis is performed
              directly in the browser. No sequence data is uploaded or stored.
            </li>

            <li>
              <strong>Lightweight tools:</strong> Each tool is optimized for
              speed and simplicity.
            </li>

            <li>
              <strong>Accessible science:</strong> The platform is designed
              to be easy to use for both beginners and experienced
              bioinformaticians.
            </li>

            <li>
              <strong>Modern web technologies:</strong> The platform uses
              React, TypeScript, and modern data visualization libraries.
            </li>

          </ul>

        </section>

        {/* AVAILABLE TOOLS */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Available Tools
          </h2>

          <p>
            The platform currently includes utilities for:
          </p>

          <ul className="grid md:grid-cols-2 gap-x-10 list-disc pl-6 space-y-1">

            <li>DNA and RNA sequence manipulation</li>
            <li>Codon usage and codon bias analysis</li>
            <li>Open reading frame (ORF) detection</li>
            <li>FASTA sequence processing</li>
            <li>Restriction enzyme site detection</li>
            <li>K-mer analysis and frequency calculations</li>
            <li>Primer analysis</li>
            <li>Protein sequence analysis</li>
            <li>Motif and pattern searching</li>

          </ul>

        </section>

        {/* TECHNOLOGY */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Technology Stack
          </h2>

          <ul className="list-disc pl-6 space-y-2">

            <li>React + TypeScript</li>
            <li>Tailwind CSS for UI design</li>
            <li>Recharts for data visualization</li>
            <li>Client-side sequence processing algorithms</li>

          </ul>

          <p>
            The tools are designed to run entirely in the browser,
            eliminating the need for server infrastructure while
            improving speed and data privacy.
          </p>

        </section>

        {/* DATA SOURCES */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Data Sources
          </h2>

          <p>
            Certain tools rely on publicly available biological datasets
            and curated reference data.
          </p>

          <ul className="list-disc pl-6 space-y-2">

            <li>Codon usage statistics databases</li>
            <li>Public restriction enzyme datasets</li>
            <li>Standard genetic code tables</li>

          </ul>

          <p>
            All external resources are acknowledged in the
            project attribution documentation.
          </p>

        </section>

        {/* OPEN SCIENCE */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Open Science and Accessibility
          </h2>

          <p>
            This platform aims to support open science by making useful
            computational tools easily accessible without requiring
            software installation or programming experience.
          </p>

          <p>
            The tools are suitable for research workflows, teaching,
            and quick exploratory analyses.
          </p>

        </section>

        {/* FUTURE DEVELOPMENT */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Future Development
          </h2>

          <p>
            Planned improvements include additional sequence analysis
            tools, improved visualizations, expanded datasets,
            and enhanced interactive features.
          </p>

        </section>

        {/* CONTACT */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Contact
          </h2>

          <p>
            If you have suggestions, feedback, or feature requests,
            please feel free to get in touch.
          </p>

        </section>

      </div>

    </PageLayout>

  )
}