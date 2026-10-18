import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { auth } from './firebase-config.js';
import { loadUserData, saveUserData } from './db.js';

export const DEMO_MINT_PROFILE = {
  uid: 'demo_mint_26',
  isDemo: true,
  displayName: 'มินท์ รัตนสุวรรณ',
  email: 'mint.design@email.com',
  role: 'Freelance Brand & UI Designer',
  location: 'หาดใหญ่',
  verifiedNDID: true,
  promptPay: '081-923-8921',
  commitments: {
    rent: 4000,
    internet: 500,
    sentHome: 2000,
    total: 6500
  },
  splitRules: {
    bufferPercent: 0.125,
    savingsPercent: 0.0833
  }
};

let currentUser = null;
const authSubscribers = [];

export function subscribeAuth(callback) {
  authSubscribers.push(callback);
  callback(currentUser);
}

function notifyAuth(user) {
  currentUser = user;
  authSubscribers.forEach(cb => cb(user));
}

export function getCurrentUser() {
  return currentUser;
}

// 1. One-Tap 1-Click Demo Login as Mint
export async function loginAsDemoMint() {
  try {
    let firebaseUser = null;
    try {
      const cred = await signInAnonymously(auth);
      firebaseUser = cred.user;
    } catch (err) {
      console.warn('Anonymous auth offline/fallback, using local demo user', err);
    }

    const userObj = {
      ...DEMO_MINT_PROFILE,
      uid: firebaseUser ? firebaseUser.uid : 'demo_mint_26',
      isDemo: true
    };

    localStorage.setItem('paysplit_active_user', JSON.stringify(userObj));
    notifyAuth(userObj);
    return { success: true, user: userObj };
  } catch (error) {
    console.error('Login demo error:', error);
    return { success: false, error: error.message };
  }
}

// 2. Email & Password Login
export async function loginWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const cloudData = await loadUserData(cred.user.uid);
    const userObj = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || email.split('@')[0],
      role: cloudData?.role || 'ฟรีแลนซ์',
      commitments: cloudData?.commitments || { rent: 4000, internet: 500, sentHome: 2000, total: 6500 },
      splitRules: cloudData?.splitRules || { bufferPercent: 0.125, savingsPercent: 0.0833 },
      activePlan: cloudData?.activePlan || 'freelance_safety',
      savingsGoal: cloudData?.savingsGoal || { title: 'เงินสำรองฉุกเฉิน', targetAmount: 30000 },
      isDemo: false
    };
    localStorage.setItem('paysplit_active_user', JSON.stringify(userObj));
    notifyAuth(userObj);
    return { success: true, user: userObj };
  } catch (error) {
    console.error('Email login error:', error);
    return { success: false, error: error.message };
  }
}

// 3. New User Registration
export async function registerWithEmail(email, password, displayName, role, commitments, activePlan = 'freelance_safety', savingsGoal = null) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    
    const userProfile = {
      uid: cred.user.uid,
      email,
      displayName,
      role: role || 'ฟรีแลนซ์',
      commitments: commitments || { rent: 0, internet: 0, sentHome: 0, total: 0, items: [] },
      splitRules: { bufferPercent: 0.125, savingsPercent: 0.0833 },
      activePlan: activePlan || 'freelance_safety',
      savingsGoal: savingsGoal || { title: 'เงินสำรองฉุกเฉิน', targetAmount: 30000 },
      isDemo: false,
      isNewUser: true,
      createdAt: new Date().toISOString()
    };

    await saveUserData(cred.user.uid, userProfile);
    localStorage.setItem('paysplit_active_user', JSON.stringify(userProfile));
    notifyAuth(userProfile);
    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// 4. Logout
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (e) {
    // Ignore offline signOut errors
  }
  localStorage.removeItem('paysplit_active_user');
  notifyAuth(null);
}

// 5. Update Current User Profile / Commitments
export async function updateCurrentUserProfile(updates) {
  if (!currentUser) return;
  currentUser = { ...currentUser, ...updates };
  localStorage.setItem('paysplit_active_user', JSON.stringify(currentUser));
  if (!currentUser.isDemo && currentUser.uid) {
    try {
      await saveUserData(currentUser.uid, currentUser);
    } catch (e) {
      console.warn('Could not sync profile to cloud:', e);
    }
  }
  notifyAuth(currentUser);
  return currentUser;
}

// Initialize Auth Listener from Local Storage and Firebase
export function initAuth() {
  const cached = localStorage.getItem('paysplit_active_user');
  if (cached) {
    try {
      currentUser = JSON.parse(cached);
      notifyAuth(currentUser);
    } catch (e) {
      localStorage.removeItem('paysplit_active_user');
    }
  }

  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      if (currentUser?.isDemo) {
        // Keep demo active if user explicitly chose demo
        return;
      }
      const cloudData = await loadUserData(fbUser.uid);
      const userObj = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || cloudData?.displayName || 'ผู้ใช้งาน',
        role: cloudData?.role || 'ฟรีแลนซ์',
        commitments: cloudData?.commitments || { rent: 4000, internet: 500, sentHome: 2000, total: 6500 },
        splitRules: cloudData?.splitRules || { bufferPercent: 0.125, savingsPercent: 0.0833 }
      };
      notifyAuth(userObj);
    } else {
      if (!currentUser?.isDemo) {
        notifyAuth(null);
      }
    }
  });
}
