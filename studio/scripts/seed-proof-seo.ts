import { getCliClient } from 'sanity/cli'

async function seed() {
  const client = getCliClient({ apiVersion: '2026-08-01' }).withConfig({ perspective: 'raw', useCdn: false })
  const documents = await client.fetch<Array<{ _id: string }>>(
    '*[_type == "case" && _id in ["test-case-01", "drafts.test-case-01"] && slug.current == "MoneyAppProof"]{_id}'
  )
  if (!documents.some(document => document._id === 'test-case-01')) throw new Error('Published Proof project not found')
  let transaction = client.transaction()
  for (const document of documents) {
    transaction = transaction.patch(document._id, patch => patch.setIfMissing({
      seo: { _type: 'object' },
      'seo.title': 'Proof Money App — Brand Strategy & Visual Identity | mmaze.studio',
      'seo.description': 'Discover how mmaze.studio shaped Proof, a social financial app, through brand strategy, tone of voice, visual identity and its Woof mascot.'
    }))
  }
  await transaction.commit()
  const project = await client.fetch<{ seo?: { title?: string; description?: string } } | null>(
    '*[_id == "test-case-01"][0]{seo}'
  )
  if (!project?.seo?.title || !project.seo.description) throw new Error('Proof SEO verification failed')
  console.log(`Verified Proof SEO in ${client.config().dataset}: ${project.seo.title}`)
}

seed().catch((error: unknown) => {
  console.error('Proof SEO seed failed:', error instanceof Error ? error.message : 'Unknown error')
  process.exitCode = 1
})
