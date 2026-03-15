import PageLayout from "../../components/PageLayout"

export default function Citations() {

  return (

     <PageLayout
      title="Citations"
      description="Scientific references and resources used in the development of the bioinformatics tools available on this platform."
      // slug="citations"
    >

      <div className="max-w-4xl mx-auto space-y-12 text-slate-700">

        {/* INTRO */}

        <section className="space-y-4">

          <h2 className="text-2xl font-semibold text-slate-900">
            Citation and Attribution
          </h2>

          <p>
            Many of the tools available on this platform are based on well-established
            algorithms, biological databases, and widely used computational methods.
            The following references acknowledge the scientific work that contributed
            to the development of these tools.
          </p>

          <p>
            If you use these tools in research or publications, please consider
            citing the relevant methods and databases listed below.
          </p>

        </section>


        {/* CODON USAGE */}

        <section className="space-y-4">

          <h2 className="text-xl font-semibold text-slate-900">
            Codon Usage Analysis
          </h2>

          <div className="space-y-3">

            <p className="text-sm">
              Nakamura Y., Gojobori T., Ikemura T. (2000).
              <em> Codon usage tabulated from international DNA sequence databases.</em>
              Nucleic Acids Research 28(1): 292.
            </p>

            <p className="text-sm text-slate-600">
              https://www.kazusa.or.jp/codon/
            </p>

            <p className="text-sm">
              Codon usage statistics databases were used as reference datasets
              for codon bias calculations and codon frequency comparisons.
            </p>

          </div>

        </section>


        {/* RESTRICTION ENZYMES */}

        <section className="space-y-4">

          <h2 className="text-xl font-semibold text-slate-900">
            Restriction Enzyme Data
          </h2>

          <div className="space-y-3">

            <p className="text-sm">
              Roberts R.J., Vincze T., Posfai J., Macelis D. (2015).
              <em>REBASE—a database for DNA restriction and modification:
              enzymes, genes and genomes.</em>
              Nucleic Acids Research.
            </p>

            <p className="text-sm text-slate-600">
              https://rebase.neb.com
            </p>

          </div>

        </section>


        {/* SEQUENCE ANALYSIS METHODS */}

        <section className="space-y-4">

          <h2 className="text-xl font-semibold text-slate-900">
            Sequence Analysis Methods
          </h2>

          <div className="space-y-3">

            <p className="text-sm">
              Mount D.W. (2004).
              <em>Bioinformatics: Sequence and Genome Analysis.</em>
              Cold Spring Harbor Laboratory Press.
            </p>

            <p className="text-sm">
              Durbin R., Eddy S., Krogh A., Mitchison G. (1998).
              <em>Biological Sequence Analysis.</em>
              Cambridge University Press.
            </p>

          </div>

        </section>


        {/* OPEN SOURCE */}

        <section className="space-y-4">

          <h2 className="text-xl font-semibold text-slate-900">
            Open Source Libraries
          </h2>

          <p>
            The web platform is built using modern open-source technologies,
            including:
          </p>

          <ul className="list-disc pl-6 space-y-2">

            <li>React</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
            <li>Recharts</li>

          </ul>

        </section>


        {/* ACKNOWLEDGEMENT */}

        <section className="space-y-4">

          <h2 className="text-xl font-semibold text-slate-900">
            Acknowledgements
          </h2>

          <p>
            This project benefits from publicly available biological databases,
            scientific literature, and open-source software libraries that
            support reproducible computational biology.
          </p>

        </section>

      </div>

    </PageLayout>

  )
}