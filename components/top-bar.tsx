'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { siteConfig } from '@/projects.config'

const LINKS = [
  { n: '1', hash: 'top', label: 'Top' },
  { n: '2', hash: 'projects', label: 'Projects' },
  { n: '3', hash: 'install', label: 'Install' },
]

function motion(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function scrollToHash(hash: string) {
  const behavior = motion()
  if (!hash || hash === 'top') {
    window.scrollTo({ top: 0, behavior })
    return
  }
  document.getElementById(hash)?.scrollIntoView({ behavior, block: 'start' })
}

export function HashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    const frame = requestAnimationFrame(() => scrollToHash(hash))
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return null
}

export function BrandHomeLink({
  children,
  className = '',
  light = false,
}: {
  children: React.ReactNode
  className?: string
  light?: boolean
}) {
  const pathname = usePathname()

  return (
    <Link
      href="/"
      onClick={(event) => {
        if (pathname !== '/') return
        event.preventDefault()
        scrollToHash('top')
        window.history.pushState(null, '', '/')
      }}
      className={`rounded-md px-2 py-1 underline decoration-2 decoration-accent underline-offset-4 hover:text-accent ${light ? 'text-background hover:bg-background/10' : 'text-foreground hover:bg-surface'} ${className}`}
    >
      {children}
    </Link>
  )
}

export function TopBar({ current = 'home', onField = false }: { current?: string; onField?: boolean }) {
  const pathname = usePathname()

  function onNav(event: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    if (pathname !== '/') return
    event.preventDefault()
    scrollToHash(hash)
    const url = hash === 'top' ? '/' : `/#${hash}`
    window.history.pushState(null, '', url)
  }

  return (
    <header className="flex items-center justify-between gap-4 px-3 py-1.5 font-mono text-xs md:px-4">
      <nav aria-label="Primary" className="flex items-center gap-4">
        <Link href="/#top" className="flex items-center gap-2 focus-visible:outline-2" aria-label="Pesty home" onClick={(e) => onNav(e, 'top')}>
          <Image src="/brand/pesty-mark.png" alt="" width={18} height={18} className="size-[18px]" />
        </Link>
        {LINKS.map((link) => (
          <Link
            key={link.n}
            href={link.hash === 'top' ? '/#top' : `/#${link.hash}`}
            aria-current={current === 'home' && link.n === '1' ? 'page' : undefined}
            aria-label={link.label}
            onClick={(e) => onNav(e, link.hash)}
            className={
              (current === 'home' && link.n === '1') || (current === 'projects' && link.n === '2')
                ? 'font-bold text-accent'
                : onField
                  ? 'text-background/80 hover:text-background'
                  : 'text-muted-foreground hover:text-foreground'
            }
          >
            {link.n}
          </Link>
        ))}
      </nav>
      <BrandHomeLink className="truncate">pesty.sh</BrandHomeLink>
      <a
        href={`https://github.com/${siteConfig.owner}`}
        className={onField ? 'text-background/80 hover:text-accent' : 'text-muted-foreground hover:text-accent'}
        rel="noreferrer"
      >
        github.com/{siteConfig.owner}
      </a>
    </header>
  )
}
