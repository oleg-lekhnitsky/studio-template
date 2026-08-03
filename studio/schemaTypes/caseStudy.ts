import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'case',
  title: 'Case',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: rule => rule.required() }),
    defineField({ name: 'year', type: 'string' }),
    defineField({
      name: 'categories',
      title: 'Categories',
      description: 'Used to filter projects on the Cases page.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'caseCategory' }] }],
      validation: rule => rule.unique()
    }),
    defineField({
      name: 'cast',
      title: 'Cast / Credits',
      description: 'People and roles shown at the end of the case.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'role', type: 'string', validation: rule => rule.required() }),
          defineField({ name: 'name', type: 'string', validation: rule => rule.required() })
        ],
        preview: { select: { title: 'role', subtitle: 'name' } }
      }]
    }),
    defineField({
      name: 'summary',
      title: 'Preview description',
      description: 'A short line shown below the case name on cards.',
      type: 'string',
      validation: rule => rule.max(160)
    }),
    defineField({
      name: 'description',
      title: 'Case introduction',
      description: 'The longer description shown inside the case after its first image.',
      type: 'text',
      rows: 6
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'orderRank', type: 'number', description: 'Lower numbers appear first.' }),
    defineField({ name: 'cover', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' }] }),
    defineField({
      name: 'coverVideo',
      title: 'Cover video',
      description: 'Use a short, compressed MP4 or WebM without an audio track when possible.',
      description: 'Optional short MP4 or WebM. When present, it replaces the cover image on project grids.',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' }
    }),
    defineField({
      name: 'coverPoster',
      title: 'Cover video poster',
      description: 'Shown while the video loads. The cover image is used as a fallback if this is empty.',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    }),
    defineField({
      name: 'content',
      title: 'Page content',
      type: 'array',
      of: [{ type: 'galleryImage' }, { type: 'video' }, { type: 'textBlock' }]
    })
  ],
  preview: { select: { title: 'title', subtitle: 'year', media: 'cover' } }
})
