import { doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase-config.js';

/**
 * Save user profile and preferences
 */
export async function saveUserData(uid, data) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
    localStorage.setItem(`paysplit_profile_${uid}`, JSON.stringify(data));
    return { success: true };
  } catch (err) {
    console.warn('Firestore offline, caching locally:', err);
    localStorage.setItem(`paysplit_profile_${uid}`, JSON.stringify(data));
    return { success: true, offline: true };
  }
}

/**
 * Load user profile
 */
export async function loadUserData(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      localStorage.setItem(`paysplit_profile_${uid}`, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Firestore read error, using cache:', err);
  }
  const cached = localStorage.getItem(`paysplit_profile_${uid}`);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Save current financial state/cycle to Firestore
 */
export async function saveLedgerState(uid, stateData) {
  try {
    const ledgerRef = doc(db, 'users', uid, 'ledger', 'active_cycle');
    const payload = {
      incomeTotal: stateData.incomeTotal,
      essentialsBalance: stateData.essentialsBalance,
      bufferBalance: stateData.bufferBalance,
      savingsBalance: stateData.savingsBalance,
      safeSpendBalance: stateData.safeSpendBalance,
      commitments: stateData.commitments,
      updatedAt: new Date().toISOString()
    };
    await setDoc(ledgerRef, payload, { merge: true });
    localStorage.setItem(`paysplit_ledger_${uid}`, JSON.stringify(payload));
  } catch (err) {
    localStorage.setItem(`paysplit_ledger_${uid}`, JSON.stringify(stateData));
  }
}

/**
 * Record a transaction to Firestore
 */
export async function recordCloudTransaction(uid, transaction) {
  try {
    const txCol = collection(db, 'users', uid, 'transactions');
    await addDoc(txCol, {
      ...transaction,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to record cloud transaction, local state preserved:', err);
  }
}
