<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

defineProps<{ settings?: SiteSettings | null }>()
</script>

<template>
  <nav aria-label="Main navigation">
    <NuxtLink v-if="!settings?.disableCases" to="/projects">Projects</NuxtLink>
    <NuxtLink v-if="!settings?.disableAbout" to="/about">About Us</NuxtLink>
    <NuxtLink v-if="!settings?.disableContact" to="/contact">Contact</NuxtLink>
    <NuxtLink v-if="!settings?.disableJobs" to="/jobs">Crew</NuxtLink>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.router-link-exact-active {
  opacity: .45;
}

nav a:focus-visible {
  outline: none;
  background: var(--accent);
  opacity: 1;
}

@media (forced-colors: active) {
  nav a:focus-visible {
    outline: 2px solid CanvasText;
    outline-offset: 2px;
  }
}

@media (max-width: 720px) {
  nav {
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    gap: clamp(8px, 3vw, 24px);
    white-space: nowrap;
  }
}
</style>
