<script setup lang="ts">
import type { Person } from '~/types/sanity'

defineProps<{ person: Person }>()
</script>

<template>
  <article class="person-card">
    <div class="person-image">
      <NuxtImg v-if="person.image?.asset?._ref"
        provider="sanity"
        :src="person.image.asset._ref"
        :alt="person.image.alt || person.name"
        sizes="sm:100vw md:50vw lg:25vw"
        :modifiers="{ crop: person.image.crop, hotspot: person.image.hotspot }"
        loading="lazy" />
    </div>
    <div class="person-meta">
      <span>{{ person.name }}</span>
      <span class="position">{{ person.position }}</span>
    </div>
  </article>
</template>

<style scoped>
.person-card {
  width: 75%;
}

.person-image {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: var(--radius);
  background: #ddd;
}

.person-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-meta {
  display: grid;
  padding-top: 8px;
}

.position { opacity: var(--opacity-secondary); }

@media (max-width: 520px) {
  .person-card { width: 100%; }
}
</style>
