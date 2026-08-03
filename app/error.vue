<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const title = computed(() => props.error.statusCode === 404 ? 'Page not found.' : 'Something went wrong.')

useSeoMeta({ title: () => `${title.value} — Yuliana`, robots: 'noindex' })
</script>

<template>
  <main class="error-page">
    <p>{{ error.statusCode }}</p>
    <h1 class="display">{{ title }}</h1>
    <button class="primary-button" type="button" @click="clearError({ redirect: '/' })">Go home</button>
  </main>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: grid;
  align-content: start;
  gap: calc(var(--space) * 2);
  padding: var(--space);
}
p, h1 { margin: 0; }
</style>
