import type { Project } from '@/lib/github'
import { Tile } from './tile'

export function BootLog({ projects }: { projects: Project[] }) {
  const lines: { text: string; status?: string; hot?: boolean }[] = [
    { text: 'pesty init — pesty.sh' },
    { text: 'loading confidence', status: 'ok' },
    { text: 'loading power', status: 'ok' },
    ...projects
      .filter((p) => p.release)
      .map((p) => ({ text: `mount ${p.name}`, status: p.release!.tag_name })),
    { text: 'unloading dignity', status: 'gone', hot: true },
    { text: 'telemetry', status: 'none', hot: true },
    { text: 'meetings', status: 'none', hot: true },
    { text: 'ready for anything.' },
  ]

  return (
    <Tile title="journalctl -f" meta={`${lines.length} lines`}>
      <div role="log" aria-label="Boot log" className="flex flex-col px-4 py-4 font-mono text-sm leading-6">
        {lines.map((line, i) => (
          <p key={line.text} className="boot-line text-muted-foreground" style={{ animationDelay: `${i * 160}ms` }}>
            <span className="text-border" aria-hidden="true">
              {'> '}
            </span>
            {line.text}
            {line.status && (
              <span className={line.hot ? 'text-accent' : 'text-foreground'}>
                {' '}
                [{line.status}]
              </span>
            )}
          </p>
        ))}
      </div>
    </Tile>
  )
}
