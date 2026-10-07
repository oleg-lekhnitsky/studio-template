<script setup lang="ts">
import { stegaClean } from '@sanity/client/stega'
import type { CaseBlock } from '~/types/sanity'
const props = defineProps<{ block: CaseBlock }>()
const imageUrl = useSanityImage()
const cleanWidth = computed(() => stegaClean(props.block.width))
const spanClass = computed(() => cleanWidth.value === 'half' ? 'half' : 'full')
const dimensions = computed(() => props.block._type === 'galleryImage'
  ? sanityImageDimensions(props.block.image.asset?._ref)
  : { width: 1600, height: 1000 })
const videoSource = computed(() => props.block._type === 'video'
  ? stegaClean(props.block.fileUrl || props.block.url || '')
  : '')
const isVimeoVideo = computed(() => /(?:player\.)?vimeo\.com/i.test(videoSource.value))
const mediaAspectRatio = computed(() => {
  if (props.block._type !== 'galleryImage' && props.block._type !== 'video') return undefined
  const ratio = stegaClean(props.block.aspectRatio)
  return ratio && ratio !== 'original' ? ratio.replace(':', ' / ') : undefined
})
</script>

<template>
  <section :class="['block', spanClass, { 'text-block': block._type === 'textBlock' }]">
    <CaseBentoBlock v-if="block._type === 'bento'" :block="block" />
    <FullscreenMedia v-else-if="block._type === 'galleryImage' && block.image.asset?._ref"
      :class="{ 'media-frame': mediaAspectRatio }" :style="{ aspectRatio: mediaAspectRatio }"
      :label="`Open ${block.image.alt || 'case image'} fullscreen`">
      <NuxtImg provider="sanity" :src="block.image.asset._ref" :alt="block.image.alt || ''"
        :width="dimensions.width" :height="dimensions.height"
        :sizes="cleanWidth === 'half'
          ? 'sm:100vw md:50vw lg:50vw xl:50vw 2xl:50vw'
          : 'sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw'"
        :modifiers="{ crop: block.image.crop, hotspot: block.image.hotspot }" loading="lazy" />
      <template #fullscreen>
        <img class="fullscreen-asset" :src="imageUrl(block.image, 2400)" :alt="block.image.alt || ''"
          :width="dimensions.width" :height="dimensions.height"
          style="position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;max-height:none;margin:0;border-radius:0;object-fit:contain" />
      </template>
    </FullscreenMedia>
    <FullscreenMedia v-else-if="block._type === 'video' && isVimeoVideo" label="Open Vimeo video fullscreen">
      <VimeoPlayer :src="videoSource" :aspect-ratio="block.aspectRatio" background />
      <template #fullscreen>
        <VimeoPlayer :src="videoSource" :aspect-ratio="block.aspectRatio" />
      </template>
    </FullscreenMedia>
    <FullscreenMedia v-else-if="block._type === 'video'" label="Open case video fullscreen" preload-fullscreen
      :class="{ 'media-frame': mediaAspectRatio }" :style="{ aspectRatio: mediaAspectRatio }">
      <AutoplayVideo :src="videoSource" :poster="imageUrl(block.poster, 1600)" />
      <template #fullscreen>
        <video class="fullscreen-asset" :src="videoSource" :poster="imageUrl(block.poster, 2000)"
          muted loop playsinline controls preload="auto"
          style="position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;max-height:none;margin:0;border-radius:0;object-fit:contain" />
      </template>
    </FullscreenMedia>
    <template v-else-if="block._type === 'textBlock' && block.text">
      <span v-if="block.label" class="label">{{ block.label }}</span>
      <div class="copy">
        <SanityContent :value="block.text" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.block {
  grid-column: span 12;
  font-size: var(--medium);
  letter-spacing: var(--letter-spacing-medium);
}

.half {
  grid-column: span 6;
  font-size: var(--medium);
  letter-spacing: var(--letter-spacing-medium);
}

.media-frame :deep(.media-source) {
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius);
}

.media-frame :deep(.media-source > img),
.media-frame :deep(.media-source > .autoplay-video),
.media-frame :deep(.media-source > .autoplay-video > video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.copy :deep(p) {
  margin: 0;
  text-wrap: pretty;
}

.copy :deep(> * + *) { margin-top: 1em; }
.copy :deep(p + p) { margin-top: 1em; }
.copy :deep(> :first-child) { margin-top: 0; }
.copy :deep(> :last-child) { margin-bottom: 0; }

.text-block {
  display: grid;
  align-items: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space);
  padding-block: calc(var(--space) * 3);
  font-size: var(--small);
  letter-spacing: var(--letter-spacing);
}

@media (max-width: 720px) {
  .half {
    grid-column: span 12;
  }
  .text-block {
    grid-template-columns: 1fr;
    padding-top: calc(var(--space) * 5);
    padding-bottom: calc(var(--space) * 2);
  }
}

</style>
