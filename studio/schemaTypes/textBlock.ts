import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'textBlock',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Section label', type: 'string' }),
    defineField({ name: 'text', type: 'array', of: [{ type: 'block' }], validation: rule => rule.required() }),
    defineField({ name: 'width', type: 'string', options: { list: ['half', 'full'], layout: 'radio' }, initialValue: 'full' })
  ],
  preview: { select: { label: 'label' }, prepare: ({ label }) => ({ title: label || 'Text block' }) }
})
