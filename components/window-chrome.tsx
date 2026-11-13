import Image from 'next/image'

export const VERSION = 'v1.0.4'

export function WindowChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-foreground bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Image
            src="/pesty-bug.png"
            alt=""
            width={16}
            height={16}
            className="size-4 grayscale contrast-200 [image-rendering:pixelated]"
          />
          <span className="font-bold tracking-wide">PESTY.SH</span>
          <span className="text-muted-foreground">{VERSION}</span>
        </div>
        <span className="hidden text-muted-foreground sm:inline">~/pesty — zsh</span>
      </div>
      <nav aria-label="Menu" className="flex gap-6 border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
        <a href="#top" className="hover:text-foreground">
          file
        </a>
        <a href="#docs" className="hover:text-foreground">
          docs
        </a>
        <a href="#requirements" className="hover:text-foreground">
          system
        </a>
      </nav>
      {children}
    </div>
  )
}
