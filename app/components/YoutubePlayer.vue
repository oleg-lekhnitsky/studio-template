<script setup lang="ts">
defineProps<{ src: string }>()
</script>

<template>
  <div class="youtube-player">
    <iframe :src="src" title="YouTube video player" loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
  </div>
</template>

<style scoped>
.youtube-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius);
  background: #141414;
}
iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
</style>
