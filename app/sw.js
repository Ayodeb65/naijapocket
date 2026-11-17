/* Offline shell for the NaijaPocket app. Scope is /app/ only. */
const VERSION = "naijapocket-app-v2";
const SHELL = [
  "./",
  "./index.html",
  "./fonts.css",
  "./app.css",
  "./fonts/inter-400-lat.woff2",
  "./fonts/inter-400-naira.woff2",
  "./fonts/inter-600-lat.woff2",
  "./fonts/inter-600-naira.woff2",
  "./fonts/inter-700-lat.woff2",
  "./fonts/inter-700-naira.woff2",
  "./fonts/bricolage-700-lat.woff2",
  "./fonts/bricolage-700-naira.woff2",
  "./fonts/bricolage-800-lat.woff2",
  "./fonts/bricolage-800-naira.woff2",
  "./manifest.webmanifest",
  "./js/main.js",
  "./js/ui.js",
  "./js/db.js",
  "./js/logic.js",
  "./js/content.js",
  "./js/money.js",
  "./js/home.js",
  "./js/saver.js",
  "./js/jobs.js",
  "./js/business.js",
  "./js/safe.js",
  "./js/health.js",
  "./js/profile.js",
  "../assets/logo-mark.svg",
  "../assets/icon-192.png",
  "../assets/icon-512.png",
  "../assets/icon-maskable-512.png",
  "../assets/apple-touch-icon.png",
  "../favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put("./index.html", copy)).catch(() => {});
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
    }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
