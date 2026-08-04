import type { TypedObject } from '@portabletext/types'

export interface SanityImage {
  asset?: { _ref?: string; url?: string }
  alt?: string
  crop?: { top: number; right: number; bottom: number; left: number }
  hotspot?: { x: number; y: number; height: number; width: number }
}

export interface CasePreview {
  _id: string
  title: string
  slug: string
  year?: string
  categories?: string[]
  summary?: string
  cover?: SanityImage
  coverVideoUrl?: string
  coverPoster?: SanityImage
}

export type CaseBlock =
  | { _key: string; _type: 'galleryImage'; image: SanityImage; width?: 'half' | 'full' }
  | { _key: string; _type: 'video'; url?: string; fileUrl?: string; poster?: SanityImage; width?: 'half' | 'full' }
  | { _key: string; _type: 'textBlock'; label?: string; text?: TypedObject[]; width?: 'half' | 'full' }

export interface CaseStudy extends CasePreview {
  description?: string
  content?: CaseBlock[]
  cast?: Array<{ _key: string; role: string; name: string }>
}

export interface PageSeo {
  title?: string
  description?: string
  image?: SanityImage
}

export interface Person {
  _key: string
  name: string
  position: string
  image?: SanityImage
}

export interface SocialLink {
  _key: string
  label: string
  url: string
}

export interface FormField {
  _key: string
  label: string
  type: 'text' | 'email' | 'url' | 'tel' | 'textarea'
  placeholder?: string
  required?: boolean
}

export interface SiteSettings {
  disableCases?: boolean
  disableAbout?: boolean
  disableJobs?: boolean
  disableContact?: boolean
  footerWordmark?: string
  seoTitle?: string
  seoDescription?: string
  ogImage?: SanityImage
  casesSeo?: PageSeo
  jobsSeo?: PageSeo
  aboutSeo?: PageSeo
  contactSeo?: PageSeo
  contactHeading?: TypedObject[]
  contactFormFields?: FormField[]
  jobFormFields?: FormField[]
  socialLinks?: SocialLink[]
  heroHeadline?: string
  heroVideoUrl?: string
  heroPoster?: SanityImage
  aboutHeadline?: string
  aboutVideoUrl?: string
  aboutImage?: SanityImage
  people?: Person[]
  jobsHeadline?: string
  jobsIntroduction?: string
}

export interface JobPreview {
  _id: string
  title: string
  slug: string
  location?: string
  employmentType?: string
  summary?: string
  closingDate?: string
}

export interface Job extends JobPreview {
  description?: TypedObject[]
}
