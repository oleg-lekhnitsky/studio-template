import { useRuntimeConfig } from 'nitropack/runtime'

const attempts = new Map<string, number[]>()

export async function enforceRateLimit(event: Parameters<typeof getRequestIP>[0], key: string) {
  const config = useRuntimeConfig()
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const identifier = `rate:${key}:${ip}`

  if (config.upstashRedisRestUrl && config.upstashRedisRestToken) {
    const response = await $fetch<Array<{ result?: number }>>(`${config.upstashRedisRestUrl}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${config.upstashRedisRestToken}` },
      body: [['INCR', identifier], ['EXPIRE', identifier, 600, 'NX']]
    })
    if ((response[0]?.result || 0) > 3) {
      throw createError({ statusCode: 429, statusMessage: 'Please wait before sending another message' })
    }
    return
  }

  const now = Date.now()
  const recent = (attempts.get(identifier) || []).filter(time => now - time < 10 * 60 * 1000)
  if (recent.length >= 3) {
    throw createError({ statusCode: 429, statusMessage: 'Please wait before sending another message' })
  }
  attempts.set(identifier, [...recent, now])
}
