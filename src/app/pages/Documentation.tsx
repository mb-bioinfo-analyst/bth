import PageLayout from "../../components/PageLayout"

export default function Documentation() {

  return (

    <PageLayout
      title="Documentation"
      description="User guide and documentation for the browser-based bioinformatics tools available on this platform."
    >

      <div className="max-w-4xl mx-auto space-y-12 text-slate-700">

        {/* INTRO */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Introduction
          </h2>

          <p>
            Bioinformatics Tools Hub provides a collection of browser-based
            utilities designed to support common bioinformatics and molecular
            biology workflows.
          </p>

          <p>
            All tools run directly in your web browser, which means your
            sequence data is processed locally and never uploaded to
            external servers. This ensures fast performance while
            maintaining data privacy.
          </p>

        </section>


        {/* HOW TO USE */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            How to Use the Tools
          </h2>

          <ol className="list-decimal pl-6 space-y-2">

            <li>Select a tool from the homepage or search bar.</li>

            <li>Paste or upload your sequence data.</li>

            <li>Configure tool parameters if available.</li>

            <li>Run the analysis to generate results.</li>

            <li>Copy or download results for downstream analysis.</li>

          </ol>

        </section>


        {/* INPUT FORMATS */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Supported Input Formats
          </h2>

          <ul className="list-disc pl-6 space-y-2">

            <li>Plain DNA or RNA sequences</li>

            <li>Multi-sequence FASTA files</li>

            <li>Protein sequences (for protein analysis tools)</li>

          </ul>

          <p>
            FASTA headers beginning with the <code>&gt;</code> symbol are fully supported.
          </p>

        </section>


        {/* TOOL CATEGORIES */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Tool Categories
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <h3 className="font-semibold text-slate-800">
                Sequence Utilities
              </h3>

              <ul className="list-disc pl-6 space-y-1 text-sm">

                <li>Reverse complement</li>
                <li>Sequence cleaner</li>
                <li>Sequence converter</li>
                <li>Sequence length calculator</li>

              </ul>

            </div>

            <div>

              <h3 className="font-semibold text-slate-800">
                FASTA Tools
              </h3>

              <ul className="list-disc pl-6 space-y-1 text-sm">

                <li>FASTA formatter</li>
                <li>FASTA filter</li>
                <li>FASTA deduplicator</li>
                <li>FASTA statistics</li>

              </ul>

            </div>

            <div>

              <h3 className="font-semibold text-slate-800">
                Sequence Analysis
              </h3>

              <ul className="list-disc pl-6 space-y-1 text-sm">

                <li>ORF finder</li>
                <li>Motif pattern finder</li>
                <li>K-mer analysis tools</li>

              </ul>

            </div>

            <div>

              <h3 className="font-semibold text-slate-800">
                Molecular Biology Tools
              </h3>

              <ul className="list-disc pl-6 space-y-1 text-sm">

                <li>Restriction site finder</li>
                <li>Primer analyzer</li>
                <li>Codon usage calculator</li>

              </ul>

            </div>

          </div>

        </section>


        {/* DATA PRIVACY */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Data Privacy
          </h2>

          <p>
            All sequence analysis is performed locally within your web browser.
            No sequence data is transmitted to external servers.
          </p>

          <p>
            This architecture ensures that sensitive research data
            remains private and secure.
          </p>

        </section>


        {/* LIMITATIONS */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Limitations
          </h2>

          <ul className="list-disc pl-6 space-y-2">

            <li>Very large datasets may exceed browser memory limits.</li>

            <li>
              These tools are intended primarily for exploratory analysis
              and educational purposes.
            </li>

          </ul>

        </section>


        {/* SUPPORT */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Support and Feedback
          </h2>

          <p>
            If you encounter issues or have suggestions for new features,
            tools, or improvements, please contact the site maintainer
            through the contact page.
          </p>

        </section>

      </div>

    </PageLayout>

  )

}