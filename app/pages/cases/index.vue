<script setup lang="ts">
import type { CasePreview, SiteSettings } from '~/types/sanity'

const { data } = await useSanityQuery<CasePreview[]>(casesQuery)
const { data: settings } = await useSanityQuery<SiteSettings>(siteSettingsQuery)
if (settings.value?.disableCases) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
const router = useRouter()
const items = computed(() => data.value?.length ? data.value : useDemoCases())
const selectedCategory = ref('All')
const displayedCategory = ref('All')
const cardsVisible = ref(true)
const toolbarVisible = ref(true)
const masonryColumnCount = ref(4)
let filterSequence = 0
let lastScrollY = 0
let scrollFrame = 0
const categories = computed(() => [
  'All',
  ...Array.from(new Set(items.value.flatMap(item => item.categories || [])))
])
const filteredItems = computed(() => displayedCategory.value === 'All'
  ? items.value
  : items.value.filter(item => item.categories?.includes(displayedCategory.value)))
const masonryColumns = computed(() => {
  const columns = Array.from({ length: masonryColumnCount.value }, () => [] as Array<{ item: CasePreview; index: number }>)
  filteredItems.value.forEach((item, index) => columns[index % masonryColumnCount.value]?.push({ item, index }))
  return columns
})

function syncMasonryColumns() {
  const width = window.innerWidth
  masonryColumnCount.value = width <= 520 ? 1 : width <= 800 ? 2 : width <= 1100 ? 3 : 4
}

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

function updateToolbarVisibility() {
  cancelAnimationFrame(scrollFrame)
  scrollFrame = requestAnimationFrame(() => {
    const currentScrollY = Math.max(window.scrollY, 0)
    const difference = currentScrollY - lastScrollY

    if (currentScrollY <= 48 || difference < -2) toolbarVisible.value = true
    else if (difference > 2) toolbarVisible.value = false

    lastScrollY = currentScrollY
  })
}

onMounted(() => {
  syncMasonryColumns()
  lastScrollY = window.scrollY
  window.addEventListener('resize', syncMasonryColumns)
  window.addEventListener('keydown', closeOnEscape)
  window.addEventListener('scroll', updateToolbarVisibility, { passive: true })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(scrollFrame)
  window.removeEventListener('resize', syncMasonryColumns)
  window.removeEventListener('keydown', closeOnEscape)
  window.removeEventListener('scroll', updateToolbarVisibility)
})
usePageSeo(() => settings.value?.casesSeo, 'Cases — Yuliana', 'Selected projects from our creative studio.')
</script>

<template>
  <PageFrame>
    <main class="cases-index">
      <header class="index-toolbar" :class="{ 'toolbar-hidden': !toolbarVisible }">
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
      <section class="masonry" :class="{ 'cards-hidden': !cardsVisible }"
        :style="{ '--masonry-columns': masonryColumnCount }">
        <div v-for="(column, columnIndex) in masonryColumns" :key="columnIndex" class="masonry-column">
          <PreviewCard v-for="entry in column" :key="entry.item._id" :item="entry.item" :index="entry.index"
            :style="{ '--case-stagger': `${Math.min(entry.index, 8) * 18}ms` }" />
        </div>
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
  position: sticky;
  z-index: 4;
  top: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
  gap: var(--space);
  margin-top: calc(var(--space) * -1);
  padding-top: var(--space);
  padding-bottom: var(--space);
  background: var(--background);
  transition:
    opacity 180ms ease-out,
    transform 240ms cubic-bezier(0.2, 0, 0, 1);
}

.index-toolbar.toolbar-hidden {
  opacity: 0;
  transform: translateY(calc(-100% - var(--space)));
  pointer-events: none;
}

.case-filter {
  grid-column: span 3;
  display: flex;
  min-height: 44px;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px var(--space);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 2px var(--space);
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
  display: grid;
  grid-template-columns: repeat(var(--masonry-columns), minmax(0, 1fr));
  gap: var(--space);
}

.masonry-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.masonry.cards-hidden :deep(.card) {
  opacity: 0;
  transform: translateY(16px);
}

.masonry :deep(.card) {
  width: 100%;
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

@media (max-width: 520px) {
  .index-toolbar { grid-template-columns: 1fr auto; }
  .case-filter { grid-column: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .index-toolbar { transition-duration: .01ms; }
  .masonry :deep(.card) { animation: none; transition: none; }
  .close-index { transition-duration: .01ms; }
  .close-index:active { scale: 1; }
}
</style>
