import { useRuntimeConfig } from 'nitropack/runtime'

interface SitemapItem { slug?: string; _updatedAt?: string }
interface SitemapEntry { path: string; lastmod?: string }

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')
  const projectId = String(config.public.sanityProjectId)
  const dataset = String(config.public.sanityDataset)
  const query = `*[_type in ["case", "job"] && defined(slug.current)]{_type, "slug": slug.current, _updatedAt}`
  let documents: Array<SitemapItem & { _type?: string }> = []

  try {
    const response = await $fetch<{ result: typeof documents }>(
      `https://${projectId}.api.sanity.io/v2026-08-01/data/query/${dataset}`,
      { query: { query } }
    )
    documents = response.result || []
  } catch {
    // Static pages remain discoverable if Sanity is temporarily unavailable.
  }

  const entries: SitemapEntry[] = [
    ...['/', '/cases', '/about', '/jobs', '/contact'].map(path => ({ path })),
    ...documents.map(document => ({
      path: `/${document._type === 'job' ? 'jobs' : 'cases'}/${document.slug}`,
      lastmod: document._updatedAt
    }))
  ]
  const xml = entries.map(entry => [
    '<url>',
    `<loc>${siteUrl}${entry.path}</loc>`,
    entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '',
    '</url>'
  ].join('')).join('')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`
})
