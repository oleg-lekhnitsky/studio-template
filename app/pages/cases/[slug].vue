<script setup lang="ts">
import type { CaseStudy, SiteSettings } from '~/types/sanity'

const route = useRoute()
const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
if (settings.value?.disableCases) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
const { data: project } = await useSanityQuery<CaseStudy>(caseQuery, { slug: route.params.slug })
const demo = computed(() => useDemoCases().find(item => item.slug === route.params.slug))
const current = computed(() => project.value || demo.value)
const imageUrl = useSanityImage()
const metaTitle = computed(() => current.value?.title || 'Case')
const metaDescription = computed(() => project.value?.description || current.value?.summary || 'A selected studio case study.')
const metaImage = computed(() => imageUrl(project.value?.cover, 1200) || undefined)

useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  ogTitle: () => metaTitle.value,
  ogDescription: () => metaDescription.value,
  ogImage: () => metaImage.value,
  twitterTitle: () => metaTitle.value,
  twitterDescription: () => metaDescription.value,
  twitterImage: () => metaImage.value
})
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: metaTitle.value,
      description: metaDescription.value,
      image: metaImage.value,
      dateCreated: current.value?.year
    })
  }]
})
const firstMediaIndex = computed(() => project.value?.content?.findIndex(block =>
  block._type === 'galleryImage' || block._type === 'video' || block._type === 'bento'
) ?? -1)
const leadContent = computed(() => {
  const content = project.value?.content || []
  return firstMediaIndex.value >= 0 ? content.slice(0, firstMediaIndex.value + 1) : []
})
const remainingContent = computed(() => {
  const content = project.value?.content || []
  return firstMediaIndex.value >= 0 ? content.slice(firstMediaIndex.value + 1) : content
})
if (!current.value) throw createError({ statusCode: 404, statusMessage: 'Case not found' })
</script>

<template>
  <PageFrame>
    <main v-if="current" class="page">
      <div v-if="leadContent.length" class="media-grid">
        <CaseMediaBlock v-for="block in leadContent" :key="block._key" :block="block" />
      </div>
      <header class="case-head">
        <div class="case-identity">
          <h1>{{ current.title }}</h1>
        </div>
        <p v-if="project?.description">{{ project.description }}</p>
      </header>
      <div v-if="remainingContent.length" class="media-grid">
        <CaseMediaBlock v-for="block in remainingContent" :key="block._key" :block="block" />
      </div>
      <div v-else-if="!leadContent.length" class="empty-media display">Content coming soon.</div>
      <dl v-if="current.year || project?.cast?.length" class="case-details">
        <template v-if="current.year">
          <dt>Year</dt>
          <dd>{{ current.year }}</dd>
        </template>
        <template v-if="project?.cast?.length">
          <dt>Team</dt>
          <dd class="team-credits">
            <template v-for="credit in project.cast" :key="credit._key">
              <span>{{ credit.role }}:
                <a v-if="credit.url" class="credit-name" :href="credit.url">{{ credit.name }}</a>
                <span v-else class="credit-name">{{ credit.name }}</span>
              </span>{{ ' ' }}
            </template>
          </dd>
        </template>
      </dl>
      <NextCases :current-id="current._id" />
    </main>
  </PageFrame>
</template>

<style scoped>
.case-head {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space);
  margin: 0;
  padding: calc(var(--space) * 2) var(--space);
}

.case-identity {
  display: grid;
  align-content: start;
  
}

.case-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space);
  margin: calc(var(--space) * 3) 0 0;
  padding: var(--space);
}

.case-details dt,
.case-details dd {
  margin: 0;
}

.case-details {
  padding-block: calc(var(--space) * 4);
}

.team-credits {
  line-height: 1.3;
}

.credit-name {
  color: var(--accent);
}

h1 {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  font-size: var(--medium);
  line-height: 1.1;
  text-wrap: pretty;
}

p {
  margin: 0;
  text-wrap: pretty;
}

.empty-media {
  min-height: 90vh;
  padding-inline: var(--space);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 720px) {
  .case-head {
    grid-template-columns: 1fr;
  }

  .case-details {
    grid-template-columns: 1fr;
  }
}
</style>
