// ── Tiny Web Audio sound engine (no audio files) ─────────────────────────────
// Used by Bomb Pass. (Spin of Doom / Star Slots keep their own copies for now —
// they can be moved onto this file during the cleanup phase.)

let ctx = null
let muted = false

function ac() {
  if (muted) return null
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch { return null }
}

export function setMuted(m) { muted = !!m }
export function isMuted() { return muted }
/** Call from a click handler so browsers allow audio. */
export function unlockAudio() { try { ac() } catch { /* ignore */ } }

function tone(freq, dur, { type = 'sine', vol = 0.15, delay = 0, slide = 0 } = {}) {
  const c = ac(); if (!c) return
  const t = c.currentTime + delay
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(c.destination)
  o.start(t); o.stop(t + dur + 0.02)
}

function noise(dur, { vol = 0.3, delay = 0 } = {}) {
  const c = ac(); if (!c) return
  const t = c.currentTime + delay
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const s = c.createBufferSource(), g = c.createGain()
  s.buffer = buf
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(g); g.connect(c.destination)
  s.start(t)
}

export const sfx = {
  tick(heat = 0) { tone(700 + heat * 500, 0.05, { type: 'square', vol: 0.07 + heat * 0.06 }) },
  correct() { tone(660, 0.12, { type: 'triangle' }); tone(880, 0.12, { type: 'triangle', delay: 0.1 }); tone(1320, 0.2, { type: 'triangle', delay: 0.2 }) },
  wrong() { tone(220, 0.25, { type: 'sawtooth', vol: 0.12, slide: -90 }); tone(150, 0.3, { type: 'sawtooth', vol: 0.12, delay: 0.15 }) },
  pass() { tone(400, 0.18, { type: 'sine', vol: 0.12, slide: 700 }) },
  shield() { tone(520, 0.1, { type: 'triangle' }); tone(780, 0.1, { type: 'triangle', delay: 0.08 }); tone(1040, 0.25, { type: 'triangle', delay: 0.16 }) },
  boom() { noise(0.9, { vol: 0.5 }); tone(90, 0.7, { type: 'sawtooth', vol: 0.25, slide: -60 }) },
  start() { tone(330, 0.1, { type: 'square', vol: 0.08 }); tone(494, 0.1, { type: 'square', vol: 0.08, delay: 0.1 }); tone(659, 0.2, { type: 'square', vol: 0.08, delay: 0.2 }) },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', delay: i * 0.14 })); tone(1047, 0.6, { type: 'triangle', delay: 0.6 }) },
}
