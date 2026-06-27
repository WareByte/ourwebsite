importScripts('/about/projs/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const _p = new ScramjetServiceWorker();
let _k = false;

self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('message', (e) => { if (e.data?.type === 'PING') e.source?.postMessage?.({ type: 'PONG' }); });

async function wfc(t) {
  if (_p.config && _p.config.prefix) return true;
  try { const c = await self.clients.matchAll({ includeUncontrolled: true }); for (const x of c) try { x.postMessage({ type: 'SCRAMJET_REQUEST_CONFIG' }); } catch (_) {} } catch (_) {}
  const s = Date.now();
  while (Date.now() - s < t) {
    if (_p.config && _p.config.prefix) return true;
    try { _p.config = null; await _p.loadConfig(); } catch (_) {}
    if (_p.config && _p.config.prefix) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return !!(_p.config && _p.config.prefix);
}

async function pt(req) {
  try { return await fetch(req); }
  catch (_) { return Response.error(); }
}

function rewriteAssetPath(pathname) {
  if (pathname.startsWith('/uv/') || pathname.startsWith('/scram/') || pathname.startsWith('/scramjet/') || pathname.startsWith('/baremux/') || pathname.startsWith('/libcurl/') || pathname.startsWith('/epoxy/')) {
    return '/about/projs' + pathname;
  }
  if (pathname === '/bare-mux-worker.js') return '/about/projs/uv/bare-mux-worker.js';
  if (pathname === '/sw.js') return '/about/projs/sw.js';
  return null;
}

async function hr(event) {
  const url = new URL(event.request.url);
  const rewritten = rewriteAssetPath(url.pathname);
  if (rewritten) return pt(new Request(rewritten, event.request));
  if (!url.pathname.startsWith('/scramjet/') && !url.pathname.startsWith('/scram/')) return pt(event.request);
  if (!_k) {
    try {
      if (!_p.config || !_p.config.prefix) { if (!await wfc(4000)) return pt(event.request); }
      _p.config = null;
      await _p.loadConfig();
      if (!_p.config || !_p.config.prefix) return pt(event.request);
      _k = true;
    } catch (e) { return pt(event.request); }
  }
  try {
    if (_p.route(event)) return await _p.fetch(event);
  } catch (e) {
    const m = e?.message || String(e);
    if (/prefix/.test(m)) {
      _k = false;
      try { _p.config = null; await _p.loadConfig(); if (_p.config && _p.config.prefix && _p.route(event)) { _k = true; return await _p.fetch(event); } } catch (_) {}
    }
    try { const c = await self.clients.matchAll(); for (const x of c) x.postMessage({ type: 'PROXY_ERROR', error: m, url: url.pathname }); } catch (_) {}
    return pt(event.request);
  }
  return pt(event.request);
}

self.addEventListener('fetch', (e) => e.respondWith(hr(e).catch(() => Response.error())));