/**
 * PaySplit Central State Management
 * Tailored for Freelance Persona: Mint (26, Graphic Designer, Hat Yai)
 */

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

  // Fixed Commitments for Mint
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
 * Calculate Split based on Mint's financial algorithm
 * @param {number} income 
 */
export function calculateSplit(income) {
  const commitmentsTarget = state.commitments.total; // 6,500฿
  
  let essentials = 0;
  let buffer = 0;
  let savings = 0;
  let safeSpend = 0;

  if (income <= commitmentsTarget) {
    // Edge case: income smaller than fixed commitments
    essentials = income;
    buffer = 0;
    savings = 0;
    safeSpend = 0;
  } else {
    // Normal / Ideal allocation for Mint:
    // Fixed commitments covered first: 6,500฿
    essentials = commitmentsTarget;

    // Remaining pool:
    const remainingAfterEssentials = income - essentials;

    // Buffer: ~12.5% of income (or ~27% of remaining)
    buffer = Math.round(income * 0.125);

    // Savings: ~8.33% of income (e.g. 1,000 on 12k)
    savings = Math.round(income * 0.0833);

    // Safe to spend: Everything else left over for guilt-free living!
    safeSpend = income - essentials - buffer - savings;

    // Safety checks
    if (safeSpend < 0) {
      safeSpend = 0;
      buffer = Math.max(0, remainingAfterEssentials - savings);
    }
  }

  return {
    income,
    essentials,
    buffer,
    savings,
    safeSpend
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
 * Reset Demo to clean initial state
 */
export function resetDemo() {
  state = JSON.parse(JSON.stringify(INITIAL_STATE));
  notify();
}
