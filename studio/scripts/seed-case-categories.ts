import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' }).withConfig({ perspective: 'raw' })
const settings = await client.fetch<{ aboutServices?: string[] } | null>(
  '*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{aboutServices}'
)
const names = Array.from(new Set((settings?.aboutServices ?? [
  'Video Production', 'Animation', 'Creative Concepts', 'AI-production',
  'Design & Brand Identity', '3D & VFX', 'Remote Production'
]).map(name => name.trim()).filter(Boolean)))
if (!names.length) throw new Error('Add services in Site settings first.')
const categories = Array.from({ length: 12 }, (_, index) =>
  Array.from(new Set([names[index % names.length], names[(index + 1) % names.length]]))
)
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
const caseIds = await client.fetch<string[]>('*[_type == "case"]._id')
for (const [index, values] of categories.entries()) {
  for (const id of [`test-case-${String(index + 1).padStart(2, '0')}`, `drafts.test-case-${String(index + 1).padStart(2, '0')}`].filter(id => caseIds.includes(id))) {
  transaction = transaction.patch(id, patch => patch.set({
    categories: values.map((value, categoryIndex) => ({
      _key: `category-${slugify(value)}-${categoryIndex}`,
      _type: 'reference',
      _ref: `case-category-${slugify(value)}`
    }))
  }))
  }
}
await transaction.commit()
for (const title of ['Branding', 'Digital', 'Campaigns', 'Motion', 'Culture', 'Products']) {
  const id = `case-category-${slugify(title)}`
  if (names.includes(title)) continue
  const references = await client.fetch<number>('count(*[references($id)])', { id })
  if (!references) await client.delete(id)
}
console.log(`Added categories to ${categories.length} test cases.`)
