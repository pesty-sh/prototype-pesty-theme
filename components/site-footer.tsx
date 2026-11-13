import { VERSION } from './window-chrome'

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-foreground px-3 py-1.5 text-xs">
      <span className="font-bold">pesty.sh</span>
      <span className="text-muted-foreground">
        {VERSION} {'· confidence. power. honor.'}
      </span>
    </footer>
  )
}
