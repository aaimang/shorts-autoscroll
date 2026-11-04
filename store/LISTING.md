# Chrome Web Store submission

Copy these answers into the [Developer Dashboard](https://chrome.google.com/webstore/devconsole) when you submit. Upload `dist/shorts-autoscroll-<version>.zip`, created by `scripts/package.sh`.

---

## Store listing tab

**Name** (from the manifest): Shorts Autoscroll

**Summary** (from the manifest, max 132 characters):
> Moves to the next YouTube Short when one ends, or after a set number of seconds.

**Category:** Tools

**Language:** English

**Description:**

```
Stop scrolling by hand every time a Short ends. Shorts Autoscroll moves to the next one for you.

TWO WAYS TO MOVE ON
• When it ends: go to the next Short as soon as the current one finishes. You can also have each one play 2 to 5 times first.
• On a timer: go to the next Short after 3 to 120 seconds of playback. Optionally move on sooner when a Short is shorter than the timer.

STAYS OUT OF YOUR WAY
• Holds while the comments or description panel is open
• Holds while the video is paused
• Holds while the tab is in the background, so you never skip Shorts you didn't see
• Only time spent actually playing counts toward the timer

SIMPLE CONTROLS
• Click the toolbar icon to switch modes and see how long until the next Short
• Alt+Shift+S turns autoscroll on or off (change it at chrome://extensions/shortcuts)

PRIVATE BY DESIGN
No accounts, no tracking, no analytics and no network requests. Your settings stay in Chrome's own sync storage.

Shorts Autoscroll is an independent project and is not affiliated with or endorsed by YouTube or Google.
```

**Graphic assets** (all in this folder):

| Asset | File | Size |
|---|---|---|
| Store icon | `../extension/icons/icon128.png` | 128×128 |
| Screenshot | `screenshot-1.png` | 1280×800 |
| Small promo tile | `promo-small.png` | 440×280 |

**Official URL / Homepage URL:** your GitHub repository URL

**Support URL:** `<repo URL>/issues`

---

## Privacy practices tab

**Single purpose:**
> Automatically moves to the next YouTube Short when the current one ends or after a time the user sets, so the user doesn't have to scroll manually.

**Permission justification: `storage`**
> Saves the user's settings (on/off, mode, number of plays, timer length and two options) so they persist across browser sessions. No other data is stored.

**Permission justification: host permission `https://www.youtube.com/*`** (content script)
> The content script must run on youtube.com to read the Shorts player's playback time and press the player's own "next" button. It matches all of www.youtube.com, not only /shorts/, because YouTube is a single-page app: users usually reach Shorts from the home page or a channel without a full page load, so a script limited to /shorts/ URLs would never be injected. On any other YouTube page the script does nothing.

**Remote code:**
> No, I am not using remote code. All JavaScript is included in the package.

**Data usage:** don't tick any data type. The extension collects none.

Tick all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** the GitHub link to `PRIVACY.md`, e.g. `https://github.com/<user>/shorts-autoscroll/blob/main/PRIVACY.md`

---

## Distribution tab

- **Visibility:** Public (or Unlisted while testing)
- **Regions:** All regions
- **Pricing:** Free

---

## Before each submission

- [ ] Raise `version` in `extension/manifest.json`
- [ ] Load `extension/` unpacked and test on a Short: timer mode, end mode, holding while comments are open
- [ ] Run `./scripts/package.sh` and upload the new zip
- [ ] If permissions changed, update the justifications above
