export interface LocalPilotProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  selectedTopic: string | null;
}

export interface LocalAttempt {
  exerciseId: string;
  submittedCode: string;
  isCorrect: boolean;
  feedbackSummary: string;
  submittedAt: string;
}

export interface LocalProgress {
  lessonId: string;
  status: 'Completed';
  completedAt: string;
  isMastered: true;
}

const DB_KEYS = {
  PROFILE: 'code_ascention_profile',
  ATTEMPTS: 'code_ascention_attempts',
  PROGRESS: 'code_ascention_progress',
};

// Safe access to localStorage
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const localDb = {
  // Profiles
  setProfile: (profile: LocalPilotProfile) => {
    const storage = getStorage();
    if (storage) {
      storage.setItem(DB_KEYS.PROFILE, JSON.stringify(profile));
    }
  },
  getProfile: (): LocalPilotProfile | null => {
    const storage = getStorage();
    if (storage) {
      const data = storage.getItem(DB_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  updateProfileTopic: (topicId: string) => {
    const profile = localDb.getProfile();
    if (profile) {
      profile.selectedTopic = topicId;
      localDb.setProfile(profile);
    }
  },
  clearProfile: () => {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(DB_KEYS.PROFILE);
      // We do NOT clear attempts/progress natively on logout so the user doesn't lose
      // their data just by closing the app, but typically a local app doesn't formally 'logout'
      // anyway, it has 'reset data' options.
    }
  },

  // Attempts
  saveAttempt: (attempt: LocalAttempt) => {
    const storage = getStorage();
    if (storage) {
      const existingStr = storage.getItem(DB_KEYS.ATTEMPTS);
      const attempts: LocalAttempt[] = existingStr ? JSON.parse(existingStr) : [];
      attempts.push(attempt);
      storage.setItem(DB_KEYS.ATTEMPTS, JSON.stringify(attempts));
    }
  },
  getAttempts: (): LocalAttempt[] => {
    const storage = getStorage();
    if (storage) {
      const existingStr = storage.getItem(DB_KEYS.ATTEMPTS);
      return existingStr ? JSON.parse(existingStr) : [];
    }
    return [];
  },

  // Progress
  saveProgress: (progress: LocalProgress) => {
    const storage = getStorage();
    if (storage) {
      const existingStr = storage.getItem(DB_KEYS.PROGRESS);
      const allProgress: LocalProgress[] = existingStr ? JSON.parse(existingStr) : [];
      
      // Upsert
      const idx = allProgress.findIndex(p => p.lessonId === progress.lessonId);
      if (idx >= 0) {
        allProgress[idx] = progress;
      } else {
        allProgress.push(progress);
      }
      storage.setItem(DB_KEYS.PROGRESS, JSON.stringify(allProgress));
    }
  },
  getProgress: (): LocalProgress[] => {
    const storage = getStorage();
    if (storage) {
      const existingStr = storage.getItem(DB_KEYS.PROGRESS);
      return existingStr ? JSON.parse(existingStr) : [];
    }
    return [];
  },
  
  // Danger Zone
  wipeAllData: () => {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(DB_KEYS.PROFILE);
        storage.removeItem(DB_KEYS.ATTEMPTS);
        storage.removeItem(DB_KEYS.PROGRESS);
      }
  }
};
