// Web Audio Synthesizer & Web Speech API for emergency alert soundscapes

class SoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Futuristic cyber click / transition blip
  playBlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio fallback silent
    }
  }

  // LoRa Mesh Packet beep
  playPacketBeep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  // Emergency Alert System (EAS) Dual-Tone Siren (853Hz + 960Hz)
  playEmergencySiren(durationSec = 2.5) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(853, this.ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(960, this.ctx.currentTime);

      // Volume envelope
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + durationSec - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationSec);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(this.ctx.currentTime + durationSec);
      osc2.stop(this.ctx.currentTime + durationSec);
    } catch {}
  }

  // Success chime
  playSuccessChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
      } catch {}
    });
  }

  // Text-To-Speech reader using Web Speech API
  speakText(text, langCode = 'hi') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Map langCode to BCP-47
    const langMap = {
      hi: 'hi-IN',
      or: 'or-IN',
      bn: 'bn-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      as: 'as-IN',
      pa: 'pa-IN',
      ur: 'ur-IN',
      ks: 'ks-IN',
      ne: 'ne-NP',
      kok: 'kok-IN',
      mai: 'mai-IN',
      sat: 'sat-IN',
      brx: 'brx-IN',
      mni: 'mni-IN',
      doi: 'doi-IN',
      sd: 'sd-IN',
      sa: 'sa-IN',
      bho: 'bho-IN',
      mwr: 'mwr-IN',
      lus: 'lus-IN',
      kha: 'kha-IN',
      es: 'es-ES',
      en: 'en-IN',
    };

    const targetCode = langMap[langCode] || 'hi-IN';
    utterance.lang = targetCode;

    // Try finding matching voice with hierarchical regional fallbacks
    const voices = window.speechSynthesis.getVoices();
    let match = voices.find(v => v.lang === targetCode || v.lang.startsWith(langCode));

    if (!match) {
      // Specialized regional fallbacks
      if (langCode === 'ur') {
        match = voices.find(v => v.lang.startsWith('ur') || v.lang === 'hi-IN');
      } else if (langCode === 'ne') {
        match = voices.find(v => v.lang.startsWith('ne') || v.lang === 'hi-IN');
      } else if (langCode === 'kok') {
        match = voices.find(v => v.lang === 'mr-IN' || v.lang === 'hi-IN');
      } else if (langCode === 'mai' || langCode === 'bho' || langCode === 'mwr' || langCode === 'sa' || langCode === 'doi') {
        match = voices.find(v => v.lang === 'hi-IN');
      } else if (langCode === 'sat' || langCode === 'or') {
        match = voices.find(v => v.lang === 'or-IN' || v.lang === 'bn-IN' || v.lang === 'hi-IN');
      } else if (langCode === 'mni' || langCode === 'brx' || langCode === 'as') {
        match = voices.find(v => v.lang === 'as-IN' || v.lang === 'bn-IN' || v.lang === 'hi-IN');
      } else if (langCode === 'ks') {
        match = voices.find(v => v.lang.startsWith('ur') || v.lang === 'hi-IN');
      } else if (langCode === 'sd') {
        match = voices.find(v => v.lang.startsWith('sd') || v.lang === 'gu-IN' || v.lang === 'hi-IN');
      }
    }

    if (!match) {
      match = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('en'));
    }

    if (match) utterance.voice = match;

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sound = new SoundFX();
