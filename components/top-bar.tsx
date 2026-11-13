import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/projects.config'

export function TopBar({ current = 'home' }: { current?: string }) {
  return (
    <header className="flex items-center justify-between gap-4 px-3 py-1.5 font-mono text-xs md:px-4">
      <nav aria-label="Primary" className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-2" aria-label="Pesty home">
          <Image
            src="/brand/pesty-mark.png"
            alt=""
            width={18}
            height={18}
            className="size-[18px] mix-blend-multiply"
          />
        </Link>
        <Link
          href="/"
          aria-current={current === 'home' ? 'page' : undefined}
          className={current === 'home' ? 'font-bold text-accent' : 'text-muted-foreground hover:text-foreground'}
        >
          1
        </Link>
        <Link
          href="/#projects"
          aria-current={current === 'projects' ? 'page' : undefined}
          className={current === 'projects' ? 'font-bold text-accent' : 'text-muted-foreground hover:text-foreground'}
        >
          2
        </Link>
        <Link href="/#install" className="text-muted-foreground hover:text-foreground">
          3
        </Link>
      </nav>
      <span className="truncate text-foreground">pesty.sh</span>
      <a
        href={`https://github.com/${siteConfig.owner}`}
        className="text-muted-foreground hover:text-accent"
        rel="noreferrer"
      >
        github.com/{siteConfig.owner}
      </a>
    </header>
  )
}
