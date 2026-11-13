import { BrandHomeLink } from '@/components/top-bar'
import { siteConfig } from '@/projects.config'

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 font-mono text-xs text-muted-foreground md:px-4">
      <span>
        <BrandHomeLink>pesty.sh</BrandHomeLink> · confidence. power. honor.
      </span>
      <span>
        no telemetry · no tracking ·{' '}
        <a href={`https://github.com/${siteConfig.owner}`} className="hover:text-accent" rel="noreferrer">
          source on github
        </a>
      </span>
    </footer>
  )
}
