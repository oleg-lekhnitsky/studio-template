<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
usePageSeo(() => settings.value?.aboutSeo, 'About — Yuliana', 'About our independent creative studio.')
const headline = computed(() => settings.value?.aboutHeadline || 'About the studio.')
</script>

<template>
  <PageFrame>
    <main class="page">
      <HeroSection :headline="headline" :video-url="settings?.aboutVideoUrl"
        :image="settings?.aboutImage" :sanity-path="settings?.aboutVideoUrl ? 'aboutVideo' : 'aboutImage'" />
      <section v-if="settings?.people?.length" class="people-grid" aria-label="People">
        <PersonCard v-for="person in settings.people" :key="person._key" :person="person" />
      </section>
    </main>
  </PageFrame>
</template>

<style scoped>
.people-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: calc(var(--space) * 4) var(--space);
  padding: calc(var(--space) * 4) var(--space);
}

@media (max-width: 960px) {
  .people-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 520px) {
  .people-grid { grid-template-columns: 1fr; }
}
</style>
