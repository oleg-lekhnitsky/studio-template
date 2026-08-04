<script setup lang="ts">
import type { JobPreview, SiteSettings } from '~/types/sanity'

const { data: jobs } = await useSanityQuery<JobPreview[]>(jobsQuery)
const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
if (settings.value?.disableJobs) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
usePageSeo(() => settings.value?.jobsSeo, 'Jobs — Yuliana', 'Open roles and opportunities at our creative studio.')
</script>

<template>
  <PageFrame>
    <main class="page jobs-page">
      <header>
        <h1 class="display">{{ settings?.jobsHeadline || 'Work with us.' }}</h1>
        <p v-if="settings?.jobsIntroduction" class="medium">{{ settings.jobsIntroduction }}</p>
      </header>
      <section v-if="jobs?.length" class="jobs-list" aria-label="Open positions">
        <JobCard v-for="job in jobs" :key="job._id" :job="job" />
      </section>
      <p v-else class="medium empty-state">There are no open positions right now.</p>
    </main>
  </PageFrame>
</template>

<style scoped>
.jobs-page {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  column-gap: var(--space);
  row-gap: calc(var(--space) * 2);
  padding: var(--space) var(--space) 0;
}
header { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: var(--space); }
.jobs-list, .empty-state { grid-column: 1; }
h1, p { margin: 0; }
@media (max-width: 720px) {
  .jobs-page, header { grid-template-columns: 1fr; }
}
</style>
