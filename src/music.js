/**
 * Songkran background music generator using Web Audio API.
 * Plays a Thai-style pentatonic melody in a continuous loop.
 */

// C major pentatonic: C D E G A  (two octaves)
const FREQS = [
  261.63, 293.66, 329.63, 392.00, 440.00,   // C4 D4 E4 G4 A4
  523.25, 587.33, 659.25, 783.99, 880.00,   // C5 D5 E5 G5 A5
]

// Melody pattern: [scaleIndex, durationSec, volumeScale]
// Festive, flowing Songkran-feel melody
const MELODY = [
  [4, .35, 1  ], [4, .18, .7], [6, .35, 1  ], [4, .35, .9],
  [6, .18, .7], [7, .52, 1  ], [6, .18, .6], [4, .35, 1  ],
  [2, .35, .9], [4, .18, .7], [2, .35, .9], [0, .52, .8 ],
  [2, .18, .6], [4, .35, 1  ], [6, .35, 1  ], [7, .18, .8],
  [9, .70, 1  ], [7, .18, .6], [6, .35, 1  ], [4, .35, .9],
  [2, .52, .8], [4, .18, .7], [6, .35, 1  ], [9, .18, .8],
  [7, .35, 1  ], [6, .35, .9], [4, .52, .9], [2, .18, .6],
  [4, .35, 1  ], [6, .52, 1  ], [4, .35, .8], [0, .70, .7],
]

// Gentle bass notes played every beat
const BASS = [0, 2, 0, 4]  // C D C E (one octave down)
const BASS_FREQS = [65.41, 73.42, 82.41, 98.00]  // C2 D2 E2 G2

export function createMusicPlayer() {
  let ctx = null
  let isPlaying = false
  let melodyTimeout = null
  let bassTimeout = null
  let masterGain = null

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)()

      masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.55, ctx.currentTime)
      masterGain.connect(ctx.destination)
    }
    return ctx
  }

  function playOsc(freq, duration, vol, type = 'sine', destination) {
    const c = getCtx()
    const osc  = c.createOscillator()
    const gain = c.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)

    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + 0.025)
    gain.gain.setValueAtTime(vol, c.currentTime + duration * 0.6)
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)

    osc.connect(gain)
    gain.connect(destination || masterGain)

    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration + 0.05)
  }

  // melody loop
  let mIdx = 0
  function scheduleMelody() {
    if (!isPlaying) return
    const [si, dur, vol] = MELODY[mIdx % MELODY.length]
    const freq = FREQS[si]
    playOsc(freq, dur, vol * 0.22)
    // soft harmony a fifth above (every other note)
    if (mIdx % 3 === 0) {
      playOsc(freq * 1.5, dur, vol * 0.06)
    }
    mIdx++
    melodyTimeout = setTimeout(scheduleMelody, dur * 1000)
  }

  // bass loop (every ~0.7s)
  let bIdx = 0
  function scheduleBass() {
    if (!isPlaying) return
    playOsc(BASS_FREQS[bIdx % BASS_FREQS.length], 0.55, 0.08, 'triangle')
    bIdx++
    bassTimeout = setTimeout(scheduleBass, 700)
  }

  return {
    play() {
      if (isPlaying) return
      const c = getCtx()
      if (c.state === 'suspended') c.resume()
      isPlaying = true
      scheduleMelody()
      bassTimeout = setTimeout(scheduleBass, 350) // offset bass
    },
    pause() {
      isPlaying = false
      clearTimeout(melodyTimeout)
      clearTimeout(bassTimeout)
    },
    get playing() { return isPlaying },
  }
}
