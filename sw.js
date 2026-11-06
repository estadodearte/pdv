// Faz o programa abrir sem internet depois da primeira visita.
// Para forçar uma atualização em todos os aparelhos, mude o número da versão abaixo.
const VERSAO = 'pdv-v9'
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-64.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
// Responde rápido com o que está guardado e atualiza em segundo plano para a próxima abertura.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return
  e.respondWith(
    caches.open(VERSAO).then(async (c) => {
      const guardado = await c.match(e.request, { ignoreSearch: true })
      const rede = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r }).catch(() => guardado)
      return guardado || rede
    })
  )
})
