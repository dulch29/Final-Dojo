import { animateCounter } from './animations.js';
import { ALLOCATION_PLANS } from './state.js';

let prevValues = {
  safe: 3000,
  essentials: 6500,
  buffer: 1500,
  savings: 1000,
  total: 12000
};

/**
 * Toast Notification Dispatcher
 */
export function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `<span style="color: var(--highlight-main); font-weight: bold;">✓</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 210);
  }, 2800);
}

/**
 * Render Complete Application UI
 */
export function renderApp(state) {
  // 1. Safe-to-Spend Metric
  const safeEl = document.getElementById('safe-spend-amount');
  if (safeEl) {
    animateCounter(safeEl, prevValues.safe, state.safeSpendBalance, 500);
  }

  // Status Message
  const statusMsg = document.getElementById('safe-status-msg');
  if (statusMsg) {
    if (!state.hasReceivedIncome || state.incomeTotal === 0) {
      statusMsg.textContent = 'แตะรับเงินเพื่อเริ่มจัดสรร';
    } else if (state.safeSpendBalance > 0) {
      statusMsg.textContent = 'ล็อก 3 ซองแล้ว · ปลอดภัย 100%';
    } else {
      statusMsg.textContent = 'ใช้ครบแล้ว · ค่าห้องยังปลอดภัย 100%';
    }
  }

  // Burn Pacing Guide
  const perDayEl = document.getElementById('val-per-day');
  const perWeekEl = document.getElementById('val-per-week');
  const runwayEl = document.getElementById('val-runway');

  const perDay = Math.max(0, Math.round(state.safeSpendBalance / 30));
  const perWeek = Math.max(0, Math.round(state.safeSpendBalance / 4));

  if (perDayEl) perDayEl.textContent = `฿${perDay.toLocaleString('th-TH')}`;
  if (perWeekEl) perWeekEl.textContent = `฿${perWeek.toLocaleString('th-TH')}`;
  if (runwayEl) runwayEl.textContent = state.safeSpendBalance > 0 ? '30 วัน' : '0 วัน';

  // 2. The 3 Dedicated Vaults
  const essentialsEl = document.getElementById('amount-essentials');
  const bufferEl = document.getElementById('amount-buffer');
  const savingsEl = document.getElementById('amount-savings');

  if (essentialsEl) animateCounter(essentialsEl, prevValues.essentials, state.essentialsBalance, 400);
  if (bufferEl) animateCounter(bufferEl, prevValues.buffer, state.bufferBalance, 400);
  if (savingsEl) animateCounter(savingsEl, prevValues.savings, state.savingsBalance, 400);

  // 3. Liquid Split Progress Bar
  const totalIncome = state.incomeTotal || 1;
  const barEssentials = document.getElementById('bar-essentials');
  const barBuffer = document.getElementById('bar-buffer');
  const barSavings = document.getElementById('bar-savings');
  const barSafe = document.getElementById('bar-safe');
  const displayTotal = document.getElementById('display-income-total');

  if (displayTotal) {
    displayTotal.textContent = `ยอดรับเข้า ฿${state.incomeTotal.toLocaleString('th-TH')}`;
  }

  if (barEssentials && barBuffer && barSavings && barSafe) {
    if (state.incomeTotal > 0) {
      barEssentials.style.width = `${(state.essentialsBalance / totalIncome) * 100}%`;
      barBuffer.style.width = `${(state.bufferBalance / totalIncome) * 100}%`;
      barSavings.style.width = `${(state.savingsBalance / totalIncome) * 100}%`;
      barSafe.style.width = `${(state.safeSpendBalance / totalIncome) * 100}%`;
    } else {
      barEssentials.style.width = '0%';
      barBuffer.style.width = '0%';
      barSavings.style.width = '0%';
      barSafe.style.width = '0%';
    }
  }

  // 4. Update Active Plan UI Badges
  const plan = ALLOCATION_PLANS[state.activePlan] || ALLOCATION_PLANS.freelance_safety;
  const homePlanBadge = document.getElementById('home-active-plan-badge');
  if (homePlanBadge) {
    homePlanBadge.innerHTML = `<span class="plan-pill-icon">${plan.emoji}</span> <span>${plan.shortName}</span>`;
  }

  const settingsPlanName = document.getElementById('settings-active-plan-name');
  const settingsPlanDesc = document.getElementById('settings-active-plan-desc');
  if (settingsPlanName) settingsPlanName.textContent = `${plan.emoji} ${plan.name}`;
  if (settingsPlanDesc) settingsPlanDesc.textContent = plan.description;

  // Highlight active plan card in drawer if open
  document.querySelectorAll('.plan-option-card').forEach(card => {
    const isSelected = card.dataset.planId === state.activePlan;
    card.classList.toggle('active', isSelected);
    const radio = card.querySelector('.plan-radio-dot');
    if (radio) radio.classList.toggle('active', isSelected);
  });

  // 5. Activity Ledger
  const txList = document.getElementById('tx-list');
  const txCount = document.getElementById('tx-count');

  if (txCount) {
    txCount.textContent = `${state.transactions.length} รายการ`;
  }

  if (txList) {
    if (state.transactions.length === 0) {
      txList.innerHTML = `
        <li style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 0.78rem;">
          ยังไม่มีรายการใช้จ่ายในรอบนี้
        </li>
      `;
    } else {
      txList.innerHTML = state.transactions.map(tx => {
        const isIncome = tx.type === 'income';
        const colorClass = isIncome ? 'income' : '';
        const prefix = isIncome ? '+฿' : '-฿';
        const categoryLabel = tx.category === 'safe'
          ? 'หักจาก: Safe-to-Spend'
          : (tx.category === 'essentials' ? 'หักจาก: ค่าใช้จ่ายจำเป็น' : 'เงินเข้ากระเป๋า');

        return `
          <li class="ledger-entry">
            <div>
              <div class="ledger-entry-title">${tx.name}</div>
              <div class="ledger-entry-meta">${categoryLabel} • ${tx.time}</div>
            </div>
            <span class="ledger-entry-amt ${colorClass}">${prefix}${tx.amount.toLocaleString('th-TH')}</span>
          </li>
        `;
      }).join('');
    }
  }

  // Save current values for next animation frame
  prevValues = {
    safe: state.safeSpendBalance,
    essentials: state.essentialsBalance,
    buffer: state.bufferBalance,
    savings: state.savingsBalance,
    total: state.incomeTotal
  };
}

/**
 * Extract 2-letter uppercase initials from name
 */
function getInitials(name = '') {
  if (!name) return 'PS';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Synchronize User Profile Across All UI Surfaces
 * @param {object} user 
 */
export function syncUserProfileUI(user) {
  if (!user) return;

  const isDemo = Boolean(user.isDemo);
  const initials = isDemo ? 'MR' : getInitials(user.displayName);
  const displayName = isDemo ? 'มินท์ (26) · Demo' : (user.displayName || 'ผู้ใช้งาน');
  const fullDisplayName = isDemo ? 'มินท์ รัตนสุวรรณ' : (user.displayName || 'ผู้ใช้งาน');
  const role = isDemo ? 'Freelance Brand & UI Designer · หาดใหญ่' : (user.role || 'ฟรีแลนซ์');
  const email = user.email || (isDemo ? 'mint.design@email.com' : '-');

  // 1. Top Bar Persona Pill
  const headerAvatar = document.getElementById('header-user-avatar');
  const headerName = document.getElementById('header-user-name');
  if (headerAvatar) headerAvatar.textContent = initials;
  if (headerName) headerName.textContent = displayName;

  // 2. Settings Tab Profile Capsule
  const settingsAvatar = document.getElementById('settings-user-avatar');
  const settingsName = document.getElementById('settings-user-name');
  const settingsRole = document.getElementById('settings-user-role');
  const settingsTag = document.getElementById('settings-user-tag');

  if (settingsAvatar) settingsAvatar.textContent = initials;
  if (settingsName) settingsName.textContent = fullDisplayName;
  if (settingsRole) settingsRole.textContent = `${role} · ${email}`;
  if (settingsTag) {
    settingsTag.textContent = isDemo ? 'บัญชีทดสอบ Demo' : 'ผู้ใช้งานจริง (Active)';
    settingsTag.style.background = isDemo ? '#FEF3C7' : '#D1FAE5';
    settingsTag.style.color = isDemo ? '#92400E' : '#065F46';
  }

  // 3. Persona / Profile Bottom Drawer Modal
  const modalAvatar = document.getElementById('modal-user-avatar');
  const modalName = document.getElementById('modal-user-name');
  const modalRole = document.getElementById('modal-user-role');
  const modalEmail = document.getElementById('modal-user-email');
  const modalBadge = document.getElementById('modal-user-badge');
  const demoStoryBox = document.getElementById('demo-persona-story-box');
  const userCommitmentsBox = document.getElementById('user-commitments-edit-box');

  if (modalAvatar) modalAvatar.textContent = initials;
  if (modalName) modalName.textContent = fullDisplayName;
  if (modalRole) modalRole.textContent = role;
  if (modalEmail) modalEmail.textContent = email;
  if (modalBadge) {
    modalBadge.innerHTML = isDemo
      ? `<span class="badge-dot-amber"></span> <span>Demo Account (คุณมินท์)</span>`
      : `<span class="badge-dot-green"></span> <span>ยืนยันข้อมูลเรียบร้อย</span>`;
  }

  // Toggle Demo backstory vs Real User Commitment Editor
  if (demoStoryBox) {
    demoStoryBox.style.display = isDemo ? 'block' : 'none';
  }
  if (userCommitmentsBox) {
    userCommitmentsBox.style.display = isDemo ? 'none' : 'block';
  }

  // Populate Commitment inputs if user has commitments
  if (user.commitments) {
    const rentInput = document.getElementById('edit-commit-rent');
    const netInput = document.getElementById('edit-commit-net');
    const homeInput = document.getElementById('edit-commit-home');
    const totalDisplay = document.getElementById('edit-commit-total-display');

    if (rentInput) rentInput.value = user.commitments.rent || 0;
    if (netInput) netInput.value = user.commitments.internet || 0;
    if (homeInput) homeInput.value = user.commitments.sentHome || 0;
    if (totalDisplay) {
      const sum = (user.commitments.rent || 0) + (user.commitments.internet || 0) + (user.commitments.sentHome || 0);
      totalDisplay.textContent = `฿${sum.toLocaleString('th-TH')}/เดือน`;
    }
  }
}
