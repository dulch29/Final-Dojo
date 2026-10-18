/**
 * PaySplit Dynamic Web Audio Synthesizer
 * Zero-asset, zero-latency procedural SFX tailored for cinematic motion graphics.
 */

let audioCtx = null;
let isMuted = typeof window !== 'undefined' && localStorage.getItem('paysplit_sound') === 'false';

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted) {
  isMuted = muted;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('paysplit_sound', muted ? 'false' : 'true');
  }
}

export function toggleMuted() {
  setMuted(!isMuted);
  return isMuted;
}

export function getMuted() {
  return isMuted;
}

export function isSoundEnabled() {
  return !isMuted;
}

export function setSoundEnabled(enabled) {
  setMuted(!enabled);
}

/**
 * 1. Notification Chime: Bright, celebratory bank inbound bell (+฿15,000)
 */
export function playNotificationChime() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // High cheerful arpeggio: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz) -> E6 (1318Hz)
  const notes = [659.25, 830.61, 987.77, 1318.51];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0, now + idx * 0.06);
    gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.55);
  });
}

/**
 * 2. Tension Heartbeat: Low ominous thumps as anxiety rises
 */
export function playHeartbeatTension(pitchMultiplier = 1) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(65 * pitchMultiplier, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * 3. Chaos Glitch / Electric Buzz: For the tangled confusion web
 */
export function playChaosGlitch() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(880, now + 0.08);
  osc.frequency.linearRampToValueAtTime(140, now + 0.16);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * 4. Screen Blackout: Sudden sub-bass vacuum drop
 */
export function playScreenBlackout() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(24, now + 0.4);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.5);
}

/**
 * 5. PaySplit Laser Blade / Slice: Crisp "ฉึบ!" slicing through chaos
 */
export function playLaserSlice() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // High whip whoosh
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2400, now);
  osc1.frequency.exponentialRampToValueAtTime(320, now + 0.18);

  gain1.gain.setValueAtTime(0.35, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.22);

  // Sub impact thump
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(180, now + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(45, now + 0.25);

  gain2.gain.setValueAtTime(0.4, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.3);
}

/**
 * 6. Vault Lock Click: Mechanical metallic latch (Lock 1, 2, 3)
 */
export function playVaultLock(index = 0) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const baseFreq = 800 + index * 200;
  osc.type = 'square';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * 7. Success Fanfare: Triumphant, harmonic chime for Safe-to-Spend
 */
export function playSuccessFanfare() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C major chord arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.75);
  });
}

/**
 * 8. Tactile Tap: Gentle wooden bubble pop for tabs, toggles, quick pills
 */
export function playTapSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(340, now);
  osc.frequency.exponentialRampToValueAtTime(95, now + 0.04);
  
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * 9. Expense Coin: Bright crisp two-tone metallic tink for money deductions
 */
export function playExpenseCoin() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  [987.77, 783.99].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.045);
    
    gain.gain.setValueAtTime(0, now + idx * 0.045);
    gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.045 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.16);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now + idx * 0.045);
    osc.stop(now + idx * 0.045 + 0.18);
  });
}

/**
 * 10. Safe-to-Spend Celebration: Sparkling uplifting celestial harp chime
 */
export function playSafeSpendCelebration() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  const notes = [392.00, 523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.045);
    
    gain.gain.setValueAtTime(0, now + idx * 0.045);
    gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.045 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.42);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now + idx * 0.045);
    osc.stop(now + idx * 0.045 + 0.45);
  });
}
