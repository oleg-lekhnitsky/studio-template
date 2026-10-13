import type { PageSeo } from '~/types/sanity'

export function usePageSeo(
  seo: MaybeRefOrGetter<PageSeo | null | undefined>,
  fallbackTitle: string,
  fallbackDescription: string
) {
  const imageUrl = useSanityImage()
  const config = useRuntimeConfig()
  const requestUrl = useRequestURL()
  const defaultImage = new URL('/ogimage.png', config.public.siteUrl || requestUrl.origin).toString()
  useSeoMeta({
    title: () => toValue(seo)?.title || fallbackTitle,
    description: () => toValue(seo)?.description || fallbackDescription,
    ogTitle: () => toValue(seo)?.title || fallbackTitle,
    ogDescription: () => toValue(seo)?.description || fallbackDescription,
    twitterTitle: () => toValue(seo)?.title || fallbackTitle,
    twitterDescription: () => toValue(seo)?.description || fallbackDescription,
    ogImage: () => imageUrl(toValue(seo)?.image, 1200) || defaultImage,
    twitterImage: () => imageUrl(toValue(seo)?.image, 1200) || defaultImage
  })
}
