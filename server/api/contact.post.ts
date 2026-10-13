import { useRuntimeConfig } from 'nitropack/runtime'

interface ContactBody {
  context?: unknown
  fields?: unknown
  company?: unknown
}

interface SubmittedField {
  label?: unknown
  type?: unknown
  required?: unknown
  value?: unknown
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.telegramBotToken || !config.telegramChatId) {
    throw createError({ statusCode: 503, statusMessage: 'Contact form is not configured' })
  }

  const body = await readBody<ContactBody>(event)
  if (body.company) return { ok: true }

  const context = typeof body.context === 'string' ? body.context.trim() : 'Portfolio enquiry'
  if (!context || context.length > 150) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission context' })
  }

  if (!Array.isArray(body.fields) || body.fields.length === 0 || body.fields.length > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid form submission' })
  }

  const allowedTypes = new Set(['text', 'email', 'url', 'tel', 'textarea'])
  const fields = (body.fields as SubmittedField[]).map((field) => {
    const label = typeof field.label === 'string' ? field.label.trim() : ''
    const type = typeof field.type === 'string' && allowedTypes.has(field.type) ? field.type : 'text'
    const value = typeof field.value === 'string' ? field.value.trim() : ''
    if (!label || label.length > 80 || value.length > 3000 || (field.required && !value)) {
      throw createError({ statusCode: 400, statusMessage: 'Complete all required fields' })
    }
    if (value && type === 'email' && (!/^\S+@\S+\.\S+$/.test(value) || value.length > 254)) {
      throw createError({ statusCode: 400, statusMessage: 'Enter a valid email address' })
    }
    if (value && type === 'url' && (value.length > 500 || !/^https?:\/\//i.test(value))) {
      throw createError({ statusCode: 400, statusMessage: 'Enter a valid URL' })
    }
    return { type, value }
  })

  await enforceRateLimit(event, 'contact')

  const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  const message = [
    `<b>${escapeHtml(context)}</b>`,
    ...fields.map(field => field.type === 'textarea'
      ? `<pre>${escapeHtml(field.value || '—')}</pre>`
      : escapeHtml(field.value || '—'))
  ].join('\n\n')

  try {
    await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: config.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      }
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Unable to send message' })
  }

  return { ok: true }
})
