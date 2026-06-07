import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export interface DailyGoalData {
  target: number; // e.g., 5, 10, 15
  history: Record<string, number>; // date string 'YYYY-MM-DD' -> count solved
  streak: number; // consecutive days completed
}

const DEFAULT_GOAL = 5;

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const dailyGoalService = {
  getGoalData(): DailyGoalData {
    try {
      const stored = localStorage.getItem('quantumDailyGoal');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure default structures are present
        return {
          target: typeof parsed.target === 'number' ? parsed.target : DEFAULT_GOAL,
          history: parsed.history || {},
          streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
        };
      }
    } catch (e) {
      console.error('Failed to parse daily goal data:', e);
    }
    return {
      target: DEFAULT_GOAL,
      history: {},
      streak: 0,
    };
  },

  async syncToCloud() {
    try {
      if (typeof localStorage !== 'undefined') {
        const isOfflineMode = localStorage.getItem('offline_mode') === 'true';
        if (isOfflineMode) return;
      }
    } catch {
      // Ignored
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const local = this.getGoalData();
    try {
      await updateDoc(userRef, {
        dailyGoal: {
          target: local.target,
          streak: local.streak,
          history: local.history
        }
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  },

  syncFromCloud(cloudGoalData: any) {
    if (!cloudGoalData) return;
    const local = this.getGoalData();
    let updated = false;

    if (typeof cloudGoalData.target === 'number' && cloudGoalData.target !== local.target) {
      local.target = cloudGoalData.target;
      updated = true;
    }

    if (typeof cloudGoalData.streak === 'number' && cloudGoalData.streak !== local.streak) {
      local.streak = cloudGoalData.streak;
      updated = true;
    }

    if (cloudGoalData.history) {
      for (const [date, count] of Object.entries(cloudGoalData.history)) {
        if (typeof count === 'number') {
          const localCount = local.history[date] || 0;
          if (localCount !== count) {
            local.history[date] = Math.max(localCount, count);
            updated = true;
          }
        }
      }
    }

    if (updated) {
      this.recalculateStreak(local);
      try {
        localStorage.setItem('quantumDailyGoal', JSON.stringify(local));
        window.dispatchEvent(new CustomEvent('dailyGoal-change', { detail: local }));
      } catch (e) {
        console.error('Failed to save merged daily goal data to localStorage:', e);
      }
    }
  },

  saveGoalData(data: DailyGoalData) {
    try {
      localStorage.setItem('quantumDailyGoal', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('dailyGoal-change', { detail: data }));
      this.syncToCloud();
    } catch (e) {
      console.error('Failed to save daily goal data:', e);
    }
  },

  setTarget(target: number) {
    const data = this.getGoalData();
    data.target = Math.max(1, target);
    this.recalculateStreak(data);
    this.saveGoalData(data);
  },

  getTodaySolved(): number {
    const data = this.getGoalData();
    const today = getTodayString();
    return data.history[today] || 0;
  },

  incrementSolved(amount: number = 1) {
    const data = this.getGoalData();
    const today = getTodayString();
    const current = data.history[today] || 0;
    data.history[today] = current + amount;
    this.recalculateStreak(data);
    this.saveGoalData(data);
  },

  recalculateStreak(data: DailyGoalData) {
    let currentStreak = 0;
    const today = new Date();
    
    // Check backwards from today to find the streak of days meeting target
    // We allow a streak to continue if we met the target yesterday, and today is either completed or in-progress
    const checkDate = new Date(today);
    
    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const solved = data.history[dateStr] || 0;
      const isToday = dateStr === getTodayString();
      
      if (solved >= data.target) {
        currentStreak++;
      } else if (isToday) {
        // Today is not complete yet, which is fine, streak can still be maintained by previous days
        // Do not break yet, check yesterday
      } else {
        // Did not meet target on a historical day, break the streak
        break;
      }
      
      // Move to yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      
      // Safety guard for infinite loop
      if (currentStreak > 3650) break; 
    }
    
    data.streak = currentStreak;
  },

  getPastWeeklyConsistency(): { date: string; solved: number; target: number; completed: boolean }[] {
    const data = this.getGoalData();
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const solved = data.history[dateStr] || 0;
      result.push({
        date: dateStr,
        solved,
        target: data.target,
        completed: solved >= data.target,
      });
    }
    return result;
  }
};
