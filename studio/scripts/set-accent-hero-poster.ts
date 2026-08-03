import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-02' })
const settings = await client.fetch<{ _id: string } | null>('*[_type == "siteSettings"][0]{_id}')
const asset = await client.fetch<{ _id: string } | null>(
  '*[_type == "sanity.imageAsset" && originalFilename == "portfolio-test-cover-solid-01.svg"][0]{_id}'
)

if (!settings) throw new Error('Site settings document not found')
if (!asset) throw new Error('Accent placeholder asset not found')

await client.patch(settings._id).set({
  heroPoster: {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: 'Accent video placeholder'
  }
}).commit()

console.log('Accent placeholder assigned to the hero video poster.')
