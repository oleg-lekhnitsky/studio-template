<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

const { data } = await useSanityQuery<CasePreview[]>(featuredCasesQuery)
const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
const items = computed(() => data.value?.length ? data.value : useDemoCases().slice(0, 4))
const headline = computed(() => settings.value?.heroHeadline || 'Ideas, identities\nand digital experiences.')
</script>

<template>
  <PageFrame>
    <main class="page">
      <HeroSection :headline="headline" :video-url="settings?.heroVideoUrl" :poster="settings?.heroPoster"
        sanity-path="heroVideo" />
      <section class="home-grid">
        <PreviewCard v-for="(item, index) in items" :key="item._id" :item="item" :index="index" />
      </section>
      <NuxtLink class="show-all primary-button" to="/cases">View all cases</NuxtLink>
    </main>
  </PageFrame>
</template>

<style scoped>
.home-grid {
  columns: 2;
  column-gap: var(--space);
  padding: var(--space);
}

.home-grid :deep(.card) {
  break-inside: avoid;
  margin-bottom: calc(var(--space) * 2);
}

.show-all {
  align-self: center;
  margin-inline: var(--space);
}

@media (max-width: 720px) {
  .home-grid {
    columns: 1;
  }
}
</style>
