import { defineField, defineType } from 'sanity'
import { privacyPolicyDefaults } from './privacyPolicyDefaults'
import { aboutPageDefaults } from './aboutPageDefaults'

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

const formFields = (name: string, title: string, group: string, initialValue: typeof contactFormFields) => defineField({
  name,
  title,
  description: 'Add, remove, and reorder the fields shown in this form. Leave empty to use the default fields.',
  type: 'array',
  group,
  initialValue,
  of: [{
    type: 'object',
    name: 'formField',
    fields: [
      defineField({ name: 'label', title: 'Label', type: 'string', validation: rule => rule.required().max(80) }),
      defineField({
        name: 'type',
        title: 'Field type',
        type: 'string',
        initialValue: 'text',
        options: {
          list: [
            { title: 'Text', value: 'text' },
            { title: 'Email', value: 'email' },
            { title: 'Website / URL', value: 'url' },
            { title: 'Phone', value: 'tel' },
            { title: 'Long text', value: 'textarea' }
          ],
          layout: 'dropdown'
        },
        validation: rule => rule.required()
      }),
      defineField({ name: 'placeholder', title: 'Placeholder', type: 'string', validation: rule => rule.max(120) }),
      defineField({ name: 'required', title: 'Required', type: 'boolean', initialValue: true })
    ],
    preview: {
      select: { title: 'label', type: 'type', required: 'required' },
      prepare: ({ title, type, required }) => ({
        title: title || 'Untitled field',
        subtitle: `${type || 'text'}${required ? ' · required' : ''}`
      })
    }
  }]
})

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'pages', title: 'Pages' },
    { name: 'home', title: 'Home' },
    { name: 'about', title: 'About' },
    { name: 'jobs', title: 'Jobs' },
    { name: 'contact', title: 'Contact' },
    { name: 'privacy', title: 'Privacy policy' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    defineField({
      name: 'privacyPolicy',
      title: 'Privacy policy',
      type: 'object',
      group: 'privacy',
      initialValue: privacyPolicyDefaults,
      description: 'Content for /privacy. Keep the draft notice until the legal identity and policy details are confirmed. Empty sections use the website’s default policy.',
      fields: [
        defineField({ name: 'title', title: 'Heading', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'updatedAt', title: 'Last updated', type: 'date' }),
        defineField({ name: 'draftNote', title: 'Draft notice', type: 'text', rows: 2, description: 'Clear this only when the policy is ready for publication.' }),
        defineField({
          name: 'sections', title: 'Sections', type: 'array',
          of: [{
            type: 'object', name: 'privacySection', title: 'Section',
            fields: [
              defineField({ name: 'heading', title: 'Heading', type: 'string', validation: rule => rule.required() }),
              defineField({
                name: 'body', title: 'Text', type: 'array', validation: rule => rule.required().min(1),
                of: [{
                  type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [],
                  marks: {
                    decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
                    annotations: [{
                      name: 'link', type: 'object', title: 'Link',
                      fields: [defineField({ name: 'href', title: 'URL', type: 'url', validation: rule => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) })]
                    }]
                  }
                }]
              })
            ],
            preview: { select: { title: 'heading' } }
          }]
        })
      ]
    }),
    defineField({
      name: 'disableCases',
      title: 'Disable Cases page',
      description: 'Hides Cases from navigation and makes Cases URLs unavailable.',
      type: 'boolean',
      group: 'pages',
      initialValue: false
    }),
    defineField({
      name: 'disableAbout',
      title: 'Disable About page',
      description: 'Hides About from navigation and makes the About URL unavailable.',
      type: 'boolean',
      group: 'pages',
      initialValue: false
    }),
    defineField({
      name: 'disableJobs',
      title: 'Disable Jobs page',
      description: 'Hides Jobs from navigation and makes all Jobs URLs unavailable.',
      type: 'boolean',
      group: 'pages',
      initialValue: false
    }),
    defineField({
      name: 'disableContact',
      title: 'Disable Contact page',
      description: 'Hides Contact from navigation and makes the Contact URL unavailable.',
      type: 'boolean',
      group: 'pages',
      initialValue: false
    }),
    defineField({
      name: 'seoTitle',
      title: 'Website title',
      type: 'string',
      group: 'general',
      validation: rule => rule.max(70)
    }),
    defineField({
      name: 'headerText',
      title: 'Header text fallback',
      description: 'Shown when no SVG or Lottie logo is uploaded.',
      type: 'string',
      group: 'general',
      initialValue: 'Studio',
      validation: rule => rule.max(60)
    }),
    defineField({
      name: 'headerLogoSvg',
      title: 'Header SVG logo',
      description: 'Optional SVG logo. A Lottie logo takes priority when both files are present.',
      type: 'file',
      group: 'general',
      options: { accept: 'image/svg+xml' }
    }),
    defineField({
      name: 'headerLogoColorMode',
      title: 'SVG logo colors',
      type: 'string',
      group: 'general',
      initialValue: 'theme',
      options: {
        list: [
          { title: 'Follow website theme', value: 'theme' },
          { title: 'Keep original SVG colors', value: 'original' }
        ],
        layout: 'radio'
      },
      hidden: ({ document }) => !document?.headerLogoSvg
    }),
    defineField({
      name: 'headerLogoLottie',
      title: 'Header Lottie animation',
      description: 'Optional Bodymovin/Lottie JSON file. Its authored colors are preserved.',
      type: 'file',
      group: 'general',
      options: { accept: 'application/json,.json' }
    }),
    defineField({
      name: 'footerWordmark',
      title: 'Footer large name',
      description: 'Large fitted name displayed at the bottom of the footer.',
      type: 'string',
      group: 'general',
      initialValue: 'mmaze.studio',
      validation: rule => rule.max(60)
    }),
    defineField({
      name: 'footerDescription',
      title: 'Footer description',
      description: 'Short text displayed in the footer beside the navigation.',
      type: 'string',
      group: 'general',
      initialValue: 'Independent creative studio',
      validation: rule => rule.max(120)
    }),
    defineField({
      name: 'footerMobileDescription',
      title: 'Mobile footer description',
      type: 'text',
      group: 'general',
      rows: 5,
      initialValue: 'Mmaze is a creative production studio. Big on building stories for brands, launches, awards and things that don’t have a name yet.'
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      description: 'Client names in the scrolling line at the top of the footer. Drag to reorder; remove all names to hide the line.',
      type: 'array',
      of: [{ type: 'string', validation: rule => rule.required() }],
      group: 'general',
      initialValue: ['FinteqHub', 'Softswiss', 'Burger King', 'GYPSY', 'Infingame', 'Clevetura', 'Boomerang', 'LVLX', 'InOut', 'Scatters Club', 'TrueWays']
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
      title: 'Legacy contact heading',
      description: 'Retained for compatibility with older content. The website no longer uses this field.',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'contact',
      hidden: true,
      readOnly: true
    }),
    formFields('contactFormFields', 'Contact form fields', 'contact', contactFormFields),
    formFields('jobFormFields', 'Job application form fields', 'jobs', jobFormFields),
    defineField({
      name: 'contactEmailHeading',
      title: 'Direct email heading',
      description: 'Heading above the email link below the contact form.',
      type: 'string',
      group: 'contact',
      initialValue: 'Or email us directly'
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email address',
      description: 'Email address shown below the contact form and used for privacy requests. Enter the address without mailto:.',
      type: 'string',
      group: 'contact',
      initialValue: 'hello@mmaze.studio',
      validation: rule => rule.email()
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
      name: 'heroSubheading',
      title: 'Hero subheading',
      type: 'text',
      group: 'home',
      rows: 3
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
      initialValue: aboutPageDefaults.aboutHeadline
    }),
    defineField({
      name: 'aboutIntroduction',
      title: 'Studio introduction',
      type: 'text',
      group: 'about',
      rows: 5,
      initialValue: aboutPageDefaults.aboutIntroduction
    }),
    defineField({
      name: 'aboutProcessTitle',
      title: 'Process heading',
      type: 'string',
      group: 'about',
      initialValue: aboutPageDefaults.aboutProcessTitle
    }),
    defineField({
      name: 'aboutProcessSteps',
      title: 'Process steps',
      description: 'Add steps in order. Numbers and arrows appear automatically. Remove all steps to hide this section.',
      type: 'array',
      of: [{ type: 'string', validation: rule => rule.required() }],
      group: 'about',
      initialValue: aboutPageDefaults.aboutProcessSteps
    }),
    defineField({
      name: 'aboutServicesTitle',
      title: 'Services heading',
      type: 'string',
      group: 'about',
      initialValue: aboutPageDefaults.aboutServicesTitle
    }),
    defineField({
      name: 'aboutServices',
      title: 'Services',
      description: 'Add and reorder service names. Remove all services to hide this section.',
      type: 'array',
      of: [{ type: 'string', validation: rule => rule.required() }],
      group: 'about',
      initialValue: aboutPageDefaults.aboutServices
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
    defineField({ name: 'jobsHeadline', title: 'Jobs page headline', type: 'string', group: 'jobs', initialValue: 'Work with us' }),
    defineField({ name: 'jobsIntroduction', title: 'Jobs page introduction', type: 'text', group: 'jobs', rows: 4 })
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) }
})
