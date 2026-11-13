'use client'

import { useEffect, useRef } from 'react'
import glyphs from './pixel-header/glyphs.json'

const GAP = glyphs.gap
const ROWS = glyphs.glyphs.p.length
const FIELD = '#fafafa'
const PURPLE = [138, 74, 215] as const
const MAGENTA = [201, 0, 196] as const
const GLOW = [255, 90, 232] as const

type Glyphs = typeof glyphs.glyphs

function inkAt(ch: string, row: number, col: number) {
  const glyph = (glyphs.glyphs as Glyphs)[ch as keyof Glyphs]
  if (!glyph) return false
  return glyph[row]?.[col] === '#'
}

function wordWidth(word: string) {
  return word.split('').reduce((sum, ch, index) => {
    const glyph = (glyphs.glyphs as Glyphs)[ch as keyof Glyphs]
    return sum + (glyph?.[0]?.length ?? 3) + (index ? GAP : 0)
  }, 0)
}

function mix(a: readonly number[], b: readonly number[], t: number) {
  return a.map((channel, index) => Math.round(channel + (b[index] - channel) * t))
}

export function PixelHeader({
  onHome,
  anchor = 'center',
  word = 'pesty.sh',
}: {
  onHome: () => void
  anchor?: 'center' | 'upper'
  word?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const homeRef = useRef(onHome)
  const anchorRef = useRef(anchor)
  const wordRef = useRef(word)
  homeRef.current = onHome
  anchorRef.current = anchor
  wordRef.current = word

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const word = wordRef.current
    const cols = wordWidth(word)
    const specks = new Uint8Array(cols * ROWS)
    let seed = 17
    for (let i = 0; i < specks.length; i += 1) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      specks[i] = seed % 17 === 0 ? 1 : 0
    }

    let pointer = { x: -999, y: -999, inside: false }
    let appear = 0
    let frame = 0
    let running = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return false
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      return true
    }

    const draw = (now: number) => {
      if (!running) return
      if (!resize()) {
        frame = window.requestAnimationFrame(draw)
        return
      }
      const width = canvas.width
      const height = canvas.height
      const band = anchorRef.current === 'upper' ? height * 0.46 : height
      const cell = Math.max(4, Math.min(14, Math.floor(Math.min(width / (cols + 8), band / (ROWS + 4)))))
      const originX = Math.floor((width - cols * cell) / 2)
      const originY =
        anchorRef.current === 'upper' ? Math.floor(height * 0.1) : Math.floor((height - ROWS * cell) / 2)
      const reveal = reduced ? 1 : Math.min(1, appear)
      appear = Math.min(1, appear + 0.018)

      ctx.fillStyle = FIELD
      ctx.fillRect(0, 0, width, height)

      const px = ((pointer.x / canvas.clientWidth) * width - originX) / cell
      const py = ((pointer.y / canvas.clientHeight) * height - originY) / cell
      const drift = reduced ? 0 : Math.sin(now / 1400) * 0.5

      let cursor = 0
      for (const ch of word) {
        const glyph = (glyphs.glyphs as Glyphs)[ch as keyof Glyphs]
        const glyphCols = glyph?.[0]?.length ?? 3
        for (let row = 0; row < ROWS; row += 1) {
          for (let col = 0; col < glyphCols; col += 1) {
            const x = cursor + col
            const on = inkAt(ch, row, col)
            const speck = specks[(row * cols + x) % specks.length] === 1
            if (!on && !speck) continue
            const shown = on ? x / cols <= reveal : true
            if (!shown) continue
            const dist = Math.hypot(x - px, row - py)
            const near = pointer.inside ? Math.max(0, 1 - dist / 8) : 0
            const vertical = row / (ROWS - 1)
            const base = mix(PURPLE, MAGENTA, vertical)
            const lit = mix(base, GLOW, near * 0.85)
            const alpha = on ? 1 : 0.16 + near * 0.45 + (speck ? drift * 0.04 : 0)
            ctx.fillStyle = `rgba(${lit[0]}, ${lit[1]}, ${lit[2]}, ${Math.max(0.08, Math.min(1, alpha))})`
            ctx.fillRect(originX + x * cell, originY + row * cell, cell - 1, cell - 1)
          }
        }
        cursor += glyphCols + GAP
      }

      frame = window.requestAnimationFrame(draw)
    }

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        inside: true,
      }
    }
    const onLeave = () => {
      pointer = { x: -999, y: -999, inside: false }
    }
    const onClick = () => {
      appear = 0
      homeRef.current()
    }

    resize()
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick)
    frame = window.requestAnimationFrame(draw)

    return () => {
      running = false
      window.cancelAnimationFrame(frame)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [word])

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full cursor-pointer"
      role="img"
      aria-label={word}
    />
  )
}
