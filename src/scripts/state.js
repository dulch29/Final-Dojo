/**
 * PaySplit Central State Management
 * Tailored for Freelance Persona: Mint (26, Graphic Designer, Hat Yai)
 */

export const ALLOCATION_PLANS = {
  freelance_safety: {
    id: 'freelance_safety',
    name: 'แผนฟรีแลนซ์ ปลอดภัยสูง',
    shortName: 'ฟรีแลนซ์ ปลอดภัย',
    emoji: '🛡️',
    badge: 'แนะนำสำหรับฟรีแลนซ์',
    description: 'ล็อกภาระจำเป็น 100% · กันสำรองงานชะลอ 12.5% · ออมฉุกเฉิน 8.3%',
    bufferPercent: 0.125,
    savingsPercent: 0.0833,
    type: 'fixed_then_percent'
  },
  classic_50_30_20: {
    id: 'classic_50_30_20',
    name: 'แผนสมดุลชีวิต 50/30/20',
    shortName: 'สมดุล 50/30/20',
    emoji: '⚖️',
    badge: 'คลาสสิก ยอดนิยม',
    description: 'จำเป็น 50% · กินใช้สบายใจ 30% · ออมและสำรอง 20%',
    bufferPercent: 0.10,
    savingsPercent: 0.10,
    essentialsPercent: 0.50,
    safeSpendPercent: 0.30,
    type: 'percentage'
  },
  aggressive_wealth: {
    id: 'aggressive_wealth',
    name: 'แผนเร่งสร้างตัว (ออมหนัก)',
    shortName: 'เร่งสร้างตัว',
    emoji: '🚀',
    badge: 'เน้นเก็บเงินก้อน',
    description: 'ล็อกภาระจำเป็นคงที่ · ออมลงทุนเข้มข้น 25% · สำรองสภาพคล่อง 10%',
    bufferPercent: 0.10,
    savingsPercent: 0.25,
    type: 'fixed_then_percent'
  },
  custom: {
    id: 'custom',
    name: 'แผนกำหนดสัดส่วนเอง',
    shortName: 'กำหนดเอง',
    emoji: '⚙️',
    badge: 'ปรับแต่งอิสระ',
    description: 'กำหนดเปอร์เซ็นต์เงินสำรองและเงินออมตามสไตล์คุณ',
    bufferPercent: 0.12,
    savingsPercent: 0.10,
    type: 'fixed_then_percent'
  }
};

export const INITIAL_STATE = {
  // Total Income received in this cycle
  incomeTotal: 0,
  
  // Allocated Balances
  essentialsBalance: 0,
  bufferBalance: 0,
  savingsBalance: 0,
  safeSpendBalance: 0,
  
  // Initial allocations before expenses
  initialAllocations: {
    essentials: 0,
    buffer: 0,
    savings: 0,
    safeSpend: 0
  },

  // Active Allocation Strategy
  activePlan: 'freelance_safety',
  customPlanRates: {
    bufferPercent: 0.12,
    savingsPercent: 0.10
  },

  // Fixed Commitments
  commitments: {
    rent: 4000,
    internet: 500,
    sentHome: 2000,
    total: 6500
  },

  // Transactions list
  transactions: [],

  // Status state
  hasReceivedIncome: false
};

// Clone initial state for reset
let state = JSON.parse(JSON.stringify(INITIAL_STATE));
const subscribers = [];

/**
 * Subscribe to state changes
 */
export function subscribe(callback) {
  subscribers.push(callback);
  callback(state);
}

function notify() {
  subscribers.forEach(cb => cb(state));
}

export function getState() {
  return state;
}

/**
 * Calculate Split based on active allocation plan
 * @param {number} income 
 * @param {string} planId
 * @param {object} customRates
 */
export function calculateSplit(income, planId = state.activePlan, customRates = state.customPlanRates) {
  const plan = ALLOCATION_PLANS[planId] || ALLOCATION_PLANS.freelance_safety;
  const commitmentsTarget = state.commitments.total || 6500;
  
  let essentials = 0;
  let buffer = 0;
  let savings = 0;
  let safeSpend = 0;

  if (income <= 0) {
    return { income: 0, essentials: 0, buffer: 0, savings: 0, safeSpend: 0, planId };
  }

  if (plan.id === 'classic_50_30_20') {
    // 50/30/20 standard percentage model
    essentials = Math.round(income * 0.50);
    safeSpend = Math.round(income * 0.30);
    buffer = Math.round(income * 0.10);
    savings = income - essentials - safeSpend - buffer; // Remaining 10%
  } else {
    // Fixed commitments + percentage buffer/savings + remainder safe to spend
    const bufRate = plan.id === 'custom' ? (customRates.bufferPercent || 0.12) : plan.bufferPercent;
    const savRate = plan.id === 'custom' ? (customRates.savingsPercent || 0.10) : plan.savingsPercent;

    if (income <= commitmentsTarget) {
      essentials = income;
      buffer = 0;
      savings = 0;
      safeSpend = 0;
    } else {
      essentials = commitmentsTarget;
      buffer = Math.round(income * bufRate);
      savings = Math.round(income * savRate);
      safeSpend = income - essentials - buffer - savings;

      if (safeSpend < 0) {
        safeSpend = 0;
        const remaining = income - essentials;
        savings = Math.min(savings, remaining);
        buffer = Math.max(0, remaining - savings);
      }
    }
  }

  return {
    income,
    essentials,
    buffer,
    savings,
    safeSpend,
    planId: plan.id
  };
}

/**
 * Apply Received Income and Instant Split
 * @param {number} amount 
 * @param {string} sourceName 
 */
export function receiveIncome(amount, sourceName = 'รับเงินค่าจ้าง') {
  const split = calculateSplit(amount);

  state.incomeTotal = amount;
  state.essentialsBalance = split.essentials;
  state.bufferBalance = split.buffer;
  state.savingsBalance = split.savings;
  state.safeSpendBalance = split.safeSpend;

  state.initialAllocations = {
    essentials: split.essentials,
    buffer: split.buffer,
    savings: split.savings,
    safeSpend: split.safeSpend
  };

  state.hasReceivedIncome = true;

  // Add Income record
  state.transactions.unshift({
    id: 'tx-' + Date.now(),
    type: 'income',
    name: sourceName,
    amount: amount,
    category: 'income',
    emoji: '💰',
    time: 'เมื่อสักครู่'
  });

  notify();
  return split;
}

/**
 * Log an Expense from a category
 * @param {string} name 
 * @param {number} amount 
 * @param {string} category 'safe' | 'essentials' 
 * @param {string} emoji 
 */
export function logExpense(name, amount, category = 'safe', emoji = '💸') {
  if (category === 'safe') {
    state.safeSpendBalance = Math.max(0, state.safeSpendBalance - amount);
  } else if (category === 'essentials') {
    state.essentialsBalance = Math.max(0, state.essentialsBalance - amount);
  }

  state.transactions.unshift({
    id: 'tx-' + Date.now(),
    type: 'expense',
    name,
    amount,
    category,
    emoji,
    time: 'เมื่อสักครู่'
  });

  notify();
}

/**
 * Set and Apply Allocation Plan
 * @param {string} planId 
 * @param {object} customRates 
 */
export function setAllocationPlan(planId, customRates = null) {
  if (ALLOCATION_PLANS[planId]) {
    state.activePlan = planId;
  }
  if (customRates) {
    state.customPlanRates = {
      ...state.customPlanRates,
      ...customRates
    };
  }

  // If income was already received, re-split dynamically
  if (state.incomeTotal > 0) {
    const split = calculateSplit(state.incomeTotal, state.activePlan, state.customPlanRates);
    state.essentialsBalance = split.essentials;
    state.bufferBalance = split.buffer;
    state.savingsBalance = split.savings;
    state.safeSpendBalance = split.safeSpend;
    state.initialAllocations = {
      essentials: split.essentials,
      buffer: split.buffer,
      savings: split.savings,
      safeSpend: split.safeSpend
    };
  }

  notify();
  return ALLOCATION_PLANS[state.activePlan];
}

/**
 * Update User Commitments (from profile or registration)
 */
export function updateUserCommitments(commitments) {
  if (!commitments) return;
  const rent = typeof commitments.rent === 'number' ? commitments.rent : (state.commitments.rent || 0);
  const internet = typeof commitments.internet === 'number' ? commitments.internet : (state.commitments.internet || 0);
  const sentHome = typeof commitments.sentHome === 'number' ? commitments.sentHome : (state.commitments.sentHome || 0);
  const total = typeof commitments.total === 'number' ? commitments.total : (rent + internet + sentHome);

  state.commitments = {
    rent,
    internet,
    sentHome,
    total
  };

  if (state.incomeTotal > 0) {
    const split = calculateSplit(state.incomeTotal, state.activePlan, state.customPlanRates);
    state.essentialsBalance = split.essentials;
    state.bufferBalance = split.buffer;
    state.savingsBalance = split.savings;
    state.safeSpendBalance = split.safeSpend;
    state.initialAllocations = {
      essentials: split.essentials,
      buffer: split.buffer,
      savings: split.savings,
      safeSpend: split.safeSpend
    };
  }

  notify();
}

/**
 * Reset Demo to clean initial state
 */
export function resetDemo() {
  state = JSON.parse(JSON.stringify(INITIAL_STATE));
  notify();
}
