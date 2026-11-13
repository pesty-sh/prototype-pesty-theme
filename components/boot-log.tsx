const LINES: { text: string; status?: string }[] = [
  { text: 'pesty init — pesty.sh' },
  { text: 'loading confidence', status: 'ok' },
  { text: 'loading power', status: 'ok' },
  { text: 'loading honor', status: 'ok' },
  { text: 'unloading dignity', status: 'gone' },
  { text: 'ready for anything.' },
]

export function BootLog() {
  return (
    <div
      role="log"
      aria-label="Boot log"
      className="border-b border-border bg-muted px-4 py-4 text-sm leading-relaxed text-muted-foreground md:px-6"
    >
      {LINES.map((line, i) => (
        <p key={line.text} className="boot-line" style={{ animationDelay: `${i * 220}ms` }}>
          <span aria-hidden="true">{'> '}</span>
          {line.text}
          {line.status && (
            <span className={line.status === 'ok' ? 'text-foreground' : 'font-bold text-foreground'}>
              {' '}
              [{line.status}]
            </span>
          )}
        </p>
      ))}
    </div>
  )
}
