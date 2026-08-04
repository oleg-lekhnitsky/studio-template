<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

const route = useRoute()
const requestUrl = useRequestURL()
const runtimeConfig = useRuntimeConfig()
const routeIsCasesIndex = () => route.path === '/cases' || route.path === '/cases/'
const isCasesIndex = ref(routeIsCasesIndex())
const { data: siteSettings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
const imageUrl = useSanityImage()

function syncShellToRoute() {
  isCasesIndex.value = routeIsCasesIndex()
}

const title = computed(() => siteSettings.value?.seoTitle || 'Yuliana — Selected Work')
const description = computed(() => siteSettings.value?.seoDescription || 'Independent creative studio portfolio.')
const socialImage = computed(() => imageUrl(siteSettings.value?.ogImage, 1200) || undefined)
const canonicalUrl = computed(() => new URL(route.path, runtimeConfig.public.siteUrl || requestUrl.origin).toString())

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
  ogImage: () => socialImage.value,
  ogUrl: () => canonicalUrl.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => socialImage.value
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: title.value.replace(/\s*[—|-].*$/, ''),
      url: runtimeConfig.public.siteUrl,
      description: description.value,
      sameAs: siteSettings.value?.socialLinks?.map(link => link.url) || []
    })
  }]
})
</script>

<template>
  <div class="app-shell" :class="{ 'cases-index-mode': isCasesIndex }">
    <NuxtLoadingIndicator color="var(--accent)" />
    <div class="site-shell" :class="{ 'cases-index-mode': isCasesIndex }">
      <SiteHeader v-if="!isCasesIndex" :settings="siteSettings" />
      <div class="site-content">
        <NuxtPage :transition="{ name: 'page', mode: 'out-in', onAfterLeave: syncShellToRoute }" />
      </div>
    </div>
    <Transition name="page" mode="out-in">
      <SiteFooter v-if="!isCasesIndex" :key="route.fullPath" :social-links="siteSettings?.socialLinks"
        :wordmark-label="siteSettings?.footerWordmark || 'Yuliana'" />
    </Transition>
  </div>
</template>

<style scoped>
.site-shell.cases-index-mode {
  display: block;
  padding-bottom: 0;
}
</style>
