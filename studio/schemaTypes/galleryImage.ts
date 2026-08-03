import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'galleryImage',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, validation: rule => rule.required(), fields: [{ name: 'alt', type: 'string' }] }),
    defineField({ name: 'width', type: 'string', options: { list: ['half', 'full'], layout: 'radio' }, initialValue: 'full' })
  ],
  preview: { select: { media: 'image', subtitle: 'width' }, prepare: ({ media, subtitle }) => ({ title: 'Image', subtitle, media }) }
})
