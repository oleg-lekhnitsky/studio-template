<script lang="ts">
import { shallowReactive } from 'vue'

interface FullscreenEntry {
  openFromHandoff: () => Promise<void>
  closeForHandoff: () => void
}

const fullscreenEntries = shallowReactive<FullscreenEntry[]>([])
let pageLocked = false
let savedBodyOverflow = ''
let lockedAppShell: HTMLElement | null = null

function lockPage() {
  if (pageLocked) return
  savedBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  lockedAppShell = document.querySelector('.app-shell')
  lockedAppShell?.setAttribute('inert', '')
  pageLocked = true
}

function unlockPage() {
  if (!pageLocked) return
  lockedAppShell?.removeAttribute('inert')
  document.body.style.overflow = savedBodyOverflow
  lockedAppShell = null
  pageLocked = false
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{ label?: string }>(), {
  label: 'Open media fullscreen'
})

const isSanityPresentation = useIsSanityPresentationTool()
const isMobile = ref(false)
const isOpen = ref(false)
const isExpanded = ref(false)
const suppressTriggerRing = ref(false)
const source = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const closeButton = ref<HTMLButtonElement>()
const dialog = ref<HTMLElement>()
const frame = ref({ top: 0, left: 0, width: 0, height: 0 })
let sourceVideo: HTMLVideoElement | null = null
let entry: FullscreenEntry
let mobileQuery: MediaQueryList | undefined

function syncMobile(event: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = event.matches
  if (event.matches && isOpen.value) close()
}

const frameStyle = computed(() => ({
  top: `${frame.value.top}px`,
  left: `${frame.value.left}px`,
  width: `${frame.value.width}px`,
  height: `${frame.value.height}px`
}))
function motionDuration() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520
}

function setSourceFrame() {
  const rect = source.value?.getBoundingClientRect()
  if (!rect) return
  frame.value = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

function setFullscreenFrame() {
  frame.value = { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
}

async function open() {
  setSourceFrame()
  sourceVideo = source.value?.querySelector('video') || null
  sourceVideo?.pause()
  lockPage()
  isOpen.value = true
  await nextTick()
  closeButton.value?.focus()
  requestAnimationFrame(() => {
    setFullscreenFrame()
    isExpanded.value = true
  })
}

async function close() {
  if (!isOpen.value) return
  isExpanded.value = false
  setSourceFrame()
  await new Promise(resolve => window.setTimeout(resolve, motionDuration()))
  isOpen.value = false
  unlockPage()
  sourceVideo?.play().catch(() => {})
  suppressTriggerRing.value = true
  nextTick(() => trigger.value?.focus({ preventScroll: true }))
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key === 'ArrowLeft') navigate(-1)
  if (event.key === 'ArrowRight') navigate(1)
  if (event.key === 'Tab') {
    const controls = Array.from(dialog.value?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') || [])
    const current = controls.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.shiftKey
      ? (current <= 0 ? controls.length - 1 : current - 1)
      : (current + 1) % controls.length
    event.preventDefault()
    controls[next]?.focus()
  }
}

function closeForHandoff() {
  isExpanded.value = false
  isOpen.value = false
  sourceVideo?.play().catch(() => {})
}

async function openFromHandoff() {
  sourceVideo = source.value?.querySelector('video') || null
  sourceVideo?.pause()
  setFullscreenFrame()
  isOpen.value = true
  isExpanded.value = true
  await nextTick()
  closeButton.value?.focus()
}

function navigate(direction: -1 | 1) {
  if (fullscreenEntries.length < 2) return
  const currentIndex = fullscreenEntries.indexOf(entry)
  if (currentIndex < 0) return
  const nextIndex = (currentIndex + direction + fullscreenEntries.length) % fullscreenEntries.length
  const nextEntry = fullscreenEntries[nextIndex]
  entry.closeForHandoff()
  nextEntry?.openFromHandoff()
}

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 720px)')
  syncMobile(mobileQuery)
  mobileQuery.addEventListener('change', syncMobile)
  entry = { openFromHandoff, closeForHandoff }
  fullscreenEntries.push(entry)
})

onBeforeUnmount(() => {
  mobileQuery?.removeEventListener('change', syncMobile)
  const index = fullscreenEntries.indexOf(entry)
  if (index >= 0) fullscreenEntries.splice(index, 1)
  if (isOpen.value && import.meta.client) unlockPage()
})
</script>

<template>
  <div class="fullscreen-media" :class="{ 'is-open': isOpen }">
    <div ref="source" class="media-source">
      <slot />
      <button v-if="!isSanityPresentation && !isMobile" ref="trigger" class="media-trigger" :class="{ 'suppress-focus-ring': suppressTriggerRing }"
        type="button" :aria-label="props.label" @click="open" @blur="suppressTriggerRing = false" />
    </div>

    <Teleport to="body">
      <div v-if="isOpen" ref="dialog" class="fullscreen-dialog" :class="{ 'is-expanded': isExpanded }"
        role="dialog" aria-modal="true"
        :aria-label="props.label" @click.self="close" @keydown="handleKeydown">
        <button ref="closeButton" class="close-button" type="button" aria-label="Close fullscreen media"
          @click="close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        <button v-if="fullscreenEntries.length > 1" class="nav-button previous" type="button"
          aria-label="Previous media" @click="navigate(-1)">←</button>
        <button v-if="fullscreenEntries.length > 1" class="nav-button next" type="button"
          aria-label="Next media" @click="navigate(1)">→</button>
        <div class="fullscreen-content" :style="frameStyle">
          <slot name="fullscreen" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.fullscreen-media { min-width: 0; }
.fullscreen-media.is-open .media-source { visibility: hidden; }
.media-source { position: relative; width: 100%; }
.media-trigger {
  position: absolute;
  z-index: 1;
  inset: 0;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}
.media-trigger.suppress-focus-ring:focus { outline: none; }
.media-trigger > .open-button,
.media-trigger > .open-cursor { display: none !important; }
@media (max-width: 720px) {
  .media-trigger { display: none; }
}
.fullscreen-dialog {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: transparent;
  overscroll-behavior: contain;
  transition: background-color 420ms cubic-bezier(0.2, 0, 0, 1);
}
.fullscreen-dialog.is-expanded { background: #000; }
.fullscreen-content {
  position: fixed;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius);
  transition-property: top, left, width, height, border-radius;
  transition-duration: 520ms;
  transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fullscreen-dialog.is-expanded .fullscreen-content { border-radius: 0; }
.fullscreen-content :deep(img),
.fullscreen-content :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
}
.close-button {
  position: fixed;
  z-index: 3;
  top: var(--space);
  right: var(--space);
  width: 44px;
  height: 44px;
  padding: 10px;
  border: 0;
  border-radius: 50%;
  color: #000;
  background: #fff;
  cursor: pointer;
  opacity: 0;
  transform: scale(.96);
  transition:
    opacity 180ms ease-out,
    transform 180ms ease-out;
}
.fullscreen-dialog.is-expanded .close-button {
  opacity: 1;
  transform: scale(1);
  transition-delay: 240ms;
}
.close-button svg { display: block; width: 100%; height: 100%; }
.close-button path { fill: none; stroke: currentColor; stroke-width: 1.5; }
.nav-button {
  position: fixed;
  z-index: 2;
  top: 0;
  display: flex;
  width: 20vw;
  height: 100vh;
  align-items: center;
  padding: var(--space);
  border: 0;
  border-radius: 0;
  color: #fff;
  font-size: var(--small);
  opacity: .4;
  cursor: pointer;
  transition: opacity 150ms ease-out;
}
.nav-button.previous {
  left: 0;
  justify-content: flex-start;
  background: linear-gradient(90deg, rgb(255 255 255 / .14), transparent);
}
.nav-button.next {
  right: 0;
  justify-content: flex-end;
  background: linear-gradient(270deg, rgb(255 255 255 / .14), transparent);
}
.nav-button:hover,
.nav-button:focus-visible { opacity: 1; }
.nav-button:active { opacity: .7; }

@media (prefers-reduced-motion: reduce) {
  .fullscreen-dialog,
  .fullscreen-content,
  .close-button { transition-duration: .01ms; transition-delay: 0ms; }
}
</style>
