// SoundFX — every sound is synthesized with WebAudio, no audio files, no network.
// A short tone is an oscillator + gain envelope; chords are two tones at once.

export class SoundFX {
  constructor() {
    this.muted = false;
    this.context = null;
  }

  unlock() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.context = new AudioContext();
    }
    if (this.context && this.context.state === 'suspended') this.context.resume();
  }

  setMuted(muted) {
    this.muted = muted;
  }

  tone(freq, startAt, seconds, type, volume) {
    if (this.muted || !this.context) return;
    const now = this.context.currentTime + startAt;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + seconds + 0.05);
  }

  click() {
    this.tone(520, 0, 0.07, 'triangle', 0.12);
  }

  // A found difference: a bright two-note chime, E5 then A5.
  find() {
    this.tone(659.25, 0, 0.16, 'sine', 0.22);
    this.tone(880.0, 0.09, 0.28, 'sine', 0.22);
  }

  // A wrong click: a low, dull buzz.
  wrong() {
    this.tone(140, 0, 0.22, 'square', 0.10);
    this.tone(105, 0.05, 0.25, 'square', 0.08);
  }

  // A hint: one soft high ping.
  hint() {
    this.tone(1174.66, 0, 0.3, 'sine', 0.14);
  }

  // A finished level: a rising four-note arpeggio.
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => this.tone(freq, i * 0.11, 0.34, 'triangle', 0.2));
  }

  // Time running out: two short warning ticks.
  tick() {
    this.tone(980, 0, 0.06, 'square', 0.06);
  }
}
