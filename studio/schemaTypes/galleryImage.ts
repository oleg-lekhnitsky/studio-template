import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'galleryImage',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, validation: rule => rule.required(), fields: [{ name: 'alt', type: 'string' }] }),
    defineField({ name: 'width', type: 'string', options: { list: ['half', 'full'], layout: 'radio' }, initialValue: 'full' }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect ratio',
      description: 'Use the same ratio as a neighboring video to match its height. Bento layouts control tile shape on desktop.',
      type: 'string',
      options: {
        list: [
          { title: 'Original', value: 'original' },
          { title: 'Landscape 16:9', value: '16:9' },
          { title: 'Landscape 4:3', value: '4:3' },
          { title: 'Square 1:1', value: '1:1' },
          { title: 'Portrait 4:5', value: '4:5' },
          { title: 'Portrait 9:16', value: '9:16' }
        ],
        layout: 'radio'
      },
      initialValue: 'original'
    })
  ],
  preview: { select: { media: 'image', subtitle: 'width' }, prepare: ({ media, subtitle }) => ({ title: 'Image', subtitle, media }) }
})
