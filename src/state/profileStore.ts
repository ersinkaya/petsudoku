import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameResult, GameState, Pet, Profile, Stats } from '../engine/types';

const PROFILE_STORAGE_KEY = '@pedsudoku_profile_v1';

const defaultStats: Stats = {
  totalScore: 0,
  bestBySize: {},
  bestTimeBySize: {},
  streakGames: 0,
  streakDays: 0,
  lastPlayedDay: '',
  badges: [],
};

const defaultProfile: Profile = {
  pet: null,
  currentLevel: 1,
  rewards: {
    mouse: 0,
    bone: 0,
    carrot: 0,
  },
  settings: {
    sound: true,
    haptics: true,
    autoMark: false,
  },
  savedGame: null,
  stats: defaultStats,
  ads: {
    levelsSinceInterstitial: 0,
    lastInterstitialAt: 0,
  },
};

interface ProfileActions {
  setPet: (pet: Pet) => void;
  advanceLevel: () => void;
  addReward: (rewardId: string, count?: number) => void;
  updateSettings: (settings: Partial<Profile['settings']>) => void;
  saveGame: (game: GameState | null) => void;
  recordGameResult: (result: GameResult) => { isNewHighScore: boolean; isNewBestTime: boolean };
  recordInterstitialShown: () => void;
  resetProgress: () => void;
}

export type ProfileStore = Profile & ProfileActions;

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      ...defaultProfile,

      setPet: (pet: Pet) => set({ pet }),

      advanceLevel: () => set((state) => ({ currentLevel: state.currentLevel + 1 })),

      addReward: (rewardId: string, count: number = 1) =>
        set((state) => ({
          rewards: {
            ...state.rewards,
            [rewardId]: (state.rewards[rewardId] || 0) + count,
          },
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      saveGame: (savedGame) => set({ savedGame }),

      recordGameResult: (result: GameResult) => {
        const state = get();
        const currentStats = state.stats || defaultStats;
        const size = result.size;

        const currentBestList = currentStats.bestBySize[size] || [];
        const isNewHighScore =
          currentBestList.length === 0 || result.score > currentBestList[0].score;

        const currentBestTime = currentStats.bestTimeBySize[size];
        const isNewBestTime =
          currentBestTime === undefined || result.seconds < currentBestTime;

        // Update best 10 list
        const updatedList = [...currentBestList, result]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        // Update streak days
        const todayStr = new Date().toISOString().split('T')[0];
        let streakDays = currentStats.streakDays;
        if (currentStats.lastPlayedDay !== todayStr) {
          // Check if yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (currentStats.lastPlayedDay === yesterdayStr) {
            streakDays += 1;
          } else {
            streakDays = 1;
          }
        }

        set({
          stats: {
            ...currentStats,
            totalScore: currentStats.totalScore + result.score,
            bestBySize: {
              ...currentStats.bestBySize,
              [size]: updatedList,
            },
            bestTimeBySize: {
              ...currentStats.bestTimeBySize,
              [size]: isNewBestTime ? result.seconds : (currentBestTime ?? result.seconds),
            },
            streakGames: currentStats.streakGames + 1,
            streakDays,
            lastPlayedDay: todayStr,
          },
          ads: {
            ...state.ads,
            levelsSinceInterstitial: state.ads.levelsSinceInterstitial + 1,
          },
        });

        return { isNewHighScore, isNewBestTime };
      },

      recordInterstitialShown: () =>
        set((state) => ({
          ads: {
            levelsSinceInterstitial: 0,
            lastInterstitialAt: Date.now(),
          },
        })),

      resetProgress: () => set({ ...defaultProfile }),
    }),
    {
      name: PROFILE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Safe fallback on parse error
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Profile hydration error, resetting to default:', error);
        }
      },
    }
  )
);
