<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

const { data } = await useSanityQuery<CasePreview[]>(featuredCasesQuery)
const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
const items = computed(() => data.value?.length ? data.value : useDemoCases().slice(0, 4))
const headline = computed(() => settings.value?.heroHeadline || 'Ideas, identities\nand digital experiences.')
const studioName = computed(() => settings.value?.footerWordmark || settings.value?.headerText || 'mmaze.studio')
</script>

<template>
  <PageFrame>
    <main class="page home-page">
      <HeroSection class="home-desktop-hero" :headline="headline" :subheading="settings?.heroSubheading" :video-url="settings?.heroVideoUrl" :poster="settings?.heroPoster"
        sanity-path="heroVideo" />
      <section class="home-mobile-intro" aria-label="Studio introduction">
        <p>{{ studioName }}</p>
        <h1>{{ headline }}</h1>
      </section>
      <div class="home-grid-toolbar">
        <h2 v-if="!settings?.disableCases" id="latest-cases-heading">Latest cases:</h2>
      </div>
      <section v-if="!settings?.disableCases" class="home-grid" aria-labelledby="latest-cases-heading">
        <PreviewCard v-for="(item, index) in items" :key="item._id" :item="item" :index="index" />
      </section>
      <NuxtLink v-if="!settings?.disableCases" class="show-all primary-button" to="/cases">View all cases</NuxtLink>
    </main>
  </PageFrame>
</template>

<style scoped>
.home-mobile-intro { display: none; }

.home-grid-toolbar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-inline: var(--space);
}

.home-grid {
  columns: 2;
  column-gap: var(--space);
  padding: 0 var(--space) var(--space);
}

.home-grid-toolbar h2 {
  margin: 0;
  font-size: var(--small);
  font-weight: 600;
  line-height: 1.2;
  opacity: var(--opacity-muted);
}

.home-grid :deep(.card) {
  display: inline-block;
  width: 100%;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: calc(var(--space) * 1.5);
    display: flex;
  flex-direction: column;
  gap: calc(var(--space) * .5);
}

.show-all {
  align-self: center;
  margin-inline: var(--space);
}

@media (max-width: 720px) {
  .home-desktop-hero { display: none; }

  .home-mobile-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: clamp(280px, 72vw, 520px);
    padding: 0 16px 56px;
    text-align: center;
  }

  .home-mobile-intro p {
    margin: 0;
    font-size: var(--small);
    opacity: var(--opacity-muted);
  }

  .home-mobile-intro h1 {
    margin: 0;
    font-size: clamp(28px, 8.2vw, 40px);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: var(--letter-spacing-medium);
    text-wrap: balance;
    white-space: pre-line;
  }

  .home-grid-toolbar { margin-inline: 16px; flex-wrap: wrap; }
  .home-grid-toolbar h2 { font-size: 14px; }

  .home-grid {
    columns: 1;
    padding-inline: 16px;
  }
}
</style>
