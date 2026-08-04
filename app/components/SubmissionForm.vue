<script setup lang="ts">
import type { FormField } from '~/types/sanity'

const props = withDefaults(defineProps<{
  context: string
  successMessage: string
  submitLabel?: string
  showPortfolio?: boolean
  fields?: FormField[]
}>(), { submitLabel: 'Send message', showPortfolio: false })

const defaultFields = computed<FormField[]>(() => [
  { _key: 'name', label: 'Name', type: 'text', required: true },
  { _key: 'email', label: 'Email', type: 'email', required: true },
  ...(props.showPortfolio
    ? [{ _key: 'portfolio', label: 'Portfolio link', type: 'url' as const, placeholder: 'https://yourportfolio.com', required: true }]
    : []),
  { _key: 'message', label: 'Message', type: 'textarea', required: true }
])
const activeFields = computed(() => props.fields?.length ? props.fields : defaultFields.value)
const allFieldsRequired = computed(() => activeFields.value.every(field => field.required))

function fieldName(field: FormField) {
  return `field-${field._key}`
}

function autocomplete(field: FormField) {
  if (field.type === 'email') return 'email'
  if (field.type === 'tel') return 'tel'
  if (field.type === 'url') return 'url'
  if (/name/i.test(field.label)) return 'name'
  return 'off'
}

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
        fields: activeFields.value.map(field => ({
          label: field.label,
          type: field.type,
          required: Boolean(field.required),
          value: values.get(fieldName(field))
        })),
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
      <p class="form-note">{{ allFieldsRequired ? 'All fields are required.' : 'Required fields are marked *.' }}</p>
      <label class="website" inert>
        Company website
        <input name="company" tabindex="-1" autocomplete="off">
      </label>
      <label v-for="field in activeFields" :key="field._key" :for="fieldName(field)">
        <span>{{ field.label }}<span v-if="field.required && !allFieldsRequired" aria-hidden="true"> *</span></span>
        <textarea v-if="field.type === 'textarea'" :id="fieldName(field)" :name="fieldName(field)"
          rows="6" maxlength="3000" :placeholder="field.placeholder" :required="field.required"
          @keydown="submitFromTextarea" />
        <input v-else :id="fieldName(field)" :name="fieldName(field)" :type="field.type"
          :autocomplete="autocomplete(field)" :spellcheck="field.type === 'email' || field.type === 'url' ? false : undefined"
          :maxlength="field.type === 'email' ? 254 : field.type === 'url' ? 500 : 300"
          :placeholder="field.placeholder" :required="field.required">
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
