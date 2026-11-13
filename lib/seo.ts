import type { Metadata } from 'next'
import { seo, type PageSeo, type ProjectSeo } from '@/seo.config'
import type { Project } from '@/lib/github'

function urlFor(path: string) {
  return new URL(path, seo.siteUrl).toString()
}

function share(title: string, description: string, path: string): Pick<Metadata, 'openGraph' | 'twitter' | 'alternates'> {
  const url = urlFor(path)
  return {
    alternates: {
      canonical: url,
      types: { 'text/markdown': new URL('/llms.txt', seo.siteUrl).toString() },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: seo.siteName,
      locale: seo.locale,
      type: 'website',
      images: seo.image ? [{ url: seo.image }] : undefined,
    },
    twitter: {
      card: seo.twitterCard,
      title,
      description,
      images: seo.image ? [seo.image] : undefined,
    },
  }
}

export function pageMetadata(page: PageSeo, path = '/'): Metadata {
  const home = path === '/'
  return {
    title: home ? { absolute: page.title } : page.title,
    description: page.description,
    keywords: [...seo.keywords, ...page.keywords],
    robots: { index: true, follow: true },
    ...share(page.title, page.description, path),
  }
}

export function projectMetadata(project: Pick<Project, 'slug' | 'name' | 'tagline'>): Metadata {
  const extra: ProjectSeo = seo.projects[project.slug as keyof typeof seo.projects] ?? {}
  const title = extra.title ?? project.name
  const description = extra.description ?? project.tagline
  const fullTitle = `${title} — ${seo.siteName}`
  return {
    title,
    description,
    keywords: [...seo.keywords, ...(extra.keywords ?? [])],
    robots: { index: true, follow: true },
    ...share(fullTitle, description, `/projects/${project.slug}`),
  }
}

export function siteJsonLd() {
  const org = {
    '@type': 'Organization',
    name: seo.organization.name,
    url: seo.siteUrl,
    description: seo.organization.description,
    sameAs: seo.organization.sameAs,
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { ...org, '@id': `${seo.siteUrl}/#organization` },
      {
        '@type': 'WebSite',
        '@id': `${seo.siteUrl}/#website`,
        name: seo.siteName,
        url: seo.siteUrl,
        description: seo.description,
        publisher: { '@id': `${seo.siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${seo.siteUrl}/#service`,
        name: seo.organization.name,
        url: seo.siteUrl,
        description: seo.organization.description,
        knowsAbout: seo.organization.knowsAbout,
        provider: { '@id': `${seo.siteUrl}/#organization` },
      },
    ],
  }
}

export function softwareJsonLd(project: Pick<Project, 'slug' | 'name' | 'tagline' | 'url'>) {
  const extra: ProjectSeo = seo.projects[project.slug as keyof typeof seo.projects] ?? {}
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: extra.description ?? project.tagline,
    url: urlFor(`/projects/${project.slug}`),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': `${seo.siteUrl}/#organization` },
    codeRepository: project.url,
  }
}
