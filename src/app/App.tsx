import { BrowserRouter, Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"

import Home from "./pages/Home"
import { tools } from "../data/tools"
import ScrollToTop from "../components/ScrollToTop"
import BackToTop from "../components/BackToTop"
import About from "./pages/About"
import Documentation from "./pages/Documentation"
import Citations from "./pages/Citations"
import NotFound from "./pages/NotFound"
import Disclaimer from "./pages/Disclaimer"
import Privacy from "./pages/Privacy"
import Contact from "./pages/Contact"
import Terms from "./pages/Terms"
import ToolCategory from "./pages/ToolCategory"
import ToolsIndex from "./pages/ToolsIndex"

// export default function App() {
//   return (
//     <div className="size-full">
//       <h1>Bioinformatics Tool Hub</h1>
//       <SequenceConverter />
//     </div>
//   );
// }


export default function App() {

  return (

    <BrowserRouter>

      <ScrollToTop />
      <Suspense fallback={null}>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/documentation" element={<Documentation />} />

        <Route path="/citations" element={<Citations />} />

        <Route path="/disclaimer" element={<Disclaimer />} />

        <Route path="/privacy" element={<Privacy />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/terms" element={<Terms />} />

        <Route path="/tools/:category" element={<ToolCategory />} />

        <Route path="/tools" element={<ToolsIndex />} />

        {tools.map((tool) => {
          const LazyTool = lazy(tool.component)

          return (
            <Route
              key={tool.path}
              path={tool.path}
              element={
                <Suspense
                  fallback={
                    <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
                      Loading tool...
                    </div>
                  }
                >
                  <LazyTool />
                </Suspense>
              }
            />
          )
        })}

        {/* 404 catch-all MUST be last */}

        <Route path="*" element={<NotFound />} />

      </Routes>

      </Suspense>

      <BackToTop />

    </BrowserRouter>

  )

}
