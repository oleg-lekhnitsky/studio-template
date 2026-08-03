<script setup lang="ts">
const props = withDefaults(defineProps<{
  context: string
  successMessage: string
  submitLabel?: string
  showPortfolio?: boolean
}>(), { submitLabel: 'Send message', showPortfolio: false })

const sent = ref(false)
const sending = ref(false)
const error = ref('')
const status = ref('')

function markInvalid(event: Event) {
  const field = event.target as HTMLInputElement | HTMLTextAreaElement
  field.setAttribute('aria-invalid', 'true')
}

function clearInvalid(event: Event) {
  const field = event.target as HTMLInputElement | HTMLTextAreaElement
  if (field.validity.valid) field.removeAttribute('aria-invalid')
}

function submitFromTextarea(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    ;(event.currentTarget as HTMLTextAreaElement).form?.requestSubmit()
  }
}

async function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement
  const values = new FormData(form)
  sending.value = true
  error.value = ''
  status.value = props.showPortfolio ? 'Sending application…' : 'Sending message…'

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        context: props.context,
        name: values.get('name'),
        email: values.get('email'),
        portfolio: values.get('portfolio'),
        message: values.get('message'),
        company: values.get('company')
      }
    })
    sent.value = true
    form.reset()
    status.value = props.successMessage
  } catch (cause) {
    const failure = cause as { status?: number; statusCode?: number; data?: { statusCode?: number } }
    const code = failure.status || failure.statusCode || failure.data?.statusCode
    error.value = code === 429
      ? 'Too many messages sent. Wait a few minutes and try again.'
      : code === 503
        ? 'This form is temporarily unavailable. Try again later.'
        : 'Unable to send. Check your connection and try again.'
    status.value = ''
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <p class="sr-only" role="status">{{ status }}</p>
  <div class="submission-form">
    <form :class="{ 'is-sent': sent }" :aria-hidden="sent" :inert="sent" :aria-busy="sending"
      @submit.prevent="submit" @invalid.capture="markInvalid" @input.capture="clearInvalid">
      <p class="form-note">All fields are required.</p>
      <label class="website" inert>
        Company website
        <input name="company" tabindex="-1" autocomplete="off">
      </label>
      <label>
        Name
        <input name="name" autocomplete="name" maxlength="100" required>
      </label>
      <label>
        Email
        <input name="email" type="email" autocomplete="email" spellcheck="false" maxlength="254" required>
      </label>
      <label v-if="showPortfolio">
        Portfolio link
        <input name="portfolio" type="url" autocomplete="url" spellcheck="false"
          maxlength="500" placeholder="https://yourportfolio.com" required>
      </label>
      <label>
        Message
        <textarea name="message" rows="6" maxlength="3000" required @keydown="submitFromTextarea" />
      </label>
      <div class="form-actions">
        <button class="primary-button primary-button--left" type="submit" :disabled="sending">
          <span v-if="sending" class="spinner" aria-hidden="true" />
          <span>{{ submitLabel }}</span>
          <span v-if="sending" class="sr-only">— sending</span>
        </button>
        <p class="privacy-note">By submitting, you allow us to use these details to respond to your enquiry.</p>
      </div>
      <p v-if="error" role="alert">{{ error }}</p>
    </form>
    <p v-if="sent" class="success display">{{ successMessage }}</p>
  </div>
</template>

<style scoped>
.submission-form { position: relative; }
form { display: grid; gap: var(--space); align-content: start; }
form.is-sent { visibility: hidden; }
.success { position: absolute; inset: 0; }
label { display: grid; gap: 8px; }
input, textarea { width: 100%; border: 0; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); border-radius: 0; padding: 10px 0; background: transparent; }
input:focus-visible, textarea:focus-visible {
  outline: none;
  background: var(--accent);
}
textarea { resize: vertical; }
.primary-button { justify-self: start; }
.form-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space); align-items: start; }
.form-note, .privacy-note { opacity: var(--opacity-secondary); }
.spinner { width: .75em; height: .75em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }
.website { position: absolute; left: -10000px; }
p { margin: 0; }

@keyframes spin { to { transform: rotate(1turn); } }

@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; border-right-color: currentColor; opacity: .5; }
}

@media (max-width: 720px) {
  .form-actions { grid-template-columns: 1fr; }
}

@media (forced-colors: active) {
  input:focus-visible, textarea:focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
    background: Canvas;
    box-shadow: none;
  }
}
</style>
