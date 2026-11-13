import { Download } from 'lucide-react'
import type { Release } from '@/lib/github'
import { formatBytes, groupAssets } from '@/lib/release-assets'

export function ReleaseDownloads({ release }: { release: Release }) {
  const { groups, sumsUrl } = groupAssets(release.assets)

  if (groups.length === 0) {
    return <p className="text-muted-foreground">This release has no binary assets attached.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ platform, downloads }) => (
        <div key={platform} className="flex flex-col gap-2">
          <h3 className="text-lg">{platform}</h3>
          <ul className="flex flex-col border border-border">
            {downloads.map((d) => (
              <li
                key={d.name}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border/40 px-3 py-2 last:border-b-0 hover:bg-surface"
              >
                <span className="w-24 shrink-0 font-mono text-sm text-accent">{d.arch}</span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{d.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {d.format} · {formatBytes(d.size)}
                </span>
                {d.checksumUrl && (
                  <a href={d.checksumUrl} className="font-mono text-xs text-muted-foreground hover:text-accent">
                    sha256
                  </a>
                )}
                <a
                  href={d.url}
                  className="flex items-center gap-1.5 border border-border px-2.5 py-1 text-sm font-medium transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-2"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download
                  <span className="sr-only">
                    {platform} {d.arch} {d.format}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {sumsUrl && (
        <p className="font-mono text-xs text-muted-foreground">
          Verify everything:{' '}
          <a href={sumsUrl} className="text-border underline underline-offset-2 hover:text-accent">
            SHA256SUMS
          </a>{' '}
          · <code>sha256sum -c SHA256SUMS</code>
        </p>
      )}
    </div>
  )
}
