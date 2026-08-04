<script setup lang="ts">
const props = withDefaults(defineProps<{
  text?: string
  svgUrl?: string
  svgColorMode?: 'theme' | 'original'
  lottieUrl?: string
}>(), {
  text: 'Studio',
  svgColorMode: 'theme'
})

const lottieContainer = ref<HTMLElement | null>(null)
let animation: { destroy: () => void } | undefined

async function mountLottie() {
  animation?.destroy()
  animation = undefined
  if (!import.meta.client || !props.lottieUrl || !lottieContainer.value) return

  const response = await fetch(props.lottieUrl)
  if (!response.ok) return
  const animationData = await response.json()
  const { default: lottie } = await import('lottie-web')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  animation = lottie.loadAnimation({
    container: lottieContainer.value,
    renderer: 'svg',
    loop: !reduceMotion,
    autoplay: !reduceMotion,
    animationData,
    rendererSettings: { preserveAspectRatio: 'xMinYMid meet' }
  })
}

onMounted(mountLottie)
watch(() => props.lottieUrl, async () => {
  await nextTick()
  await mountLottie()
})
onBeforeUnmount(() => animation?.destroy())

const maskStyle = computed(() => props.svgUrl
  ? { '--header-logo': `url("${props.svgUrl.replace(/"/g, '%22')}")` }
  : undefined)
</script>

<template>
  <span class="header-identity">
    <span v-if="lottieUrl" ref="lottieContainer" class="lottie-logo" aria-hidden="true" />
    <span v-else-if="svgUrl && svgColorMode === 'theme'" class="svg-logo svg-logo--theme"
      :style="maskStyle" aria-hidden="true" />
    <img v-else-if="svgUrl" class="svg-logo" :src="svgUrl" alt="">
    <span v-else>{{ text }}</span>
  </span>
</template>

<style scoped>
.header-identity {
  display: block;
  max-width: 100%;
}

.svg-logo,
.lottie-logo {
  display: block;
  width: auto;
  max-width: 100%;
  height: 40px;
}

.svg-logo--theme {
  width: min(180px, 100%);
  background: currentColor;
  -webkit-mask: var(--header-logo) left center / contain no-repeat;
  mask: var(--header-logo) left center / contain no-repeat;
}

.lottie-logo { width: min(180px, 100%); }
.lottie-logo :deep(svg) { display: block; }

@media (max-width: 720px) {
  .svg-logo,
  .lottie-logo { height: 28px; }
}
</style>
