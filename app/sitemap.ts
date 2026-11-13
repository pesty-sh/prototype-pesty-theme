import type { MetadataRoute } from 'next'
import { getProjectSlugs } from '@/lib/github'
import { seo } from '@/seo.config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs()
  const lastModified = new Date()
  return [
    { url: seo.siteUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    ...slugs.map((slug) => ({
      url: new URL(`/projects/${slug}`, seo.siteUrl).toString(),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
