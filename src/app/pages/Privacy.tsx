import PageLayout from "../../components/PageLayout"

export default function Privacy() {

  return (

    <PageLayout
      title="Privacy Policy"
      description="Privacy policy explaining how Bioinformatics Tools Hub handles user data and browser-based sequence analysis."
    >

      <div className="max-w-4xl mx-auto space-y-8 text-slate-700 leading-relaxed">

        <section className="space-y-3">

          <h2 className="text-2xl font-semibold text-slate-900">
            Overview
          </h2>

          <p>
            Bioinformatics Tools Hub respects your privacy. This website
            provides browser-based bioinformatics tools that process
            biological sequences directly in your web browser.
          </p>

          <p>
            Most tools available on this platform perform computation locally
            and do not transmit sequence data to external servers.
          </p>

        </section>


        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Sequence Data Processing
          </h2>

          <p>
            DNA, RNA, and protein sequences entered into the tools are
            processed locally within your browser using client-side
            JavaScript.
          </p>

          <p>
            Unless explicitly stated otherwise, biological sequences
            are not stored, transmitted, or collected by this website.
          </p>

        </section>


        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Cookies and Analytics
          </h2>

          <p>
            This website may use cookies or analytics services to
            understand general website usage patterns and improve
            user experience.
          </p>

          <p>
            These services may collect anonymized information such as
            browser type, device information, and pages visited.
          </p>

        </section>


        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Third-Party Services
          </h2>

          <p>
            Some parts of the website may rely on third-party services
            such as analytics providers, hosting platforms, or
            advertising networks.
          </p>

          <p>
            These services may collect information in accordance with
            their own privacy policies.
          </p>

        </section>


        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Data Security
          </h2>

          <p>
            While the tools are designed to process sequence data locally,
            users should exercise caution when working with confidential
            or unpublished research data.
          </p>

        </section>


        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Policy Updates
          </h2>

          <p>
            This privacy policy may be updated periodically to reflect
            changes in website functionality or applicable regulations.
          </p>

        </section>


        <section className="space-y-3">

          <h2 className="text-xl font-semibold text-slate-900">
            Contact
          </h2>

          <p>
            If you have questions about this privacy policy, please
            contact the site maintainer through the contact page.
          </p>

        </section>

      </div>

    </PageLayout>

  )

}