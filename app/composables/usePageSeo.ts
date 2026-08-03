import type { PageSeo } from '~/types/sanity'

export function usePageSeo(
  seo: MaybeRefOrGetter<PageSeo | null | undefined>,
  fallbackTitle: string,
  fallbackDescription: string
) {
  const imageUrl = useSanityImage()
  useSeoMeta({
    title: () => toValue(seo)?.title || fallbackTitle,
    description: () => toValue(seo)?.description || fallbackDescription,
    ogTitle: () => toValue(seo)?.title || fallbackTitle,
    ogDescription: () => toValue(seo)?.description || fallbackDescription,
    twitterTitle: () => toValue(seo)?.title || fallbackTitle,
    twitterDescription: () => toValue(seo)?.description || fallbackDescription,
    ogImage: () => imageUrl(toValue(seo)?.image, 1200) || undefined,
    twitterImage: () => imageUrl(toValue(seo)?.image, 1200) || undefined
  })
}
