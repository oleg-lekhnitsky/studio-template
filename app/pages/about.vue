<script setup lang="ts">
import { stegaClean } from '@sanity/client/stega'
import type { SiteSettings } from '~/types/sanity'

const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
if (settings.value?.disableAbout) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
usePageSeo(() => settings.value?.aboutSeo, 'About Us — mmaze.studio', 'About our independent creative studio.')
const headline = computed(() => settings.value?.aboutHeadline ?? '')
const introduction = computed(() => settings.value?.aboutIntroduction ?? '')
const processSteps = computed(() => settings.value?.aboutProcessSteps ?? [])
const services = computed(() => settings.value?.aboutServices ?? [])
</script>

<template>
  <PageFrame>
    <main class="page about-page">
      <h1 v-if="headline" class="sr-only">{{ headline }}</h1>
      <HeroSection class="about-hero" :headline="headline" :show-headings="false" :video-url="settings?.aboutVideoUrl"
        :image="settings?.aboutImage" :sanity-path="settings?.aboutVideoUrl ? 'aboutVideo' : 'aboutImage'" />
      <p v-if="introduction" class="about-introduction">{{ introduction }}</p>
      <section v-if="processSteps.length" class="about-section" :aria-labelledby="settings?.aboutProcessTitle ? 'process-title' : undefined">
        <h2 v-if="settings?.aboutProcessTitle" id="process-title">{{ settings.aboutProcessTitle }}:</h2>
        <ol class="process-list">
          <li v-for="(step, index) in processSteps" :key="index">
            <span>{{ String(index + 1).padStart(2, '0') }} {{ step }}</span>
            <span v-if="index < processSteps.length - 1" class="process-arrow" aria-hidden="true">→</span>
          </li>
        </ol>
      </section>
      <section v-if="services.length" class="about-section" :aria-labelledby="settings?.aboutServicesTitle ? 'services-title' : undefined">
        <h2 v-if="settings?.aboutServicesTitle" id="services-title">{{ settings.aboutServicesTitle }}:</h2>
        <ul class="services-list">
          <li v-for="(service, index) in services" :key="index">
            <NuxtLink :to="{ path: '/projects', query: { category: stegaClean(service).trim() } }">{{ service }}</NuxtLink>
          </li>
        </ul>
      </section>
    </main>
  </PageFrame>
</template>

<style scoped>
.about-page {
  gap: 0;
}

.about-hero { margin-bottom: 0; }
.about-hero :deep(.hero-media) { aspect-ratio: 16 / 9; object-fit: cover; }

.about-introduction {
  margin: calc(var(--space) * 4) var(--space) 0;
  font-size: calc(var(--medium) /1.625);
  font-weight: 600;
  line-height: 1.25;
  white-space: pre-line;
}

.about-section {
  margin-top: clamp(96px, 20vw, 320px);
  padding-inline: var(--space);
}

.about-section h2 {
  margin: 0 0 var(--space);
  font-size: var(--small);
  font-weight: 600;
  line-height: 1.3;
}

.process-list,
.services-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: clamp(32px, 3.5vw, 72px);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: var(--letter-spacing-medium);
}

.process-list li { display: inline; }
.process-arrow { margin-inline: .2em; }

.services-list {
  display: flex;
  flex-wrap: wrap;
  column-gap: .8em;
}

.services-list a {
  text-decoration: underline;
  text-decoration-thickness: .06em;
  text-underline-offset: .12em;
}

@media (max-width: 720px) {
  .services-list { flex-direction: column; align-items: flex-start; }
  .about-hero { margin-top: calc(var(--space) * 12); }
  .about-section { margin-top: 96px; }
  .about-introduction {
    margin-top: calc(var(--space) * 7);
    font-size: calc(var(--small)*1.625);
    line-height: 1.25;
  }
  .about-introduction + .about-section { margin-top: calc(var(--space) * 7); }
  .about-section + .about-section { margin-top: calc(var(--space) * 26); }
}
</style>
