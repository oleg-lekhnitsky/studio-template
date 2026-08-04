const sanityDataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production'
const sanityStudioBaseUrl = process.env.NUXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333'

function getSanityStudioUrl(baseUrl: string, dataset: string) {
  const workspace = dataset === 'version-two' ? 'version-two' : 'production'
  const url = new URL(baseUrl)
  const pathname = url.pathname.replace(/\/$/, '')

  if (pathname !== `/${workspace}`) {
    url.pathname = `${pathname}/${workspace}`
  }

  return url.toString().replace(/\/$/, '')
}

const sanityStudioUrl = getSanityStudioUrl(sanityStudioBaseUrl, sanityDataset)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/sanity', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    telegramBotToken: process.env.NUXT_TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.NUXT_TELEGRAM_CHAT_ID,
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    sanityWebhookSecret: process.env.SANITY_WEBHOOK_SECRET,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      sanityProjectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'v8alcn6p',
      sanityDataset
    }
  },
  sanity: {
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'v8alcn6p',
    dataset: sanityDataset,
    useCdn: true,
    apiVersion: '2026-08-01',
    ...(process.env.SANITY_API_READ_TOKEN ? {
      visualEditing: {
        previewMode: true,
        token: process.env.SANITY_API_READ_TOKEN,
        studioUrl: sanityStudioUrl,
        stega: true
      }
    } : {})
  },
  image: {
    sanity: {
      projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'v8alcn6p',
      dataset: sanityDataset
    }
  },
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
})
