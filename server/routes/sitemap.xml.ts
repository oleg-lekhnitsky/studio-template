import { useRuntimeConfig } from 'nitropack/runtime'

interface SitemapItem { slug?: string; _updatedAt?: string }
interface SitemapEntry { path: string; lastmod?: string }
interface SitemapSettings {
  disableCases?: boolean
  disableAbout?: boolean
  disableJobs?: boolean
  disableContact?: boolean
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  })[character]!)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')
  const projectId = String(config.public.sanityProjectId)
  const dataset = String(config.public.sanityDataset)
  const query = `{
    "settings": *[_type == "siteSettings" && _id == "4e409066-8870-4256-9bd0-a6b3b930ec39"][0]{disableCases, disableAbout, disableJobs, disableContact},
    "documents": *[(_type == "case" || (_type == "job" && active == true)) && defined(slug.current) && !(_id in path("drafts.**"))]{_type, "slug": slug.current, _updatedAt}
  }`
  let documents: Array<SitemapItem & { _type?: string }> = []
  let settings: SitemapSettings = {}

  try {
    const response = await $fetch<{ result: { documents?: typeof documents; settings?: SitemapSettings | null } }>(
      `https://${projectId}.api.sanity.io/v2026-08-01/data/query/${dataset}`,
      { query: { query } }
    )
    documents = response.result?.documents || []
    settings = response.result?.settings || {}
  } catch {
    // Static pages remain discoverable if Sanity is temporarily unavailable.
  }

  const entries: SitemapEntry[] = [
    ...[
      '/',
      ...(!settings.disableCases ? ['/projects'] : []),
      ...(!settings.disableAbout ? ['/about'] : []),
      ...(!settings.disableJobs ? ['/jobs'] : []),
      ...(!settings.disableContact ? ['/contact'] : [])
    ].map(path => ({ path })),
    ...documents.filter(document => document.slug && (document._type === 'job'
      ? !settings.disableJobs : document._type === 'case' && !settings.disableCases)).map(document => ({
      path: `/${document._type === 'job' ? 'jobs' : 'projects'}/${encodeURIComponent(document.slug!)}`,
      lastmod: document._updatedAt
    }))
  ]
  const xml = entries.map(entry => [
    '<url>',
    `<loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>`,
    entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '',
    '</url>'
  ].join('')).join('')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`
})
