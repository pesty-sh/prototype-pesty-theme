import type { MetadataRoute } from 'next'
import { seo } from '@/seo.config'

export default function robots(): MetadataRoute.Robots {
  const allow = { allow: '/' }
  return {
    rules: [{ userAgent: '*', ...allow }, ...seo.ai.crawlers.map((userAgent) => ({ userAgent, ...allow }))],
    sitemap: new URL('/sitemap.xml', seo.siteUrl).toString(),
    host: seo.siteUrl,
  }
}
