import { CopyButton } from './copy-button'

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const lines = code.replace(/\n$/, '').split('\n')
  const numbered = lines.length > 1
  const label = lang || 'text'

  return (
    <figure className="code-block my-4 min-w-0 border border-border bg-surface">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border/40 px-3 py-1 font-mono text-sm text-muted-foreground">
        <span>{label}</span>
        <CopyButton value={code.replace(/\n$/, '')} label={`Copy ${label} example`} />
      </figcaption>
      <div className="flex min-w-0">
        {numbered && (
          <div
            className="shrink-0 select-none border-r border-border/40 px-3 py-3 text-right font-mono text-sm leading-6 text-muted-foreground"
            aria-hidden="true"
          >
            {lines.map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
        )}
        <div className="min-w-0 flex-1 overflow-x-auto px-3 py-3" tabIndex={0}>
          <pre className="m-0 font-mono text-sm leading-6">
            <code className="whitespace-pre">{lines.join('\n')}</code>
          </pre>
        </div>
      </div>
    </figure>
  )
}
