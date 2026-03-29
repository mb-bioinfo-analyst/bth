export interface Env {
  REVEL: R2Bucket
}

type IndexEntry = {
  chr: string
  start: number
  end: number
  file: string
}

type Variant = {
  chr: string
  pos: number
  ref: string
  alt: string
}

type BatchRequest = {
  variants?: Array<{
    input: string
    variant: Variant
  }>
  annotateGenes?: boolean
}

type EnsemblGeneRecord = {
  id?: string
  external_name?: string
  biotype?: string
  feature_type?: string
  start?: number
  end?: number
}

const CHUNK_CACHE = new Map<string, Record<string, number>>()
const INDEX_CACHE_KEY = "__revel_index__"
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=3600",
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {

    // ✅ HANDLE CORS PREFLIGHT
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    try {
      const url = new URL(request.url)

      if (url.pathname === "/revel" && request.method === "GET") {
        return handleRevel(request, env)
      }

      if (url.pathname === "/revel/batch" && request.method === "POST") {
        return handleRevelBatch(request, env)
      }

      if (url.pathname === "/gene" && request.method === "GET") {
        return handleGene(request)
      }

      if (url.pathname === "/openapi.json") {
        return json(buildOpenApiSpec())
      }

      if (url.pathname === "/docs") {
        return html(buildSwaggerHtml())
      }

      return json({ error: "Not found" }, 404)

    } catch (err) {
      return json({ error: String(err) }, 500)
    }
  },
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

async function handleRevel(request: Request, env: Env): Promise<Response> {
  const parsed = getVariantParams(request)
  if (!parsed.valid) {
    return json({
      error: "Missing or invalid parameters",
      expected: "chr, pos, ref, alt",
    }, 400)
  }

  const result = await queryRevel(parsed.variant, env)

  return json(result)
}

async function handleRevelBatch(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as BatchRequest
  const variants = Array.isArray(body.variants) ? body.variants : []
  const annotateGenes = body.annotateGenes === true

  if (!variants.length) {
    return json({ error: "No variants supplied" }, 400)
  }

  if (variants.length > 500) {
    return json({ error: "Batch size too large. Max 500 variants." }, 400)
  }

  const results = await Promise.all(
    variants.map(async (item) => {
      const v = normalizeVariant(item.variant)
      if (!v) {
        return {
          input: item.input,
          variant: null,
          score: null,
          gene: null,
          source: null,
          error: "Invalid variant",
        }
      }

      const revel = await queryRevel(v, env)
      const gene = annotateGenes ? await queryGene(v.chr, v.pos) : null

      return {
        input: item.input,
        variant: v,
        score: revel.score ?? null,
        gene,
        source: revel.source ?? null,
      }
    })
  )

  return json({ results })
}

async function handleGene(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const chr = normalizeChr(url.searchParams.get("chr") || "")
  const pos = Number(url.searchParams.get("pos") || "")

  if (!chr || !Number.isInteger(pos) || pos <= 0) {
    return json({ error: "Missing or invalid parameters" }, 400)
  }

  const gene = await queryGene(chr, pos)

  return json(gene ?? {
    symbol: null,
    geneId: null,
    biotype: null,
  })
}

async function queryRevel(
  variant: Variant,
  env: Env
): Promise<{ score: number | null; source: string | null; reason?: string }> {
  const index = await loadIndex(env)

  const entry = index.find(
    r =>
      normalizeChr(r.chr) === normalizeChr(variant.chr) &&
      variant.pos >= r.start &&
      variant.pos <= r.end
  )

  if (!entry) {
    return {
      score: null,
      source: null,
      reason: "Variant outside indexed regions",
    }
  }

  let chunk = CHUNK_CACHE.get(entry.file)

  if (!chunk) {
    const dataObj = await env.REVEL.get(entry.file)
    if (!dataObj) {
      return {
        score: null,
        source: entry.file,
        reason: "Chunk file missing",
      }
    }

    chunk = JSON.parse(await dataObj.text()) as Record<string, number>
    CHUNK_CACHE.set(entry.file, chunk)
  }

  const key = `${variant.pos}_${variant.ref}_${variant.alt}`

  return {
    score: chunk[key] ?? null,
    source: entry.file,
  }
}

async function loadIndex(env: Env): Promise<IndexEntry[]> {
  const cached = CHUNK_CACHE.get(INDEX_CACHE_KEY)
  if (cached) {
    return cached as unknown as IndexEntry[]
  }

  const indexObj = await env.REVEL.get("revel_index.json")
  if (!indexObj) throw new Error("REVEL index not found")

  const index = JSON.parse(await indexObj.text()) as IndexEntry[]
  CHUNK_CACHE.set(INDEX_CACHE_KEY, index as unknown as Record<string, number>)

  return index
}

async function queryGene(chr: string, pos: number) {
  const region = `${chr}:${pos}-${pos}`
  const url =
    `https://grch37.rest.ensembl.org/overlap/region/homo_sapiens/${region}` +
    `?feature=gene`

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  })

  if (!res.ok) {
    return null
  }

  const data = (await res.json()) as EnsemblGeneRecord[]

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const best = data[0]

  return {
    symbol: best.external_name ?? null,
    geneId: best.id ?? null,
    biotype: best.biotype ?? null,
  }
}

function getVariantParams(request: Request):
  | { valid: true; variant: Variant }
  | { valid: false } {
  const url = new URL(request.url)

  const chr = normalizeChr(url.searchParams.get("chr") || "")
  const pos = Number(url.searchParams.get("pos") || "")
  const ref = (url.searchParams.get("ref") || "").toUpperCase()
  const alt = (url.searchParams.get("alt") || "").toUpperCase()

  const variant = normalizeVariant({ chr, pos, ref, alt })
  if (!variant) return { valid: false }

  return { valid: true, variant }
}

function normalizeVariant(input: Partial<Variant>): Variant | null {
  const chr = normalizeChr(input.chr || "")
  const pos = Number(input.pos)
  const ref = String(input.ref || "").toUpperCase()
  const alt = String(input.alt || "").toUpperCase()

  if (!chr) return null
  if (!Number.isInteger(pos) || pos <= 0) return null
  if (!/^[ACGT]+$/.test(ref)) return null
  if (!/^[ACGT]+$/.test(alt)) return null

  return { chr, pos, ref, alt }
}

function normalizeChr(chr: string): string {
  return chr
    .replace(/^chr/i, "")
    .replace(/^_/, "")
    .replace(/^0+/, "")
    .toUpperCase()
}

function buildOpenApiSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "BioToolsHub REVEL API",
      version: "1.0.0",
      description: "REVEL v1.3 lookup API with optional lightweight gene overlap annotation.",
    },
    paths: {
      "/revel": {
        get: {
          summary: "Lookup one REVEL score",
          parameters: [
            { name: "chr", in: "query", required: true, schema: { type: "string" } },
            { name: "pos", in: "query", required: true, schema: { type: "integer" } },
            { name: "ref", in: "query", required: true, schema: { type: "string" } },
            { name: "alt", in: "query", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "REVEL lookup result" },
          },
        },
      },
      "/revel/batch": {
        post: {
          summary: "Lookup a batch of REVEL scores",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    annotateGenes: { type: "boolean" },
                    variants: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          input: { type: "string" },
                          variant: {
                            type: "object",
                            properties: {
                              chr: { type: "string" },
                              pos: { type: "integer" },
                              ref: { type: "string" },
                              alt: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Batch result" },
          },
        },
      },
      "/gene": {
        get: {
          summary: "Lightweight overlapping gene lookup",
          parameters: [
            { name: "chr", in: "query", required: true, schema: { type: "string" } },
            { name: "pos", in: "query", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Gene overlap result" },
          },
        },
      },
    },
  }
}

function buildSwaggerHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>BioToolsHub REVEL API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    #swagger-ui { max-width: 1200px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout"
    });
  </script>
</body>
</html>`
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      "Cache-Control": "public, max-age=3600",
    },
  })
}

function html(payload: string, status = 200): Response {
  return new Response(payload, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders(),
    },
  })
}