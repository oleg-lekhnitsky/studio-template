import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })
const categories = [
  ['Branding', 'Digital'],
  ['Campaigns', 'Motion'],
  ['Culture', 'Branding'],
  ['Digital', 'Products'],
  ['Branding', 'Products'],
  ['Culture', 'Campaigns'],
  ['Digital', 'Motion'],
  ['Branding', 'Campaigns'],
  ['Products', 'Motion'],
  ['Culture', 'Digital'],
  ['Branding', 'Culture'],
  ['Digital', 'Campaigns']
]

const names = Array.from(new Set(categories.flat()))
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

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
for (const [index, values] of categories.entries()) {
  transaction = transaction.patch(`test-case-${String(index + 1).padStart(2, '0')}`, patch => patch.set({
    categories: values.map((value, categoryIndex) => ({
      _key: `category-${slugify(value)}-${categoryIndex}`,
      _type: 'reference',
      _ref: `case-category-${slugify(value)}`
    }))
  }))
}
await transaction.commit()
console.log(`Added categories to ${categories.length} test cases.`)
