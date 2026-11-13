const FACE = 'Satoshi Header'

export async function satoshiMark(text: string) {
  const face = new FontFace(FACE, 'url(/fonts/Satoshi-Bold.woff2)', { weight: '700' })
  await face.load()
  document.fonts.add(face)

  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) return null
  const size = 96
  probe.font = `700 ${size}px "${FACE}"`
  const measured = probe.measureText(text)
  const pad = 8
  const width = Math.ceil(measured.width) + pad * 2
  const ascent = Math.ceil(measured.actualBoundingBoxAscent || size * 0.8)
  const descent = Math.ceil(measured.actualBoundingBoxDescent || size * 0.22)
  const height = ascent + descent + pad * 2
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.font = `700 ${size}px "${FACE}"`
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, pad, pad + ascent)
  const image = ctx.getImageData(0, 0, width, height)
  const ink = (x: number, y: number) => image.data[(y * width + x) * 4 + 3] > 96

  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!ink(x, y)) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  if (maxX < minX) return null

  const srcW = maxX - minX + 1
  const srcH = maxY - minY + 1
  const rows = 32
  const cols = Math.max(1, Math.min(160, Math.round((srcW / srcH) * rows)))
  const cells = new Uint8Array(cols * rows)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x0 = minX + Math.floor((col * srcW) / cols)
      const x1 = minX + Math.floor(((col + 1) * srcW) / cols)
      const y0 = minY + Math.floor((row * srcH) / rows)
      const y1 = minY + Math.floor(((row + 1) * srcH) / rows)
      let hits = 0
      let total = 0
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          total++
          if (ink(x, y)) hits++
        }
      }
      cells[row * cols + col] = total > 0 && hits / total > 0.32 ? 1 : 0
    }
  }
  return { cells, cols, rows }
}
