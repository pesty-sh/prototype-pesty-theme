import glyphs from './pixel-header/glyphs.json'

type GlyphMap = Record<string, string[]>

const GLYPHS = glyphs.glyphs as GlyphMap

export function wordmarkGrid(text: string) {
  const gap = glyphs.gap
  let cursor = 0
  const cells: { x: number; y: number }[] = []
  for (const ch of text) {
    const glyph = GLYPHS[ch]
    if (!glyph) continue
    const cols = glyph[0]?.length ?? 0
    for (let y = 0; y < glyph.length; y += 1) {
      const row = glyph[y] ?? ''
      for (let x = 0; x < cols; x += 1) {
        if (row[x] === '#') cells.push({ x: cursor + x, y })
      }
    }
    cursor += cols + gap
  }
  return {
    width: Math.max(1, cursor - gap),
    height: GLYPHS.p?.length ?? 19,
    cells,
  }
}

/** Pixel wordmark drawn from the local glyph table. No font file, no wasm. */
export function PixelWordmark({ text }: { text: string }) {
  const { width, height, cells } = wordmarkGrid(text)
  const d = cells.map(({ x, y }) => `M${x} ${y}h1v1h-1z`).join('')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label={text}>
      <path d={d} fill="#c900c4" />
    </svg>
  )
}
