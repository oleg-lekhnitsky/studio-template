<script setup lang="ts">
const props = defineProps<{ src?: string; poster?: string }>()
const video = ref<HTMLVideoElement>()
let observer: IntersectionObserver | undefined
let reducedMotion: MediaQueryList | undefined

async function play() {
  if (!video.value) return
  try { await video.value.play() } catch {}
}
function pause() { video.value?.pause() }
function syncMotionPreference() { if (reducedMotion?.matches) pause() }

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.addEventListener('change', syncMotionPreference)
  observer = new IntersectionObserver(([entry]) => {
    if (!entry || reducedMotion?.matches || !entry.isIntersecting) pause()
    else play()
  }, { threshold: .15 })
  if (video.value) observer.observe(video.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  reducedMotion?.removeEventListener('change', syncMotionPreference)
})
</script>

<template>
  <div class="autoplay-video">
    <video ref="video" :src="props.src" :poster="props.poster" muted loop playsinline preload="metadata" />
  </div>
</template>

<style scoped>
.autoplay-video { position: relative; width: 100%; }
video { width: 100%; }
</style>
