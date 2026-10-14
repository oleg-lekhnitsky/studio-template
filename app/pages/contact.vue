<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'
import { stegaClean } from '@sanity/client/stega'

const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
if (settings.value?.disableContact) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
usePageSeo(() => settings.value?.contactSeo, 'Contact — mmaze.studio', 'Start a project with our creative studio.')
const contactEmail = computed(() => {
  const address = stegaClean(settings.value?.contactEmail || '').trim()
  if (address) return address
  const link = settings.value?.socialLinks?.find(link => stegaClean(link.url).startsWith('mailto:'))
  return link ? stegaClean(link.url).slice(7).split('?')[0] : 'hello@mmaze.studio'
})
</script>

<template>
  <PageFrame>
    <main class="page contact">
      <h1 class="display">Tell us about your<br>project</h1>
      <div class="contact-form">
        <ContactForm :fields="settings?.contactFormFields" />
      </div>
      <section class="contact-email display" aria-labelledby="contact-email-title">
        <h2 id="contact-email-title">{{ settings?.contactEmailHeading || 'Or email us directly' }}</h2>
        <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
      </section>
    </main>
  </PageFrame>
</template>

<style scoped>
.contact {
  width: 100%;
  min-height: calc(100svh - var(--space) * 4);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: auto auto 1fr;
  gap: 0 var(--space);
  padding: var(--space) var(--space) 0;
}

h1,
.contact-email { grid-column: 1; min-width: 0; }

.contact .display {
  font-size: clamp(32px, 3.8vw, 144px);
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: -.045em;
}

.contact-form {
  grid-column: 1;
  min-width: 0;
  margin-top: clamp(32px, 4.5vw, 172px);
}

h1 {
  margin: 0;
  font-weight: inherit;
}

.contact-email {
  align-self: end;
  margin-top: clamp(48px, 5vw, 96px);
}
.contact-email h2 { margin: 0 0 .12em; font: inherit; }
.contact-email a {
  color: color-mix(in srgb, var(--foreground) 18%, var(--background));
  text-decoration: underline;
  text-decoration-thickness: .06em;
  text-underline-offset: .16em;
  overflow-wrap: anywhere;
}
.contact-email a:hover { color: var(--foreground); opacity: 1; }

@media (max-width: 720px) {
  .contact { grid-template-columns: 1fr; min-height: 0; }
}

</style>
