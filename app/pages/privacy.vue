<script setup lang="ts">
import { stegaClean } from '@sanity/client/stega'
import type { SiteSettings } from '~/types/sanity'

const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
const policy = computed(() => settings.value?.privacyPolicy)
const title = computed(() => policy.value?.title || 'Privacy policy')
const draftNote = computed(() => policy.value?.draftNote ?? 'Draft — the operator’s legal name, country, and applicable legal details are awaiting confirmation.')
const updatedAt = computed(() => {
  const date = new Date(stegaClean(policy.value?.updatedAt || '2026-10-13'))
  return Number.isNaN(date.getTime()) ? undefined : new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(date)
})
const contactEmail = computed(() => {
  const address = stegaClean(settings.value?.contactEmail || '').trim()
  if (address) return address
  const link = settings.value?.socialLinks?.find(link => stegaClean(link.url).startsWith('mailto:'))
  return link ? stegaClean(link.url).slice(7).split('?')[0] : 'hello@mmaze.studio'
})
useSeoMeta({
  title: () => `${stegaClean(title.value)} — mmaze.studio`,
  description: 'How mmaze.studio handles enquiries and personal information.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <PageFrame>
    <main class="page privacy-page">
      <h1 class="display">{{ title }}</h1>
      <p v-if="draftNote" class="draft-note">{{ draftNote }}</p>
      <p v-if="updatedAt">Last updated: {{ updatedAt }}</p>

      <template v-if="policy?.sections?.length">
        <section v-for="section in policy.sections" :key="section._key" :aria-labelledby="`privacy-${section._key}`">
          <h2 :id="`privacy-${section._key}`">{{ section.heading }}</h2>
          <div class="policy-copy"><SanityContent :value="section.body" /></div>
        </section>
      </template>
      <template v-else>

      <section aria-labelledby="privacy-operator">
        <h2 id="privacy-operator">Who handles your information</h2>
        <p>This notice describes how mmaze.studio handles information submitted through this website.
          For privacy questions, email <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>.</p>
      </section>
      <section aria-labelledby="privacy-collection">
        <h2 id="privacy-collection">What we collect and why</h2>
        <p>When you contact us, we receive the details you provide, such as your name, email address,
          and message. Job applications may also include a portfolio link and other application details.
          We use this information to respond to your enquiry or consider your application.</p>
        <p>Your IP address is used to limit repeated form submissions and protect the forms from abuse.
          Please avoid including sensitive personal information in your message.</p>
      </section>
      <section aria-labelledby="privacy-recipients">
        <h2 id="privacy-recipients">How we handle your information</h2>
        <p>Your submission is sent to our team through Telegram and can be read by team members with access
          to the receiving chat. See <a href="https://telegram.org/privacy" target="_blank" rel="noopener noreferrer">Telegram’s privacy policy</a>.</p>
      </section>
      <section aria-labelledby="privacy-services">
        <h2 id="privacy-services">Website services</h2>
        <p>The website’s hosting provider also processes requests needed to operate the site.
          Embedded Vimeo videos connect to Vimeo when loaded; see
          <a href="https://vimeo.com/privacy" target="_blank" rel="noopener noreferrer">Vimeo’s privacy policy</a>
          for how it handles information.</p>
      </section>
      <section aria-labelledby="privacy-retention">
        <h2 id="privacy-retention">How long we keep submissions</h2>
        <p>We keep form submissions for one year from receipt, then delete them from our receiving Telegram chat.
          Any separate records created if we work together are outside the scope of this form-submission notice.</p>
      </section>
      <section aria-labelledby="privacy-requests">
        <h2 id="privacy-requests">Questions and requests</h2>
        <p>You can contact us to request access to, correction of, or deletion of information you submitted.
          Depending on the law that applies, you may have additional rights and the right to complain
          to your local data protection authority.</p>
        <p>Email <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a> and tell us which submission your request concerns.
          We may need to verify your identity before responding.</p>
      </section>
      </template>
    </main>
  </PageFrame>
</template>

<style scoped>
.privacy-page {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  padding: var(--space) var(--space) 0;
  gap: calc(var(--space) * 2) var(--space);
}
.privacy-page > * { grid-column: 1; min-width: 0; }
h1, h2, p { margin: 0; }
h2 { font-size: var(--medium); line-height: 1.2; }
section { display: grid; gap: var(--space); }
p { font-size: clamp(16px, 1.1vw, 20px); line-height: 1.5; }
a { text-decoration: underline; text-underline-offset: .15em; }
.policy-copy :deep(p) { margin: 0; font-size: clamp(16px, 1.1vw, 20px); line-height: 1.5; }
.policy-copy :deep(p + p) { margin-top: var(--space); }
.policy-copy :deep(a) { text-decoration: underline; text-underline-offset: .15em; }
.draft-note { padding: var(--space); border: 1px solid currentColor; border-radius: var(--radius); }
@media (max-width: 720px) {
  .privacy-page { grid-template-columns: 1fr; }
}
</style>
