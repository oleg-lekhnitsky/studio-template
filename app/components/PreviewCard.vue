<script setup lang="ts">
import type { CasePreview } from '~/types/sanity'
const props = defineProps<{ item: CasePreview; index?: number }>()
const fallback = computed(() => `hsl(${((props.index || 0) * 47) % 360} 12% ${88 - ((props.index || 0) % 3) * 7}%)`)
const dimensions = computed(() => sanityImageDimensions(props.item.cover?.asset?._ref))
const posterUrl = useSanityImage()
</script>

<template>
  <NuxtLink class="card" :to="`/cases/${item.slug}`">
    <div class="visual" :style="{ background: fallback }">
      <AutoplayVideo v-if="item.coverVideoUrl"
        :src="item.coverVideoUrl" :poster="posterUrl(item.coverPoster || item.cover, 1600)" />
      <NuxtImg v-else-if="item.cover?.asset?._ref"
        provider="sanity" :src="item.cover.asset._ref" :alt="item.cover.alt || item.title"
        :width="dimensions.width" :height="dimensions.height"
        sizes="sm:100vw md:50vw lg:50vw xl:50vw 2xl:50vw"
        :modifiers="{ crop: item.cover.crop, hotspot: item.cover.hotspot }" loading="lazy" />
      <span v-else class="placeholder display">{{ String((index || 0) + 1).padStart(2, '0') }}</span>
    </div>
    <div class="meta">
      <div class="details">
        <span>{{ item.title }}</span>
        <span v-if="item.summary" class="description">{{ item.summary }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.card { display: block; }
.visual {
  overflow: hidden;
  border-radius: var(--radius);
  clip-path: inset(0 round var(--radius));
}
.visual:has(.placeholder) { aspect-ratio: 4 / 3; }
.visual :deep(img), .visual video { height: auto; transition: transform .35s; }
.card:hover { opacity: 1; }
.card:hover :deep(img), .card:hover video { transform: scale(1.015); }
.placeholder { display: flex; height: 100%; align-items: flex-end; padding: 12px; }
.meta { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space); padding-top: 8px; }
.details { display: grid; }
.description { opacity: var(--opacity-secondary); }
</style>
