<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

defineProps<{ settings?: SiteSettings | null }>()

const navigation = ref<HTMLElement | null>(null)
const navigationStyle = ref<Record<string, string>>({})
const navigationChanging = ref(false)
const navigationOverFooter = ref(false)
const nuxtApp = useNuxtApp()

let frame = 0
let removeTransitionStart: (() => void) | undefined
let removeTransitionFinish: (() => void) | undefined

function positionNavigation() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const element = navigation.value
    const footer = document.querySelector<HTMLElement>('.footer')
    if (!element || !footer || window.innerWidth <= 720) {
      navigationStyle.value = {}
      navigationOverFooter.value = false
      return
    }

    const space = Number.parseFloat(getComputedStyle(footer).paddingTop) || 12
    const restingTop = window.innerHeight - element.offsetHeight - space
    const footerTop = footer.getBoundingClientRect().top + space
    const top = Math.max(space, Math.min(restingTop, footerTop))
    navigationOverFooter.value = footerTop <= restingTop
    navigationStyle.value = { top: `${top}px`, bottom: 'auto' }
  })
}

onMounted(() => {
  positionNavigation()
  window.addEventListener('scroll', positionNavigation, { passive: true })
  window.addEventListener('resize', positionNavigation)
  removeTransitionStart = nuxtApp.hook('page:start', () => {
    navigationChanging.value = true
  })
  removeTransitionFinish = nuxtApp.hook('page:transition:finish', () => {
    positionNavigation()
    requestAnimationFrame(() => { navigationChanging.value = false })
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', positionNavigation)
  window.removeEventListener('resize', positionNavigation)
  removeTransitionStart?.()
  removeTransitionFinish?.()
})
</script>

<template>
  <header class="header">
    <NuxtLink to="/">Studio</NuxtLink>
    <div ref="navigation" :class="['header-navigation', {
      changing: navigationChanging,
      'over-footer': navigationOverFooter
    }]" :style="navigationStyle">
      <SiteNavigation :settings="settings" />
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  z-index: 3;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  padding: var(--space);
  background: var(--background);
}

.header-navigation {
  position: fixed;
  z-index: 2;
  bottom: var(--space);
  left: var(--space);
  width: calc(clamp(220px, 22vw, 360px) - var(--space) * 2);
  transition:
    color 120ms ease-out,
    opacity 720ms cubic-bezier(0.16, 1.35, 0.3, 1),
    transform 760ms cubic-bezier(0.16, 1.35, 0.3, 1);
}

.header-navigation.changing { opacity: 0; transform: translateY(20px); }
.header-navigation.over-footer { color: #000; }

.header > a:focus-visible {
  outline: none;
  background: var(--accent);
}

@media (forced-colors: active) {
  .header > a:focus-visible {
    outline: 2px solid CanvasText;
    outline-offset: 2px;
  }
}

@media (max-width: 720px) {
  .header {
    position: relative;
    z-index: 1;
    flex-direction: row;
    height: auto;
    padding: calc(var(--space) / 2) var(--space);
  }

  .header-navigation {
    position: static;
    width: auto;
  }

}
</style>
