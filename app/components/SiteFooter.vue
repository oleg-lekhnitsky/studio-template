<script setup lang="ts">
import type { SocialLink } from '~/types/sanity'

const props = withDefaults(defineProps<{
  socialLinks?: SocialLink[]
  wordmarkLabel?: string
  description?: string
  mobileDescription?: string | null
  clients?: string[] | null
}>(), {
  wordmarkLabel: 'mmaze.studio',
  description: 'Independent creative studio'
})

const clientNames = computed(() => props.clients ?? ['FinteqHub', 'Softswiss', 'Burger King', 'GYPSY', 'Infingame', 'Clevetura', 'Boomerang', 'LVLX', 'InOut', 'Scatters Club', 'TrueWays'])
const mobileCopy = computed(() => props.mobileDescription ?? 'Mmaze is a creative production studio. Big on building stories for brands, launches, awards and things that don’t have a name yet.')

const wordmark = ref<HTMLElement | null>(null)
const wordmarkSize = ref('20vw')
const wordmarkReady = ref(false)

let observer: ResizeObserver | undefined

function fitWordmark() {
  const container = wordmark.value
  if (!container || container.clientWidth <= 2) return

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
    <NuxtLink class="footer-logo" to="/" :aria-label="`${wordmarkLabel} home`">
      <img src="/icon.gif" alt="" width="1080" height="1080">
    </NuxtLink>
    <div v-if="clientNames.length" class="footer-client-line">
      <span class="footer-clients-label">Clients:</span>
      <ClientsMarquee class="footer-clients" :clients="clientNames" />
    </div>
    <div class="footer-meta">
      <span class="footer-description">{{ description }}</span>
      <p v-if="mobileCopy" class="footer-mobile-description">{{ mobileCopy }}</p>
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
  color: #141414;
  background-color: var(--accent);
}

.footer-logo,
.footer-clients-label,
.footer-mobile-description { display: none; }

.footer-client-line {
  grid-column: 2;
  min-width: 0;
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
  .footer {
    grid-template-columns: 40px minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    column-gap: calc(var(--space) * .5);
    row-gap: clamp(96px, 20svh, 240px);
    min-height: 100svh;
    padding: var(--space);
    margin-left: 0;
  }

  .footer-logo {
    display: block;
    grid-column: 1;
    grid-row: 1;
    align-self: start;
    width: 40px;
    height: 40px;
  }

  .footer-logo img {
    height: 100%;
    transform: translateX(-5px);
    border-radius: 0;
    mix-blend-mode: multiply;
  }

  .footer-client-line {
    grid-column: 2;
    grid-row: 1;
    margin-right: -16px;
  }

  .footer-clients-label {
    display: block;
    font-size: var(--small);
    line-height: 1.2;
    opacity: .4;
  }

  .footer-clients {
    font-size: var(--small);
    line-height: 1.2;
    letter-spacing: var(--letter-spacing);
  }

  .footer-meta {
    position: static;
    display: flex;
    flex-direction: column;
    gap: 32px;
    grid-column: 1 / -1;
    grid-row: 2;
    align-self: end;
    margin-bottom: 0;
  }

  .footer-mobile-description {
    display: block;
    margin: 0;
    font-size: clamp(28px, 8.2vw, 40px);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: var(--letter-spacing-medium);
  }

  .footer-socials :deep(ul) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
  }

  .footer-socials :deep(a) {
    text-decoration: underline;
    text-underline-offset: .2em;
  }

  .footer-description,
  .copyright,
  .footer-wordmark { display: none; }
}
</style>
