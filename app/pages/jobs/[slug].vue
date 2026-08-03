<script setup lang="ts">
import type { Job } from '~/types/sanity'

const route = useRoute()
const { data: job } = await useSanityQuery<Job>(jobQuery, { slug: route.params.slug })
if (!job.value) throw createError({ statusCode: 404, statusMessage: 'Job not found' })

const metaTitle = computed(() => job.value?.title || 'Job')
const metaDescription = computed(() => job.value?.summary || `Apply for ${metaTitle.value} at our creative studio.`)
useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  ogTitle: () => metaTitle.value,
  ogDescription: () => metaDescription.value,
  twitterTitle: () => metaTitle.value,
  twitterDescription: () => metaDescription.value
})
</script>

<template>
  <PageFrame>
    <main v-if="job" class="page job-page">
      <header class="job-head">
        <h1 class="display">{{ job.title }}</h1>
        <div class="meta">
          <span>{{ job.location }}</span>
          <span>{{ job.employmentType }}</span>
          <span v-if="job.closingDate">Apply by {{ job.closingDate }}</span>
        </div>
      </header>
      <div class="job-content">
        <SanityContent v-if="job.description" class="medium description" :value="job.description" />
        <section class="application">
          <h2 class="medium">Apply for {{ job.title }}</h2>
          <JobApplicationForm :job-title="job.title" />
        </section>
      </div>
    </main>
  </PageFrame>
</template>

<style scoped>
.job-page {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: calc(var(--space) * 2) var(--space);
  padding: var(--space) var(--space) 0;
}
.job-head, .job-content { grid-column: 1; }
.job-head, .job-content { display: grid; grid-template-columns: 1fr; gap: calc(var(--space) * 2); }
h1, h2 { margin: 0; font-weight: inherit; }
.meta { display: flex; flex-wrap: wrap; gap: calc(var(--space) / 2) var(--space); margin-bottom: var(--space); }
.meta span::before { content: '•'; margin-right: calc(var(--space) / 2); font-weight: 900; }
.description { font-size: var(--medium); }
.job-content :deep(p) { margin: 0; padding: 0; }
.application { display: grid; gap: calc(var(--space) * 2); }
@media (max-width: 720px) {
  .job-page { grid-template-columns: 1fr; }
  .job-head, .job-content { grid-column: 1; }
}
</style>
