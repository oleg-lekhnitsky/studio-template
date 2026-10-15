export function youtubeEmbedUrl(source: string): string {
  try {
    const url = new URL(source)
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    let id: string | null | undefined
    if (host === 'youtu.be') id = url.pathname.split('/')[1]
    else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      const parts = url.pathname.split('/').filter(Boolean)
      id = parts[0] === 'watch' ? url.searchParams.get('v')
        : ['embed', 'shorts', 'live'].includes(parts[0] || '') ? parts[1] : undefined
    }
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}` : ''
  } catch {
    return ''
  }
}
