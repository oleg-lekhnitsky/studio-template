<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
if (settings.value?.disableAbout) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
usePageSeo(() => settings.value?.aboutSeo, 'About — mmaze.studio', 'About our independent creative studio.')
const headline = computed(() => settings.value?.aboutHeadline || 'About the studio.')
const introduction = computed(() => settings.value?.aboutIntroduction ?? 'We’re a young team of talented people who make production a great process with a clear result. We ask a lot of questions, care about the small stuff and stay curious about pretty much everything. From straightforward productions to the slightly weird ones, we like figuring out how to make things work — and making them really good.')
const processSteps = computed(() => settings.value?.aboutProcessSteps ?? ['Get the brief right', 'Get the right people', 'Map out the production', 'Polish before we share', 'Deliver what we promised'])
const services = computed(() => settings.value?.aboutServices ?? ['Video Production', 'Animation', 'Creative Concepts', 'AI-production', 'Design & Brand Identity', '3D & VFX', 'Remote Production'])
</script>

<template>
  <PageFrame>
    <main class="page about-page">
      <h1 class="sr-only">{{ headline }}</h1>
      <HeroSection class="about-hero" :headline="headline" :show-headings="false" :video-url="settings?.aboutVideoUrl"
        :image="settings?.aboutImage" :sanity-path="settings?.aboutVideoUrl ? 'aboutVideo' : 'aboutImage'" />
      <p v-if="introduction" class="about-introduction">{{ introduction }}</p>
      <section v-if="processSteps.length" class="about-section" aria-labelledby="process-title">
        <h2 id="process-title">{{ settings?.aboutProcessTitle || 'The Mmaze 5' }}:</h2>
        <ol class="process-list">
          <li v-for="(step, index) in processSteps" :key="index">
            <span>{{ String(index + 1).padStart(2, '0') }} {{ step }}</span>
            <span v-if="index < processSteps.length - 1" class="process-arrow" aria-hidden="true">→</span>
          </li>
        </ol>
      </section>
      <section v-if="services.length" class="about-section" aria-labelledby="services-title">
        <h2 id="services-title">Services:</h2>
        <ul class="services-list">
          <li v-for="(service, index) in services" :key="index">{{ service }}</li>
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
  font-size: var(--small);
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
  font-weight: 500;
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

@media (max-width: 720px) {
  .about-section { margin-top: 96px; }
  .about-introduction { line-height: 1.4; }
}
</style>
