import React from "react"
import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

type PageLayoutProps = {
  title: string
  description: string
//   slug: string
  children: React.ReactNode
  seoContent?: React.ReactNode
}

export default function PageLayout({
  title,
  description,
//   slug,
  children,
  seoContent
}: PageLayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <Navbar />

      <Helmet>
        <title>{title} | Bioinformatics Tools Hub</title>

        <meta name="description" content={description} />
        <meta name="robots" content="index,follow" />

        <link
          rel="canonical"
          href={`https://biotoolshub.org${location.pathname.replace(/\/$/, "")}`}
        />

        <meta property="og:title" content={`${title} | Bioinformatics Tools Hub`} />
        <meta property="og:site_name" content="Bioinformatics Tools Hub" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://biotoolshub.org/preview.png" />
        <meta property="og:url" content={`https://biotoolshub.org${location.pathname}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Bioinformatics Tools Hub`} />
        <meta name="twitter:image" content="https://biotoolshub.org/preview.png" />
        <meta name="twitter:description" content={description} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description,
            url: `https://biotoolshub.org${location.pathname}`,
            isPartOf: {
              "@type": "WebSite",
              name: "Bioinformatics Tools Hub",
              url: "https://biotoolshub.org"
            }
          })}
        </script>

        <script type="application/ld+json">
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
                name: title,
                item: `https://biotoolshub.org${location.pathname}`
              }
            ]
          })}
        </script>
      </Helmet>

      <section className="mx-auto max-w-5xl px-6 pb-8 pt-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
            {description}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <section className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-md md:p-6">
          <div className="rounded-2xl bg-white p-6 text-slate-900 md:p-8">
            {children}
          </div>
        </section>

        {seoContent && (
          <section className="mt-12">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-md">
              <div className="prose prose-invert max-w-none text-slate-300">
                {seoContent}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}