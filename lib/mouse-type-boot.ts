/** Classic script. Magenta cursor cell and trail, without waiting on React. */
export const mouseTypeBoot = `
;(function () {
  if (window.__pestyMouseType) return
  window.__pestyMouseType = true
  if (!window.matchMedia('(pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var STEP = 10
  var FADE_MS = 160
  var PEAK = 0.28

  document.documentElement.classList.add('mouse-type')

  var host = document.createElement('div')
  host.className = 'pointer-events-none fixed inset-0 z-50 overflow-hidden'
  host.setAttribute('aria-hidden', 'true')
  document.body.appendChild(host)

  var caret = document.createElement('span')
  caret.className = 'mouse-cell is-caret'
  caret.hidden = true
  host.appendChild(caret)

  var shadows = []
  var acc = 0
  var px = -1
  var py = -1
  var idle = 0

  function fade(now) {
    for (var i = shadows.length - 1; i >= 0; i -= 1) {
      var age = now - shadows[i].born
      if (age >= FADE_MS) {
        shadows[i].el.remove()
        shadows.splice(i, 1)
        continue
      }
      shadows[i].el.style.opacity = String(PEAK * (1 - age / FADE_MS))
    }
    window.requestAnimationFrame(fade)
  }
  window.requestAnimationFrame(fade)

  function overHeader(x, y) {
    var header = document.getElementById('rust-header')
    if (!header) return false
    var rect = header.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  function clearTrail() {
    for (var i = shadows.length - 1; i >= 0; i -= 1) shadows[i].el.remove()
    shadows.length = 0
  }

  function drop(x, y, now) {
    var el = document.createElement('span')
    el.className = 'mouse-cell is-tail'
    el.style.transform = 'translate3d(' + Math.round(x) + 'px, ' + Math.round(y) + 'px, 0)'
    el.style.opacity = String(PEAK)
    host.appendChild(el)
    shadows.push({ el: el, born: now })
  }

  window.addEventListener('pointermove', function (event) {
    var x = event.clientX
    var y = event.clientY
    if (overHeader(x, y)) {
      caret.hidden = true
      px = -1
      py = -1
      acc = 0
      clearTrail()
      return
    }
    var now = performance.now()
    if (px >= 0) acc += Math.hypot(x - px, y - py)
    var fromX = px
    var fromY = py
    px = x
    py = y
    caret.hidden = false
    caret.style.transform = 'translate3d(' + Math.round(x) + 'px, ' + Math.round(y) + 'px, 0)'
    caret.classList.add('is-moving')
    window.clearTimeout(idle)
    idle = window.setTimeout(function () { caret.classList.remove('is-moving') }, 90)
    if (fromX < 0) return
    while (acc >= STEP) {
      acc -= STEP
      drop(fromX, fromY, now)
    }
  }, { passive: true })

  document.documentElement.addEventListener('pointerleave', function () {
    caret.hidden = true
  })
})()
`