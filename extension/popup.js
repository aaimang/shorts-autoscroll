const STEPS = {
  plays: [1, 2, 3, 4, 5],
  seconds: [3, 5, 8, 10, 15, 20, 30, 45, 60, 90, 120]
};
const FORMAT = {
  plays: (n) => `${n}×`,
  seconds: (n) => `${n}s`
};

const $ = (id) => document.getElementById(id);
let settings = { ...DEFAULTS };

function render() {
  $('enabled').checked = settings.enabled;
  $('settings').classList.toggle('off', !settings.enabled);
  document.querySelector(`input[name="mode"][value="${settings.mode}"]`).checked = true;
  for (const el of document.querySelectorAll('[data-mode]')) el.hidden = el.dataset.mode !== settings.mode;
  $('endEarly').checked = settings.endEarly;
  $('holdOnComments').checked = settings.holdOnComments;

  for (const key of Object.keys(STEPS)) {
    const list = STEPS[key];
    const i = list.indexOf(settings[key]);
    $(key).textContent = FORMAT[key](settings[key]);
    document.querySelector(`[data-step="${key}"][data-dir="-1"]`).disabled = i <= 0;
    document.querySelector(`[data-step="${key}"][data-dir="1"]`).disabled = i >= list.length - 1;
  }
}

function save(patch) {
  Object.assign(settings, patch);
  chrome.storage.sync.set(patch);
  render();
}

$('enabled').addEventListener('change', (e) => save({ enabled: e.target.checked }));
$('endEarly').addEventListener('change', (e) => save({ endEarly: e.target.checked }));
$('holdOnComments').addEventListener('change', (e) => save({ holdOnComments: e.target.checked }));
for (const r of document.querySelectorAll('input[name="mode"]')) {
  r.addEventListener('change', () => save({ mode: r.value }));
}
for (const b of document.querySelectorAll('[data-step]')) {
  b.addEventListener('click', () => {
    const key = b.dataset.step;
    const list = STEPS[key];
    // Snap to the nearest step in case storage holds an off-list value.
    let i = list.findIndex((n) => n >= settings[key]);
    if (i < 0) i = list.length - 1;
    i = Math.max(0, Math.min(list.length - 1, i + Number(b.dataset.dir)));
    save({ [key]: list[i] });
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  for (const key in changes) settings[key] = changes[key].newValue;
  render();
});

// Live status from the content script in the active tab.
const HOLD_TEXT = {
  off: 'Off',
  hidden: 'Waiting — tab is in the background',
  comments: 'Holding — comments are open',
  paused: 'Holding — video is paused'
};

function showStatus(text, tone, progress, count) {
  $('status').textContent = text;
  $('dot').className = `dot ${tone || ''}`;
  $('bar').parentElement.classList.toggle('idle', progress == null);
  $('bar').style.width = `${Math.round((progress || 0) * 100)}%`;
  $('count').textContent = count ? `${count} Short${count === 1 ? '' : 's'} skipped this tab` : '';
}

async function poll() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let s = null;
  try {
    s = await chrome.tabs.sendMessage(tab.id, { type: 'status' });
  } catch {}

  if (!s || !s.onShorts) {
    showStatus(settings.enabled ? 'Open a YouTube Short to start' : 'Off', '', null, s?.advanced);
    return;
  }
  if (s.hold) {
    showStatus(HOLD_TEXT[s.hold], s.hold === 'off' ? '' : 'wait', null, s.advanced);
    return;
  }

  if (settings.mode === 'timer') {
    const left = Math.max(0, Math.ceil(settings.seconds - s.watched));
    showStatus(`Next Short in ${left}s`, 'live', s.watched / settings.seconds, s.advanced);
  } else {
    const play = Math.min(s.loops + 1, settings.plays);
    const frac = s.duration ? s.time / s.duration : 0;
    const text = settings.plays > 1 ? `Play ${play} of ${settings.plays}` : 'Moves on when this ends';
    showStatus(text, 'live', (s.loops + frac) / settings.plays, s.advanced);
  }
}

chrome.storage.sync.get(DEFAULTS, (s) => {
  settings = s;
  render();
  poll();
  setInterval(poll, 500);
});
