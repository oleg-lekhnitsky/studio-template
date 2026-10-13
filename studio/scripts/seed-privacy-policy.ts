import { getCliClient } from 'sanity/cli'
import { privacyPolicyDefaults } from '../schemaTypes/privacyPolicyDefaults'

async function seed() {
const client = getCliClient({ apiVersion: '2026-08-01' }).withConfig({ perspective: 'raw', useCdn: false })
const settingsId = '4e409066-8870-4256-9bd0-a6b3b930ec39'
const documents = await client.fetch<Array<{
  _id: string
  _rev: string
  privacyPolicy?: { sections?: unknown[] }
  socialLinks?: Array<{ url?: string }>
}>>('*[_type == "siteSettings" && _id in $ids]{_id, _rev, privacyPolicy, socialLinks}', {
  ids: [settingsId, `drafts.${settingsId}`]
})
if (!documents.length) throw new Error('Site settings document was not found.')

let transaction = client.transaction()
let seeded = 0
for (const document of documents) {
  if (document.privacyPolicy?.sections?.length) continue
  const emailLink = document.socialLinks?.find(link => link.url?.startsWith('mailto:'))?.url
  const email = emailLink?.slice(7).split('?')[0] || 'hello@mmaze.studio'
  const policy = JSON.parse(JSON.stringify(privacyPolicyDefaults).replaceAll('hello@mmaze.studio', email))
  transaction = transaction.patch(document._id, patch => patch.ifRevisionId(document._rev).set({ privacyPolicy: policy }))
  seeded++
}
if (seeded) await transaction.commit()
console.log(`Seeded privacy policy in ${seeded} settings document(s) in dataset ${client.config().dataset}. Existing policies were preserved.`)

const published = await client.fetch<{ privacyPolicy?: { sections?: unknown[] } } | null>(
  '*[_id == $id][0]{privacyPolicy}', { id: settingsId }
)
if (!published?.privacyPolicy?.sections?.length) throw new Error('Published settings have no privacy policy; publish Site settings in Sanity.')
console.log(`Verified published policy: ${published.privacyPolicy.sections.length} sections.`)

}

seed().catch(() => {
  console.error("Privacy seed failed. Check Sanity authentication, network access, and Site settings.")
  process.exitCode = 1
})
