<script setup lang="ts">
const props = defineProps<{ clients?: string[] | null }>()
const names = computed(() => (props.clients ?? []).map(name => name.trim()).filter(Boolean))
const paused = ref(false)
</script>

<template>
  <section v-if="names.length" class="clients" aria-label="Clients" :class="{ paused }">
    <button class="clients-toggle" type="button" :aria-pressed="paused" @click="paused = !paused">
      {{ paused ? 'Resume client animation' : 'Pause client animation' }}
    </button>
    <ul class="sr-only">
      <li v-for="(name, index) in names" :key="index">{{ name }}</li>
    </ul>
    <div class="clients-track" aria-hidden="true">
      <div v-for="copy in 2" :key="copy" class="clients-group">
        <span v-for="(name, index) in names" :key="index">{{ name }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.clients {
  position: relative;
  cursor: default;
  min-width: 0;
  overflow: hidden;
  font-size: var(--large);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: var(--letter-spacing-large);
}

.clients-track {
  display: flex;
  width: max-content;
  animation: clients-scroll 55s linear infinite;
  
}

.clients-group {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-around;
  min-width: 100vw;
  gap: 1em;
  padding-right: 1em;
  white-space: nowrap;
}

.clients:focus-within .clients-track,
.clients.paused .clients-track {
  animation-play-state: paused;
}

@media (hover: hover) and (pointer: fine) {
  .clients:hover .clients-track { animation-play-state: paused; }
}

.clients-toggle {
  position: absolute;
  z-index: 1;
  top: 0;
  right: var(--space);
  padding: .5em;
  border: 0;
  color: #141414;
  background: var(--accent);
  font-size: var(--small);
  letter-spacing: normal;
  cursor: pointer;
  transform: translateY(-150%);
}

.clients-toggle:focus-visible { transform: none; }

@keyframes clients-scroll {
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .clients-track { width: auto; animation: none; }
  .clients-group {
    min-width: 0;
    flex-wrap: wrap;
    justify-content: flex-start;
    white-space: normal;
    padding-inline: var(--space);
    gap: .5em 1em;
  }
  .clients-group + .clients-group,
  .clients-toggle { display: none; }
}
</style>
