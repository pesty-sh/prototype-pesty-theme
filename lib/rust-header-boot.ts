/** Classic script. Paints #rust-header from /engine.wasm without waiting on React. */
export const rustHeaderBoot = `
;(function () {
  if (window.__pestyRustHeader) return
  window.__pestyRustHeader = true
  var FRAME_MS = 28
  var GROUND = 246

  function dpr() { return Math.min(window.devicePixelRatio || 1, 2) }

  function boxOf(el, origin, scale) {
    var rect = el.getBoundingClientRect()
    return {
      x: (rect.left - origin.left) * scale,
      y: (rect.top - origin.top) * scale,
      w: rect.width * scale,
      h: rect.height * scale
    }
  }

  function tuneInk(ctx, width, height, mark) {
    var image = ctx.getImageData(0, 0, width, height)
    var data = image.data
    var markRight = mark.x + mark.w
    var markBottom = mark.y + mark.h
    for (var y = 0; y < height; y++) {
      var inMarkRow = y >= mark.y && y < markBottom
      for (var x = 0; x < width; x++) {
        if (inMarkRow && x >= mark.x && x < markRight) continue
        var i = (y * width + x) * 4
        var r = data[i], g = data[i + 1], b = data[i + 2]
        if (r >= GROUND && g >= GROUND && b >= GROUND) continue
        var light = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255
        var t = Math.min(1, Math.max(0, (light - 0.18) / 0.62))
        data[i] = 196 + (236 - 196) * t
        data[i + 1] = 150 + (176 - 150) * t
        data[i + 2] = 230 + (246 - 230) * t
      }
    }
    ctx.putImageData(image, 0, 0)
  }

  function loadWasm(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('engine.wasm ' + res.status)
      return WebAssembly.instantiateStreaming(res, {}).then(function (out) { return out.instance })
    }).catch(function () {
      return fetch(url).then(function (res) { return res.arrayBuffer() }).then(function (bytes) {
        return WebAssembly.instantiate(bytes, {}).then(function (out) { return out.instance })
      })
    })
  }

  function setHex(api, ptr, kind, hex) {
    var bytes = new TextEncoder().encode(hex)
    if (bytes.length > 16) return
    var p = api.engine_hex_prepare(ptr)
    if (!p) return
    new Uint8Array(api.memory.buffer, p, bytes.length).set(bytes)
    api.engine_hex_commit(ptr, kind, bytes.length)
  }

  function satoshiMark(text) {
    var face = new FontFace('Satoshi Header', 'url(/fonts/Satoshi-Bold.woff2)', { weight: '700' })
    return face.load().then(function (loaded) {
      document.fonts.add(loaded)
      var probe = document.createElement('canvas').getContext('2d')
      if (!probe) return null
      var size = 96
      probe.font = '700 ' + size + 'px "Satoshi Header"'
      var measured = probe.measureText(text)
      var pad = 8
      var width = Math.ceil(measured.width) + pad * 2
      var ascent = Math.ceil(measured.actualBoundingBoxAscent || size * 0.8)
      var descent = Math.ceil(measured.actualBoundingBoxDescent || size * 0.22)
      var height = ascent + descent + pad * 2
      var canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      var ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return null
      ctx.font = '700 ' + size + 'px "Satoshi Header"'
      ctx.fillStyle = '#000'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(text, pad, pad + ascent)
      var image = ctx.getImageData(0, 0, width, height)
      function ink(x, y) { return image.data[(y * width + x) * 4 + 3] > 96 }
      var minX = width, minY = height, maxX = 0, maxY = 0
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          if (!ink(x, y)) continue
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
      }
      if (maxX < minX) return null
      var srcW = maxX - minX + 1
      var srcH = maxY - minY + 1
      var rows = 32
      var cols = Math.max(1, Math.min(160, Math.round((srcW / srcH) * rows)))
      var cells = new Uint8Array(cols * rows)
      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
          var x0 = minX + Math.floor((col * srcW) / cols)
          var x1 = minX + Math.floor(((col + 1) * srcW) / cols)
          var y0 = minY + Math.floor((row * srcH) / rows)
          var y1 = minY + Math.floor(((row + 1) * srcH) / rows)
          var hits = 0, total = 0
          for (var yy = y0; yy < y1; yy++) {
            for (var xx = x0; xx < x1; xx++) {
              total++
              if (ink(xx, yy)) hits++
            }
          }
          cells[row * cols + col] = total > 0 && hits / total > 0.32 ? 1 : 0
        }
      }
      return { cells: cells, cols: cols, rows: rows }
    })
  }

  function boot(root) {
    if (!root || root.dataset.rustBoot === '1') return
    var canvas = root.querySelector('canvas')
    var nav = root.querySelector('[data-rust-nav]')
    var mark = root.querySelector('[data-rust-mark]')
    if (!canvas || !nav || !mark) return
    var ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    root.dataset.rustBoot = '1'

    var field = null
    var fieldSize = { w: 0, h: 0 }
    var replayed = 0
    var cursor = { x: 0, y: 0, inside: 0 }
    var running = true
    var raf = 0
    var lastDraw = 0
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function draw(now) {
      if (!field) return
      var origin = canvas.getBoundingClientRect()
      var scale = dpr()
      var width = Math.max(1, Math.round(origin.width * scale))
      var height = Math.max(1, Math.round(origin.height * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        ctx.imageSmoothingEnabled = false
        ctx.fillStyle = '#fafafa'
        ctx.fillRect(0, 0, width, height)
      }
      if (fieldSize.w !== width || fieldSize.h !== height) {
        field.api.engine_resize(field.ptr, width, height)
        fieldSize = { w: width, h: height }
      }
      var markBox = boxOf(mark, origin, scale)
      field.api.engine_pointer(field.ptr, cursor.x, cursor.y, cursor.inside)
      field.api.engine_clear_quiet(field.ptr)
      var navBox = boxOf(nav, origin, scale)
      field.api.engine_push_quiet(field.ptr, navBox.x, navBox.y, navBox.w, navBox.h)
      field.api.engine_frame(field.ptr, now, markBox.x, markBox.y, markBox.w, markBox.h, reduced ? 1 : 0)
      var pix = field.api.engine_pixels(field.ptr)
      var len = field.api.engine_byte_len(field.ptr)
      var fw = field.api.engine_width(field.ptr)
      var fh = field.api.engine_height(field.ptr)
      if (fw && fh && len === fw * fh * 4) {
        var bytes = new Uint8ClampedArray(field.api.memory.buffer, pix, len)
        ctx.putImageData(new ImageData(bytes, fw, fh), 0, 0)
      }
      tuneInk(ctx, width, height, markBox)
    }

    function loop(now) {
      if (!running) return
      if (now - lastDraw >= (reduced ? 80 : FRAME_MS)) {
        lastDraw = now
        draw(now)
      }
      raf = window.requestAnimationFrame(loop)
    }

    function local(event) {
      var origin = canvas.getBoundingClientRect()
      var scale = dpr()
      var inside = event.clientX >= origin.left && event.clientX <= origin.right && event.clientY >= origin.top && event.clientY <= origin.bottom
      return { x: (event.clientX - origin.left) * scale, y: (event.clientY - origin.top) * scale, inside: inside }
    }

    window.addEventListener('pointermove', function (event) {
      var point = local(event)
      cursor.x = point.x
      cursor.y = point.y
      cursor.inside = point.inside ? 1 : 0
    })
    document.documentElement.addEventListener('pointerleave', function () {
      cursor.inside = 0
    })
    window.addEventListener('pointerdown', function (event) {
      if (!field || event.button !== 0) return
      var target = event.target
      if (target && target.closest && target.closest('a, button, input, textarea, select, label')) return
      var point = local(event)
      if (!point.inside) return
      field.api.engine_pointer_down(field.ptr, point.x, point.y, event.timeStamp)
    })
    window.addEventListener('pointerup', function (event) {
      if (!field) return
      var point = local(event)
      replayed = field.api.engine_pointer_up(field.ptr, point.x, point.y, event.timeStamp)
    })
    mark.addEventListener('click', function () {
      if (replayed) {
        replayed = 0
        return
      }
      if (field) field.api.engine_replay(field.ptr, performance.now())
    })

    loadWasm('/engine.wasm?v=0.1.6').then(function (instance) {
      var api = instance.exports
      field = { api: api, ptr: api.engine_new() }
      setHex(api, field.ptr, 0, '#c900c4')
      setHex(api, field.ptr, 1, '#fafafa')
      draw(performance.now())
      raf = window.requestAnimationFrame(loop)
      return satoshiMark('pesty-sh').then(function (drawn) {
        if (!drawn) return
        var prep = api.engine_mark_prepare(field.ptr, drawn.cols, drawn.rows)
        if (!prep) return
        new Uint8Array(api.memory.buffer, prep, drawn.cols * drawn.rows).set(drawn.cells)
        api.engine_mark_commit(field.ptr)
        mark.style.aspectRatio = api.engine_logo_cols(field.ptr) + ' / ' + api.engine_logo_rows(field.ptr)
        var fallback = root.querySelector('[data-rust-fallback]')
        if (fallback) fallback.hidden = true
      })
    }).catch(function () {
      window.cancelAnimationFrame(raf)
    })
  }

  function scan() {
    var root = document.getElementById('rust-header')
    if (!root) return
    boot(root)
    if (root.dataset.rustBoot === '1') observer.disconnect()
  }
  var observer = new MutationObserver(scan)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  scan()
  document.addEventListener('DOMContentLoaded', scan)
})()
`
