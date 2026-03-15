import axios from "axios"
import fs from "fs-extra"
import path from "path"
import { pipeline } from "stream/promises"

const URL =
  "http://codonstatsdb.unr.edu/download/codonstatsdb_March2022.tar.gz"

async function run() {

  const outDir = path.join(process.cwd(), "data")
  await fs.ensureDir(outDir)

  const filePath =
    path.join(outDir, "codonstatsdb.tar.gz")

  console.log("Downloading CodonStatsDB (~5GB)...")

  const res = await axios({
    method: "GET",
    url: URL,
    responseType: "stream"
  })

  await pipeline(
    res.data,
    fs.createWriteStream(filePath)
  )

  console.log("Download complete")
}

run()