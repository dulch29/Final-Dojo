import confetti from 'canvas-confetti';

/**
 * Animate a numeric value from start to end with cubic-bezier easing
 * @param {HTMLElement} element 
 * @param {number} startVal 
 * @param {number} endVal 
 * @param {number} duration 
 */
export function animateCounter(element, startVal, endVal, duration = 800) {
  if (!element) return;
  if (startVal === endVal) {
    element.textContent = Number(endVal).toLocaleString('th-TH');
    return;
  }

  const startTime = performance.now();
  element.classList.add('updating');

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease Out Quart: 1 - pow(1 - x, 4)
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    const currentVal = Math.round(startVal + (endVal - startVal) * easeProgress);

    element.textContent = currentVal.toLocaleString('th-TH');

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = Number(endVal).toLocaleString('th-TH');
      setTimeout(() => element.classList.remove('updating'), 200);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Trigger Confetti Explosion for the Instant Split moment
 */
export function fireSplitConfetti() {
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#38BDF8'],
    disableForReducedMotion: true
  });
}

/**
 * Mobile Haptic Feedback Vibration
 */
export function triggerHaptic(type = 'medium') {
  if ('vibrate' in navigator) {
    if (type === 'light') navigator.vibrate(12);
    else if (type === 'medium') navigator.vibrate([18, 40, 18]);
    else if (type === 'heavy') navigator.vibrate([30, 60, 30]);
  }
}
