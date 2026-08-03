import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })

const people = [
  ['Maya Chen', 'Creative Director'],
  ['Leon Hart', 'Art Director'],
  ['Nora Vale', 'Photographer'],
  ['Theo Marin', 'Senior Designer'],
  ['Iris Okafor', 'Strategist'],
  ['Sasha Bell', 'Motion Designer'],
  ['Milo Tan', 'Creative Developer'],
  ['Amara Singh', 'Producer'],
  ['Rina Cole', 'Designer'],
  ['Felix North', 'Film Director'],
  ['Mina Park', 'Project Manager'],
  ['Jonas Reed', 'Sound Designer']
] as const

async function placeholderAsset(index: number) {
  const number = String(index + 1).padStart(2, '0')
  const filename = `studio-person-placeholder-${number}.svg`
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    { filename }
  )
  if (existing) return existing._id

  const lightness = 78 + (index % 4) * 4
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="hsl(0 0% ${lightness}%)"/></svg>`
  const uploaded = await client.assets.upload('image', Buffer.from(svg), {
    filename,
    contentType: 'image/svg+xml'
  })
  return uploaded._id
}

const settingsDocuments = await client.fetch<Array<{ _id: string }>>('*[_type == "siteSettings"]{_id}')
const settings = settingsDocuments.find(document => !document._id.startsWith('drafts.'))
if (!settings) throw new Error('Published Site settings document was not found.')

const assetIds = await Promise.all(people.map((_, index) => placeholderAsset(index)))
const entries = people.map(([name, position], index) => ({
  _key: `person-${String(index + 1).padStart(2, '0')}`,
  _type: 'person',
  name,
  position,
  image: {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetIds[index] },
    alt: `${name}, ${position}`
  }
}))

await client.patch(settings._id).set({ people: entries }).commit()
console.log(`Added ${entries.length} fictional people to Site settings.`)
