const FEATURES = [
  {
    cmd: 'pesty build',
    does: 'Whatever you asked for. Whatever you were afraid to ask for. Built.',
    status: 'armed',
  },
  {
    cmd: 'pesty fix',
    does: 'Every bug, every hack, every "temporary" patch from 2019. Fixed.',
    status: 'armed',
  },
  {
    cmd: 'pesty ship',
    does: 'Straight to production on a Friday, because we fear nothing.',
    status: 'armed',
  },
]

export function FeatureTable() {
  return (
    <section
      id="docs"
      aria-labelledby="docs-title"
      className="flex scroll-mt-4 flex-col gap-4 border-t border-border px-4 py-10 md:px-6"
    >
      <h2 id="docs-title" className="text-sm font-bold">
        <span className="text-muted-foreground" aria-hidden="true">
          {'$ '}
        </span>
        man pesty
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-xl table-fixed border-collapse border border-foreground text-sm">
          <colgroup>
            <col className="w-36" />
            <col />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-b border-foreground text-left">
              <th scope="col" className="px-3 py-2 text-xs font-bold tracking-widest uppercase">
                Command
              </th>
              <th scope="col" className="px-3 py-2 text-xs font-bold tracking-widest uppercase">
                Function
              </th>
              <th scope="col" className="px-3 py-2 text-xs font-bold tracking-widest uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f) => (
              <tr key={f.cmd} className="border-t border-border align-top">
                <th scope="row" className="px-3 py-3 text-left font-bold whitespace-nowrap">
                  {f.cmd}
                </th>
                <td className="px-3 py-3 leading-relaxed text-muted-foreground">{f.does}</td>
                <td className="px-3 py-3">● {f.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
