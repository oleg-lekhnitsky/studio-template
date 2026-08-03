import { useRuntimeConfig } from 'nitropack/runtime'

interface ContactBody {
  context?: unknown
  name?: unknown
  email?: unknown
  portfolio?: unknown
  message?: unknown
  company?: unknown
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.telegramBotToken || !config.telegramChatId) {
    throw createError({ statusCode: 503, statusMessage: 'Contact form is not configured' })
  }

  const body = await readBody<ContactBody>(event)
  if (body.company) return { ok: true }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const context = typeof body.context === 'string' ? body.context.trim() : 'Portfolio enquiry'
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const portfolio = typeof body.portfolio === 'string' ? body.portfolio.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name || name.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid name' })
  }
  if (!context || context.length > 150) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission context' })
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid email address' })
  }
  if (portfolio && (portfolio.length > 500 || !/^https?:\/\//i.test(portfolio))) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid portfolio link' })
  }
  if (!message || message.length > 3000) {
    throw createError({ statusCode: 400, statusMessage: 'Message must be between 1 and 3000 characters' })
  }

  await enforceRateLimit(event, 'contact')

  try {
    await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: config.telegramChatId,
        text: `${context}\n\nName: ${name}\nEmail: ${email}${portfolio ? `\nPortfolio: ${portfolio}` : ''}\n\n${message}`
      }
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Unable to send message' })
  }

  return { ok: true }
})
