import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' }).withConfig({ perspective: 'raw', useCdn: false })
const cases = await client.fetch<Array<{ _id: string; categories?: Array<string | { _ref?: string }> }>>(
  '*[_type == "case"]{_id, categories}'
)

const names = Array.from(new Set(cases.flatMap(document =>
  (document.categories || []).filter((category): category is string => typeof category === 'string')
)))

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

for (const title of names) {
  const slug = slugify(title)
  await client.createIfNotExists({
    _id: `case-category-${slug}`,
    _type: 'caseCategory',
    title,
    slug: { _type: 'slug', current: slug }
  })
}

let transaction = client.transaction()
let migrated = 0
for (const document of cases) {
  const categories = document.categories || []
  if (!categories.some(category => typeof category === 'string')) continue

  const references = categories.map((category, index) => {
    if (typeof category !== 'string') return category
    return {
      _key: `category-${slugify(category)}-${index}`,
      _type: 'reference',
      _ref: `case-category-${slugify(category)}`
    }
  })
  transaction = transaction.patch(document._id, patch => patch.set({ categories: references }))
  migrated += 1
}

if (migrated) await transaction.commit()
console.log(`Created ${names.length} category documents and migrated ${migrated} cases.`)
