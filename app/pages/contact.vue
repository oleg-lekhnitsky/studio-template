<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
usePageSeo(() => settings.value?.contactSeo, 'Contact — Yuliana', 'Start a project with our creative studio.')
</script>

<template>
  <PageFrame>
    <main class="page contact">
      <div v-if="settings?.contactHeading?.length" class="contact-heading display">
        <SanityContent :value="settings.contactHeading" />
      </div>
      <h1 v-else class="display">Start a project.</h1>
      <div class="contact-form">
        <ContactForm />
        <div v-if="settings?.socialLinks?.length" class="contact-socials display">
          <SocialLinks :links="settings.socialLinks" />
        </div>
      </div>
    </main>
  </PageFrame>
</template>

<style scoped>
.contact {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: calc(var(--space) * 2) var(--space);
  padding: var(--space) var(--space) 0;
}

.contact-heading,
h1 { grid-column: 1 / -1; }

.contact-form {
  grid-column: 1;
  display: grid;
  gap: calc(var(--space) * 8);
}

h1 {
  margin: 0;
  font-weight: inherit;
}

.contact-heading :deep(h1),
.contact-heading :deep(p) {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
}

.contact-heading :deep(a) {
  text-decoration: underline;
  text-decoration-thickness: .08em;
  text-underline-offset: .08em;
}

@media (max-width: 720px) {
  .contact {
    grid-template-columns: 1fr;
  }

  .contact-heading,
  h1,
  .contact-form { grid-column: 1; }
}
</style>
