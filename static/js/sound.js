// Âm thanh tổng hợp bằng Web Audio (không cần file mp3)
const STORAGE_KEY = "hnag_muted";

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem(STORAGE_KEY) === "1";
  }

  _ac() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  _tone(freq, dur, { type = "square", vol = 0.06, delay = 0, slideTo = null } = {}) {
    if (this.muted) return;
    const ac = this._ac();
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  _noise(dur, { vol = 0.4, freq = 900 } = {}) {
    if (this.muted) return;
    const ac = this._ac();
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();
    src.buffer = buf;
    filter.type = "lowpass";
    filter.frequency.value = freq;
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  }

  tick() { this._tone(1500 + Math.random() * 300, 0.035, { vol: 0.035 }); }

  start() { this._tone(220, 0.35, { type: "sawtooth", vol: 0.05, slideTo: 880 }); }

  land() { this._tone(660, 0.12, { type: "triangle", vol: 0.12 }); }

  reveal(tier) {
    // Phẩm chất càng cao, hợp âm càng dài
    const notes = [523, 659, 784, 1047, 1319, 1568];
    const count = Math.min(notes.length, 2 + tier);
    notes.slice(0, count).forEach((f, i) =>
      this._tone(f, 0.5, { type: "triangle", vol: 0.09, delay: i * 0.08 }));
    this._noise(0.5 + tier * 0.15, { vol: 0.25 + tier * 0.08, freq: 600 + tier * 300 });
    if (tier >= 5) {
      [1047, 1319, 1568, 2093].forEach((f, i) =>
        this._tone(f, 0.8, { type: "sine", vol: 0.07, delay: 0.5 + i * 0.12 }));
    }
  }

  toggle() {
    this.muted = !this.muted;
    localStorage.setItem(STORAGE_KEY, this.muted ? "1" : "0");
    return this.muted;
  }
}

export const sound = new SoundFX();
