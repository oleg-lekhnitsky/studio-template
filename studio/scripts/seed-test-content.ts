import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })

const coverDesigns = [
  { color: '#06f90e', width: 1600, height: 1200 },
  { color: '#ff5c35', width: 1200, height: 1600 },
  { color: '#5d5fef', width: 1600, height: 900 },
  { color: '#ffd400', width: 1200, height: 1200 },
  { color: '#ff90e8', width: 1400, height: 1800 },
  { color: '#00c2ff', width: 1800, height: 1200 },
  { color: '#ff3347', width: 1600, height: 1000 },
  { color: '#7bffb2', width: 1100, height: 1600 },
  { color: '#a66cff', width: 1800, height: 1350 },
  { color: '#ff8a00', width: 1000, height: 1400 },
  { color: '#29d3a5', width: 1700, height: 1000 },
  { color: '#f2f2f2', width: 1300, height: 1300 }
]

async function solidAsset(filename: string, color: string, width: number, height: number) {
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    { filename }
  )
  if (existing) return existing._id

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${color}"/></svg>`
  const uploaded = await client.assets.upload('image', Buffer.from(svg), {
    filename,
    contentType: 'image/svg+xml'
  })
  return uploaded._id
}

const assetIds = await Promise.all(coverDesigns.map(({ color, width, height }, index) =>
  solidAsset(`portfolio-test-cover-solid-${String(index + 1).padStart(2, '0')}.svg`, color, width, height)
))

const contentAssets: Array<{ landscape: string; portraitA: string; portraitB: string }> = []
for (const [index, { color }] of coverDesigns.entries()) {
  const number = String(index + 1).padStart(2, '0')
  const portraitColorA = coverDesigns[(index + 1) % coverDesigns.length].color
  const portraitColorB = coverDesigns[(index + 2) % coverDesigns.length].color
  const landscape = await solidAsset(`portfolio-test-content-${number}-landscape.svg`, color, 1920, 1080)
  const portraitA = await solidAsset(`portfolio-test-content-${number}-portrait-a.svg`, portraitColorA, 1080, 1350)
  const portraitB = await solidAsset(`portfolio-test-content-${number}-portrait-b.svg`, portraitColorB, 1080, 1350)
  contentAssets.push({ landscape, portraitA, portraitB })
}

const image = (assetId: string, alt: string) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: assetId },
  alt
})

const block = (key: string, text: string) => ({
  _key: key,
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _key: `${key}-span`, _type: 'span', marks: [], text }]
})

const caseTitles = [
  'Signal House', 'After Hours', 'Field Notes', 'Open Form',
  'Soft Geometry', 'Common Ground', 'New Rituals', 'Parallel Lines',
  'Bright Matter', 'Local Weather', 'Public Memory', 'Future Archive'
]

const jobTitles = [
  'Senior Designer', 'Junior Designer', 'Art Director', 'Motion Designer',
  'Frontend Developer', 'Creative Developer', 'Project Manager', 'Producer',
  'Design Intern', 'Copywriter', 'Strategist', 'Studio Manager'
]

function caseContent(title: string, index: number) {
  const labels = ['Strategy', 'Approach', 'Outcome']
  const sections = Array.from({ length: 3 }, (_, group) => {
    const assets = contentAssets[(index + group) % contentAssets.length]
    const number = index + 1
    const groupNumber = group + 1
    return [
      {
        _key: `landscape-${number}-${groupNumber}`,
        _type: 'galleryImage',
        width: 'full',
        image: image(assets.landscape, `${title} landscape placeholder ${groupNumber}`)
      },
      {
        _key: `portrait-a-${number}-${groupNumber}`,
        _type: 'galleryImage',
        width: 'half',
        image: image(assets.portraitA, `${title} portrait placeholder ${groupNumber}a`)
      },
      {
        _key: `portrait-b-${number}-${groupNumber}`,
        _type: 'galleryImage',
        width: 'half',
        image: image(assets.portraitB, `${title} portrait placeholder ${groupNumber}b`)
      },
      {
        _key: `text-${number}-${groupNumber}`,
        _type: 'textBlock',
        label: labels[group],
        width: 'full',
        text: [block(
          `case-copy-${number}-${groupNumber}`,
          `${title} uses a clear and flexible process to connect research, visual direction, and production. This placeholder section describes the ${labels[group].toLowerCase()} behind the project and can be replaced with detailed case-study copy in Sanity.`
        )]
      }
    ]
  }).flat()

  return sections
}

const cases = caseTitles.map((title, index) => ({
  _id: `test-case-${String(index + 1).padStart(2, '0')}`,
  _type: 'case',
  title,
  slug: { _type: 'slug', current: `test-case-${index + 1}` },
  year: String(2026 - (index % 4)),
  summary: `A concise preview of ${title}.`,
  description: `${title} is a longer placeholder case introduction describing the idea, context, approach, and outcome of the project. This copy appears after the first image, while the shorter preview description is reserved for cards.`,
  featured: index < 6,
  orderRank: index + 1,
  cover: image(assetIds[index], `${title} placeholder cover`),
  content: caseContent(title, index)
}))

const employmentTypes = ['Full-time', 'Contract', 'Part-time', 'Internship']
const locations = ['Moscow / Hybrid', 'Remote', 'Berlin / Hybrid', 'London / Hybrid']

const jobs = jobTitles.map((title, index) => ({
  _id: `test-job-${String(index + 1).padStart(2, '0')}`,
  _type: 'job',
  title,
  slug: { _type: 'slug', current: `test-job-${index + 1}` },
  active: true,
  location: locations[index % locations.length],
  employmentType: employmentTypes[index % employmentTypes.length],
  summary: `We are looking for a ${title.toLowerCase()} to join our growing team.`,
  description: [
    block(`job-intro-${index + 1}`, `As our ${title}, you will collaborate with a small multidisciplinary team on identities, campaigns, websites, and moving-image projects.`),
    block(`job-details-${index + 1}`, 'You are thoughtful, curious, comfortable sharing work in progress, and able to turn strong ideas into precise outcomes.')
  ],
  closingDate: `2026-${String(9 + (index % 4)).padStart(2, '0')}-${String(10 + index).padStart(2, '0')}`,
  orderRank: index + 1
}))

let transaction = client.transaction()
for (const document of [...cases, ...jobs]) transaction = transaction.createOrReplace(document)
await transaction.commit()

console.log(`Seeded ${cases.length} cases and ${jobs.length} vacancies.`)
