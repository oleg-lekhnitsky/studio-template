<script setup lang="ts">
import { stegaClean } from '@sanity/client/stega'

const props = withDefaults(defineProps<{
  src: string
  background?: boolean
  aspectRatio?: string
}>(), {
  background: false,
  aspectRatio: '16:9'
})

const playerAspectRatio = computed(() => {
  const [width, height] = stegaClean(props.aspectRatio).split(':').map(Number)
  return width > 0 && height > 0 ? `${width} / ${height}` : '16 / 9'
})

function getVimeoEmbedUrl(source: string) {
  try {
    const url = new URL(stegaClean(source))
    const parts = url.pathname.split('/').filter(Boolean)
    const videoIndex = parts.indexOf('video')
    const id = videoIndex >= 0 ? parts[videoIndex + 1] : parts.find(part => /^\d+$/.test(part))

    if (!id) return ''

    const embed = new URL(`https://player.vimeo.com/video/${id}`)
    const privacyHash = url.searchParams.get('h')
    if (privacyHash) embed.searchParams.set('h', privacyHash)

    embed.searchParams.set('autoplay', '1')
    embed.searchParams.set('loop', '1')
    embed.searchParams.set('muted', '1')
    embed.searchParams.set('autopause', '0')
    embed.searchParams.set('playsinline', '1')
    embed.searchParams.set('controls', props.background ? '0' : '1')

    return embed.toString()
  } catch {
    return ''
  }
}

const embedUrl = computed(() => getVimeoEmbedUrl(props.src))
</script>

<template>
  <div :class="['vimeo-player', { 'is-inline': background }]" :style="{ aspectRatio: playerAspectRatio }">
    <iframe v-if="embedUrl" :src="embedUrl" title="Vimeo video player"
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
      allowfullscreen />
  </div>
</template>

<style scoped>
.vimeo-player {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #000;
}

.vimeo-player.is-inline {
  border-radius: var(--radius);
}

iframe {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
