<script setup lang="ts">
import type { FormField } from '~/types/sanity'

const props = withDefaults(defineProps<{
  context: string
  successMessage: string
  submitLabel?: string
  showPortfolio?: boolean
  fields?: FormField[]
  appearance?: 'default' | 'contact'
}>(), { submitLabel: 'Send message', showPortfolio: false })
const emit = defineEmits<{ success: [message: string] }>()

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

function placeholder(field: FormField) {
  if (props.appearance !== 'contact') return field.placeholder
  const text = field.placeholder || (field.type === 'textarea'
    ? props.showPortfolio ? 'Tell us a little about yourself' : 'A few words about what you need'
    : field.label)
  return `${text}${field.required ? '*' : ''}`
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
const errorAttempt = ref(0)
const fieldErrors = reactive<Record<string, string>>({})

function shake(element: HTMLElement) {
  element.classList.remove('is-shaking')
  void element.offsetWidth
  element.classList.add('is-shaking')
}

function finishShake(event: AnimationEvent) {
  if (event.animationName === 't-input-shake') {
    ;(event.target as HTMLElement).classList.remove('is-shaking')
  }
}

function markInvalid(event: Event) {
  event.preventDefault()
  const field = event.target as HTMLInputElement | HTMLTextAreaElement
  field.setAttribute('aria-invalid', 'true')
  fieldErrors[field.id] = field.validationMessage
  shake(field)
}

function clearInvalid(event: Event) {
  const field = event.target as HTMLInputElement | HTMLTextAreaElement
  if (field.validity.valid) {
    field.removeAttribute('aria-invalid')
    field.classList.remove('is-shaking')
    delete fieldErrors[field.id]
  }
}

function submitFromTextarea(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    ;(event.currentTarget as HTMLTextAreaElement).form?.requestSubmit()
  }
}

async function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement
  if (sending.value || sent.value) return
  if (!form.checkValidity()) {
    await nextTick()
    form.querySelector<HTMLInputElement | HTMLTextAreaElement>('[aria-invalid="true"]')?.focus()
    return
  }
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
    status.value = props.successMessage
    emit('success', props.successMessage)
  } catch (cause) {
    const failure = cause as { status?: number; statusCode?: number; data?: { statusCode?: number } }
    const code = failure.status || failure.statusCode || failure.data?.statusCode
    error.value = code === 429
      ? 'Too many messages sent. Wait a few minutes and try again.'
      : code === 503
        ? 'This form is temporarily unavailable. Try again later.'
        : 'Unable to send. Check your connection and try again.'
    status.value = ''
    errorAttempt.value++
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <p class="sr-only" role="status">{{ status }}</p>
  <div class="submission-form" :class="{ 'submission-form--contact': appearance === 'contact' }">
    <form novalidate :class="{ 'is-sent': sent }" :aria-hidden="sent || undefined" :inert="sent" :aria-busy="sending"
      @submit.prevent="submit" @invalid.capture="markInvalid" @input.capture="clearInvalid" @animationend="finishShake">
      <p class="form-note">{{ allFieldsRequired ? 'All fields are required.' : 'Required fields are marked *.' }}</p>
      <label class="website" inert>
        Company website
        <input name="company" tabindex="-1" autocomplete="off">
      </label>
      <label v-for="field in activeFields" :key="field._key" :for="fieldName(field)"
        class="t-input-wrap" :class="{ 'is-error': fieldErrors[fieldName(field)] }">
        <span>{{ field.label }}<span v-if="field.required && !allFieldsRequired" aria-hidden="true"> *</span></span>
        <textarea v-if="field.type === 'textarea'" :id="fieldName(field)" :name="fieldName(field)" class="t-input"
          :aria-describedby="fieldErrors[fieldName(field)] ? `${fieldName(field)}-error` : undefined"
          rows="6" maxlength="3000" :placeholder="placeholder(field)" :required="field.required"
          @keydown="submitFromTextarea" />
        <input v-else :id="fieldName(field)" :name="fieldName(field)" :type="field.type" class="t-input"
          :aria-describedby="fieldErrors[fieldName(field)] ? `${fieldName(field)}-error` : undefined"
          :autocomplete="autocomplete(field)" :spellcheck="field.type === 'email' || field.type === 'url' ? false : undefined"
          :maxlength="field.type === 'email' ? 254 : field.type === 'url' ? 500 : 300"
          :placeholder="placeholder(field)" :required="field.required">
        <p v-if="fieldErrors[fieldName(field)]" :id="`${fieldName(field)}-error`" class="t-error-msg">
          {{ fieldErrors[fieldName(field)] }}
        </p>
      </label>
      <div class="form-actions">
        <button class="primary-button primary-button--left"
          :class="{ 'primary-button--dark': appearance === 'contact', 'primary-button--sent': sent }" type="submit" :disabled="sending || sent">
          <span v-if="sending" class="spinner" aria-hidden="true" />
          <Transition name="submit-label" mode="out-in">
            <span :key="sent ? 'sent' : 'send'">{{ sent ? 'Sent' : submitLabel }}</span>
          </Transition>
          <span v-if="sending" class="sr-only">— sending</span>
        </button>
        <p class="privacy-note">
          We’ll use your details to {{ showPortfolio ? 'consider your application' : 'respond to your enquiry' }}.
          <NuxtLink to="/privacy">Privacy policy</NuxtLink>.
        </p>
      </div>
      <p v-if="error" :key="errorAttempt" class="t-input is-shaking" role="alert">{{ error }}</p>
    </form>
      <div class="form-success t-panel-slide" :data-open="sent" :aria-hidden="!sent" :inert="!sent">
        <p>{{ successMessage }}</p>
      </div>
  </div>
</template>

<style scoped>
.submission-form { position: relative; --panel-translate-y: 12px; }
form { display: grid; gap: var(--space); align-content: start; }
form.is-sent { visibility: hidden; }
.form-success {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  border-radius: var(--radius);
  color: var(--foreground);
  font-size: calc(var(--medium) / 1.625);
  letter-spacing: var(--letter-spacing-medium);
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
}
.form-success > p {
  transform: translateY(-0.06em);
}
.t-panel-slide {
  transform: translateY(var(--panel-translate-y));
  opacity: 0;
  filter: blur(var(--panel-blur));
  pointer-events: none;
  transition:
    transform var(--panel-close-dur) var(--panel-ease),
    opacity   var(--panel-close-dur) var(--panel-ease),
    filter    var(--panel-close-dur) var(--panel-ease);
  will-change: transform, opacity, filter;
}
.t-panel-slide[data-open="true"] {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
  pointer-events: auto;
  transition:
    transform var(--panel-open-dur) var(--panel-ease),
    opacity   var(--panel-open-dur) var(--panel-ease),
    filter    var(--panel-open-dur) var(--panel-ease);
}

@media (prefers-reduced-motion: reduce) {
  .t-panel-slide { transition: none !important; }
}
label { display: grid; gap: 8px; }
input, textarea { width: 100%; border: 0; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); border-radius: 0; padding: 10px 0; background: transparent; }
input:focus-visible, textarea:focus-visible {
  outline: none;
  background: var(--accent);
}
textarea { resize: vertical; }
.primary-button { justify-self: start; }
.primary-button.primary-button--sent {
  background: var(--accent);
  color: var(--foreground);
  border-color: var(--accent);
  cursor: default;
  opacity: 1;
}
.submit-label-enter-active, .submit-label-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.submit-label-enter-from { opacity: 0; transform: translateY(4px); }
.submit-label-leave-to { opacity: 0; transform: translateY(-4px); }
.form-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space); align-items: start; }
.form-note, .privacy-note { opacity: var(--opacity-secondary); }
.privacy-note a { text-decoration: underline; text-underline-offset: .15em; }
.spinner { width: .75em; height: .75em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }
.website { position: absolute; left: -10000px; }
p { margin: 0; }

.submission-form--contact { container-type: inline-size; }
.submission-form--contact form { gap: clamp(8px, 2cqw, 32px); }
.submission-form--contact label:not(.website) > span,
.submission-form--contact .form-note {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.submission-form--contact input,
.submission-form--contact textarea {
  border: 0;
  border-radius: var(--radius);
  padding: clamp(14px, 4cqw, 64px);
  background: color-mix(in srgb, var(--foreground) 6%, var(--background));
  color: var(--foreground);
  font-size: clamp(14px, 2.4cqw, 40px);
  line-height: 1.3;
}
.submission-form--contact input::placeholder,
.submission-form--contact textarea::placeholder { color: color-mix(in srgb, var(--foreground) 35%, var(--background)); opacity: 1; }
.submission-form--contact textarea { min-height: clamp(120px, 28cqw, 448px); }
.submission-form--contact input:focus-visible,
.submission-form--contact textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.submission-form--contact .form-actions { grid-template-columns: 1fr; gap: 16px; margin-top: clamp(4px, 1cqw, 16px); }
.submission-form--contact .primary-button {
  width: 39%;
  min-width: 120px;
  margin-left: 0;
  border-radius: var(--radius);
  padding: clamp(10px, 2.5cqw, 40px);
  font-size: clamp(14px, 2.4cqw, 40px);
}
.submission-form--contact .privacy-note { font-size: 12px; }

input[aria-invalid='true'],
textarea[aria-invalid='true'] {
  outline: 2px solid #d93a3a;
  outline-offset: 3px;
}

@keyframes spin { to { transform: rotate(1turn); } }

@media (prefers-reduced-motion: reduce) {
  .submit-label-enter-active, .submit-label-leave-active { transition: none; }
  .spinner { animation: none; border-right-color: currentColor; opacity: .5; }
}

@media (max-width: 720px) {
  .form-success { font-size: calc(var(--small) * 1.625); }
  .form-actions { grid-template-columns: 1fr; }
  .submission-form--contact .primary-button { width: 100%; min-width: 0; padding: 20px; }
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
