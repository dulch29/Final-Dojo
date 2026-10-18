import { 
  playNotificationChime, 
  playHeartbeatTension, 
  playChaosGlitch, 
  playScreenBlackout, 
  playLaserSlice, 
  playVaultLock, 
  playSuccessFanfare,
  toggleMuted,
  getMuted 
} from './sfx.js';
import { fireSplitConfetti, triggerHaptic } from './animations.js';

/**
 * PaySplit Cinematic Video Motion Controller
 * Orchestrates the real-time kinetic animation:
 * 1. Inbound Notification (+฿15,000)
 * 2. Tangled Web of Confusion & Chaos Nodes
 * 3. Screen Blackout (จอมืด!)
 * 4. PaySplit Laser Blade Slice ("ฉึบ!") & 3-Vault Resolution
 */

let timelineTimeouts = [];
let animFrameId = null;
let onCinemaCompleteCallback = null;
let isPlaying = false;

function schedule(fn, delay) {
  const id = setTimeout(fn, delay);
  timelineTimeouts.push(id);
  return id;
}

export function initCinematicMotion({ onComplete }) {
  onCinemaCompleteCallback = onComplete;

  const shell = document.getElementById('view-motion-cinema');
  if (!shell) return;

  const btnSound = document.getElementById('btn-cinema-sound');
  const btnSkip = document.getElementById('btn-cinema-skip');
  const btnReplay = document.getElementById('btn-cinema-replay');
  const btnCta = document.getElementById('btn-cinema-cta');

  // Sound toggle button
  if (btnSound) {
    btnSound.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = toggleMuted();
      btnSound.innerHTML = muted 
        ? `<span class="sound-icon">🔇</span><span>เสียง: ปิด</span>` 
        : `<span class="sound-icon">🔊</span><span>เสียง: เปิด</span>`;
    });
  }

  // Skip button
  if (btnSkip) {
    btnSkip.addEventListener('click', (e) => {
      e.stopPropagation();
      skipCinematic();
    });
  }

  // Replay button
  if (btnReplay) {
    btnReplay.addEventListener('click', (e) => {
      e.stopPropagation();
      startCinematicStory();
    });
  }

  // CTA button
  if (btnCta) {
    btnCta.addEventListener('click', (e) => {
      e.stopPropagation();
      skipCinematic();
    });
  }

  // Auto-play the cinematic on initialization
  startCinematicStory();
}

export function clearTimeline() {
  timelineTimeouts.forEach(t => clearTimeout(t));
  timelineTimeouts = [];
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  isPlaying = false;
}

export function startCinematicStory() {
  clearTimeline();
  isPlaying = true;

  const phone = document.getElementById('cinema-phone');
  const notif = document.getElementById('cinema-inbound-notif');
  const balanceAmount = document.getElementById('phone-balance-num');
  const ambientGlow = document.getElementById('cinema-ambient-glow');
  const blackout = document.getElementById('cinema-blackout');
  const laserBlade = document.getElementById('cinema-laser-blade');
  const resolvedCard = document.getElementById('cinema-resolved-card');
  const captionText = document.getElementById('cinema-caption');
  const laserCanvas = document.getElementById('cinema-laser-svg');
  const chaosBubbles = document.querySelectorAll('.chaos-bubble');
  const vaultRows = document.querySelectorAll('.resolved-vault-row');
  const btnCtaLabel = document.getElementById('cinema-cta-label');

  // Reset elements to initial state
  const balanceCard = document.querySelector('.cinema-phone-balance');
  if (phone) phone.className = 'cinema-center-phone';
  if (notif) {
    notif.classList.remove('visible');
    notif.style.display = 'flex';
  }
  if (balanceCard) {
    balanceCard.style.display = 'block';
    balanceCard.style.opacity = '1';
  }
  if (balanceAmount) {
    balanceAmount.textContent = '฿ 0';
    balanceAmount.style.color = '#FFFFFF';
  }
  if (ambientGlow) ambientGlow.className = 'cinema-ambient-glow';
  if (blackout) blackout.classList.remove('active');
  if (laserBlade) laserBlade.classList.remove('slice');
  if (resolvedCard) {
    resolvedCard.classList.remove('visible');
    resolvedCard.style.display = 'none';
  }
  if (laserCanvas) laserCanvas.innerHTML = '';
  chaosBubbles.forEach(b => b.classList.remove('visible'));
  vaultRows.forEach(r => r.classList.remove('snap-in'));
  if (btnCtaLabel) btnCtaLabel.textContent = 'ข้ามไป Sign In';

  // --------------------------------------------------------------------------
  // STEP 1 (0.2s): Inbound Notification Drops In ("ฉึบ! เงินเข้า ฿15,000")
  // --------------------------------------------------------------------------
  schedule(() => {
    if (captionText) captionText.textContent = 'เงินค่าจ้าง ฿15,000 เพิ่งเข้าบัญชี... 🔔';
    if (notif) notif.classList.add('visible');
    playNotificationChime();
    triggerHaptic('medium');

    // Spin counter up from 0 to 15,000
    let start = 0;
    const target = 15000;
    const duration = 800;
    const startTime = performance.now();

    function countUp(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const current = Math.round(start + (target - start) * (1 - Math.pow(1 - progress, 3)));
      if (balanceAmount) balanceAmount.textContent = `฿ ${current.toLocaleString('th-TH')}`;
      if (progress < 1) {
        animFrameId = requestAnimationFrame(countUp);
      }
    }
    animFrameId = requestAnimationFrame(countUp);
  }, 300);

  // --------------------------------------------------------------------------
  // STEP 2 (2.2s): The Web of Confusion ("กล่องความสับสนโยงเยงไปมา")
  // --------------------------------------------------------------------------
  schedule(() => {
    if (captionText) captionText.textContent = 'แต่ในหัว... ภาระเริ่มผุดขึ้นมาเต็มไปหมด!';
    if (phone) phone.classList.add('cinema-shake');
    if (ambientGlow) ambientGlow.className = 'cinema-ambient-glow chaos';
    if (balanceAmount) balanceAmount.style.color = '#EF4444';

    playHeartbeatTension(1);
    triggerHaptic('heavy');

    // Reveal chaos bubbles in orbit
    chaosBubbles.forEach((b, idx) => {
      schedule(() => {
        b.classList.add('visible');
        playChaosGlitch();
        triggerHaptic('light');
        drawConnectingLine(b);
      }, idx * 280);
    });
  }, 2200);

  // Step 2.5: Faster anxiety heartbeat
  schedule(() => {
    playHeartbeatTension(1.4);
    if (captionText) captionText.textContent = 'ควรแบ่งไปไหนดี? ค่าห้อง? ค่าเน็ต? เงินออม? แล้วเงินกินใช้จริงล่ะ?!';
  }, 3800);

  schedule(() => {
    playHeartbeatTension(1.8);
  }, 4800);

  // --------------------------------------------------------------------------
  // STEP 3 (5.8s): Complete Screen Blackout ("จนจอมืด!")
  // --------------------------------------------------------------------------
  schedule(() => {
    if (blackout) blackout.classList.add('active');
    if (ambientGlow) ambientGlow.className = 'cinema-ambient-glow blackout';
    if (phone) phone.className = 'cinema-center-phone'; // stop shaking
    if (laserCanvas) laserCanvas.innerHTML = '';
    chaosBubbles.forEach(b => b.classList.remove('visible'));
    
    playScreenBlackout();
    triggerHaptic('heavy');
    if (captionText) captionText.textContent = '...เมื่อไม่มีระบบจัดการ ทุกอย่างก็มืดแปดด้าน';
  }, 5800);

  // --------------------------------------------------------------------------
  // STEP 4 (6.8s): The PaySplit Laser Slice & Instant 3-Vault Resolution ("ฉึบ!")
  // --------------------------------------------------------------------------
  schedule(() => {
    if (blackout) blackout.classList.remove('active');
    if (ambientGlow) ambientGlow.className = 'cinema-ambient-glow';
    if (laserBlade) {
      laserBlade.classList.add('slice');
      playLaserSlice();
      triggerHaptic('medium');
    }

    if (captionText) captionText.textContent = 'PaySplit เข้ามาจัดสรร 3 ซองเงินให้ทันที!';

    // Reveal PaySplit Resolved Card inside phone and hide earlier layers
    if (notif) {
      notif.classList.remove('visible');
      notif.style.display = 'none';
    }
    if (balanceCard) {
      balanceCard.style.display = 'none';
    }
    if (resolvedCard) {
      resolvedCard.style.display = 'flex';
      requestAnimationFrame(() => {
        resolvedCard.classList.add('visible');
      });
    }

    // Snap in 3 locked vaults with mechanical clicks
    vaultRows.forEach((row, i) => {
      schedule(() => {
        row.classList.add('snap-in');
        playVaultLock(i);
        triggerHaptic('light');
      }, 350 + i * 220);
    });

    // Finale: Safe-to-Spend reveal & Fanfare!
    schedule(() => {
      playSuccessFanfare();
      fireSplitConfetti();
      triggerHaptic('heavy');
      if (captionText) captionText.textContent = 'ล็อก 3 ซองเรียบร้อย! ส่วนที่เหลือกินใช้ได้ 100% สบายใจ ✨';
      if (btnCtaLabel) btnCtaLabel.textContent = 'เริ่มจัดสรรเงินของคุณ (เข้าสู่ระบบ)';
    }, 1100);
  }, 6800);
}

function drawConnectingLine(bubbleEl) {
  const svg = document.getElementById('cinema-laser-svg');
  const phone = document.getElementById('cinema-phone');
  if (!svg || !phone || !bubbleEl) return;

  const svgRect = svg.getBoundingClientRect();
  const phoneRect = phone.getBoundingClientRect();
  const bubbleRect = bubbleEl.getBoundingClientRect();

  if (svgRect.width && svgRect.height) {
    svg.setAttribute('viewBox', `0 0 ${svgRect.width} ${svgRect.height}`);
  }

  const startX = phoneRect.left + phoneRect.width / 2 - svgRect.left;
  const startY = phoneRect.top + phoneRect.height / 2 - svgRect.top;
  const endX = bubbleRect.left + bubbleRect.width / 2 - svgRect.left;
  const endY = bubbleRect.top + bubbleRect.height / 2 - svgRect.top;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(startX));
  line.setAttribute('y1', String(startY));
  line.setAttribute('x2', String(endX));
  line.setAttribute('y2', String(endY));
  line.setAttribute('stroke', '#EF4444');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('class', 'chaos-laser-line');
  line.setAttribute('opacity', '0.75');

  svg.appendChild(line);
}

export function skipCinematic() {
  clearTimeline();

  const cinemaShell = document.getElementById('view-motion-cinema');
  const onboardingShell = document.getElementById('view-onboarding');

  if (cinemaShell) {
    cinemaShell.style.opacity = '0';
    cinemaShell.style.transform = 'scale(0.96)';
    setTimeout(() => {
      cinemaShell.style.display = 'none';
      if (onboardingShell) {
        onboardingShell.style.display = 'flex';
        onboardingShell.style.opacity = '0';
        onboardingShell.style.transform = 'translateY(12px)';
        requestAnimationFrame(() => {
          onboardingShell.style.transition = 'opacity 350ms cubic-bezier(0.32, 0.72, 0, 1), transform 350ms cubic-bezier(0.32, 0.72, 0, 1)';
          onboardingShell.style.opacity = '1';
          onboardingShell.style.transform = 'translateY(0)';
        });
      }
      if (onCinemaCompleteCallback) onCinemaCompleteCallback();
    }, 300);
  } else {
    if (onCinemaCompleteCallback) onCinemaCompleteCallback();
  }
}

export function replayCinematic() {
  const cinemaShell = document.getElementById('view-motion-cinema');
  const onboardingShell = document.getElementById('view-onboarding');

  if (onboardingShell) onboardingShell.style.display = 'none';
  if (cinemaShell) {
    cinemaShell.style.display = 'flex';
    requestAnimationFrame(() => {
      cinemaShell.style.opacity = '1';
      cinemaShell.style.transform = 'scale(1)';
    });
    startCinematicStory();
  }
}
