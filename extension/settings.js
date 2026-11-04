// Shared by background, popup and content script.
const DEFAULTS = {
  enabled: true,
  mode: 'end',         // 'end' = after the Short finishes, 'timer' = after N seconds
  plays: 1,            // 'end' mode: how many times to watch before moving on
  seconds: 15,         // 'timer' mode: seconds of playback per Short
  endEarly: true,      // 'timer' mode: also move on if the Short ends first
  holdOnComments: true // don't move while comments or description are open
};
