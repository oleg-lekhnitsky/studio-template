import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'job',
  title: 'Job',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: rule => rule.required() }),
    defineField({ name: 'active', type: 'boolean', initialValue: true }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'employmentType', title: 'Employment type', type: 'string', options: { list: ['Full-time', 'Part-time', 'Contract', 'Internship'] } }),
    defineField({ name: 'summary', type: 'text', rows: 3 }),
    defineField({ name: 'description', type: 'array', of: [{ type: 'block' }], validation: rule => rule.required() }),
    defineField({ name: 'closingDate', title: 'Closing date', type: 'date' }),
    defineField({ name: 'orderRank', type: 'number', description: 'Lower numbers appear first.' })
  ],
  preview: {
    select: { title: 'title', location: 'location', active: 'active' },
    prepare: ({ title, location, active }) => ({ title, subtitle: `${active ? 'Active' : 'Inactive'}${location ? ` · ${location}` : ''}` })
  }
})
