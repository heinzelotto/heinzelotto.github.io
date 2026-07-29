// Tombstone for the pre-2026-07-29 service worker at /argmap/sw.js (D62).
// Purges the old scope's caches, unregisters itself, and walks open tabs over
// to the root — preserving their share-link state.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  // Load-bearing: skipWaiting() activates this worker but does not hand it the
  // open pages. Without claim(), matchAll({type:'window'}) lists only
  // CONTROLLED clients (none) and WindowClient.navigate() rejects on
  // uncontrolled ones — the migration loop below would be dead code.
  await self.clients.claim();
  for (const k of await caches.keys()) {
    // NOT a blanket sweep. Old and new workers share an origin, and workbox
    // names its precache `workbox-precache-v2-<registration.scope>` — so the
    // old one ends in …/argmap/ and the new one in the bare origin. Deleting
    // every cache here would wipe the ROOT worker's precache and break offline
    // for everyone who has already migrated.
    if (k.includes('/argmap/')) await caches.delete(k);
  }
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) {
    c.navigate('/' + new URL(c.url).search + new URL(c.url).hash);
  }
})()));
