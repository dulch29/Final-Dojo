import { 
  subscribe, 
  getState, 
  receiveIncome, 
  logExpense, 
  updateUserCommitments, 
  resetDemo,
  resetToNewUser,
  updateSavingsGoal,
  setAllocationPlan,
  ALLOCATION_PLANS
} from './state.js';
import { renderApp, showToast, syncUserProfileUI } from './ui.js';
import { fireSplitConfetti, fireMiniConfetti, triggerHaptic } from './animations.js';
import { 
  playNotificationChime,
  playSuccessFanfare,
  playTapSound,
  playExpenseCoin,
  playSafeSpendCelebration,
  isSoundEnabled,
  setSoundEnabled
} from './sfx.js';
import { 
  initAuth, 
  subscribeAuth, 
  loginAsDemoMint, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser, 
  getCurrentUser,
  updateCurrentUserProfile 
} from './auth.js';
import { initCinematicMotion, replayCinematic } from './motion-cinematic.js';

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
  // 0.1 View Management: Cinematic Motion Video -> Onboarding / Sign-in -> App Shell
  // --------------------------------------------------------------------------
  const viewMotionCinema = document.getElementById('view-motion-cinema');
  const viewOnboarding = document.getElementById('view-onboarding');
  const viewAppMain = document.getElementById('view-app-main');
  const bottomNavBar = document.querySelector('.bottom-nav-bar');
  const btnLoginDemo = document.getElementById('btn-login-demo');
  const btnOpenEmailLogin = document.getElementById('btn-open-email-login');
  const btnOpenRegister = document.getElementById('btn-open-register');
  const btnReplayIntro = document.getElementById('btn-replay-intro');
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
    if (viewMotionCinema) viewMotionCinema.style.display = 'none';
    if (viewOnboarding) viewOnboarding.style.display = 'none';
    if (viewAppMain) viewAppMain.style.display = 'flex';
    if (bottomNavBar) bottomNavBar.style.display = 'flex';

    if (user) {
      syncUserProfileUI(user);
      if (user.isDemo) {
        if (user.commitments) {
          updateUserCommitments(user.commitments);
        }
        // Seed standard scenario on initial login for demo persona
        if (!getState().hasReceivedIncome) {
          receiveIncome(12000, 'งานรีแบรนด์ SME (มาตรฐานมินท์)');
        }
      } else {
        // Real authenticated user
        if (user.commitments) {
          updateUserCommitments(user.commitments);
        }
        if (user.activePlan) {
          setAllocationPlan(user.activePlan);
        }
        if (user.savingsGoal) {
          updateSavingsGoal(user.savingsGoal);
        }
        // If brand new user with no income, guarantee completely clean 0 balance state
        if (user.isNewUser && !getState().hasReceivedIncome) {
          resetToNewUser(user.commitments, user.activePlan || 'freelance_safety', user.savingsGoal);
        }
      }
    }
  };

  const showOnboardingView = () => {
    if (viewAppMain) viewAppMain.style.display = 'none';
    if (bottomNavBar) bottomNavBar.style.display = 'none';

    // Check if user already skipped or watched cinematic video in this session
    const hasSeenIntro = sessionStorage.getItem('paysplit_cinema_seen');
    if (hasSeenIntro) {
      if (viewMotionCinema) viewMotionCinema.style.display = 'none';
      if (viewOnboarding) viewOnboarding.style.display = 'flex';
    } else {
      if (viewMotionCinema) {
        viewMotionCinema.style.display = 'flex';
        if (viewOnboarding) viewOnboarding.style.display = 'none';
      } else {
        if (viewOnboarding) viewOnboarding.style.display = 'flex';
      }
    }
  };

  // Initialize Cinematic Video Motion Graphic Storytelling
  initCinematicMotion({
    onComplete: () => {
      sessionStorage.setItem('paysplit_cinema_seen', 'true');
    }
  });

  if (btnReplayIntro) {
    btnReplayIntro.addEventListener('click', () => {
      triggerHaptic('medium');
      sessionStorage.removeItem('paysplit_cinema_seen');
      replayCinematic();
    });
  }

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

  // --------------------------------------------------------------------------
  // Register Form: Plan Selection & Block-based Commitments
  // --------------------------------------------------------------------------
  let registeredCommitmentItems = [];

  const regPlanChips = document.querySelectorAll('.reg-plan-chip');
  const regSelectedPlan = document.getElementById('reg-selected-plan');
  if (regPlanChips.length > 0) {
    regPlanChips.forEach(chip => {
      chip.addEventListener('click', () => {
        regPlanChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (regSelectedPlan) {
          regSelectedPlan.value = chip.dataset.plan || 'freelance_safety';
        }
        triggerHaptic('light');
      });
    });
  }

  const commitmentPresetBlocks = document.querySelectorAll('.commit-block-btn:not(.btn-add-custom-block)');
  const activeCommitmentsTray = document.getElementById('active-commitments-tray');
  const trayEmptyHint = document.getElementById('tray-empty-hint');
  const trayItemsList = document.getElementById('tray-items-list');
  const regCommitmentsTotalBadge = document.getElementById('reg-commitments-total-badge');
  const btnToggleCustomCommitment = document.getElementById('btn-toggle-custom-commitment');
  const customCommitInlineBox = document.getElementById('custom-commit-inline-box');
  const btnConfirmAddCustomCommit = document.getElementById('btn-confirm-add-custom-commit');
  const customCommitName = document.getElementById('custom-commit-name');
  const customCommitAmount = document.getElementById('custom-commit-amount');

  function renderCommitmentTray() {
    if (!trayItemsList) return;
    if (registeredCommitmentItems.length === 0) {
      if (trayEmptyHint) trayEmptyHint.style.display = 'block';
      trayItemsList.innerHTML = '';
      if (regCommitmentsTotalBadge) regCommitmentsTotalBadge.textContent = 'รวม: ฿0/เดือน';
      return;
    }

    if (trayEmptyHint) trayEmptyHint.style.display = 'none';

    let total = 0;
    trayItemsList.innerHTML = registeredCommitmentItems.map((item, idx) => {
      const amt = parseInt(item.amount, 10) || 0;
      total += amt;
      return `
        <div class="tray-item-row" data-id="${item.id}">
          <div class="tray-item-info">
            <span>${item.emoji || '🔒'}</span>
            <span>${item.name}</span>
          </div>
          <div class="tray-item-input-wrap">
            <input type="number" class="tray-item-input" data-index="${idx}" value="${amt}" min="0" step="100" inputmode="numeric">
            <span style="font-size: 0.74rem; color: var(--text-muted);">฿</span>
            <button type="button" class="btn-tray-remove" data-index="${idx}" aria-label="ลบรายการ">✕</button>
          </div>
        </div>
      `;
    }).join('');

    if (regCommitmentsTotalBadge) {
      regCommitmentsTotalBadge.textContent = `รวม: ฿${total.toLocaleString('th-TH')}/เดือน`;
    }

    // Attach listeners to tray inputs & remove buttons
    trayItemsList.querySelectorAll('.tray-item-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (registeredCommitmentItems[idx]) {
          registeredCommitmentItems[idx].amount = parseInt(e.target.value, 10) || 0;
          let currentTotal = registeredCommitmentItems.reduce((sum, it) => sum + (parseInt(it.amount, 10) || 0), 0);
          if (regCommitmentsTotalBadge) {
            regCommitmentsTotalBadge.textContent = `รวม: ฿${currentTotal.toLocaleString('th-TH')}/เดือน`;
          }
        }
      });
    });

    trayItemsList.querySelectorAll('.btn-tray-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        const removed = registeredCommitmentItems.splice(idx, 1)[0];
        if (removed && removed.key) {
          const matchingPreset = document.querySelector(`.commit-block-btn[data-key="${removed.key}"]`);
          if (matchingPreset) matchingPreset.classList.remove('active');
        }
        triggerHaptic('light');
        renderCommitmentTray();
      });
    });
  }

  // Toggle preset blocks
  commitmentPresetBlocks.forEach(block => {
    block.addEventListener('click', () => {
      const key = block.dataset.key;
      const name = block.dataset.name;
      const amount = parseInt(block.dataset.amount, 10) || 0;
      const emoji = block.dataset.emoji || '🔒';

      const existingIndex = registeredCommitmentItems.findIndex(i => i.key === key);
      if (existingIndex >= 0) {
        registeredCommitmentItems.splice(existingIndex, 1);
        block.classList.remove('active');
      } else {
        registeredCommitmentItems.push({
          id: 'c-' + key + '-' + Date.now(),
          key,
          name,
          amount,
          emoji
        });
        block.classList.add('active');
      }
      triggerHaptic('light');
      renderCommitmentTray();
    });
  });

  // Toggle custom commitment input box
  if (btnToggleCustomCommitment && customCommitInlineBox) {
    btnToggleCustomCommitment.addEventListener('click', () => {
      const isVisible = customCommitInlineBox.style.display === 'block';
      customCommitInlineBox.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && customCommitName) customCommitName.focus();
    });
  }

  if (btnConfirmAddCustomCommit) {
    btnConfirmAddCustomCommit.addEventListener('click', () => {
      const name = customCommitName?.value.trim();
      const amount = parseInt(customCommitAmount?.value, 10) || 0;
      if (!name) {
        showToast('กรุณาระบุชื่อรายการ');
        return;
      }
      registeredCommitmentItems.push({
        id: 'c-custom-' + Date.now(),
        name,
        amount,
        emoji: '📌'
      });
      if (customCommitName) customCommitName.value = '';
      if (customCommitAmount) customCommitAmount.value = '';
      if (customCommitInlineBox) customCommitInlineBox.style.display = 'none';
      triggerHaptic('medium');
      renderCommitmentTray();
    });
  }

  // Handle Registration Submit
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name')?.value.trim();
      const role = document.getElementById('reg-role')?.value.trim();
      const email = document.getElementById('reg-email')?.value.trim();
      const pass = document.getElementById('reg-password')?.value;
      const activePlan = document.getElementById('reg-selected-plan')?.value || 'freelance_safety';
      const savingsTitle = document.getElementById('reg-savings-title')?.value.trim() || 'เงินสำรองฉุกเฉิน';
      const savingsTarget = parseInt(document.getElementById('reg-savings-target')?.value, 10) || 30000;

      if (!email || !pass || !name) return;

      const totalCommitments = registeredCommitmentItems.reduce((sum, it) => sum + (parseInt(it.amount, 10) || 0), 0);
      const rentItem = registeredCommitmentItems.find(i => i.key === 'rent');
      const netItem = registeredCommitmentItems.find(i => i.key === 'internet' || i.key === 'utilities');
      const homeItem = registeredCommitmentItems.find(i => i.key === 'home');

      const commitments = {
        rent: rentItem ? parseInt(rentItem.amount, 10) : 0,
        internet: netItem ? parseInt(netItem.amount, 10) : 0,
        sentHome: homeItem ? parseInt(homeItem.amount, 10) : 0,
        total: totalCommitments,
        items: registeredCommitmentItems.map(i => ({
          id: i.id,
          name: i.name,
          amount: parseInt(i.amount, 10) || 0,
          emoji: i.emoji || '🔒'
        }))
      };

      const savingsGoal = {
        title: savingsTitle,
        targetAmount: savingsTarget
      };

      showToast('กำลังสร้างบัญชีผู้ใช้ใหม่...');
      const res = await registerWithEmail(email, pass, name, role, commitments, activePlan, savingsGoal);
      if (res.success) {
        // Guarantee clean reset state for new user
        resetToNewUser(commitments, activePlan, savingsGoal);
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
    playTapSound();
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

  // --------------------------------------------------------------------------
  // 3. Interactive Hero Stage Gimmicks (Tap Safe-to-Spend & Pacing Metrics)
  // --------------------------------------------------------------------------
  const heroAmountBox = document.getElementById('hero-amount-box');
  const heroSafeToast = document.getElementById('hero-safe-toast');
  let heroToastTimer = null;

  if (heroAmountBox) {
    heroAmountBox.addEventListener('click', () => {
      triggerHaptic('medium');
      playSafeSpendCelebration();
      fireMiniConfetti();

      const state = getState();
      const amtStr = Number(state.safeSpendBalance).toLocaleString('th-TH');

      if (heroSafeToast) {
        heroSafeToast.textContent = `✨ ฿${amtStr} นี้กินใช้ได้ 100% สบายใจ ไร้กังวล!`;
        heroSafeToast.classList.add('show');
        clearTimeout(heroToastTimer);
        heroToastTimer = setTimeout(() => {
          heroSafeToast.classList.remove('show');
        }, 3000);
      }
    });
  }

  // Pacing Columns Tap Tooltips
  const colPacingDay = document.getElementById('col-pacing-day');
  const colPacingWeek = document.getElementById('col-pacing-week');
  const colPacingRunway = document.getElementById('col-pacing-runway');

  if (colPacingDay) {
    colPacingDay.addEventListener('click', () => {
      playTapSound();
      triggerHaptic('light');
      const state = getState();
      const dayAmt = Math.max(0, Math.round(state.safeSpendBalance / 30));
      showToast(`☀️ งบเฉลี่ยวันละ ฿${dayAmt.toLocaleString('th-TH')} ช่วยให้กินใช้สบายได้ตลอด 30 วัน`);
    });
  }

  if (colPacingWeek) {
    colPacingWeek.addEventListener('click', () => {
      playTapSound();
      triggerHaptic('light');
      const state = getState();
      const weekAmt = Math.max(0, Math.round(state.safeSpendBalance / 4));
      showToast(`📅 งบเฉลี่ยสัปดาห์ละ ฿${weekAmt.toLocaleString('th-TH')} สำหรับอาหาร กาแฟ และช้อปปิ้ง`);
    });
  }

  if (colPacingRunway) {
    colPacingRunway.addEventListener('click', () => {
      playTapSound();
      triggerHaptic('light');
      const state = getState();
      const runwayDays = state.safeSpendBalance > 0 ? 30 : 0;
      showToast(`⏳ รันเวย์ ${runwayDays} วัน คือระยะเวลาที่เงินกินใช้จะพอเพียงก่อนถึงรอบเงินถัดไป`);
    });
  }

  // --------------------------------------------------------------------------
  // 3.1 Interactive Stream Track & Legend Pills Inspection
  // --------------------------------------------------------------------------
  const inspectCard = document.getElementById('stream-inspect-card');
  const inspectIcon = document.getElementById('inspect-icon');
  const inspectText = document.getElementById('inspect-text');

  const inspectCategory = (cat) => {
    playTapSound();
    triggerHaptic('light');
    const state = getState();
    const total = state.incomeTotal || 1;

    if (cat === 'essentials') {
      if (inspectIcon) inspectIcon.textContent = '🔒';
      const pct = Math.round((state.essentialsBalance / total) * 100);
      if (inspectText) {
        inspectText.innerHTML = `<strong>ค่าใช้จ่ายจำเป็น:</strong> ฿${state.essentialsBalance.toLocaleString('th-TH')} (${pct}%) — กักไว้จ่ายค่าห้อง & เน็ต`;
      }
    } else if (cat === 'buffer') {
      if (inspectIcon) inspectIcon.textContent = '🛡️';
      const pct = Math.round((state.bufferBalance / total) * 100);
      if (inspectText) {
        inspectText.innerHTML = `<strong>เงินสำรองกันสะดุด:</strong> ฿${state.bufferBalance.toLocaleString('th-TH')} (${pct}%) — กักตุนยามงานชะลอ`;
      }
    } else if (cat === 'savings') {
      if (inspectIcon) inspectIcon.textContent = '💜';
      const pct = Math.round((state.savingsBalance / total) * 100);
      if (inspectText) {
        inspectText.innerHTML = `<strong>เงินออมเป้าหมาย:</strong> ฿${state.savingsBalance.toLocaleString('th-TH')} (${pct}%) — เก็บสะสมเข้าเป้าหมาย`;
      }
    } else if (cat === 'safe') {
      if (inspectIcon) inspectIcon.textContent = '✨';
      const pct = Math.round((state.safeSpendBalance / total) * 100);
      if (inspectText) {
        inspectText.innerHTML = `<strong>Safe-to-Spend:</strong> ฿${state.safeSpendBalance.toLocaleString('th-TH')} (${pct}%) — เงินกินใช้ได้จริง 100% ไร้กังวล`;
      }
    }

    if (inspectCard) {
      inspectCard.style.borderColor = 'rgba(16, 185, 129, 0.7)';
      inspectCard.style.transform = 'scale(1.02)';
      setTimeout(() => {
        if (inspectCard) inspectCard.style.transform = 'scale(1)';
      }, 180);
    }
  };

  document.querySelectorAll('.track-seg, .legend-dot-item').forEach(el => {
    el.addEventListener('click', () => {
      const cat = el.dataset.cat;
      if (cat) inspectCategory(cat);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Highlight Action: "ฉันได้รับเงิน" (Opens Bottom Drawer with Live Split Preview)
  // --------------------------------------------------------------------------
  const btnOpenIncome = document.getElementById('btn-open-income');
  const incomeDrawerBackdrop = document.getElementById('income-sheet-backdrop');
  const btnCloseIncomeDrawer = document.getElementById('btn-close-income-drawer');
  const btnConfirmDrawerIncome = document.getElementById('btn-confirm-drawer-income');
  const drawerIncomeInput = document.getElementById('drawer-income-input');

  const previewValEssentials = document.getElementById('preview-val-essentials');
  const previewValBuffer = document.getElementById('preview-val-buffer');
  const previewValSavings = document.getElementById('preview-val-savings');
  const previewValSafe = document.getElementById('preview-val-safe');
  const previewActivePlanTag = document.getElementById('preview-active-plan-tag');

  const updateDrawerSplitPreview = (income) => {
    const state = getState();
    const plan = ALLOCATION_PLANS[state.activePlan] || ALLOCATION_PLANS.freelance_safety;
    if (previewActivePlanTag) previewActivePlanTag.textContent = `${plan.emoji} ${plan.shortName}`;

    let essentials = 0;
    if (plan.id === 'classic_50_30_20') {
      essentials = Math.round(income * 0.50);
    } else {
      essentials = state.commitments?.total || 6500;
    }

    const bufPct = plan.id === 'custom' ? (state.customPlanRates?.bufferPercent || 0.12) : plan.bufferPercent;
    const savPct = plan.id === 'custom' ? (state.customPlanRates?.savingsPercent || 0.10) : plan.savingsPercent;

    const buffer = Math.round(income * bufPct);
    const savings = Math.round(income * savPct);
    const safeSpend = Math.max(0, income - essentials - buffer - savings);

    if (previewValEssentials) previewValEssentials.textContent = `฿${essentials.toLocaleString('th-TH')}`;
    if (previewValBuffer) previewValBuffer.textContent = `฿${buffer.toLocaleString('th-TH')}`;
    if (previewValSavings) previewValSavings.textContent = `฿${savings.toLocaleString('th-TH')}`;
    if (previewValSafe) previewValSafe.textContent = `฿${safeSpend.toLocaleString('th-TH')}`;
  };

  const openIncomeDrawer = () => {
    playTapSound();
    triggerHaptic('light');
    if (incomeDrawerBackdrop) incomeDrawerBackdrop.classList.add('open');
    const curVal = parseFloat(drawerIncomeInput && drawerIncomeInput.value) || 12000;
    updateDrawerSplitPreview(curVal);
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

  // Live Input Listener
  if (drawerIncomeInput) {
    drawerIncomeInput.addEventListener('input', () => {
      const val = parseFloat(drawerIncomeInput.value) || 0;
      updateDrawerSplitPreview(val);
    });
  }

  // Quick Amount Increment Pills
  document.querySelectorAll('.quick-amt-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      playTapSound();
      triggerHaptic('light');

      if (pill.id === 'btn-reset-income-input') {
        if (drawerIncomeInput) drawerIncomeInput.value = 0;
        updateDrawerSplitPreview(0);
        return;
      }

      const addVal = parseInt(pill.dataset.add, 10) || 0;
      const current = parseFloat(drawerIncomeInput?.value) || 0;
      const next = current + addVal;
      if (drawerIncomeInput) drawerIncomeInput.value = next;
      updateDrawerSplitPreview(next);
    });
  });

  if (btnConfirmDrawerIncome) {
    btnConfirmDrawerIncome.addEventListener('click', () => {
      const amount = parseFloat(drawerIncomeInput && drawerIncomeInput.value) || 0;
      if (amount <= 0) {
        showToast('กรุณาระบุจำนวนเงินที่ถูกต้อง');
        return;
      }

      const split = receiveIncome(amount, `รับเงินโอน ${amount.toLocaleString('th-TH')} ฿`);
      closeIncomeDrawer();
      playSuccessFanfare();
      fireSplitConfetti();
      triggerHaptic('heavy');
      showToast(`จัดสรรเงินสำเร็จ! Safe-to-Spend: ${split.safeSpend.toLocaleString('th-TH')} ฿`);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Expense Actions: "หักรายจ่าย" (Opens Expense Drawer with Quick Chips)
  // --------------------------------------------------------------------------
  const btnOpenExpense = document.getElementById('btn-open-expense');
  const expenseDrawerBackdrop = document.getElementById('expense-sheet-backdrop');
  const btnCloseExpDrawer = document.getElementById('btn-close-exp-drawer');
  const btnConfirmDrawerExp = document.getElementById('btn-confirm-drawer-exp');
  const drawerExpName = document.getElementById('drawer-exp-name');
  const drawerExpAmount = document.getElementById('drawer-exp-amount');

  const openExpenseDrawer = () => {
    playTapSound();
    triggerHaptic('light');
    if (expenseDrawerBackdrop) expenseDrawerBackdrop.classList.add('open');
  };

  const closeExpenseDrawer = () => {
    if (expenseDrawerBackdrop) expenseDrawerBackdrop.classList.remove('open');
  };

  if (btnOpenExpense) btnOpenExpense.addEventListener('click', openExpenseDrawer);
  if (btnCloseExpDrawer) btnCloseExpDrawer.addEventListener('click', closeExpenseDrawer);
  if (expenseDrawerBackdrop) {
    expenseDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === expenseDrawerBackdrop) closeExpenseDrawer();
    });
  }

  // 1-Tap Quick Expense Category Chips
  document.querySelectorAll('.exp-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      playTapSound();
      triggerHaptic('light');
      const name = chip.dataset.name;
      const amt = chip.dataset.amount;
      if (drawerExpName && name) drawerExpName.value = name;
      if (drawerExpAmount && amt) drawerExpAmount.value = amt;
    });
  });

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
      playExpenseCoin();
      triggerHaptic('medium');
      showToast(`บันทึก ${name} -${amount} ฿ (หักจาก Safe-to-Spend สำเร็จ)`);
    });
  }



  // --------------------------------------------------------------------------
  // 7. Reset Demo / User Actions (Header + Profile Tab)
  // --------------------------------------------------------------------------
  const handleReset = () => {
    const user = getCurrentUser();
    if (user?.isDemo) {
      resetDemo();
      showToast('รีเซ็ตข้อมูลเดโมคุณมินท์เรียบร้อย');
    } else {
      resetToNewUser(user?.commitments, user?.activePlan, user?.savingsGoal);
      showToast('รีเซ็ตยอดเงินรอบนี้เป็น 0฿ เรียบร้อย');
    }
    triggerHaptic('light');
  };

  const btnStrategyReset = document.getElementById('btn-strategy-reset');
  if (btnStrategyReset) btnStrategyReset.addEventListener('click', handleReset);

  // --------------------------------------------------------------------------
  // 8. Persona & User Profile Drawer
  // --------------------------------------------------------------------------
  const personaBackdrop = document.getElementById('persona-modal-backdrop');
  const btnClosePersona = document.getElementById('btn-close-persona-drawer');
  const btnClosePersonaConfirm = document.getElementById('btn-close-persona-confirm');
  const formEditCommitments = document.getElementById('form-edit-commitments');

  const openPersona = () => {
    if (personaBackdrop) personaBackdrop.classList.add('open');
  };

  const closePersona = () => {
    if (personaBackdrop) personaBackdrop.classList.remove('open');
  };

  if (btnOpenPersona) btnOpenPersona.addEventListener('click', openPersona);
  if (btnClosePersona) btnClosePersona.addEventListener('click', closePersona);
  if (btnClosePersonaConfirm) btnClosePersonaConfirm.addEventListener('click', closePersona);
  if (personaBackdrop) {
    personaBackdrop.addEventListener('click', (e) => {
      if (e.target === personaBackdrop) closePersona();
    });
  }

  // Handle Edit Commitments Form Submit (Real User)
  if (formEditCommitments) {
    formEditCommitments.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rent = parseInt(document.getElementById('edit-commit-rent')?.value, 10) || 0;
      const net = parseInt(document.getElementById('edit-commit-net')?.value, 10) || 0;
      const home = parseInt(document.getElementById('edit-commit-home')?.value, 10) || 0;
      const total = rent + net + home;

      const commitments = { rent, internet: net, sentHome: home, total };
      updateUserCommitments(commitments);
      await updateCurrentUserProfile({ commitments });

      triggerHaptic('medium');
      fireSplitConfetti();
      showToast(`บันทึกภาระจำเป็น ฿${total.toLocaleString('th-TH')}/เดือน สำเร็จ!`);
      closePersona();
    });
  }

  // --------------------------------------------------------------------------
  // 8.1 Allocation Plans Selection Drawer Modal (ไหนหน้าที่ให้เลือกแบบแผน)
  // --------------------------------------------------------------------------
  const btnInfoSafe = document.getElementById('btn-info-safe');
  const plansModalBackdrop = document.getElementById('plans-modal-backdrop');
  const btnClosePlansDrawer = document.getElementById('btn-close-plans-drawer');
  const btnConfirmPlanChoice = document.getElementById('btn-confirm-plan-choice');
  const planOptionCards = document.querySelectorAll('.plan-option-card');

  const customSliderBuffer = document.getElementById('custom-slider-buffer');
  const customSliderSavings = document.getElementById('custom-slider-savings');
  const customValBuffer = document.getElementById('custom-val-buffer');
  const customValSavings = document.getElementById('custom-val-savings');

  const openPlansModal = () => {
    if (plansModalBackdrop) plansModalBackdrop.classList.add('open');
  };

  const closePlansModal = () => {
    if (plansModalBackdrop) plansModalBackdrop.classList.remove('open');
  };

  if (btnInfoSafe) btnInfoSafe.addEventListener('click', openPlansModal);
  if (btnClosePlansDrawer) btnClosePlansDrawer.addEventListener('click', closePlansModal);
  if (btnConfirmPlanChoice) {
    btnConfirmPlanChoice.addEventListener('click', () => {
      triggerHaptic('medium');
      closePlansModal();
      showToast('เปิดใช้แบบแผนการแยกเงินเรียบร้อยแล้ว');
    });
  }

  if (plansModalBackdrop) {
    plansModalBackdrop.addEventListener('click', (e) => {
      if (e.target === plansModalBackdrop) closePlansModal();
    });
  }

  // Select Plan Cards
  planOptionCards.forEach(card => {
    card.addEventListener('click', () => {
      const planId = card.dataset.planId;
      if (!planId) return;

      planOptionCards.forEach(c => {
        c.classList.remove('active');
        const dot = c.querySelector('.plan-radio-dot');
        if (dot) dot.classList.remove('active');
      });

      card.classList.add('active');
      const activeDot = card.querySelector('.plan-radio-dot');
      if (activeDot) activeDot.classList.add('active');

      let customRates = null;
      if (planId === 'custom') {
        const buf = parseInt(customSliderBuffer?.value || '12', 10) / 100;
        const sav = parseInt(customSliderSavings?.value || '10', 10) / 100;
        customRates = { bufferPercent: buf, savingsPercent: sav };
      }

      const selectedPlan = setAllocationPlan(planId, customRates);
      updateCurrentUserProfile({ activePlan: planId });
      triggerHaptic('medium');
      showToast(`สลับใช้: ${selectedPlan.name}`);
    });
  });

  // Custom Sliders
  const handleCustomSliderChange = () => {
    if (!customSliderBuffer || !customSliderSavings) return;
    const bufVal = parseInt(customSliderBuffer.value, 10);
    const savVal = parseInt(customSliderSavings.value, 10);

    if (customValBuffer) customValBuffer.textContent = `${bufVal}%`;
    if (customValSavings) customValSavings.textContent = `${savVal}%`;

    setAllocationPlan('custom', {
      bufferPercent: bufVal / 100,
      savingsPercent: savVal / 100
    });
    updateCurrentUserProfile({
      activePlan: 'custom',
      splitRules: { bufferPercent: bufVal / 100, savingsPercent: savVal / 100 }
    });
  };

  if (customSliderBuffer) customSliderBuffer.addEventListener('input', handleCustomSliderChange);
  if (customSliderSavings) customSliderSavings.addEventListener('input', handleCustomSliderChange);

  // --------------------------------------------------------------------------
  // 8.2 Tab 2: Savings Goal Drawer Handler
  // --------------------------------------------------------------------------
  const btnEditSavingsGoal = document.getElementById('btn-edit-savings-goal');
  const savingsGoalModalBackdrop = document.getElementById('savings-goal-modal-backdrop');
  const btnCloseSavingsDrawer = document.getElementById('btn-close-savings-drawer');
  const formEditSavingsGoal = document.getElementById('form-edit-savings-goal');
  const inputGoalTitle = document.getElementById('input-goal-title');
  const inputGoalTarget = document.getElementById('input-goal-target');
  const goalPresetChips = document.querySelectorAll('.goal-preset-chip');

  const openSavingsGoalModal = () => {
    if (!savingsGoalModalBackdrop) return;
    const currentGoal = getState().savingsGoal || { title: 'เงินสำรองฉุกเฉิน', targetAmount: 30000 };
    if (inputGoalTitle) inputGoalTitle.value = currentGoal.title || '';
    if (inputGoalTarget) inputGoalTarget.value = currentGoal.targetAmount || 30000;
    savingsGoalModalBackdrop.classList.add('open');
  };

  const closeSavingsGoalModal = () => {
    if (savingsGoalModalBackdrop) savingsGoalModalBackdrop.classList.remove('open');
  };

  if (btnEditSavingsGoal) btnEditSavingsGoal.addEventListener('click', openSavingsGoalModal);
  if (btnCloseSavingsDrawer) btnCloseSavingsDrawer.addEventListener('click', closeSavingsGoalModal);
  if (savingsGoalModalBackdrop) {
    savingsGoalModalBackdrop.addEventListener('click', (e) => {
      if (e.target === savingsGoalModalBackdrop) closeSavingsGoalModal();
    });
  }

  goalPresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const title = chip.dataset.title;
      const target = parseInt(chip.dataset.target, 10);
      if (inputGoalTitle && title) inputGoalTitle.value = title;
      if (inputGoalTarget && target) inputGoalTarget.value = target;
      triggerHaptic('light');
    });
  });

  if (formEditSavingsGoal) {
    formEditSavingsGoal.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = inputGoalTitle?.value.trim() || 'เงินสำรองฉุกเฉิน';
      const targetAmount = parseInt(inputGoalTarget?.value, 10) || 30000;
      const newGoal = { title, targetAmount };

      updateSavingsGoal(newGoal);
      await updateCurrentUserProfile({ savingsGoal: newGoal });

      closeSavingsGoalModal();
      triggerHaptic('medium');
      fireSplitConfetti();
      showToast(`อัปเดตเป้าหมาย: "${title}" (฿${targetAmount.toLocaleString('th-TH')}) สำเร็จ!`);
    });
  }

  // --------------------------------------------------------------------------
  // 9. Multi-UI Style Theme System (Neumorphic / Modern Minimal / Glassmorphism)
  // --------------------------------------------------------------------------
  // Initialize UI theme on load
  const currentTheme = localStorage.getItem('paysplit_theme') || 'neumorphic';
  document.documentElement.setAttribute('data-theme', currentTheme);

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
      openPlansModal();
    });
  }

  const btnEditAvatar = document.getElementById('btn-edit-avatar');
  if (btnEditAvatar) {
    btnEditAvatar.addEventListener('click', () => {
      triggerHaptic('light');
      showToast('อัปเดตรูปโปรไฟล์สำเร็จ');
    });
  }



  const toggleHaptic = document.getElementById('toggle-haptic');
  if (toggleHaptic) {
    toggleHaptic.addEventListener('change', () => {
      triggerHaptic('light');
      showToast(toggleHaptic.checked ? 'เปิดระบบสั่นจำลองปุ่มกดจริง' : 'ปิดระบบสั่น');
    });
  }

  const toggleSound = document.getElementById('toggle-sound');
  if (toggleSound) {
    toggleSound.checked = isSoundEnabled();
    toggleSound.addEventListener('change', () => {
      setSoundEnabled(toggleSound.checked);
      if (toggleSound.checked) playTapSound();
      triggerHaptic('light');
      showToast(toggleSound.checked ? 'เปิดระบบเสียงสัมผัสสังเคราะห์ (Sound FX)' : 'ปิดระบบเสียง');
    });
  }

  // --------------------------------------------------------------------------
  // 11. Native Mobile Clock & Keyboard Accessibility
  // --------------------------------------------------------------------------
  const updateClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    ['status-clock', 'intro-clock', 'onboarding-clock'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = timeStr;
    });
  };
  updateClock();
  setInterval(updateClock, 30000);

  // Global Escape key to dismiss modals & drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeIncomeDrawer();
      closeExpDrawer();
      closePersona();
      closePlansModal();
      closeSavingsGoalModal();
      closeAuthModal();
    }
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration skipped:', err);
      });
    });
  }
});
