---
layout: post
title:  "An Embedded ArgMap"
date:   2026-08-24 21:28:20 +0200
categories: argmap
---

## Embedding ArgMaps

This is the first test of an embedded ArgMap!

<iframe src="/embed.html?layout=graph"
        style="width:100%;height:560px;border:0;border-radius:4px"
        title="ArgMap: an explorable argument map"></iframe>

And the second! This is a rehearsal for LessWrong's custom widgets which are a little bit more constrained in how the embedded argmap must be passed in. Only html within an `<iframe srcdoc="..." sandbox="allow-scripts">` and nothing else is allowed.

That means there is opaque origin, no browser storage, no workers, and every load is cross-origin.

Let's see whether it works:

<div id="rehearsal" style="max-width:681px;margin:1.5rem 0"></div>

{% raw %}
<script>
(function () {
  // Verbatim from ForumMagnum's iframeResizeScript.ts, which LessWrong appends
  // to every widget. The closing tag is split so it does not end this script
  // element early.
  var RESIZE_SCRIPT =
    '<script>\n' +
    '(function() {\n' +
    '  function postHeight() {\n' +
    '    var body = document.body;\n' +
    '    if (!body) return;\n' +
    '    var cs = getComputedStyle(body);\n' +
    '    var h = body.offsetHeight\n' +
    '      + (parseFloat(cs.marginTop) || 0)\n' +
    '      + (parseFloat(cs.marginBottom) || 0);\n' +
    "    parent.postMessage({ type: 'iframe-widget-resize', height: Math.ceil(h) }, '*');\n" +
    '  }\n' +
    "  if (document.readyState === 'loading') {\n" +
    "    document.addEventListener('DOMContentLoaded', postHeight);\n" +
    '  } else {\n' +
    '    postHeight();\n' +
    '  }\n' +
    "  if (typeof ResizeObserver !== 'undefined') {\n" +
    '    var raf;\n' +
    '    new ResizeObserver(function() {\n' +
    '      cancelAnimationFrame(raf);\n' +
    '      raf = requestAnimationFrame(postHeight);\n' +
    '    }).observe(document.documentElement);\n' +
    '  }\n' +
    "  window.addEventListener('message', function(event) {\n" +
    "    if (event.data && event.data.type === 'iframe-widget-request-resize') {\n" +
    '      postHeight();\n' +
    '    }\n' +
    '  });\n' +
    "  window.addEventListener('resize', postHeight);\n" +
    '})();\n' +
    '<' + '/script>';

  var slot = document.getElementById('rehearsal');
  var frame = null;

  // The widget itself is fetched rather than pasted in here. Putting it inline
  // would mean escaping every closing script tag it contains, and fetching the
  // shipped copy also means this rehearsal always tests the current one.
  fetch('/embed-shim.html')
    .then(function (r) {
      if (!r.ok) throw new Error('embed-shim.html: HTTP ' + r.status);
      return r.text();
    })
    .then(function (shim) {
      frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.setAttribute('title', 'ArgMap, loaded the way LessWrong loads a widget');
      frame.style.cssText = 'width:100%;height:400px;border:none;border-radius:4px';
      frame.srcdoc = shim + RESIZE_SCRIPT;
      frame.addEventListener('load', function () {
        frame.contentWindow.postMessage({ type: 'iframe-widget-request-resize' }, '*');
      });
      slot.appendChild(frame);
    })
    .catch(function (e) {
      slot.textContent = 'The rehearsal widget did not load: ' + e.message;
    });

  // LessWrong's side of the protocol: it listens for one message type, clamps
  // the height it is given, and ignores everything else.
  window.addEventListener('message', function (event) {
    if (!frame || event.source !== frame.contentWindow) return;
    if (!event.data || event.data.type !== 'iframe-widget-resize') return;
    var h = Math.max(50, Math.min(5000, Math.round(event.data.height)));
    frame.style.height = h + 'px';
  });
})();
</script>
{% endraw %}

