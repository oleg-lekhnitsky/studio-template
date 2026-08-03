import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'caseCategory',
  title: 'Case category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: rule => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: rule => rule.required()
    })
  ],
  preview: { select: { title: 'title' } }
})
