import { cn } from '@/lib/utils'

type TileProps = {
  title?: string
  meta?: React.ReactNode
  active?: boolean
  className?: string
  bodyClassName?: string
  style?: React.CSSProperties
  as?: 'section' | 'div' | 'article'
  id?: string
  labelledBy?: string
  children: React.ReactNode
}

export function Tile({
  title,
  meta,
  active,
  className,
  bodyClassName,
  style,
  as: As = 'section',
  id,
  labelledBy,
  children,
}: TileProps) {
  return (
    <As id={id} aria-labelledby={labelledBy} data-active={active} className={cn('tile flex flex-col', className)} style={style}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-border/40 px-6 py-1.5 font-mono text-xs text-muted-foreground">
          <span className="truncate">{title}</span>
          {meta && <span className="shrink-0">{meta}</span>}
        </div>
      )}
      <div className={cn('panel-body flex flex-1 flex-col', bodyClassName)}>{children}</div>
    </As>
  )
}
