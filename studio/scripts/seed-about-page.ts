import { getCliClient } from 'sanity/cli'
import { aboutPageDefaults } from '../schemaTypes/aboutPageDefaults'

async function seed() {
  const client = getCliClient({ apiVersion: '2026-08-01' }).withConfig({ perspective: 'raw', useCdn: false })
  const settingsId = '4e409066-8870-4256-9bd0-a6b3b930ec39'
  const documents = await client.fetch<Array<{ _id: string }>>(
    '*[_type == "siteSettings" && _id in $ids]{_id}',
    { ids: [settingsId, `drafts.${settingsId}`] }
  )
  if (!documents.some(document => document._id === settingsId)) {
    throw new Error('Published Site settings document was not found.')
  }

  let transaction = client.transaction()
  for (const document of documents) {
    transaction = transaction.patch(document._id, patch => patch.setIfMissing(aboutPageDefaults))
  }
  await transaction.commit()

  const published = await client.fetch<Record<string, unknown> | null>(
    '*[_id == $id][0]', { id: settingsId }
  )
  for (const field of Object.keys(aboutPageDefaults)) {
    if (published?.[field] === undefined) throw new Error(`Missing seeded field: ${field}`)
  }
  console.log(`Seeded and verified About content in ${client.config().dataset} (${documents.length} document(s)). Existing content and media were preserved.`)
}

seed().catch((error: unknown) => {
  console.error('About seed failed:', error instanceof Error ? error.message : 'Unknown error')
  process.exitCode = 1
})
