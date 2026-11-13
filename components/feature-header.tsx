'use client'

import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '@/projects.config'
import { Field } from '@/lib/pixel-field'
import { BootLog } from './boot-log'
import { PixelHeader } from './pixel-header'
import { PixelWordmark } from './pixel-wordmark'
import { Tile } from './tile'
import { TopBar } from './top-bar'
import { TypeTitle } from './type-title'

const CREED: [string, string][] = [
  ['what can we build?', 'anything.'],
  ['what can we fix?', 'everything.'],
  ['what will it cost?', 'coffee.'],
]
const TITLE = 'pesty-sh'
const FRAME_MS = 28
const GROUND = 246

function tuneInk(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mark: { x: number; y: number; w: number; h: number },
) {
  const image = ctx.getImageData(0, 0, width, height)
  const data = image.data
  const markRight = mark.x + mark.w
  const markBottom = mark.y + mark.h
  for (let y = 0; y < height; y++) {
    const inMarkRow = y >= mark.y && y < markBottom
    for (let x = 0; x < width; x++) {
      if (inMarkRow && x >= mark.x && x < markRight) continue
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      if (r >= GROUND && g >= GROUND && b >= GROUND) continue
      const light = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255
      const t = Math.min(1, Math.max(0, (light - 0.18) / 0.62))
      data[i] = 196 + (236 - 196) * t
      data[i + 1] = 150 + (176 - 150) * t
      data[i + 2] = 230 + (246 - 230) * t
    }
  }
  ctx.putImageData(image, 0, 0)
}
const QUIET_PAD = 0

export function FeatureHeader() {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLButtonElement>(null)
  const fieldRef = useRef<Field | null>(null)
  const replayedRef = useRef(false)
  const [engine, setEngine] = useState<'svg' | 'wasm' | 'glyphs'>('svg')

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const nav = navRef.current
    const mark = markRef.current
    if (!root || !canvas || !nav || !mark) return
    if (root.dataset.rustBoot === '1') return
    root.dataset.rustBoot = '1'
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    const fillWhite = () => {
      const rect = canvas.getBoundingClientRect()
      const scale = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(rect.width * scale))
      canvas.height = Math.max(1, Math.round(rect.height * scale))
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    fillWhite()

    let field: Field | null = null
    let fieldSize = { w: 0, h: 0 }
    let running = true
    let raf = 0
    let lastDraw = 0
    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cursor = { x: 0, y: 0, inside: false }
    const quiet = [nav, ...root.querySelectorAll<HTMLElement>('[data-rust-quiet]')]

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2)
    const boxOf = (el: Element, origin: DOMRect, scale: number) => {
      const rect = el.getBoundingClientRect()
      return {
        x: (rect.left - origin.left) * scale,
        y: (rect.top - origin.top) * scale,
        w: rect.width * scale,
        h: rect.height * scale,
      }
    }

    const draw = (now: number) => {
      if (!field) return
      const origin = canvas.getBoundingClientRect()
      const scale = dpr()
      const width = Math.max(1, Math.round(origin.width * scale))
      const height = Math.max(1, Math.round(origin.height * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        ctx.imageSmoothingEnabled = false
        ctx.fillStyle = '#fafafa'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      if (fieldSize.w !== width || fieldSize.h !== height) {
        field.resize(width, height)
        fieldSize = { w: width, h: height }
      }
      const markBox = boxOf(mark, origin, scale)
      if (markBox.w < 1 || markBox.h < 1) return
      field.pointer(cursor.x, cursor.y, cursor.inside)
      field.clearQuiet()
      const pad = QUIET_PAD * scale
      for (const el of quiet) {
        const box = boxOf(el, origin, scale)
        const inset = el.hasAttribute('data-rust-quiet') ? 0.05 : 0
        const insetX = box.w * inset
        const insetY = box.h * inset
        field.pushQuiet(box.x + insetX - pad, box.y + insetY - pad, box.w - insetX * 2 + pad * 2, box.h - insetY * 2 + pad * 2)
      }
      field.frame(now, markBox.x, markBox.y, markBox.w, markBox.h, reduced)
      field.blit(ctx)
      tuneInk(ctx, width, height, markBox)
    }

    const loop = (now: number) => {
      if (!running) return
      if (now - lastDraw >= (reduced ? 80 : FRAME_MS)) {
        lastDraw = now
        draw(now)
      }
      raf = window.requestAnimationFrame(loop)
    }

    const local = (event: PointerEvent) => {
      const origin = canvas.getBoundingClientRect()
      const scale = dpr()
      const inside =
        event.clientX >= origin.left &&
        event.clientX <= origin.right &&
        event.clientY >= origin.top &&
        event.clientY <= origin.bottom
      return {
        x: (event.clientX - origin.left) * scale,
        y: (event.clientY - origin.top) * scale,
        inside,
      }
    }

    const onMove = (event: PointerEvent) => {
      cursor = local(event)
    }
    const onLeave = () => {
      cursor = { x: 0, y: 0, inside: false }
    }
    const onDown = (event: PointerEvent) => {
      if (!field || event.button !== 0) return
      const target = event.target
      if (target instanceof Element && target.closest('a, button, input, textarea, select, label')) return
      const point = local(event)
      if (!point.inside) return
      field.pointerDown(point.x, point.y, event.timeStamp)
    }
    const onUp = (event: PointerEvent) => {
      if (!field) return
      const point = local(event)
      replayedRef.current = field.pointerUp(point.x, point.y, event.timeStamp)
    }

    let cancel = false
    Field.load('/engine.wasm?v=0.1.10')
      .then(async (loaded) => {
        if (cancel) return
        field = loaded
        fieldRef.current = loaded
        loaded.setHex(0, '#c900c4')
        loaded.setHex(1, '#fafafa')
        mark.style.aspectRatio = `${loaded.cols} / ${loaded.rows}`
        document.documentElement.setAttribute('data-rust-live', '1')
        setEngine('wasm')
        draw(performance.now())
        raf = window.requestAnimationFrame(loop)
      })
      .catch(() => {
        if (!cancel) setEngine('glyphs')
      })

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    const onReduce = (event: MediaQueryListEvent) => {
      reduced = event.matches
    }
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    media.addEventListener('change', onReduce)

    return () => {
      cancel = true
      running = false
      fieldRef.current = null
      window.cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      media.removeEventListener('change', onReduce)
    }
  }, [])

  return (
    <section id="rust-header" ref={rootRef} className="relative h-dvh w-full overflow-hidden bg-background" aria-label="Pesty">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-background" aria-hidden="true" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div ref={navRef} data-rust-nav className="pointer-events-auto">
          <TopBar />
        </div>
        <div className="mt-6 flex min-h-0 flex-1 items-start justify-center px-3 md:mt-8">
          <button
            ref={markRef}
            type="button"
            aria-label="Replay pesty-sh"
            data-rust-mark
            className="pointer-events-auto relative w-[min(92vw,77rem)] bg-transparent"
            style={{ aspectRatio: '80 / 21' }}
            onClick={() => {
              if (replayedRef.current) {
                replayedRef.current = false
                return
              }
              fieldRef.current?.replay(performance.now())
            }}
          >
            <span data-rust-fallback className="absolute inset-0">
              {engine === 'wasm' ? null : engine === 'glyphs' ? (
                <PixelHeader word={TITLE} anchor="center" onHome={() => {}} />
              ) : (
                <PixelWordmark text={TITLE} />
              )}
            </span>
          </button>
        </div>
        <div className="pointer-events-auto px-3 pb-3 md:px-4">
          <div data-rust-quiet className="mx-auto w-fit max-w-full">
          <Tile
            active
            labelledBy="header-pitch"
            className="max-w-full"
            bodyClassName="grid gap-0 p-0 md:grid-cols-[auto_auto]"
            style={{ backgroundColor: 'color-mix(in srgb, var(--background) 92%, transparent)' }}
          >
            <div className="flex w-[19.5rem] flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <span>~/pesty — README.md</span>
                <span className="shrink-0">NORMAL</span>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <TypeTitle
                  as="h2"
                  id="header-pitch"
                  text={siteConfig.bio}
                  persistCursor
                  speed={22}
                  className="text-balance text-lg leading-tight tracking-tight"
                />
                <dl className="flex flex-col gap-1 font-mono text-sm">
                  {CREED.map(([q, a]) => (
                    <div key={q} className="flex flex-wrap gap-x-3">
                      <dt className="text-muted-foreground">
                        <span className="text-border" aria-hidden="true">
                          {'> '}
                        </span>
                        {q}
                      </dt>
                      <dd className="text-accent">{a}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-nowrap gap-3">
                  <a
                    href="#projects"
                    className="border-2 border-accent bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-background hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Browse projects
                  </a>
                  <a
                    href="#install"
                    className="border-2 border-border px-5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Install
                  </a>
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-col border-t border-border/40 md:border-t-0 md:border-l">
              <BootLog embedded />
            </div>
          </Tile>
          </div>
        </div>
      </div>
    </section>
  )
}
