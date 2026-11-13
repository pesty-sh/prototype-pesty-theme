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
      <div className="overflow-x-auto py-3 font-mono text-sm leading-6" tabIndex={0}>
        {lines.map((line, index) => (
          <div key={index} className="flex min-h-6">
            {numbered && (
              <span
                className="sticky left-0 w-10 shrink-0 select-none border-r border-border/40 bg-surface pr-3 text-right text-muted-foreground"
                aria-hidden="true"
              >
                {index + 1}
              </span>
            )}
            <span className="whitespace-pre px-3">{line || ' '}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}
