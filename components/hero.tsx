import Image from 'next/image'
import { siteConfig } from '@/projects.config'
import { Tile } from './tile'

const CREED: [string, string][] = [
  ['what can we build?', 'anything.'],
  ['what can we fix?', 'everything.'],
  ['what will it cost?', 'our dignity.'],
]

export function Hero() {
  return (
    <Tile title="~/pesty — README.md" meta="NORMAL" active className="md:col-span-2" labelledBy="pitch">
      <div className="flex flex-col gap-8 px-5 py-8 md:px-8 md:py-10">
        <Image
          src="/brand/pesty-wordmark.png"
          alt="Pesty — pesty.sh"
          width={1165}
          height={504}
          priority
          className="h-auto w-44 md:w-56"
        />
        <h1 id="pitch" className="max-w-2xl text-4xl leading-[1.05] tracking-tight text-balance md:text-6xl">
          {siteConfig.bio}
          <span className="cursor ml-2" aria-hidden="true" />
        </h1>
        <dl className="flex flex-col gap-1 font-mono text-sm">
          {CREED.map(([q, a]) => (
            <div key={q} className="flex flex-wrap gap-x-3">
              <dt className="text-muted-foreground">
                <span className="text-border" aria-hidden="true">
                  {'> '}
                </span>
                {q}
              </dt>
              <dd className="text-accent">{a}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-3">
          <a
            href="#projects"
            className="border-2 border-accent bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-background hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Browse projects
          </a>
          <a
            href="#install"
            className="border-2 border-border px-5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Install
          </a>
        </div>
      </div>
    </Tile>
  )
}
