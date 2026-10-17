import { animateCounter } from './animations.js';

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

  // 4. Activity Ledger
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
