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
</script>

<template>
  <section :class="['block', spanClass, { 'text-block': block._type === 'textBlock' }]">
    <FullscreenMedia v-if="block._type === 'galleryImage' && block.image.asset?._ref"
      :label="`Open ${block.image.alt || 'case image'} fullscreen`">
      <NuxtImg provider="sanity" :src="block.image.asset._ref" :alt="block.image.alt || ''"
        :width="dimensions.width" :height="dimensions.height"
        :sizes="cleanWidth === 'half'
          ? 'sm:100vw md:50vw lg:50vw xl:50vw 2xl:50vw'
          : 'sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw'"
        :modifiers="{ crop: block.image.crop, hotspot: block.image.hotspot }" loading="lazy" />
      <template #fullscreen>
        <NuxtImg provider="sanity" :src="block.image.asset._ref" :alt="block.image.alt || ''"
          :width="dimensions.width" :height="dimensions.height" sizes="100vw"
          :modifiers="{ crop: block.image.crop, hotspot: block.image.hotspot }" />
      </template>
    </FullscreenMedia>
    <FullscreenMedia v-else-if="block._type === 'video'" label="Open case video fullscreen">
      <AutoplayVideo :src="block.fileUrl || block.url" :poster="imageUrl(block.poster, 1600)" />
      <template #fullscreen>
        <video :src="block.fileUrl || block.url" :poster="imageUrl(block.poster, 2000)"
          autoplay muted loop playsinline controls preload="metadata" />
      </template>
    </FullscreenMedia>
    <template v-else-if="block._type === 'textBlock' && block.text">
      <span v-if="block.label" class="label">{{ block.label }}</span>
      <SanityContent class="copy" :value="block.text" />
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

.copy :deep(p) {
  margin: 0;
}

.text-block {
  display: grid;
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
  .text-block { grid-template-columns: 1fr; }
}

</style>
