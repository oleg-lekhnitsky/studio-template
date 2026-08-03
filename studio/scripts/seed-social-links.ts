import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })
const settingsDocuments = await client.fetch<Array<{ _id: string }>>('*[_type == "siteSettings"]{_id}')
if (!settingsDocuments.length) throw new Error('Site settings document was not found.')

const socialLinks = [
  { _key: 'instagram', _type: 'socialLink', label: 'Instagram', url: 'https://www.instagram.com/' },
  { _key: 'vimeo', _type: 'socialLink', label: 'Vimeo', url: 'https://vimeo.com/' },
  { _key: 'linkedin', _type: 'socialLink', label: 'LinkedIn', url: 'https://www.linkedin.com/' }
]

let transaction = client.transaction()
for (const settings of settingsDocuments) {
  transaction = transaction.patch(settings._id, patch => patch.set({ socialLinks }))
}
await transaction.commit()

console.log('Added Instagram, Vimeo, and LinkedIn to Site settings.')
