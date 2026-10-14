import { getCliClient } from 'sanity/cli'
import { readFile } from 'node:fs/promises'

const client = getCliClient({ apiVersion: '2026-08-02' })
const settings = await client.fetch<{ _id: string } | null>('*[_type == "siteSettings"][0]{_id}')
if (!settings) throw new Error('Site settings document not found')

const css = await readFile(new URL('../../app/assets/css/main.css', import.meta.url), 'utf8')
const accent = css.match(/--accent:\s*(#[\da-f]{6})\s*;/i)?.[1]
if (!accent) throw new Error('Website accent color not found')
const poster = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><path fill="${accent}" d="M0 0h1920v1080H0z"/></svg>`
const asset = await client.assets.upload('image', Buffer.from(poster), {
  filename: 'hero-accent-poster.svg',
  contentType: 'image/svg+xml'
})

await client.patch(settings._id).set({
  heroPoster: {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: 'Accent video placeholder'
  }
}).commit()

console.log('Accent placeholder assigned to the hero video poster.')
