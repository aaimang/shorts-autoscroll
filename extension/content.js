// Runs on every youtube.com page (it's a single-page app) and only acts on /shorts/.
//
// YouTube quirks this relies on:
// - Shorts play with loop=true and YouTube re-applies it, so `ended` rarely fires.
//   A finished play shows up as currentTime jumping from the end back to ~0.
// - One <video> element is reused across clips, so state is reset on URL change.
// - In a hidden tab YouTube keeps looping but never moves on, so we hold there.

(() => {
  const TICK_MS = 250;
  const SETTLE_MS = 1500; // ignore loop signals right after a new Short starts

  let settings = { ...DEFAULTS };
  let clip = freshClip();
  let advanced = 0;
  let lastUrl = location.href;
  let lastTick = performance.now();
  let current = null;
  const hooked = new WeakSet();

  chrome.storage.sync.get(DEFAULTS, (s) => { settings = s; });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const key in changes) settings[key] = changes[key].newValue;
  });

  function freshClip() {
    return { loops: 0, watched: 0, lastTime: 0, since: performance.now() };
  }

  const onShorts = () => location.pathname.startsWith('/shorts/');

  function activeVideo() {
    let best = null;
    let bestArea = 0;
    for (const v of document.querySelectorAll('ytd-shorts video')) {
      const r = v.getBoundingClientRect();
      const w = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
      const h = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      const area = Math.max(0, w) * Math.max(0, h);
      if (area > bestArea) { bestArea = area; best = v; }
    }
    return best;
  }

  function panelOpen() {
    return !!document.querySelector(
      'ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]'
    );
  }

  // Why we're not counting right now, or null when we are.
  function holdReason() {
    if (!settings.enabled) return 'off';
    if (document.hidden) return 'hidden';
    if (settings.holdOnComments && panelOpen()) return 'comments';
    if (current && current.paused) return 'paused';
    return null;
  }

  function hook(v) {
    if (hooked.has(v)) return;
    hooked.add(v);
    v.addEventListener('timeupdate', () => {
      if (v !== current) return;
      const d = v.duration;
      const t = v.currentTime;
      if (Number.isFinite(d) && d > 1 && clip.lastTime > d - 1.2 && t < 1) onPlayFinished();
      clip.lastTime = t;
    });
    v.addEventListener('ended', () => { if (v === current) onPlayFinished(); });
  }

  function onPlayFinished() {
    if (performance.now() - clip.since < SETTLE_MS) return;
    clip.loops++;
    const hold = holdReason();
    if (hold && hold !== 'paused') return;
    if (settings.mode === 'end' && clip.loops >= settings.plays) advance();
    else if (settings.mode === 'timer' && settings.endEarly) advance();
  }

  function advance() {
    const btn = document.querySelector('ytd-shorts #navigation-button-down button');
    if (btn && !btn.disabled) {
      btn.click();
    } else {
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40, bubbles: true
      }));
    }
    advanced++;
    clip = freshClip();
  }

  function tick() {
    const now = performance.now();
    const dt = Math.min((now - lastTick) / 1000, 1);
    lastTick = now;
    if (!onShorts()) return;

    if (location.href !== lastUrl) {
      lastUrl = location.href;
      clip = freshClip();
    }

    const v = activeVideo();
    if (v !== current) { current = v; clip.lastTime = 0; }
    if (!v) return;
    hook(v);

    if (holdReason() || v.readyState < 2) return;
    clip.watched += dt;
    if (settings.mode === 'timer' && clip.watched >= settings.seconds) advance();
  }

  setInterval(tick, TICK_MS);

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (msg?.type !== 'status') return;
    reply({
      onShorts: onShorts(),
      hold: holdReason(),
      advanced,
      watched: clip.watched,
      loops: clip.loops,
      duration: current && Number.isFinite(current.duration) ? current.duration : 0,
      time: current ? current.currentTime : 0
    });
  });
})();
