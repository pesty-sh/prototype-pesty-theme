import { VERSION } from './window-chrome'

const WORKSPACES = ['1', '2', '3', '4']

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 px-3 py-1.5 text-xs md:px-4">
      <nav aria-label="Workspaces" className="flex items-center gap-3">
        {WORKSPACES.map((ws, i) => (
          <span
            key={ws}
            className={i === 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}
            aria-current={i === 0 ? 'page' : undefined}
          >
            {ws}
          </span>
        ))}
      </nav>
      <span className="font-bold">pesty.sh</span>
      <span className="text-muted-foreground">{VERSION}</span>
    </header>
  )
}
