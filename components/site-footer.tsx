import { BrandHomeLink } from '@/components/top-bar'
import { siteConfig } from '@/projects.config'

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center gap-2 px-3 py-3 text-center font-mono text-xs text-muted-foreground md:flex-row md:justify-between md:px-4 md:py-2 md:text-left">
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
