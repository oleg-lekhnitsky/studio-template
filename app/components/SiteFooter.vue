<script setup lang="ts">
import type { SocialLink } from '~/types/sanity'

const props = withDefaults(defineProps<{
  socialLinks?: SocialLink[]
  wordmarkLabel?: string
  description?: string
  clients?: string[] | null
}>(), {
  wordmarkLabel: 'Yuliana',
  description: 'Independent creative studio'
})

const clientNames = computed(() => props.clients ?? ['FinteqHub', 'Softswiss', 'Burger King', 'GYPSY', 'Infingame', 'Clevetura', 'Boomerang', 'LVLX', 'InOut', 'Scatters Club', 'TrueWays'])

const wordmark = ref<HTMLElement | null>(null)
const wordmarkSize = ref('20vw')
const wordmarkReady = ref(false)

let observer: ResizeObserver | undefined

function fitWordmark() {
  const container = wordmark.value
  if (!container) return

  const context = document.createElement('canvas').getContext('2d')
  if (!context) return
  context.font = `700 100px ${getComputedStyle(container).fontFamily}`
  const naturalWidth = context.measureText(props.wordmarkLabel).width - (props.wordmarkLabel.length * 4)
  if (!naturalWidth) return

  wordmarkSize.value = `${100 * ((container.clientWidth - 2) / naturalWidth)}px`
  wordmarkReady.value = true
}

onMounted(async () => {
  await nextTick()
  fitWordmark()
  await document.fonts?.ready
  fitWordmark()
  observer = new ResizeObserver(fitWordmark)
  if (wordmark.value) observer.observe(wordmark.value)
})

watch(() => props.wordmarkLabel, async () => {
  wordmarkReady.value = false
  await nextTick()
  fitWordmark()
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <footer class="footer">
    <ClientsMarquee class="footer-clients" :clients="clientNames" />
    <div class="footer-meta">
      <span>{{ description }}</span>
      <div v-if="socialLinks?.length" class="footer-socials">
        <SocialLinks :links="socialLinks" />
      </div>
      <span class="copyright">© {{ new Date().getFullYear() }}</span>
    </div>
    <div ref="wordmark" class="footer-wordmark">
      <NuxtLink to="/" :aria-label="`${wordmarkLabel} home`">
        <span
          :class="{ ready: wordmarkReady }"
          :style="{ fontSize: wordmarkSize }"
        >{{ wordmarkLabel }}</span>
      </NuxtLink>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  display: grid;
  grid-template-columns: clamp(220px, 22vw, 360px) minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  row-gap: calc(var(--space) * 2);
  justify-content: space-between;
  min-height: 100vh;
  overflow: clip;
  padding: var(--space);
  color: #000;
  background-color: var(--accent);
}

.footer-clients {
  grid-column: 2;
  margin-right: calc(-1 * var(--space));
}

.footer-meta {
  
  position: sticky;
  z-index: 1;
  top: var(--space);
  grid-column: 2;
  grid-row: 2;
  align-self: start;
  margin-bottom: 25vw;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: flex-start;
  display: none;
}

.footer-socials {
  grid-column: 2;
  --social-focus: #fff;
}
.copyright {
  position: absolute;
  top: 0;
  right: 0;
}

.footer-wordmark {
  position: absolute;
  right: var(--space);
  bottom: var(--space);
  left: var(--space);
  display: block;
}

.footer-wordmark a:hover { opacity: 1; }
.footer-wordmark span {
  display: inline-block;
  visibility: hidden;
  font-family: var(--font-family);
  font-weight: 700;
  line-height: .72;
  letter-spacing: -.04em;
  white-space: nowrap;
}
.footer-wordmark span.ready { visibility: visible; }

@media (max-width: 720px) {
  .footer { grid-template-columns: 1fr; gap: calc(var(--space) * 4); margin-left: 0; }
  .footer-clients { grid-column: 1; margin-left: calc(-1 * var(--space)); }
  .footer-meta { grid-column: 1; }
}
</style>
