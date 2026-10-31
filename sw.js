// 무술 수련장 service worker — keeps the game, models, sounds and libraries on the phone
const VERSION = '202610311618';
const CACHE = 'dojo-' + VERSION;
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "fighter.glb?v=202610311618", "girl.glb?v=202610311618", "male.glb?v=202610311618", "sounds/music/bgm_dojo_drum_loop_96bpm.mp3", "sounds/music/bgm_honor_bound.mp3", "sounds/music/bgm_only_300_stood.mp3", "sounds/music/bgm_tale_of_warriors.mp3", "sounds/music/bgm_war_drums_ambience.mp3", "sounds/sfx/block_clank_01.mp3", "sounds/sfx/block_clank_02.mp3", "sounds/sfx/body_fall_01.mp3", "sounds/sfx/clap_01.mp3", "sounds/sfx/drum_roll_01.mp3", "sounds/sfx/gong_01.mp3", "sounds/sfx/gong_02.mp3", "sounds/sfx/hit_heavy_01.mp3", "sounds/sfx/hit_heavy_02.mp3", "sounds/sfx/knock_wood_01.mp3", "sounds/sfx/knock_wood_02.mp3", "sounds/sfx/punch_body_01.mp3", "sounds/sfx/punch_body_02.mp3", "sounds/sfx/punch_body_03.mp3", "sounds/sfx/punch_face_01.mp3", "sounds/sfx/roll_01.mp3", "sounds/sfx/step_01.mp3", "sounds/sfx/step_02.mp3", "sounds/sfx/step_03.mp3", "sounds/sfx/stomp_01.mp3", "sounds/sfx/stomp_02.mp3", "sounds/sfx/taiko_hit_01.mp3", "sounds/sfx/taiko_hit_02.mp3", "sounds/sfx/taiko_hit_03.mp3", "sounds/sfx/victory_horn_01.mp3", "sounds/sfx/whoosh_kick_01.mp3", "sounds/sfx/whoosh_kick_02.mp3", "sounds/sfx/whoosh_punch_01.mp3", "sounds/sfx/whoosh_punch_02.mp3", "sounds/sfx/whoosh_punch_03.mp3", "sounds/voice/kiai_female_short_01.mp3", "sounds/voice/kiai_female_short_02.mp3", "sounds/voice/kiai_female_short_03.mp3", "sounds/voice/kiai_male_short_01.mp3", "sounds/voice/kiai_male_short_02.mp3", "sounds/voice/kiai_male_short_03.mp3", "sounds/voice/kiai_male_short_04.mp3", "sounds/voice/kiai_male_short_05.mp3", "sounds/voice/scream_female_01.mp3", "sounds/voice/scream_female_02.mp3", "sounds/voice/scream_female_04.mp3", "sounds/voice/scream_female_05.mp3", "sounds/voice/scream_male_01.mp3", "sounds/voice/scream_male_02.mp3", "sounds/voice/scream_male_03.mp3", "sounds/voice/scream_male_04.mp3", "sounds/voice/scream_male_05.mp3", "vendor/three/build/three.module.js", "vendor/three/examples/jsm/loaders/GLTFLoader.js", "vendor/three/examples/jsm/controls/OrbitControls.js", "vendor/three/examples/jsm/environments/RoomEnvironment.js", "vendor/three/examples/jsm/utils/BufferGeometryUtils.js"];
const CDN = ["https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js", "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js", "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js", "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js", "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js"];
self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all([...CORE, ...CDN].map(u=>
    fetch(u, {cache:'reload'}).then(r=>{ if (r.ok) return c.put(u, r); }).catch(()=>{})))));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('dojo-') && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // the page itself: try the network first so updates arrive, fall back to the saved copy offline
  if (req.mode === 'navigate' || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname))){
    e.respondWith(fetch(req).then(r=>{ const c = r.clone(); caches.open(CACHE).then(k=>k.put('index.html', c)); return r; })
      .catch(()=>caches.match('index.html', {ignoreSearch:true}).then(r=>r || caches.match('./'))));
    return;
  }
  const cacheable = url.origin === location.origin || /(^|\.)(jsdelivr\.net|googleapis\.com|gstatic\.com)$/.test(url.hostname);
  if (!cacheable) return;
  const ranged = req.headers.has('range');
  e.respondWith(caches.match(req.url, {ignoreVary:true}).then(hit=>{
    if (hit) return hit;                                  // music streams get the whole saved file
    return fetch(req).then(r=>{
      if (!ranged && (r.ok || r.type === 'opaque')){ const c = r.clone(); caches.open(CACHE).then(k=>k.put(req.url, c)); }
      return r;
    });
  }));
});
