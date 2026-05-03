import fs from "fs"
import path from "path"
import { tools } from "../data/tools"

const BASE_URL = "https://biotoolshub.org"

const today = new Date().toISOString().split("T")[0]

/*
-----------------------------------------
Helpers
-----------------------------------------
*/

// const slugify = (str: string) =>
//   str.toLowerCase().replace(/\s+/g, "-")

const categoryToSlug = (category: string) =>
  category
    .toLowerCase()
    .replace("bioinformatics tools", "")
    .replace("tools", "")
    .trim()
    .replace(/\s+/g, "-")


/*
-----------------------------------------
Static pages
-----------------------------------------
*/

const staticPages = [
  "",
  "/about",
  "/documentation",
  "/citations",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/tools"
]

/*
-----------------------------------------
Tool pages
-----------------------------------------
*/

const toolPages = tools.map(t => t.path)

/*
-----------------------------------------
Category pages
-----------------------------------------
*/

// const categories = Array.from(
//   new Set(tools.map(t => slugify(t.category)))
// )

const categories = Array.from(
  new Set(tools.map(t => categoryToSlug(t.category)))
)


const categoryPages = categories.map(c => `/tools/${c}`)

/*
-----------------------------------------
Combine URLs
-----------------------------------------
*/

const urls = [
  ...staticPages,
  ...categoryPages,
  ...toolPages
]

/*
-----------------------------------------
Build XML
-----------------------------------------
*/

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.map(url => {

  let priority = "0.7"
  let changefreq = "monthly"

  if (url === "") {
    priority = "1.0"
    changefreq = "weekly"
  }

  if (url.startsWith("/tools") && url.split("/").length === 2) {
    priority = "0.9"
  }

  if (url.startsWith("/tools/") && url.split("/").length === 3) {
    priority = "0.8"
  }

  return `
<url>
<loc>${BASE_URL}${url}</loc>
<lastmod>${today}</lastmod>
<changefreq>${changefreq}</changefreq>
<priority>${priority}</priority>
</url>
`
}).join("")}

</urlset>`

/*
-----------------------------------------
Write file
-----------------------------------------
*/

fs.writeFileSync(
  path.join(process.cwd(), "public", "sitemap.xml"),
  xml
)

console.log("✅ Sitemap generated")