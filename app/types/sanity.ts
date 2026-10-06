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

export type CaseMediaTile =
  | { _key: string; _type: 'galleryImage'; image: SanityImage; width?: 'half' | 'full'; aspectRatio?: 'original' | '16:9' | '4:3' | '1:1' | '4:5' | '9:16' }
  | { _key: string; _type: 'video'; url?: string; fileUrl?: string; poster?: SanityImage; width?: 'half' | 'full'; aspectRatio?: '16:9' | '4:3' | '1:1' | '4:5' | '9:16' }

export interface CaseBento {
  _key: string
  _type: 'bento'
  width?: 'full'
  layout?: 'halves' | 'stack-left' | 'stack-right' | 'quarters' | 'thirds' | 'large-left' | 'large-right' | 'large-left-split-right'
  aspectRatio?: '16:9' | '4:3' | '1:1' | '4:5'
  tiles?: CaseMediaTile[]
}

export type CaseBlock =
  | CaseMediaTile
  | CaseBento
  | { _key: string; _type: 'textBlock'; label?: string; text?: TypedObject[]; width?: 'half' | 'full' }

export interface CaseStudy extends CasePreview {
  description?: string
  content?: CaseBlock[]
  cast?: Array<{
    _key: string
    role: string
    name?: string
    url?: string
    people?: Array<{ _key: string; name: string; url?: string }>
  }>
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
  footerDescription?: string
  footerMobileDescription?: string | null
  clients?: string[] | null
  headerText?: string
  headerLogoSvgUrl?: string
  headerLogoColorMode?: 'theme' | 'original'
  headerLogoLottieUrl?: string
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
  heroSubheading?: string
  heroVideoUrl?: string
  heroPoster?: SanityImage
  aboutHeadline?: string
  aboutIntroduction?: string | null
  aboutProcessTitle?: string
  aboutProcessSteps?: string[] | null
  aboutServices?: string[] | null
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
