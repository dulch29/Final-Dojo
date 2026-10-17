import { subscribe, getState, receiveIncome, logExpense, updateUserCommitments, resetDemo } from './state.js';
import { renderApp, showToast } from './ui.js';
import { fireSplitConfetti, triggerHaptic } from './animations.js';
import { 
  initAuth, 
  subscribeAuth, 
  loginAsDemoMint, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser, 
  getCurrentUser 
} from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Subscribe UI renderer to Reactive State
  subscribe(renderApp);

  // --------------------------------------------------------------------------
  // 0. Interactive Money Split Simulator (Onboarding Landing Page)
  // --------------------------------------------------------------------------
  const simSlider = document.getElementById('sim-income-slider');
  const simSliderVal = document.getElementById('sim-slider-val');
  const simSafeNum = document.getElementById('sim-safe-num');
  const simValEssentials = document.getElementById('sim-val-essentials');
  const simValBuffer = document.getElementById('sim-val-buffer');
  const simValSavings = document.getElementById('sim-val-savings');

  const updateSimulator = (income) => {
    if (simSliderVal) simSliderVal.textContent = `฿${income.toLocaleString('th-TH')}`;
    const essentials = 6500;
    const buffer = Math.round(income * 0.125);
    const savings = Math.round(income * 0.0833);
    const safeSpend = Math.max(0, income - essentials - buffer - savings);

    if (simSafeNum) simSafeNum.textContent = safeSpend.toLocaleString('th-TH');
    if (simValEssentials) simValEssentials.textContent = `฿${essentials.toLocaleString('th-TH')}`;
    if (simValBuffer) simValBuffer.textContent = `฿${buffer.toLocaleString('th-TH')}`;
    if (simValSavings) simValSavings.textContent = `฿${savings.toLocaleString('th-TH')}`;
  };

  if (simSlider) {
    simSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      updateSimulator(val);
    });
  }

  // --------------------------------------------------------------------------
  // 0.1 View Management: Onboarding vs Main App Shell
  // --------------------------------------------------------------------------
  const viewOnboarding = document.getElementById('view-onboarding');
  const viewAppMain = document.getElementById('view-app-main');
  const bottomNavBar = document.querySelector('.bottom-nav-bar');
  const btnLoginDemo = document.getElementById('btn-login-demo');
  const btnOpenEmailLogin = document.getElementById('btn-open-email-login');
  const btnOpenRegister = document.getElementById('btn-open-register');
  const authModalBackdrop = document.getElementById('auth-modal-backdrop');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
  const tabAuthLogin = document.getElementById('tab-auth-login');
  const tabAuthRegister = document.getElementById('tab-auth-register');
  const formSignIn = document.getElementById('form-sign-in');
  const formRegister = document.getElementById('form-register');
  const authModalTitle = document.getElementById('auth-modal-title');
  const btnUserLogout = document.getElementById('btn-user-logout');
  const btnOpenPersona = document.getElementById('btn-open-persona');

  const showAppView = (user) => {
    if (viewOnboarding) viewOnboarding.style.display = 'none';
    if (viewAppMain) viewAppMain.style.display = 'flex';
    if (bottomNavBar) bottomNavBar.style.display = 'flex';

    if (btnOpenPersona && user) {
      const nameSpan = btnOpenPersona.querySelector('span:last-child');
      if (nameSpan) {
        nameSpan.textContent = user.isDemo ? 'มินท์ (26)' : (user.displayName || 'ผู้ใช้');
      }
    }

    if (user && user.commitments) {
      updateUserCommitments(user.commitments);
    }

    // Seed standard scenario on initial login if not yet seeded
    if (!getState().hasReceivedIncome) {
      receiveIncome(12000, user?.isDemo ? 'งานรีแบรนด์ SME (มาตรฐานมินท์)' : 'เงินโอนรับค่าจ้าง');
    }
  };

  const showOnboardingView = () => {
    if (viewOnboarding) viewOnboarding.style.display = 'flex';
    if (viewAppMain) viewAppMain.style.display = 'none';
    if (bottomNavBar) bottomNavBar.style.display = 'none';
  };

  // Open / Close Auth Modal
  const openAuthModal = (mode = 'login') => {
    if (!authModalBackdrop) return;
    authModalBackdrop.classList.add('open');
    if (mode === 'register') {
      tabAuthRegister?.classList.add('active');
      tabAuthLogin?.classList.remove('active');
      if (formRegister) formRegister.style.display = 'flex';
      if (formSignIn) formSignIn.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'สร้างบัญชีใหม่ (Sign Up)';
    } else {
      tabAuthLogin?.classList.add('active');
      tabAuthRegister?.classList.remove('active');
      if (formSignIn) formSignIn.style.display = 'flex';
      if (formRegister) formRegister.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'เข้าสู่ระบบ (Sign In)';
    }
  };

  const closeAuthModal = () => {
    if (authModalBackdrop) authModalBackdrop.classList.remove('open');
  };

  if (btnLoginDemo) {
    btnLoginDemo.addEventListener('click', async () => {
      triggerHaptic('medium');
      fireSplitConfetti();
      showToast('เข้าสู่ระบบสำเร็จในฐานะ คุณมินท์ (Demo)');
      await loginAsDemoMint();
    });
  }

  if (btnOpenEmailLogin) {
    btnOpenEmailLogin.addEventListener('click', () => openAuthModal('login'));
  }

  if (btnOpenRegister) {
    btnOpenRegister.addEventListener('click', () => openAuthModal('register'));
  }

  if (btnCloseAuthModal) {
    btnCloseAuthModal.addEventListener('click', closeAuthModal);
  }

  if (authModalBackdrop) {
    authModalBackdrop.addEventListener('click', (e) => {
      if (e.target === authModalBackdrop) closeAuthModal();
    });
  }

  if (tabAuthLogin) {
    tabAuthLogin.addEventListener('click', () => {
      tabAuthLogin.classList.add('active');
      tabAuthRegister?.classList.remove('active');
      if (formSignIn) formSignIn.style.display = 'flex';
      if (formRegister) formRegister.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'เข้าสู่ระบบ (Sign In)';
    });
  }

  if (tabAuthRegister) {
    tabAuthRegister.addEventListener('click', () => {
      tabAuthRegister.classList.add('active');
      tabAuthLogin?.classList.remove('active');
      if (formRegister) formRegister.style.display = 'flex';
      if (formSignIn) formSignIn.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'สร้างบัญชีใหม่ (Sign Up)';
    });
  }

  // Handle Sign In Submit
  if (formSignIn) {
    formSignIn.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      const pass = document.getElementById('login-password')?.value;
      if (!email || !pass) return;

      showToast('กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...');
      const res = await loginWithEmail(email, pass);
      if (res.success) {
        closeAuthModal();
        triggerHaptic('medium');
        showToast(`ยินดีต้อนรับกลับ, ${res.user.displayName}!`);
      } else {
        showToast(`เข้าสู่ระบบไม่สำเร็จ: ${res.error}`);
      }
    });
  }

  // Handle Registration Submit
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name')?.value.trim();
      const role = document.getElementById('reg-role')?.value.trim();
      const rent = parseInt(document.getElementById('reg-commitments')?.value, 10) || 6500;
      const email = document.getElementById('reg-email')?.value.trim();
      const pass = document.getElementById('reg-password')?.value;

      if (!email || !pass || !name) return;

      showToast('กำลังสร้างบัญชีผู้ใช้ใหม่...');
      const commitments = {
        rent: rent,
        internet: 0,
        sentHome: 0,
        total: rent
      };

      const res = await registerWithEmail(email, pass, name, role, commitments);
      if (res.success) {
        closeAuthModal();
        triggerHaptic('medium');
        fireSplitConfetti();
        showToast(`สร้างบัญชีสำเร็จ! ยินดีต้อนรับคุณ ${name}`);
      } else {
        showToast(`สร้างบัญชีไม่สำเร็จ: ${res.error}`);
      }
    });
  }

  // Handle Logout
  if (btnUserLogout) {
    btnUserLogout.addEventListener('click', async () => {
      triggerHaptic('light');
      await logoutUser();
      showToast('ออกจากระบบเรียบร้อย');
    });
  }

  // Subscribe to Auth State
  subscribeAuth((user) => {
    if (user) {
      showAppView(user);
    } else {
      showOnboardingView();
    }
  });

  initAuth();

  // --------------------------------------------------------------------------
  // 2. Exact 3-Tab Liquid Curved Navigation (Home: 0, Vaults: 1, Profile: 2)
  // --------------------------------------------------------------------------
  const tabButtons = document.querySelectorAll('.nav-item-btn');
  const tabViews = document.querySelectorAll('.tab-view');
  const curvedNotch = document.getElementById('nav-curved-notch');

  const switchTab = (tabId, index) => {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    tabViews.forEach(view => {
      view.classList.toggle('active', view.id === tabId);
    });

    if (curvedNotch) {
      curvedNotch.setAttribute('data-active', String(index));
    }

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerHaptic('light');
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      const index = parseInt(btn.dataset.index, 10);
      if (targetTab) switchTab(targetTab, index);
    });
  });

  // Quick link from Home mini vault card to Vaults tab (index 1)
  const quickLinkVaults = document.getElementById('quick-link-vaults');
  if (quickLinkVaults) {
    quickLinkVaults.addEventListener('click', () => {
      switchTab('tab-vaults', 1);
    });
  }

  // --------------------------------------------------------------------------
  // 3. Quick Scenario Presets (Hick's Law: 3 Meaningful Income Presets)
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
  // 6. Tactile Quick Expense Chips (Micro-Haptic Push Buttons)
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
  // 7. Reset Demo Actions (Header + Profile Tab)
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

  // --------------------------------------------------------------------------
  // 9. Multi-UI Style Theme System (Neumorphic / Modern Minimal / Glassmorphism)
  // --------------------------------------------------------------------------
  const themeOrder = ['neumorphic', 'minimal', 'glassmorphism'];
  const themeLabels = {
    neumorphic: 'Neo-Tactile Hybrid',
    minimal: 'Modern Minimal',
    glassmorphism: 'Glassmorphism'
  };

  const headerThemeBtn = document.getElementById('btn-header-theme');
  const headerThemeTag = document.getElementById('header-theme-tag');
  const profileThemeLabel = document.getElementById('profile-theme-label');
  const themeCards = document.querySelectorAll('.theme-card');

  let currentTheme = localStorage.getItem('paysplit_theme') || 'neumorphic';

  const applyTheme = (themeName, notifyUser = false) => {
    currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('paysplit_theme', themeName);

    if (headerThemeTag) {
      headerThemeTag.textContent = themeName === 'glassmorphism' ? 'Glass' : (themeName === 'minimal' ? 'Minimal' : 'Hybrid');
    }
    if (profileThemeLabel) {
      profileThemeLabel.textContent = themeLabels[themeName] || themeName;
    }

    themeCards.forEach(card => {
      card.classList.toggle('active', card.dataset.themeChoice === themeName);
    });

    if (notifyUser) {
      triggerHaptic('light');
      showToast(`สลับสไตล์ UI: ${themeLabels[themeName] || themeName}`);
    }
  };

  // Initialize theme on load
  applyTheme(currentTheme, false);

  if (headerThemeBtn) {
    headerThemeBtn.addEventListener('click', () => {
      const nextIndex = (themeOrder.indexOf(currentTheme) + 1) % themeOrder.length;
      applyTheme(themeOrder[nextIndex], true);
    });
  }

  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      const chosen = card.dataset.themeChoice;
      if (chosen && chosen !== currentTheme) {
        applyTheme(chosen, true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 10. Profile Settings & Realistic User Account Handlers
  // --------------------------------------------------------------------------
  const btnProfileOpenPersona = document.getElementById('btn-profile-open-persona');
  if (btnProfileOpenPersona) {
    btnProfileOpenPersona.addEventListener('click', openPersona);
  }

  const btnSettingsOpenProfile = document.getElementById('btn-settings-open-profile');
  if (btnSettingsOpenProfile) {
    btnSettingsOpenProfile.addEventListener('click', openPersona);
  }

  const btnEditRules = document.getElementById('btn-edit-rules');
  if (btnEditRules) {
    btnEditRules.addEventListener('click', () => {
      triggerHaptic('light');
      showToast('ระบบปรับสูตรแบบกำหนดเอง (Custom Rules) พร้อมใช้ใน v1.2');
    });
  }

  const btnEditAvatar = document.getElementById('btn-edit-avatar');
  if (btnEditAvatar) {
    btnEditAvatar.addEventListener('click', () => {
      triggerHaptic('light');
      showToast('อัปเดตรูปโปรไฟล์สำเร็จ');
    });
  }

  const toggleBiometrics = document.getElementById('toggle-biometrics');
  if (toggleBiometrics) {
    toggleBiometrics.addEventListener('change', () => {
      triggerHaptic('light');
      showToast(toggleBiometrics.checked ? 'เปิดใช้งาน Face ID ยืนยันรายการ' : 'ปิดการยืนยันด้วย Face ID');
    });
  }

  const toggleDailyAlert = document.getElementById('toggle-daily-alert');
  if (toggleDailyAlert) {
    toggleDailyAlert.addEventListener('change', () => {
      triggerHaptic('light');
      showToast(toggleDailyAlert.checked ? 'เปิดแจ้งเตือนสรุปงบ Safe-to-Spend รายวัน' : 'ปิดการแจ้งเตือนรายวัน');
    });
  }

  const toggleHaptic = document.getElementById('toggle-haptic');
  if (toggleHaptic) {
    toggleHaptic.addEventListener('change', () => {
      triggerHaptic('light');
      showToast(toggleHaptic.checked ? 'เปิดระบบสั่นจำลองปุ่มกดจริง' : 'ปิดระบบสั่น');
    });
  }

  // --------------------------------------------------------------------------
  // 11. Native Mobile Clock & Keyboard Accessibility
  // --------------------------------------------------------------------------
  const updateClock = () => {
    const clockEl = document.getElementById('status-clock');
    if (clockEl) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}`;
    }
  };
  updateClock();
  setInterval(updateClock, 30000);

  // Global Escape key to dismiss modals & drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeIncomeDrawer();
      closeExpDrawer();
      closePersona();
    }
  });
});
