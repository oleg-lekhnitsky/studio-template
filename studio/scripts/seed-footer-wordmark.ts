import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })
const settingsDocuments = await client.fetch<Array<{
  _id: string
  footerWordmark?: string
  footerDescription?: string
  headerText?: string
}>>(
  '*[_type == "siteSettings"]{_id, footerWordmark, footerDescription, headerText}'
)
if (!settingsDocuments.length) throw new Error('Site settings document was not found.')

let transaction = client.transaction()
for (const settings of settingsDocuments) {
  if (!settings.footerWordmark?.trim()) {
    transaction = transaction.patch(settings._id, patch => patch.set({ footerWordmark: 'Yuliana' }))
  }
  if (!settings.footerDescription?.trim()) {
    transaction = transaction.patch(settings._id, patch => patch.set({ footerDescription: 'Independent creative studio' }))
  }
  if (!settings.headerText?.trim()) {
    transaction = transaction.patch(settings._id, patch => patch.set({ headerText: 'Studio' }))
  }
}
await transaction.commit()

console.log('Added the default header and footer text to Site settings.')
