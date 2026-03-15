import PageLayout from "../../components/PageLayout"

export default function Terms() {

  return (

    <PageLayout
      title="Terms of Use"
      description="Terms governing the use of Bioinformatics Tools Hub and its browser-based bioinformatics utilities."
    >

      <div className="max-w-4xl mx-auto space-y-8 text-slate-700 leading-relaxed">


        {/* INTRO */}

        <section className="space-y-3">

          <h2 className="text-2xl font-semibold text-slate-900">
            Acceptance of Terms
          </h2>

          <p>
            By accessing or using Bioinformatics Tools Hub, you agree to be
            bound by these Terms of Use. If you do not agree with these terms,
            please discontinue use of the website and its tools.
          </p>

        </section>


        {/* PURPOSE */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Purpose of the Platform
          </h2>

          <p>
            Bioinformatics Tools Hub provides browser-based computational tools
            for DNA, RNA, and protein sequence analysis. These tools are
            intended for educational, research, and exploratory purposes.
          </p>

        </section>


        {/* ACCEPTABLE USE */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Acceptable Use
          </h2>

          <p>
            Users agree to use the tools responsibly and in accordance with
            applicable laws and ethical research practices.
          </p>

          <ul className="list-disc pl-6 space-y-2">

            <li>Do not attempt to disrupt or overload the service.</li>

            <li>
              Do not use automated scripts to excessively query the tools.
            </li>

            <li>
              Do not use the platform for unlawful or harmful activities.
            </li>

          </ul>

        </section>


        {/* SCIENTIFIC DISCLAIMER */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Scientific Use Disclaimer
          </h2>

          <p>
            The tools provided on this platform implement commonly used
            bioinformatics algorithms and computational methods.
          </p>

          <p>
            Results should not be considered definitive scientific conclusions.
            Users are responsible for validating results using established
            software, peer-reviewed methods, and experimental verification.
          </p>

        </section>


        {/* INTELLECTUAL PROPERTY */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Intellectual Property
          </h2>

          <p>
            The software, interface design, and content of Bioinformatics
            Tools Hub are protected by applicable intellectual property laws.
          </p>

          <p>
            Users may freely use the tools for research, education, and
            personal projects but may not reproduce or redistribute the
            website content without permission.
          </p>

        </section>


        {/* THIRD PARTY */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Third-Party Resources
          </h2>

          <p>
            Some tools may reference publicly available biological databases
            or external scientific resources. Bioinformatics Tools Hub does
            not control or guarantee the availability or accuracy of such
            external resources.
          </p>

        </section>


        {/* LIMITATION */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Limitation of Liability
          </h2>

          <p>
            Bioinformatics Tools Hub is provided on an “as is” basis.
            The maintainers are not liable for any damages, losses,
            or consequences arising from the use of the tools or
            information provided on this website.
          </p>

        </section>


        {/* MODIFICATIONS */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Changes to the Terms
          </h2>

          <p>
            These Terms of Use may be updated periodically.
            Continued use of the website after updates constitutes
            acceptance of the revised terms.
          </p>

        </section>


        {/* CONTACT */}

        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Contact
          </h2>

          <p>
            If you have questions regarding these Terms of Use,
            please contact the site maintainer through the
            contact page.
          </p>

        </section>


      </div>

    </PageLayout>

  )

}