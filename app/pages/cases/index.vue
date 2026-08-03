<script setup lang="ts">
import type { CasePreview, SiteSettings } from '~/types/sanity'

const { data } = await useSanityQuery<CasePreview[]>(casesQuery)
const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
const router = useRouter()
const items = computed(() => data.value?.length ? data.value : useDemoCases())
const selectedCategory = ref('All')
const displayedCategory = ref('All')
const cardsVisible = ref(true)
let filterSequence = 0
const categories = computed(() => [
  'All',
  ...Array.from(new Set(items.value.flatMap(item => item.categories || [])))
])
const filteredItems = computed(() => displayedCategory.value === 'All'
  ? items.value
  : items.value.filter(item => item.categories?.includes(displayedCategory.value)))

async function selectCategory(category: string) {
  if (category === selectedCategory.value && cardsVisible.value) return
  selectedCategory.value = category
  cardsVisible.value = false
  const sequence = ++filterSequence

  const staggeredExitDuration = 220 + Math.min(Math.max(filteredItems.value.length - 1, 0), 8) * 18
  await new Promise(resolve => setTimeout(resolve, staggeredExitDuration))
  if (sequence !== filterSequence) return

  displayedCategory.value = category
  await nextTick()
  requestAnimationFrame(() => {
    if (sequence === filterSequence) cardsVisible.value = true
  })
}

function closeCases() {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') closeCases()
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
usePageSeo(() => settings.value?.casesSeo, 'Cases — Yuliana', 'Selected projects from our creative studio.')
</script>

<template>
  <PageFrame>
    <main class="cases-index">
      <header class="index-toolbar">
        <section class="case-filter" aria-labelledby="case-filter-label">
          <span id="case-filter-label">I want to see</span>
          <div class="filter-options">
            <button v-for="category in categories" :key="category" type="button"
              :class="{ active: selectedCategory === category }"
              :aria-pressed="selectedCategory === category"
              @click="selectCategory(category)">
              {{ category }}
            </button>
          </div>
          <p class="sr-only" role="status" aria-live="polite">
            Showing {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'case' : 'cases' }}.
          </p>
        </section>
        <button class="close-index" type="button" aria-label="Close all cases and return to previous page"
          @click="closeCases">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </header>
      <section class="masonry" :class="{ 'cards-hidden': !cardsVisible }">
        <PreviewCard v-for="(item, index) in filteredItems" :key="item._id" :item="item" :index="index"
          :style="{ '--case-stagger': `${Math.min(index, 8) * 18}ms` }" />
      </section>
    </main>
  </PageFrame>
</template>

<style scoped>
.cases-index {
  min-height: 100vh;
  padding: var(--space);
}

.index-toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
  gap: var(--space);
  margin-bottom: var(--space);
}

.case-filter {
  grid-column: span 3;
  display: flex;
  min-height: 44px;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 var(--space);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space);
}

.filter-options button {
  min-height: 24px;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  opacity: var(--opacity-secondary);
}

.filter-options button:hover { opacity: .6; }
.filter-options button.active { opacity: 1; }
.filter-options button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }

.close-index {
  justify-self: end;
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  place-items: center;
  color: inherit;
  border-radius: 50%;
  background: var(--surface);
  cursor: pointer;
  transition-property: scale, opacity;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.close-index:hover { opacity: .65; }
.close-index:active { scale: .96; }
.close-index:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.close-index svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; }

.masonry {
  columns: 4;
  column-gap: var(--space);
}

.masonry.cards-hidden :deep(.card) {
  opacity: 0;
  transform: translateY(16px);
}

.masonry :deep(.card) {
  break-inside: avoid;
  margin-bottom: calc(var(--space) * 2);
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 180ms ease-out var(--case-stagger, 0ms),
    transform 220ms cubic-bezier(0.16, 1.35, 0.3, 1) var(--case-stagger, 0ms);
  animation: case-card-fade-in 420ms cubic-bezier(0.16, 1.35, 0.3, 1) backwards;
  animation-delay: var(--case-stagger, 0ms);
}

@keyframes case-card-fade-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .masonry { columns: 3; }
}

@media (max-width: 800px) {
  .masonry { columns: 2; }
}

@media (max-width: 520px) {
  .masonry {
    columns: 1;
  }

  .index-toolbar { grid-template-columns: 1fr auto; }
  .case-filter { grid-column: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .masonry :deep(.card) { animation: none; transition: none; }
  .close-index { transition-duration: .01ms; }
  .close-index:active { scale: 1; }
}
</style>
