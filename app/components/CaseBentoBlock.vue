<script setup lang="ts">
import { stegaClean } from '@sanity/client/stega'
import type { CaseBento } from '~/types/sanity'

const props = defineProps<{ block: CaseBento }>()
const layouts = {
  halves: { columns: 2, areas: ['1 / 1 / 3 / 2', '1 / 2 / 3 / 3'] },
  'stack-left': { columns: 2, areas: ['1 / 1 / 2 / 2', '2 / 1 / 3 / 2', '1 / 2 / 3 / 3'] },
  'stack-right': { columns: 2, areas: ['1 / 1 / 3 / 2', '1 / 2 / 2 / 3', '2 / 2 / 3 / 3'] },
  quarters: { columns: 2, areas: ['1 / 1 / 2 / 2', '2 / 1 / 3 / 2', '1 / 2 / 2 / 3', '2 / 2 / 3 / 3'] },
  thirds: { columns: 3, areas: ['1 / 1 / 3 / 2', '1 / 2 / 3 / 3', '1 / 3 / 3 / 4'] },
  'large-left-split-right': { columns: 4, areas: ['1 / 1 / 3 / 3', '1 / 3 / 2 / 4', '1 / 4 / 2 / 5', '2 / 3 / 3 / 5'] },
  'large-left': { columns: 4, areas: ['1 / 1 / 3 / 3', '1 / 3 / 2 / 4', '2 / 3 / 3 / 4', '1 / 4 / 2 / 5', '2 / 4 / 3 / 5'] },
  'large-right': { columns: 4, areas: ['1 / 1 / 2 / 2', '2 / 1 / 3 / 2', '1 / 2 / 2 / 3', '2 / 2 / 3 / 3', '1 / 3 / 3 / 5'] }
}
const layout = computed(() => layouts[stegaClean(props.block.layout) || 'stack-left'] || layouts['stack-left'])
const aspectRatio = computed(() => (stegaClean(props.block.aspectRatio) || '16:9').replace(':', ' / '))
</script>

<template>
  <div class="bento" :style="{ '--bento-columns': layout.columns, aspectRatio }">
    <CaseMediaBlock v-for="(tile, index) in block.tiles || []" :key="tile._key"
      class="bento-tile" :block="tile" :style="{ gridArea: layout.areas[index] }" />
  </div>
</template>

<style scoped>
.bento {
  display: grid;
  grid-template-columns: repeat(var(--bento-columns), minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: var(--space);
}

.bento-tile { min-width: 0; min-height: 0; }
.bento-tile :deep(.fullscreen-media) { aspect-ratio: auto !important; }
.bento-tile :deep(.fullscreen-media),
.bento-tile :deep(.media-source) { height: 100%; }
.bento-tile :deep(.media-source) { overflow: hidden; border-radius: var(--radius); }
.bento-tile :deep(.media-source > img),
.bento-tile :deep(.media-source > video),
.bento-tile :deep(.media-source > .vimeo-player) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 720px) {
  .bento { display: flex; flex-direction: column; aspect-ratio: auto !important; }
  .bento-tile { aspect-ratio: auto; }
  .bento-tile :deep(.fullscreen-media),
  .bento-tile :deep(.media-source),
  .bento-tile :deep(.media-source > img),
  .bento-tile :deep(.media-source > video),
  .bento-tile :deep(.media-source > .autoplay-video),
  .bento-tile :deep(.media-source > .autoplay-video > video),
  .bento-tile :deep(.media-source > .vimeo-player) {
    height: auto;
  }
}
</style>
