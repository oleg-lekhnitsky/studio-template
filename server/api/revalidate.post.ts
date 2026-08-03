import { useRuntimeConfig } from 'nitropack/runtime'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = getHeader(event, 'x-sanity-secret')
  if (!config.sanityWebhookSecret || secret !== config.sanityWebhookSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
  }

  await useStorage('cache').clear()
  return { ok: true }
})
