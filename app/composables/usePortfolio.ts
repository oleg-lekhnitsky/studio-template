import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import type { CasePreview, CaseStudy } from '~/types/sanity'

export const siteSettingsId = '4e409066-8870-4256-9bd0-a6b3b930ec39'

export const casesQuery = groq`*[_type == "case"] | order(orderRank asc, _createdAt desc) {
  _id, title, "slug": slug.current, year, "categories": categories[]->title, summary, cover,
  "coverVideoUrl": coverVideo.asset->url, coverPoster
}`

export const featuredCasesQuery = groq`*[_type == "case" && featured == true] | order(orderRank asc, _createdAt desc) [0...6] {
  _id, title, "slug": slug.current, year, "categories": categories[]->title, summary, cover,
  "coverVideoUrl": coverVideo.asset->url, coverPoster
}`

export const caseQuery = groq`*[_type == "case" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, year, "categories": categories[]->title, description, cast, cover,
  "coverVideoUrl": coverVideo.asset->url, coverPoster,
  content[]{
    ...,
    _type == "video" => { ..., "fileUrl": file.asset->url }
  }
}`

export const siteSettingsQuery = groq`*[_type == "siteSettings" && _id == "${siteSettingsId}"][0] {
  disableCases,
  disableAbout,
  disableJobs,
  disableContact,
  footerWordmark,
  footerDescription,
  headerText,
  "headerLogoSvgUrl": headerLogoSvg.asset->url,
  headerLogoColorMode,
  "headerLogoLottieUrl": headerLogoLottie.asset->url,
  seoTitle,
  seoDescription,
  ogImage,
  casesSeo,
  jobsSeo,
  aboutSeo,
  contactSeo,
  contactHeading,
  contactFormFields[]{ _key, label, type, placeholder, required },
  jobFormFields[]{ _key, label, type, placeholder, required },
  socialLinks[]{ _key, label, url },
  heroHeadline,
  "heroVideoUrl": heroVideo.asset->url,
  heroPoster,
  aboutHeadline,
  "aboutVideoUrl": aboutVideo.asset->url,
  aboutImage,
  people[]{ _key, name, position, image },
  jobsHeadline,
  jobsIntroduction
}`

export const jobsQuery = groq`*[_type == "job" && active == true] | order(orderRank asc, _createdAt desc) {
  _id, title, "slug": slug.current, location, employmentType, summary, closingDate
}`

export const jobQuery = groq`*[_type == "job" && active == true && slug.current == $slug][0] {
  _id, title, "slug": slug.current, location, employmentType, summary, description, closingDate
}`

const demoCases: CasePreview[] = [
  { _id: 'demo-1', title: 'Field Notes', slug: 'field-notes', year: '2026' },
  { _id: 'demo-2', title: 'New Objects', slug: 'new-objects', year: '2025' },
  { _id: 'demo-3', title: 'In Practice', slug: 'in-practice', year: '2025' },
  { _id: 'demo-4', title: 'Common Ground', slug: 'common-ground', year: '2024' },
  { _id: 'demo-5', title: 'After Hours', slug: 'after-hours', year: '2024' },
  { _id: 'demo-6', title: 'Soft Systems', slug: 'soft-systems', year: '2023' }
]

export function useDemoCases() { return demoCases }

export function sanityImageDimensions(ref?: string) {
  const match = ref?.match(/-(\d+)x(\d+)-[^-]+$/)
  return {
    width: match ? Number(match[1]) : 1600,
    height: match ? Number(match[2]) : 1000
  }
}

export function useSanityImage() {
  const { client } = useSanity()
  const builder = createImageUrlBuilder(client)
  return (source?: SanityImageSource, width = 1600) => source
    ? builder.image(source).width(width).fit('max').auto('format').url()
    : ''
}

export type { CasePreview, CaseStudy }
