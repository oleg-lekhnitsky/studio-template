import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const siteSettingsId = '4e409066-8870-4256-9bd0-a6b3b930ec39'
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

const mainDocuments = defineDocuments([
  {
    route: '/cases/:slug',
    filter: `_type == "case" && slug.current == $slug`
  },
  {
    route: '/jobs/:slug',
    filter: `_type == "job" && slug.current == $slug`
  },
  { route: '/', type: 'siteSettings' }
])

const locations = {
  case: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: document => ({
      locations: document?.slug
        ? [
            { title: document.title || 'Untitled case', href: `/cases/${document.slug}` },
            { title: 'All cases', href: '/cases' }
          ]
        : [{ title: 'Add a slug to preview this case', href: '/cases' }]
    })
  }),
  job: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: document => ({
      locations: document?.slug
        ? [
            { title: document.title || 'Untitled vacancy', href: `/jobs/${document.slug}` },
            { title: 'All jobs', href: '/jobs' }
          ]
        : [{ title: 'Add a slug to preview this vacancy', href: '/jobs' }]
    })
  }),
  siteSettings: defineLocations({
    message: 'Site settings are used across the website.',
    tone: 'caution'
  })
}

export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'v8alcn6p',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: S => S.list()
        .title('Content')
        .items([
          S.listItem()
            .id('siteSettings')
            .title('Site settings')
            .child(
              S.document()
                .schemaType('siteSettings')
                .documentId(siteSettingsId)
                .title('Site settings')
            ),
          S.divider(),
          ...S.documentTypeListItems().filter(item => item.getId() !== 'siteSettings')
        ])
    }),
    presentationTool({
      previewUrl: {
        initial: previewUrl,
        previewMode: {
          enable: '/preview/enable',
          disable: '/preview/disable'
        }
      },
      resolve: { mainDocuments, locations }
    }),
    visionTool()
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (previous, context) => context.schemaType === 'siteSettings'
      ? previous.filter(action => action.action !== 'duplicate' && action.action !== 'delete')
      : previous
  }
})
