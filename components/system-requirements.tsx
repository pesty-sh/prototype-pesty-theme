const REQUIREMENTS: [string, string][] = [
  ['os', 'Any. It will adapt.'],
  ['memory', '64 MB. It needs no more.'],
  ['disk', '8 MB. One binary. No dependencies.'],
  ['courage', 'Required.'],
  ['dignity', 'Not required. Will be consumed.'],
]

export function SystemRequirements() {
  return (
    <section
      id="requirements"
      aria-labelledby="requirements-title"
      className="flex scroll-mt-4 flex-col gap-6 border-t border-border px-4 py-10 md:px-6"
    >
      <h2 id="requirements-title" className="text-sm font-bold">
        <span className="text-muted-foreground" aria-hidden="true">
          {'$ '}
        </span>
        pesty --requirements
      </h2>
      <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm leading-relaxed">
        {REQUIREMENTS.map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-muted-foreground">{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div id="install" className="flex scroll-mt-4 flex-col gap-2">
        <p className="text-sm text-muted-foreground">install</p>
        <pre className="overflow-x-auto border border-foreground bg-muted px-4 py-3 text-sm">
          <code>
            <span className="text-muted-foreground" aria-hidden="true">
              {'$ '}
            </span>
            {'curl -fsSL https://pesty.sh/install | sh'}
          </code>
        </pre>
      </div>
    </section>
  )
}
