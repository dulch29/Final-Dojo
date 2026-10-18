import { fireSplitConfetti, triggerHaptic } from './animations.js';

/**
 * PaySplit Graphic Motion Intro Choreographer
 * Manages the 3-scene problem narrative and transition to Sign-in
 */

const SCENE_DURATION_MS = 6000; // 6 seconds per scene for comfortable reading

let currentScene = 0;
let sceneTimer = null;
let sceneStartTime = 0;
let isPaused = false;
let progressRaf = null;
let onIntroCompleteCallback = null;

export function initMotionIntro({ onComplete }) {
  onIntroCompleteCallback = onComplete;

  const shell = document.getElementById('view-intro-motion');
  if (!shell) return;

  const btnNext = document.getElementById('btn-intro-action');
  const btnPrev = document.getElementById('btn-intro-prev');
  const btnSkip = document.getElementById('btn-skip-intro');
  const tapLeft = document.getElementById('tap-zone-left');
  const tapRight = document.getElementById('tap-zone-right');

  // Next CTA button
  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('light');
      handleNext();
    });
  }

  // Back button
  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('light');
      handlePrev();
    });
  }

  // Skip button
  if (btnSkip) {
    btnSkip.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('medium');
      finishIntro();
    });
  }

  // Tap zones
  if (tapLeft) {
    tapLeft.addEventListener('click', () => {
      triggerHaptic('light');
      handlePrev();
    });
  }

  if (tapRight) {
    tapRight.addEventListener('click', () => {
      triggerHaptic('light');
      handleNext();
    });
  }

  // Press-and-hold pause
  const handleHoldStart = () => { isPaused = true; };
  const handleHoldEnd = () => { isPaused = false; };

  shell.addEventListener('mousedown', handleHoldStart);
  shell.addEventListener('mouseup', handleHoldEnd);
  shell.addEventListener('touchstart', handleHoldStart, { passive: true });
  shell.addEventListener('touchend', handleHoldEnd);

  // Keyboard navigation (Arrow keys, Space)
  document.addEventListener('keydown', (e) => {
    if (shell.style.display === 'none') return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  });

  // Start with scene 0
  goToScene(0);
}

function updateProgress() {
  if (isPaused) {
    progressRaf = requestAnimationFrame(updateProgress);
    return;
  }

  const elapsed = Date.now() - sceneStartTime;
  const progressPercent = Math.min(100, (elapsed / SCENE_DURATION_MS) * 100);

  const fill = document.querySelector(`.story-progress-track[data-scene="${currentScene}"] .story-progress-fill`);
  if (fill) {
    fill.style.width = `${progressPercent}%`;
  }

  if (elapsed >= SCENE_DURATION_MS) {
    handleNext();
  } else {
    progressRaf = requestAnimationFrame(updateProgress);
  }
}

function handleNext() {
  if (currentScene < 2) {
    goToScene(currentScene + 1);
  } else {
    finishIntro();
  }
}

function handlePrev() {
  if (currentScene > 0) {
    goToScene(currentScene - 1);
  }
}

export function goToScene(index) {
  if (progressRaf) cancelAnimationFrame(progressRaf);

  currentScene = index;
  sceneStartTime = Date.now();

  // 1. Update Segmented Progress Bars
  const tracks = document.querySelectorAll('.story-progress-track');
  tracks.forEach((track, i) => {
    const fill = track.querySelector('.story-progress-fill');
    if (i < index) {
      track.classList.add('completed');
      if (fill) fill.style.width = '100%';
    } else if (i === index) {
      track.classList.remove('completed');
      if (fill) fill.style.width = '0%';
    } else {
      track.classList.remove('completed');
      if (fill) fill.style.width = '0%';
    }
  });

  // 2. Update Active Scene Visibility
  const scenes = document.querySelectorAll('.motion-scene');
  scenes.forEach((sc, i) => {
    sc.classList.toggle('active', i === index);
  });

  // 3. Update Back & Action Buttons
  const btnPrev = document.getElementById('btn-intro-prev');
  const btnActionLabel = document.getElementById('intro-action-label');

  if (btnPrev) {
    btnPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
  }

  if (btnActionLabel) {
    if (index === 0) btnActionLabel.textContent = 'ดูสิ่งที่เกิดขึ้นต่อ';
    else if (index === 1) btnActionLabel.textContent = 'ดูวิธีแก้ปัญหา (The Shield)';
    else if (index === 2) btnActionLabel.textContent = 'เริ่มแยกเงินของคุณ (Sign In)';
  }

  // 4. Scene-specific kinetic effects
  if (index === 0) {
    // Scene 1: Money in euphoria
    setTimeout(() => {
      triggerHaptic('medium');
    }, 250);
  } else if (index === 1) {
    // Scene 2: Ghost bills pop in
    setTimeout(() => {
      triggerHaptic('heavy');
    }, 300);
  } else if (index === 2) {
    // Scene 3: The PaySplit Salvation!
    setTimeout(() => {
      fireSplitConfetti();
      triggerHaptic('medium');
    }, 400);
  }

  // Start progress animation
  progressRaf = requestAnimationFrame(updateProgress);
}

export function finishIntro() {
  if (progressRaf) cancelAnimationFrame(progressRaf);

  const introShell = document.getElementById('view-intro-motion');
  const onboardingShell = document.getElementById('view-onboarding');

  if (introShell) {
    introShell.style.opacity = '0';
    introShell.style.transform = 'scale(0.96)';
    setTimeout(() => {
      introShell.style.display = 'none';
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
      if (onIntroCompleteCallback) onIntroCompleteCallback();
    }, 300);
  } else {
    if (onIntroCompleteCallback) onIntroCompleteCallback();
  }
}

export function replayMotionIntro() {
  const introShell = document.getElementById('view-intro-motion');
  const onboardingShell = document.getElementById('view-onboarding');

  if (onboardingShell) onboardingShell.style.display = 'none';
  if (introShell) {
    introShell.style.display = 'flex';
    requestAnimationFrame(() => {
      introShell.style.opacity = '1';
      introShell.style.transform = 'scale(1)';
    });
    goToScene(0);
  }
}
