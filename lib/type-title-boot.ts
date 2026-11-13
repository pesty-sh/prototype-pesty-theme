/** Classic script. Runs from the HTML, not from the React bundle. */
export const typeTitleBoot = `
(function () {
  if (window.__pestyTypeTitle) return
  window.__pestyTypeTitle = true
  var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  function boot(el) {
    if (el.shadowRoot) return
    var text = el.getAttribute('text') || ''
    var speed = Number(el.getAttribute('speed') || 28)
    var delay = Number(el.getAttribute('delay') || 160)
    var persist = el.getAttribute('persist') === 'true'
    var root = el.attachShadow({ mode: 'open' })
    root.innerHTML = '<style>'
      + ':host{cursor:pointer}'
      + 'button{all:unset;display:grid;width:100%;cursor:pointer;text-align:left;font:inherit;color:inherit;letter-spacing:inherit;line-height:inherit;text-wrap:balance}'
      + '.ghost,.shown{grid-area:1/1}'
      + '.ghost{visibility:hidden}'
      + '.caret{display:inline-block;width:.5em;height:.9em;margin-left:.25em;vertical-align:baseline;background:var(--accent,#c900c4);animation:pesty-blink 1.06s steps(1) infinite}'
      + '@keyframes pesty-blink{50%{opacity:0}}'
      + '</style>'
      + '<button type="button" title="Click to retype">'
      + '<span class="ghost"></span><span class="shown"><span class="chars"></span><span class="caret" hidden></span></span>'
      + '</button>'
    var button = root.querySelector('button')
    var ghost = root.querySelector('.ghost')
    var chars = root.querySelector('.chars')
    var caret = root.querySelector('.caret')
    ghost.textContent = text
    chars.textContent = text
    var timer = 0
    var started = false
    var seen = window.__pestyTyped || (window.__pestyTyped = {})
    function play(quick) {
      seen[text] = true
      window.clearTimeout(timer)
      if (reducedQuery.matches) {
        chars.textContent = text
        caret.hidden = true
        return
      }
      var i = 0
      chars.textContent = ''
      caret.hidden = false
      var tick = function () {
        i += 1
        chars.textContent = text.slice(0, i)
        if (i < text.length) timer = window.setTimeout(tick, speed)
        else if (!persist) caret.hidden = true
      }
      timer = window.setTimeout(tick, quick ? 40 : delay)
    }
    button.addEventListener('click', function (event) {
      event.preventDefault()
      event.stopPropagation()
      play(true)
    })
    var fallback = el.querySelector('.type-title-fallback')
    if (fallback) fallback.hidden = true
    if (seen[text]) {
      chars.textContent = text
      caret.hidden = !persist
      return
    }
    function arm() {
      if (started || reducedQuery.matches) return
      var rect = el.getBoundingClientRect()
      if (rect.width < 1 || rect.bottom <= 0 || rect.top >= window.innerHeight) return
      started = true
      play(false)
      window.removeEventListener('scroll', arm)
    }
    arm()
    if (!started) window.addEventListener('scroll', arm, { passive: true })
  }

  function scan(root) {
    var nodes = (root || document).querySelectorAll('type-title')
    for (var i = 0; i < nodes.length; i += 1) boot(nodes[i])
  }

  scan(document)
  document.addEventListener('DOMContentLoaded', function () { scan(document) })
  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i += 1) {
      var added = records[i].addedNodes
      for (var j = 0; j < added.length; j += 1) {
        var node = added[j]
        if (node.nodeType !== 1) continue
        if (node.tagName === 'TYPE-TITLE') boot(node)
        else if (node.querySelectorAll) scan(node)
      }
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
})()
`
