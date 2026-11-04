importScripts('settings.js');

function paintBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? '' : 'off' });
  chrome.action.setBadgeBackgroundColor({ color: '#71717a' });
}

chrome.runtime.onInstalled.addListener(async () => {
  const s = await chrome.storage.sync.get(DEFAULTS);
  await chrome.storage.sync.set(s);
  paintBadge(s.enabled);
});

chrome.runtime.onStartup.addListener(async () => {
  const { enabled } = await chrome.storage.sync.get({ enabled: DEFAULTS.enabled });
  paintBadge(enabled);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.enabled) paintBadge(changes.enabled.newValue);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle') return;
  const { enabled } = await chrome.storage.sync.get({ enabled: DEFAULTS.enabled });
  chrome.storage.sync.set({ enabled: !enabled });
});
