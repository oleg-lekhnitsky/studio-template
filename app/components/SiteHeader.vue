<script setup lang="ts">
import type { SiteSettings } from '~/types/sanity'

defineProps<{ settings?: SiteSettings | null }>()

const navigation = ref<HTMLElement | null>(null)
const identity = ref<{ $el: HTMLElement } | null>(null)
const identityOverFooter = ref(false)
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
      identityOverFooter.value = false
      return
    }

    const space = Number.parseFloat(getComputedStyle(footer).paddingTop) || 12
    const restingTop = window.innerHeight - element.offsetHeight - space
    const footerTop = footer.getBoundingClientRect().top
    const identityRect = identity.value?.$el.getBoundingClientRect()
    identityOverFooter.value = !!identityRect
      && footerTop <= identityRect.top + identityRect.height / 2
    const socials = footer.querySelector<HTMLElement>('.footer-socials')
    const firstLink = element.querySelector<HTMLElement>('nav a')
    const linkOffset = firstLink
      ? firstLink.getBoundingClientRect().top - element.getBoundingClientRect().top
      : 0
    const socialTop = socials?.getBoundingClientRect().top
      ?? footerTop + footer.offsetHeight / 2
    const footerNavigationTop = socialTop - linkOffset
    const top = Math.min(restingTop, footerNavigationTop)
    navigationOverFooter.value = top >= footerTop
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
    <NuxtLink ref="identity" class="header-identity-link" :class="{ 'over-footer': identityOverFooter }"
      to="/" :aria-label="`${settings?.headerText || 'Studio'} home`">
      <HeaderIdentity
        class="desktop-identity"
        image-url="/icon.gif"
        :text="settings?.headerText || 'Studio'"
        :svg-url="settings?.headerLogoSvgUrl"
        :svg-color-mode="settings?.headerLogoColorMode || 'theme'"
        :lottie-url="settings?.headerLogoLottieUrl"
      />
      <span class="mobile-identity">mmaze.studio</span>
    </NuxtLink>
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

.header-identity-link {
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  width: fit-content;
  max-width: 100%;
}

.header-identity-link.over-footer :deep(.image-logo) { filter: none; mix-blend-mode: multiply; }
.mobile-identity { display: none; }

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
    align-items: center;
    gap: clamp(12px, 4vw, 32px);
    font-size: clamp(11px, 3.3vw, 20px);
    line-height: 1.2;
    height: auto;
    padding: var(--space);
  }

  .header-navigation {
    position: static;
    width: auto;
  }

  .header-identity-link {
    position: static;
    flex-shrink: 0;
  }

  .desktop-identity { display: none; }
  .mobile-identity { display: block; font-weight: 700; letter-spacing: -.04em; }

}
</style>
