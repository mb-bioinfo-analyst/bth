import PageLayout from "../../components/PageLayout"
import { Mail, Github, Linkedin } from "lucide-react"

export default function Contact() {

    return (

        <PageLayout
            title="Contact"
            description="Contact the maintainer of Bioinformatics Tools Hub for feedback, questions, or collaboration."
        >

            <div className="max-w-4xl mx-auto space-y-10 text-slate-700">

                {/* INTRO */}

                <section className="space-y-4">

                    <h2 className="text-2xl font-semibold text-slate-900">
                        Get in Touch
                    </h2>

                    <p>
                        If you have questions, suggestions, bug reports, or ideas for new
                        bioinformatics tools, feel free to reach out.
                    </p>

                    <p>
                        Feedback from researchers and students helps improve the platform
                        and guide future development.
                    </p>

                    <p>
                        Maintained by: Bilal Mustafa (PhD)
                    </p>
                    <p>
                        Bioinformatics Researcher / Data Scientist
                    </p>
                </section>


                {/* CONTACT METHODS */}

                <section className="grid md:grid-cols-3 gap-6">

                    {/* EMAIL */}

                    <a
                        href="mailto:your@email.com"
                        className="rounded-xl border border-slate-200 p-6 hover:border-cyan-400 transition"
                    >

                        <Mail className="mb-3 text-cyan-500" size={28} />

                        <h3 className="font-semibold text-slate-900">
                            Email
                        </h3>

                        <p className="text-sm text-slate-600 mt-1">
                            Send questions or feedback directly via email.
                        </p>

                    </a>


                    {/* GITHUB */}

                    <a
                        href="https://github.com/yourusername"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-200 p-6 hover:border-cyan-400 transition"
                    >

                        <Github className="mb-3 text-cyan-500" size={28} />

                        <h3 className="font-semibold text-slate-900">
                            GitHub
                        </h3>

                        <p className="text-sm text-slate-600 mt-1">
                            Report issues or view development updates.
                        </p>

                    </a>


                    {/* LINKEDIN */}

                    <a
                        href="https://linkedin.com/in/yourprofile"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-200 p-6 hover:border-cyan-400 transition"
                    >

                        <Linkedin className="mb-3 text-cyan-500" size={28} />

                        <h3 className="font-semibold text-slate-900">
                            LinkedIn
                        </h3>

                        <p className="text-sm text-slate-600 mt-1">
                            Connect for research or professional collaboration.
                        </p>

                    </a>

                </section>


                {/* CONTACT FORM */}

                <section className="space-y-4">

                    <h2 className="text-2xl font-semibold text-slate-900">
                        Send a Message
                    </h2>

                    <p>
                        You can also send a message using the form below.
                    </p>

                    <form
                        action="https://formspree.io/f/yourformid"
                        method="POST"
                        className="space-y-4"
                    >

                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            required
                            className="w-full rounded-lg border border-slate-200 p-3"
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Your email"
                            required
                            className="w-full rounded-lg border border-slate-200 p-3"
                        />

                        <textarea
                            name="message"
                            placeholder="Your message"
                            required
                            rows={5}
                            className="w-full rounded-lg border border-slate-200 p-3"
                        />

                        <button
                        aria-label="Submit Send Message"
                            type="submit"
                            className="rounded-lg bg-cyan-500 px-6 py-2 text-black font-medium hover:bg-cyan-400"
                        >
                            Send Message
                        </button>

                    </form>

                </section>

            </div>

        </PageLayout>

    )

}