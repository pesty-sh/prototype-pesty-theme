/** Classic script. Paints #rust-header from /engine.wasm without waiting on React. */
export const rustHeaderBoot = `
;(function () {
  if (window.__pestyRustHeader) return
  window.__pestyRustHeader = true
  var FRAME_MS = 28
  var TINT = '#c900c4'
  var GROUND = '#fafafa'
  var SIDE = 15

  function dpr() { return Math.min(window.devicePixelRatio || 1, 2) }

  function attrNum(el, name) {
    var raw = el.getAttribute(name)
    if (raw == null || String(raw).trim() === '') return NaN
    var n = Number(raw)
    return isFinite(n) ? n : NaN
  }

  function attrText(el, name, fallback) {
    var raw = el.getAttribute(name)
    if (raw == null || String(raw).trim() === '') return fallback
    return String(raw).trim()
  }

  function boxOf(el, origin, scale) {
    var rect = el.getBoundingClientRect()
    return {
      x: (rect.left - origin.left) * scale,
      y: (rect.top - origin.top) * scale,
      w: rect.width * scale,
      h: rect.height * scale
    }
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

  function boot(root) {
    if (!root || root.dataset.rustBoot === '1') return
    var canvas = root.querySelector('canvas')
    var nav = root.querySelector('[data-rust-nav]')
    var mark = root.querySelector('[data-rust-mark]')
    if (!canvas || !nav || !mark) return
    var ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    root.dataset.rustBoot = '1'
    var ground = attrText(root, 'data-rust-ground', GROUND)
    var side = attrNum(root, 'data-rust-side')
    if (!isFinite(side) || side < 0) side = SIDE
    var denom = 80 + 2 * side
    mark.style.width = 'min(calc(92vw * 80 / ' + denom + '), calc(56rem * 80 / ' + denom + '))'

    var field = null
    var fieldSize = { w: 0, h: 0 }
    var replayed = 0
    var cursor = { x: 0, y: 0, inside: 0 }
    var running = true
    var raf = 0
    var lastDraw = 0
    var primed = false
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (window.__pestyRustStop) window.__pestyRustStop()
    window.__pestyRustStop = function () { running = false }

    function paintGround() {
      var origin = canvas.getBoundingClientRect()
      var scale = dpr()
      var width = Math.max(1, Math.round(Math.max(origin.width, 1) * scale))
      var height = Math.max(1, Math.round(Math.max(origin.height, 1) * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        ctx.imageSmoothingEnabled = false
        ctx.fillStyle = ground
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      return { origin: origin, scale: scale, width: width, height: height }
    }
    paintGround()

    function draw(now) {
      if (!field || !running) return
      var sized = paintGround()
      var markBox = boxOf(mark, sized.origin, sized.scale)
      if (markBox.w < 1 || markBox.h < 1) return
      if (fieldSize.w !== sized.width || fieldSize.h !== sized.height) {
        field.api.engine_resize(field.ptr, sized.width, sized.height)
        fieldSize = { w: sized.width, h: sized.height }
      }
      field.api.engine_pointer(field.ptr, cursor.x, cursor.y, cursor.inside)
      field.api.engine_clear_quiet(field.ptr)
      var zones = root.querySelectorAll('[data-rust-nav], [data-rust-quiet]')
      for (var i = 0; i < zones.length; i += 1) {
        var box = boxOf(zones[i], sized.origin, sized.scale)
        if (zones[i].hasAttribute('data-rust-quiet')) {
          var inset = attrNum(root, 'data-rust-inset')
          if (!isFinite(inset)) inset = 0.05
          var insetX = box.w * inset
          var insetY = box.h * inset
          box.x += insetX
          box.y += insetY
          box.w -= insetX * 2
          box.h -= insetY * 2
        }
        field.api.engine_push_quiet(field.ptr, box.x, box.y, box.w, box.h)
      }
      var hold = reduced || (window.__pestyRustIntro && !primed) ? 1 : 0
      field.api.engine_frame(field.ptr, now, markBox.x, markBox.y, markBox.w, markBox.h, hold)
      primed = true
      window.__pestyRustIntro = true
      var pix = field.api.engine_pixels(field.ptr)
      var len = field.api.engine_byte_len(field.ptr)
      var fw = field.api.engine_width(field.ptr)
      var fh = field.api.engine_height(field.ptr)
      if (fw && fh && len === fw * fh * 4) {
        var bytes = new Uint8ClampedArray(field.api.memory.buffer, pix, len)
        ctx.putImageData(new ImageData(bytes, fw, fh), 0, 0)
      }
      document.documentElement.setAttribute('data-rust-live', '1')
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

    loadWasm('/engine.wasm?v=0.1.14').then(function (instance) {
      if (!running || !root.isConnected) return
      var api = instance.exports
      field = { api: api, ptr: api.engine_new() }
      api.engine_tune(
        field.ptr,
        attrNum(root, 'data-rust-ball-strength'),
        attrNum(root, 'data-rust-ball'),
        attrNum(root, 'data-rust-magnet'),
        attrNum(root, 'data-rust-pull'),
        attrNum(root, 'data-rust-quiet-reach')
      )
      setHex(api, field.ptr, 0, attrText(root, 'data-rust-tint', TINT))
      setHex(api, field.ptr, 1, ground)
      var noise = root.getAttribute('data-rust-noise')
      var noiseLit = root.getAttribute('data-rust-noise-lit')
      if (noise && String(noise).trim()) setHex(api, field.ptr, 2, String(noise).trim())
      if (noiseLit && String(noiseLit).trim()) setHex(api, field.ptr, 3, String(noiseLit).trim())
      mark.style.aspectRatio = api.engine_logo_cols(field.ptr) + ' / ' + api.engine_logo_rows(field.ptr)
      var stable = 0
      var lastKey = ''
      function arm(now) {
        if (!running || !root.isConnected) return
        var origin = canvas.getBoundingClientRect()
        var key = Math.round(origin.width) + 'x' + Math.round(origin.height)
        var box = boxOf(mark, origin, dpr())
        if (origin.width >= 2 && origin.height >= 2 && box.w >= 1 && box.h >= 1 && key === lastKey) stable += 1
        else stable = 0
        lastKey = key
        paintGround()
        if (stable < 2) {
          raf = window.requestAnimationFrame(arm)
          return
        }
        draw(now)
        raf = window.requestAnimationFrame(loop)
      }
      raf = window.requestAnimationFrame(arm)
    }).catch(function () {
      running = false
      window.cancelAnimationFrame(raf)
    })
  }

  function scan() {
    var root = document.getElementById('rust-header')
    if (!root) return
    boot(root)
  }
  var observer = new MutationObserver(scan)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  scan()
  document.addEventListener('DOMContentLoaded', scan)
})()
`
