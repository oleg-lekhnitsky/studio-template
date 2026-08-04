import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })
const settingsDocuments = await client.fetch<Array<{ _id: string; footerWordmark?: string }>>(
  '*[_type == "siteSettings"]{_id, footerWordmark}'
)
if (!settingsDocuments.length) throw new Error('Site settings document was not found.')

let transaction = client.transaction()
for (const settings of settingsDocuments) {
  if (!settings.footerWordmark?.trim()) {
    transaction = transaction.patch(settings._id, patch => patch.set({ footerWordmark: 'Yuliana' }))
  }
}
await transaction.commit()

console.log('Added the default footer large name to Site settings.')
