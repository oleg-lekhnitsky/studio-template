<script setup lang="ts">
import { createDataAttribute } from '@sanity/visual-editing-csm'
import type { SanityImage } from '~/types/sanity'

const props = withDefaults(defineProps<{
  headline: string
  subheading?: string
  videoUrl?: string
  image?: SanityImage
  poster?: SanityImage
  placeholder?: boolean
  showHeadings?: boolean
  sanityPath?: string
}>(), { placeholder: false, showHeadings: true })

const imageUrl = useSanityImage()
const runtimeConfig = useRuntimeConfig()
const cleanHeadline = computed(() => props.headline.trim())
const mediaDataSanity = computed(() => props.sanityPath
  ? createDataAttribute({
      projectId: runtimeConfig.public.sanityProjectId,
      dataset: runtimeConfig.public.sanityDataset,
      id: siteSettingsId,
      type: 'siteSettings',
      path: props.sanityPath
    }).toString()
  : undefined)
</script>

<template>
  <section class="hero">
    <FullscreenMedia v-if="videoUrl" class="hero-media-frame" label="Open hero video fullscreen" preload-fullscreen
      :data-sanity="mediaDataSanity">
      <AutoplayVideo class="hero-media" :src="videoUrl" :poster="imageUrl(poster || image, 2400)" />
      <template #fullscreen>
        <video class="fullscreen-asset" :src="videoUrl" :poster="imageUrl(poster || image, 2400)"
          muted loop playsinline controls preload="auto"
          style="position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;max-height:none;margin:0;border-radius:0;object-fit:contain" />
      </template>
    </FullscreenMedia>
    <NuxtImg v-else-if="image?.asset?._ref" class="hero-media" provider="sanity"
      :src="image.asset._ref" :alt="image.alt || ''" width="2400"
      :data-sanity="mediaDataSanity"
      sizes="sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
      :modifiers="{ crop: image.crop, hotspot: image.hotspot }" />
    <div v-else-if="placeholder" class="hero-media hero-placeholder" aria-hidden="true" />
    <div v-if="showHeadings" class="hero-headings">
      <h1>{{ cleanHeadline }}</h1>
      <p v-if="subheading?.trim()">{{ subheading }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space) * 4);
  margin-bottom: calc(var(--space) * 3);
}

.hero-media {
  width: calc(100% - var(--space) * 2);
  height: auto;
  margin-top: var(--space);
  margin-inline: var(--space);
  background: var(--surface);
}

.hero-media-frame {
  width: calc(100% - var(--space) * 2);
  aspect-ratio: 16 / 9;
  min-height: 0;
  margin-top: var(--space);
  margin-inline: var(--space);
  border-radius: var(--radius);
  overflow: hidden;
}

.hero-media-frame :deep(.media-source) {
  height: 100%;
  overflow: hidden;
}

.hero-media-frame .hero-media {
  width: 100%;
  height: 100%;
  margin: 0;
}

.hero-media-frame :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
}

.hero-headings {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space);
  align-items: start;
  padding: var(--space);
}

h1{
  font-weight: 600;
}

h1,
p {
  margin: 0;
  white-space: pre-line;
  text-wrap: pretty;
}

h1 {
  font-size: var(--medium);
  font-weight: 600;
  line-height: 1.1;
  
}

p {
  font-size: var(--small);
  font-weight: 600;
  line-height: 1.4;
  
}

@media (max-width: 720px) {
  .hero-headings {
    grid-template-columns: 1fr;
  }
}
</style>
