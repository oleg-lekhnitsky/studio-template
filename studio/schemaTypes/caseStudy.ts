import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'case',
  title: 'Case',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: rule => rule.required() }),
    defineField({
      name: 'previewTitle',
      title: 'Preview title',
      description: 'Optional title shown on case cards. Leave empty to use the main title.',
      type: 'string'
    }),
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
      description: 'Add a role, then add each person with their own name and link.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'role', type: 'string', validation: rule => rule.required() }),
          defineField({
            name: 'people',
            title: 'People',
            type: 'array',
            of: [{
              type: 'object',
              name: 'creditPerson',
              title: 'Person',
              fields: [
                defineField({ name: 'name', type: 'string', validation: rule => rule.required() }),
                defineField({
                  name: 'url',
                  title: 'Name link',
                  description: 'Optional link to this person’s website or profile.',
                  type: 'url',
                  validation: rule => rule.uri({ scheme: ['http', 'https'] })
                })
              ],
              preview: { select: { title: 'name', subtitle: 'url' } }
            }],
            validation: rule => rule.custom((people, context) =>
              (people?.length || (context.parent as { name?: string } | undefined)?.name)
                ? true : 'Add at least one person.'
            )
          }),
          defineField({
            name: 'name',
            title: 'Existing name',
            description: 'For separate links, add each person to People and clear this field.',
            type: 'string',
            hidden: ({ parent }) => !parent?.name
          }),
          defineField({
            name: 'url',
            hidden: ({ parent }) => !parent?.name && !parent?.url,
            title: 'Name link',
            description: 'Optional link to this person’s website or profile.',
            type: 'url',
            validation: rule => rule.uri({ scheme: ['http', 'https'] })
          })
        ],
        preview: {
          select: { title: 'role', name: 'name', people: 'people' },
          prepare: ({ title, name, people }) => ({
            title,
            subtitle: [name, ...(people || []).map((person: { name?: string }) => person.name)].filter(Boolean).join(', ')
          })
        }
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
      of: [{ type: 'galleryImage' }, { type: 'video' }, { type: 'textBlock' }, { type: 'bento' }]
    })
  ],
  preview: { select: { title: 'title', subtitle: 'year', media: 'cover' } }
})
