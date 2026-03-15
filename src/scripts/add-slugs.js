import fs from "fs"

let file = fs.readFileSync("src/data/tools.ts","utf8")

file = file.replace(
  /path:\s*"\/tools\/([^"]+)"/g,
  (match, slug) => `slug: "${slug}",\n    ${match}`
)

fs.writeFileSync("tools.ts", file)

console.log("Slugs added!")