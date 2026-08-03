<script setup lang="ts">
import type { SocialLink } from '~/types/sanity'

defineProps<{ links: SocialLink[] }>()
</script>

<template>
  <nav aria-label="Social media">
    <ul>
      <li v-for="link in links" :key="link._key">
        <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
ul {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

a { display: inline-block; }

a:focus-visible {
  outline: none;
  background: var(--social-focus, var(--accent));
}

@media (forced-colors: active) {
  a:focus-visible {
    outline: 2px solid CanvasText;
    outline-offset: 2px;
  }
}
</style>
