/**
 * PaySplit Mobile-First Application Controller
 * Modern Minimalist Pastel + Tab Navigation Architecture + Luminous Highlight CTA
 */

import { subscribe, receiveIncome, logExpense, resetDemo } from './state.js';
import { renderApp, showToast } from './ui.js';
import { fireSplitConfetti, triggerHaptic } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Subscribe UI renderer to Reactive State
  subscribe(renderApp);

  // Initialize with Mint's standard scenario: 12,000 THB Branding Job
  receiveIncome(12000, 'งานรีแบรนด์ SME (มาตรฐานมินท์)');

  // --------------------------------------------------------------------------
  // 2. Tab Navigation System (Home, Vaults, Activity, Strategy)
  // --------------------------------------------------------------------------
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  const switchTab = (tabId) => {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    tabViews.forEach(view => {
      view.classList.toggle('active', view.id === tabId);
    });

    // Scroll mobile shell smoothly to top when switching
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerHaptic('light');
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (targetTab) switchTab(targetTab);
    });
  });

  // Quick link from Home mini vault card to Vaults tab
  const quickLinkVaults = document.getElementById('quick-link-vaults');
  if (quickLinkVaults) {
    quickLinkVaults.addEventListener('click', () => {
      switchTab('tab-vaults');
    });
  }

  // --------------------------------------------------------------------------
  // 3. On-Screen Preset Scenario Chips (Instant Income Simulation)
  // --------------------------------------------------------------------------
  const presetChips = document.querySelectorAll('.preset-chip');
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const amount = parseFloat(chip.dataset.amount);
      const note = chip.dataset.note || `ยอดเงินเข้า ${amount.toLocaleString('th-TH')} ฿`;

      const split = receiveIncome(amount, note);
      fireSplitConfetti();
      triggerHaptic('medium');
      showToast(`จัดสรรเงินเรียบร้อย! Safe-to-Spend: ${split.safeSpend.toLocaleString('th-TH')} ฿`);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Highlight Action: "ฉันได้รับเงิน" (Opens Bottom Drawer)
  // --------------------------------------------------------------------------
  const btnOpenIncome = document.getElementById('btn-open-income');
  const incomeDrawerBackdrop = document.getElementById('income-sheet-backdrop');
  const btnCloseIncomeDrawer = document.getElementById('btn-close-income-drawer');
  const btnConfirmDrawerIncome = document.getElementById('btn-confirm-drawer-income');
  const drawerIncomeInput = document.getElementById('drawer-income-input');

  const openIncomeDrawer = () => {
    if (incomeDrawerBackdrop) incomeDrawerBackdrop.classList.add('open');
    if (drawerIncomeInput) drawerIncomeInput.focus();
  };

  const closeIncomeDrawer = () => {
    if (incomeDrawerBackdrop) incomeDrawerBackdrop.classList.remove('open');
  };

  if (btnOpenIncome) btnOpenIncome.addEventListener('click', openIncomeDrawer);
  if (btnCloseIncomeDrawer) btnCloseIncomeDrawer.addEventListener('click', closeIncomeDrawer);
  if (incomeDrawerBackdrop) {
    incomeDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === incomeDrawerBackdrop) closeIncomeDrawer();
    });
  }

  if (btnConfirmDrawerIncome) {
    btnConfirmDrawerIncome.addEventListener('click', () => {
      const amount = parseFloat(drawerIncomeInput && drawerIncomeInput.value) || 0;
      if (amount <= 0) {
        showToast('กรุณาระบุจำนวนเงินที่ถูกต้อง');
        return;
      }

      presetChips.forEach(c => {
        c.classList.toggle('active', c.dataset.amount === String(amount));
      });

      const split = receiveIncome(amount, `รับเงินโอน ${amount.toLocaleString('th-TH')} ฿`);
      closeIncomeDrawer();
      fireSplitConfetti();
      triggerHaptic('heavy');
      showToast(`จัดสรรเงินสำเร็จ! Safe-to-Spend: ${split.safeSpend.toLocaleString('th-TH')} ฿`);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Expense Actions: "หักรายจ่าย" & "+ ระบุเอง" (Opens Expense Drawer)
  // --------------------------------------------------------------------------
  const btnOpenExpense = document.getElementById('btn-open-expense');
  const btnCustomExpChip = document.getElementById('btn-custom-exp-chip');
  const expenseDrawerBackdrop = document.getElementById('expense-sheet-backdrop');
  const btnCloseExpDrawer = document.getElementById('btn-close-exp-drawer');
  const btnConfirmDrawerExp = document.getElementById('btn-confirm-drawer-exp');
  const drawerExpName = document.getElementById('drawer-exp-name');
  const drawerExpAmount = document.getElementById('drawer-exp-amount');

  const openExpenseDrawer = () => {
    if (expenseDrawerBackdrop) expenseDrawerBackdrop.classList.add('open');
  };

  const closeExpenseDrawer = () => {
    if (expenseDrawerBackdrop) expenseDrawerBackdrop.classList.remove('open');
  };

  if (btnOpenExpense) btnOpenExpense.addEventListener('click', openExpenseDrawer);
  if (btnCustomExpChip) btnCustomExpChip.addEventListener('click', openExpenseDrawer);
  if (btnCloseExpDrawer) btnCloseExpDrawer.addEventListener('click', closeExpenseDrawer);
  if (expenseDrawerBackdrop) {
    expenseDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === expenseDrawerBackdrop) closeExpenseDrawer();
    });
  }

  if (btnConfirmDrawerExp) {
    btnConfirmDrawerExp.addEventListener('click', () => {
      const name = (drawerExpName && drawerExpName.value.trim()) || 'ค่าใช้จ่ายทั่วไป';
      const amount = parseFloat(drawerExpAmount && drawerExpAmount.value) || 0;

      if (amount <= 0) {
        showToast('กรุณาระบุยอดเงินมากกว่า 0');
        return;
      }

      logExpense(name, amount, 'safe');
      closeExpenseDrawer();
      triggerHaptic('medium');
      showToast(`บันทึก ${name} -${amount} ฿ (หักจาก Safe-to-Spend สำเร็จ)`);
    });
  }

  // --------------------------------------------------------------------------
  // 6. Tactile Quick Expense Chips (Instant Click)
  // --------------------------------------------------------------------------
  const quickChips = document.querySelectorAll('.neu-expense-btn:not(#btn-custom-exp-chip)');
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const name = chip.dataset.name;
      const amount = parseFloat(chip.dataset.amount);
      const category = chip.dataset.category || 'safe';

      logExpense(name, amount, category);
      triggerHaptic('light');
      showToast(`บันทึก ${name} -${amount} ฿ (ค่าห้องยังปลอดภัย 100%)`);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Reset Demo Actions (Header + Strategy Tab)
  // --------------------------------------------------------------------------
  const handleReset = () => {
    resetDemo();
    presetChips.forEach(c => c.classList.remove('active'));
    triggerHaptic('light');
    showToast('รีเซ็ตเดโมเรียบร้อย');
  };

  const btnReset = document.getElementById('btn-reset-demo');
  if (btnReset) btnReset.addEventListener('click', handleReset);

  const btnStrategyReset = document.getElementById('btn-strategy-reset');
  if (btnStrategyReset) btnStrategyReset.addEventListener('click', handleReset);

  // --------------------------------------------------------------------------
  // 8. Persona Context Drawer
  // --------------------------------------------------------------------------
  const btnOpenPersona = document.getElementById('btn-open-persona');
  const btnInfoSafe = document.getElementById('btn-info-safe');
  const personaBackdrop = document.getElementById('persona-modal-backdrop');
  const btnClosePersona = document.getElementById('btn-close-persona-drawer');
  const btnClosePersonaConfirm = document.getElementById('btn-close-persona-confirm');

  const openPersona = () => {
    if (personaBackdrop) personaBackdrop.classList.add('open');
  };

  const closePersona = () => {
    if (personaBackdrop) personaBackdrop.classList.remove('open');
  };

  if (btnOpenPersona) btnOpenPersona.addEventListener('click', openPersona);
  if (btnInfoSafe) btnInfoSafe.addEventListener('click', openPersona);
  if (btnClosePersona) btnClosePersona.addEventListener('click', closePersona);
  if (btnClosePersonaConfirm) btnClosePersonaConfirm.addEventListener('click', closePersona);
  if (personaBackdrop) {
    personaBackdrop.addEventListener('click', (e) => {
      if (e.target === personaBackdrop) closePersona();
    });
  }
});
