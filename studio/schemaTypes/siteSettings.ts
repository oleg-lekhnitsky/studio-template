import { defineField, defineType } from 'sanity'

const pageSeo = (name: string, title: string) => defineField({
  name,
  title,
  type: 'object',
  group: 'seo',
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: rule => rule.max(70) }),
    defineField({ name: 'description', title: 'Page description', type: 'text', rows: 3, validation: rule => rule.max(160) }),
    defineField({
      name: 'image',
      title: 'Social sharing image',
      description: 'Optional page-specific image. 1200 × 630 is recommended; the global image is used when empty.',
      type: 'image',
      options: { hotspot: true }
    })
  ]
})

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'home', title: 'Home' },
    { name: 'about', title: 'About' },
    { name: 'jobs', title: 'Jobs' },
    { name: 'contact', title: 'Contact' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Website title',
      type: 'string',
      group: 'general',
      validation: rule => rule.max(70)
    }),
    defineField({
      name: 'seoDescription',
      title: 'Website description',
      type: 'text',
      group: 'seo',
      rows: 3,
      validation: rule => rule.max(160)
    }),
    defineField({
      name: 'ogImage',
      title: 'Social sharing image',
      description: 'Used when the website is shared. A 1200 × 630 image is recommended.',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    }),
    pageSeo('casesSeo', 'Cases page SEO'),
    pageSeo('jobsSeo', 'Jobs page SEO'),
    pageSeo('aboutSeo', 'About page SEO'),
    pageSeo('contactSeo', 'Contact page SEO'),
    defineField({
      name: 'contactHeading',
      title: 'Contact page heading',
      description: 'Large heading shown above the contact form. Text can include links.',
      type: 'array',
      group: 'contact',
      of: [{
        type: 'block',
        styles: [{ title: 'Heading', value: 'h1' }],
        lists: [],
        marks: {
          decorators: [],
          annotations: [{
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: rule => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] })
              })
            ]
          }]
        }
      }]
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      description: 'Links shown on the Contact page and in the footer.',
      type: 'array',
      group: 'general',
      of: [{
        type: 'object',
        name: 'socialLink',
        fields: [
          defineField({ name: 'label', title: 'Name', type: 'string', validation: rule => rule.required() }),
          defineField({
            name: 'url',
            title: 'URL',
            type: 'url',
            validation: rule => rule.required().uri({ scheme: ['http', 'https'] })
          })
        ],
        preview: { select: { title: 'label', subtitle: 'url' } }
      }]
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'text',
      group: 'home',
      rows: 3,
      initialValue: 'Ideas, identities\nand digital experiences.'
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero video',
      description: 'Use a compressed MP4 or WebM without an audio track when possible. Keep it short for fast loading.',
      type: 'file',
      group: 'home',
      options: { accept: 'video/mp4,video/webm' }
    }),
    defineField({
      name: 'heroPoster',
      title: 'Hero video poster',
      description: 'Displayed while the video loads.',
      type: 'image',
      group: 'home',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    }),
    defineField({
      name: 'aboutHeadline',
      title: 'About page headline',
      type: 'text',
      group: 'about',
      rows: 3,
      initialValue: 'About the studio.'
    }),
    defineField({
      name: 'aboutVideo',
      title: 'About page video',
      description: 'Optional compressed MP4 or WebM. When present, it replaces the About image.',
      type: 'file',
      group: 'about',
      options: { accept: 'video/mp4,video/webm' }
    }),
    defineField({
      name: 'aboutImage',
      title: 'About page image',
      type: 'image',
      group: 'about',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    }),
    defineField({
      name: 'people',
      title: 'People',
      description: 'People shown on the About page.',
      type: 'array',
      group: 'about',
      of: [{
        type: 'object',
        name: 'person',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string', validation: rule => rule.required() }),
          defineField({ name: 'position', title: 'Position', type: 'string', validation: rule => rule.required() }),
          defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: { hotspot: true },
            fields: [{ name: 'alt', title: 'Alternative text', type: 'string' }],
            validation: rule => rule.required()
          })
        ],
        preview: {
          select: { title: 'name', subtitle: 'position', media: 'image' }
        }
      }]
    }),
    defineField({ name: 'jobsHeadline', title: 'Jobs page headline', type: 'string', group: 'jobs', initialValue: 'Work with us.' }),
    defineField({ name: 'jobsIntroduction', title: 'Jobs page introduction', type: 'text', group: 'jobs', rows: 4 })
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) }
})
