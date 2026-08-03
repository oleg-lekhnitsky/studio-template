<script setup lang="ts">
import type { CasePreview } from '~/types/sanity'

const props = defineProps<{ currentId: string }>()
const { data } = await useSanityQuery<CasePreview[]>(casesQuery)

const items = computed(() => {
  const cases = data.value?.length ? data.value : useDemoCases()
  if (cases.length < 2) return []

  const currentIndex = cases.findIndex(item => item._id === props.currentId)
  if (currentIndex === -1) return cases.filter(item => item._id !== props.currentId)

  const after = cases.slice(currentIndex + 1)
  const before = cases.slice(0, currentIndex)
  return [...after, ...before]
})
</script>

<template>
  <section v-if="items.length" class="next-cases">
    <h2 class="display">Next cases</h2>
    <div class="next-grid">
      <PreviewCard
        v-for="(item, index) in items"
        :key="item._id"
        :item="item"
        :index="index"
      />
    </div>
  </section>
</template>

<style scoped>
.next-cases {
  margin-top: calc(var(--space) * 4);
  padding-inline: var(--space);
}
h2 { margin: 0 0 calc(var(--space) * 2); font-weight: inherit; }
.next-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(260px, 30%);
  gap: var(--space);
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-inline: contain;
  scroll-snap-type: inline mandatory;
  scrollbar-width: none;
}
.next-grid::-webkit-scrollbar { display: none; }
.next-grid > * { scroll-snap-align: start; }
@media (max-width: 720px) { .next-grid { grid-auto-columns: 82%; } }
</style>
