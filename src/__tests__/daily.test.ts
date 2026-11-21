import {
  getDailyPuzzleConfig,
  getTodayDateString,
  formatTurkishDate,
  stringToSeed,
} from '../engine/daily';
import { useProfileStore } from '../state/profileStore';
import { useGameStore } from '../state/gameStore';

describe('Daily Puzzle Engine & Streak System', () => {
  beforeEach(() => {
    useProfileStore.getState().resetProgress();
  });

  describe('1. Determinism and Date Formatting', () => {
    it('produces identical configuration and seed for the same date', () => {
      const config1 = getDailyPuzzleConfig('2026-11-21');
      const config2 = getDailyPuzzleConfig('2026-11-21');

      expect(config1.seed).toBe(config2.seed);
      expect(config1.size).toBe(config2.size);
      expect(config1.difficulty).toBe(config2.difficulty);
      expect(config1.formattedDateTr).toBe(config2.formattedDateTr);
    });

    it('produces different seeds for different calendar days', () => {
      const configA = getDailyPuzzleConfig('2026-11-21');
      const configB = getDailyPuzzleConfig('2026-11-22');

      expect(configA.seed).not.toBe(configB.seed);
    });

    it('correctly formats Turkish dates with month and day of week', () => {
      // 21 Kasım 2026 is a Saturday
      const formatted = formatTurkishDate('2026-11-21');
      expect(formatted).toBe('21 Kasım Cumartesi');
    });

    it('assigns 9x9 Master to weekend challenges', () => {
      // 2026-11-21 is Saturday, 2026-11-22 is Sunday
      const sat = getDailyPuzzleConfig('2026-11-21');
      const sun = getDailyPuzzleConfig('2026-11-22');

      expect(sat.size).toBe(9);
      expect(sat.difficulty).toBe('master');
      expect(sun.size).toBe(9);
      expect(sun.difficulty).toBe('master');
    });
  });

  describe('2. Daily Streak & Reward Calculation', () => {
    it('records first daily puzzle completion with 2 bonus rewards and streak = 1', () => {
      const initialRewards = useProfileStore.getState().rewards['mouse'] || 0;

      const res = useProfileStore.getState().recordDailyCompleted({
        dateStr: '2026-11-21',
        score: 1500,
        seconds: 120,
      });

      expect(res.isFirstToday).toBe(true);
      expect(res.bonusRewards).toBe(2);
      expect(res.currentStreak).toBe(1);

      const daily = useProfileStore.getState().dailyStats;
      expect(daily.completedDates).toContain('2026-11-21');
      expect(daily.history['2026-11-21'].score).toBe(1500);
      expect(useProfileStore.getState().rewards['mouse']).toBe(initialRewards + 2);
    });

    it('does not double-count streak or rewards when replaying same day', () => {
      useProfileStore.getState().recordDailyCompleted({
        dateStr: '2026-11-21',
        score: 1500,
        seconds: 120,
      });

      const rewardsAfterFirst = useProfileStore.getState().rewards['mouse'];

      // Replay same day
      const res2 = useProfileStore.getState().recordDailyCompleted({
        dateStr: '2026-11-21',
        score: 1800,
        seconds: 100,
      });

      expect(res2.isFirstToday).toBe(false);
      expect(res2.bonusRewards).toBe(0);
      expect(res2.currentStreak).toBe(1);
      expect(useProfileStore.getState().rewards['mouse']).toBe(rewardsAfterFirst);
    });
  });

  describe('3. GameStore Daily Mode Integration', () => {
    it('initializes daily puzzle with correct flags and date', () => {
      const config = getDailyPuzzleConfig('2026-11-21');
      useGameStore.getState().initNewGame({
        size: config.size,
        difficulty: config.difficulty,
        seed: config.seed,
        isDaily: true,
        dailyDate: '2026-11-21',
      });

      const state = useGameStore.getState();
      expect(state.isDaily).toBe(true);
      expect(state.dailyDate).toBe('2026-11-21');
      expect(state.puzzle.isDaily).toBe(true);
      expect(state.puzzle.dailyDate).toBe('2026-11-21');
      expect(state.puzzle.size).toBe(config.size);
      expect(state.puzzle.seed).toBe(config.seed);

      const snapshot = state.getSnapshot();
      expect(snapshot.isDaily).toBe(true);
      expect(snapshot.dailyDate).toBe('2026-11-21');
    });
  });
});
