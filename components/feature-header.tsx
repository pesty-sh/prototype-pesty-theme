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
const SIDE = 15
const TINT = '#c900c4'
const GROUND = '#fafafa'
const NOISE = '#c496e6'
const NOISE_LIT = '#ecb0f6'

function markWidth(side: number) {
  const denom = 80 + 2 * side
  return `min(calc(92vw * 80 / ${denom}), calc(56rem * 80 / ${denom}))`
}

function attrNum(el: HTMLElement, name: string) {
  const raw = el.getAttribute(name)
  if (raw == null || raw.trim() === '') return Number.NaN
  const n = Number(raw)
  return Number.isFinite(n) ? n : Number.NaN
}

function attrText(el: HTMLElement, name: string, fallback: string) {
  const raw = el.getAttribute(name)
  if (raw == null || raw.trim() === '') return fallback
  return raw.trim()
}

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
    const ground = attrText(root, 'data-rust-ground', GROUND)
    const fillWhite = () => {
      const rect = canvas.getBoundingClientRect()
      const scale = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(rect.width * scale))
      canvas.height = Math.max(1, Math.round(rect.height * scale))
      ctx.fillStyle = ground
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
        ctx.fillStyle = ground
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
      const insetAttr = attrNum(root, 'data-rust-inset')
      const inset = Number.isFinite(insetAttr) ? insetAttr : 0.05
      for (const el of quiet) {
        const box = boxOf(el, origin, scale)
        const pad = el.hasAttribute('data-rust-quiet') ? inset : 0
        const insetX = box.w * pad
        const insetY = box.h * pad
        field.pushQuiet(box.x + insetX, box.y + insetY, box.w - insetX * 2, box.h - insetY * 2)
      }
      field.frame(now, markBox.x, markBox.y, markBox.w, markBox.h, reduced)
      field.blit(ctx)
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
    Field.load('/engine.wasm?v=0.1.14')
      .then(async (loaded) => {
        if (cancel) return
        field = loaded
        fieldRef.current = loaded
        loaded.tune(
          attrNum(root, 'data-rust-ball-strength'),
          attrNum(root, 'data-rust-ball'),
          attrNum(root, 'data-rust-magnet'),
          attrNum(root, 'data-rust-pull'),
          attrNum(root, 'data-rust-quiet-reach'),
        )
        loaded.setHex(0, attrText(root, 'data-rust-tint', TINT))
        loaded.setHex(1, ground)
        const noise = root.getAttribute('data-rust-noise')
        const noiseLit = root.getAttribute('data-rust-noise-lit')
        if (noise && noise.trim()) loaded.setHex(2, noise.trim())
        if (noiseLit && noiseLit.trim()) loaded.setHex(3, noiseLit.trim())
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
    <section
      id="rust-header"
      ref={rootRef}
      className="relative h-dvh w-full overflow-hidden bg-background"
      aria-label="Pesty"
      data-rust-ball="12"
      data-rust-ball-strength="0.276"
      data-rust-magnet="13.8"
      data-rust-pull="0.88"
      data-rust-quiet-reach="7"
      data-rust-inset="0.05"
      data-rust-side={SIDE}
      data-rust-tint={TINT}
      data-rust-ground={GROUND}
      data-rust-noise={NOISE}
      data-rust-noise-lit={NOISE_LIT}
    >
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
            className="pointer-events-auto relative bg-transparent"
            style={{ aspectRatio: '80 / 21', width: markWidth(SIDE) }}
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
