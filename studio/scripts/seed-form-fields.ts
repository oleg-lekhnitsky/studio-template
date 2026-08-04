import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })
const settingsDocuments = await client.fetch<Array<{
  _id: string
  contactFormFields?: unknown[]
  jobFormFields?: unknown[]
}>>('*[_type == "siteSettings"]{_id, contactFormFields, jobFormFields}')
if (!settingsDocuments.length) throw new Error('Site settings document was not found.')

const contactFormFields = [
  { _key: 'name', _type: 'formField', label: 'Name', type: 'text', required: true },
  { _key: 'email', _type: 'formField', label: 'Email', type: 'email', required: true },
  { _key: 'message', _type: 'formField', label: 'Message', type: 'textarea', required: true }
]

const jobFormFields = [
  { _key: 'name', _type: 'formField', label: 'Name', type: 'text', required: true },
  { _key: 'email', _type: 'formField', label: 'Email', type: 'email', required: true },
  {
    _key: 'portfolio',
    _type: 'formField',
    label: 'Portfolio link',
    type: 'url',
    placeholder: 'https://yourportfolio.com',
    required: true
  },
  { _key: 'message', _type: 'formField', label: 'Message', type: 'textarea', required: true }
]

let transaction = client.transaction()
for (const settings of settingsDocuments) {
  const fields: Record<string, unknown> = {}
  if (!settings.contactFormFields?.length) fields.contactFormFields = contactFormFields
  if (!settings.jobFormFields?.length) fields.jobFormFields = jobFormFields
  if (Object.keys(fields).length) {
    transaction = transaction.patch(settings._id, patch => patch.set(fields))
  }
}
await transaction.commit()

console.log('Added the default Contact and Job application fields to Site settings.')
