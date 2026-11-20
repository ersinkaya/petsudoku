import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { GameResult, GameState, Pet, Profile, Stats } from '../engine/types';
import { BadgeDefinition, checkNewBadges } from '../stats/badges';

const PROFILE_STORAGE_KEY = '@pedsudoku_profile_v1';

// In-memory fallback in case native storage module is unavailable in certain testing environments
const inMemoryCache = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (AsyncStorage) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) return value;
      }
    } catch (e) {
      // Graceful fallback to memory
    }
    return inMemoryCache.get(key) || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    inMemoryCache.set(key, value);
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      // Graceful fallback to memory
    }
  },
  removeItem: async (key: string): Promise<void> => {
    inMemoryCache.delete(key);
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      // Graceful fallback to memory
    }
  },
};

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
  hasSeenTutorial: false,
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

export interface GameRecordReturn {
  isNewHighScore: boolean;
  isNewBestTime: boolean;
  rankInSize: number;
  newBadges: BadgeDefinition[];
}

interface ProfileActions {
  setPet: (pet: Pet) => void;
  advanceLevel: () => void;
  setHasSeenTutorial: (seen: boolean) => void;
  addReward: (rewardId: string, count?: number) => void;
  updateSettings: (settings: Partial<Profile['settings']>) => void;
  saveGame: (game: GameState | null) => void;
  recordGameResult: (result: GameResult) => GameRecordReturn;
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

      setHasSeenTutorial: (hasSeenTutorial: boolean) => set({ hasSeenTutorial }),

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

      recordGameResult: (result: GameResult): GameRecordReturn => {
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

        const rankInSize = updatedList.findIndex((item) => item.playedAt === result.playedAt) + 1;

        // Update streak days
        const todayStr = new Date().toISOString().split('T')[0];
        let streakDays = currentStats.streakDays;
        if (currentStats.lastPlayedDay !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (currentStats.lastPlayedDay === yesterdayStr) {
            streakDays += 1;
          } else {
            streakDays = 1;
          }
        }

        const candidateStats: Stats = {
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
        };

        // Check for new badges
        const newBadges = checkNewBadges(
          currentStats.badges || [],
          result,
          candidateStats,
          state.rewards
        );

        const allBadgesSet = new Set([...(currentStats.badges || []), ...newBadges.map((b) => b.id)]);

        const finalStats: Stats = {
          ...candidateStats,
          badges: Array.from(allBadgesSet),
        };

        set({
          stats: finalStats,
          ads: {
            ...state.ads,
            levelsSinceInterstitial: state.ads.levelsSinceInterstitial + 1,
          },
        });

        return {
          isNewHighScore,
          isNewBestTime,
          rankInSize: rankInSize > 0 ? rankInSize : 1,
          newBadges,
        };
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
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
