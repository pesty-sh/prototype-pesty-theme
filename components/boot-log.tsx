import { Tile } from './tile'

export function BootLog({ embedded = false }: { embedded?: boolean }) {
  const lines: { text: string; status?: string; href?: string; hot?: boolean }[] = [
    { text: 'pesty init — pesty.sh' },
    { text: 'loading confidence', status: 'ok' },
    { text: 'loading power', status: 'ok' },
    { text: 'mounting binaries', status: 'link', href: '#projects' },
    { text: 'telemetry', status: 'none', hot: true },
    { text: 'meetings', status: 'none', hot: true },
    { text: 'ready for anything.' },
  ]

  const titleBar = (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 px-6 py-1.5 font-mono text-xs text-muted-foreground">
      <span className="truncate">journalctl -f</span>
      <span className="shrink-0">{lines.length} lines</span>
    </div>
  )

  const log = (
      <div role="log" aria-label="Boot log" className={embedded ? 'flex flex-col p-4 font-mono text-sm leading-6 md:pr-5' : 'flex flex-col font-mono text-sm leading-6'}>
        {lines.map((line, i) => (
          <p key={line.text} className="boot-line text-muted-foreground" style={{ animationDelay: `${i * 160}ms` }}>
            <span className="text-border" aria-hidden="true">
              {'> '}
            </span>
            {line.text}
            {line.status &&
              (line.href ? (
                <a href={line.href} className="text-accent underline decoration-accent underline-offset-4 hover:text-foreground">
                  {' '}
                  [{line.status}]
                </a>
              ) : (
                <span className={line.hot ? 'text-accent' : 'text-foreground'}>
                  {' '}
                  [{line.status}]
                </span>
              ))}
          </p>
        ))}
      </div>
  )

  if (embedded) {
    return (
      <>
        {titleBar}
        {log}
      </>
    )
  }

  return (
    <Tile title="journalctl -f" meta={`${lines.length} lines`}>
      {log}
    </Tile>
  )
}
