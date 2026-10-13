<script setup lang="ts">
import type { JobPreview } from '~/types/sanity'
defineProps<{ job: JobPreview }>()
</script>

<template>
  <NuxtLink class="job-card" :to="`/jobs/${job.slug}`">
    <h2 class="medium">{{ job.title }}</h2>
    <div class="meta">
      <span>{{ job.location }}</span>
      <span>{{ job.employmentType }}</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.job-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space);
  padding: calc(var(--space) * 2);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--foreground) 6%, var(--background));
}
h2 { margin: 0; }
.meta { display: flex; justify-content: space-between; gap: var(--space); }
@media (max-width: 720px) { .job-card { grid-template-columns: 1fr; } }
</style>
