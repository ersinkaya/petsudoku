import { ALL_BADGES, BADGE_DEFINITIONS, checkNewBadges } from '../stats/badges';
import { DailyStats, GameResult, Stats } from '../engine/types';

describe('Badges System', () => {
  const baseStats: Stats = {
    totalScore: 1000,
    bestBySize: {},
    bestTimeBySize: {},
    streakGames: 1,
    streakDays: 1,
    lastPlayedDay: '2026-11-20',
    badges: [],
  };

  const baseResult: GameResult = {
    level: 1,
    size: 5,
    score: 650,
    seconds: 45,
    heartsLeft: 3,
    hintsUsed: 0,
    undosUsed: 0,
    difficulty: 'easy',
    playedAt: Date.now(),
  };

  test('contains 32 total badge definitions across categories', () => {
    expect(ALL_BADGES.length).toBe(32);
    expect(Object.keys(BADGE_DEFINITIONS).length).toBe(32);
  });

  test('unlocks first_win, flawless, no_hints, no_undo, and perfect_game on clean win', () => {
    const newBadges = checkNewBadges([], baseResult, baseStats, { mouse: 2 });
    const ids = newBadges.map((b) => b.id);

    expect(ids).toContain('first_win');
    expect(ids).toContain('flawless'); // 3 hearts
    expect(ids).toContain('no_hints'); // 0 hints
    expect(ids).toContain('no_undo'); // 0 undos
    expect(ids).toContain('perfect_game'); // 3 hearts + 0 hints + 0 undos
    expect(ids).toContain('speed_demon'); // 45s < 60s
    expect(ids).toContain('speed_90');
    expect(ids).toContain('speed_180');
    expect(ids).toContain('speed_300');
    expect(ids).toContain('size_5_win');
  });

  test('does not grant already unlocked badges again', () => {
    const alreadyEarned = ['first_win', 'flawless', 'no_hints', 'speed_demon'];
    const newBadges = checkNewBadges(alreadyEarned, baseResult, baseStats, { mouse: 2 });
    const ids = newBadges.map((b) => b.id);

    expect(ids).not.toContain('first_win');
    expect(ids).not.toContain('flawless');
    expect(ids).not.toContain('no_hints');
    expect(ids).not.toContain('speed_demon');
  });

  test('does not grant no_undo or perfect_game if undos were used', () => {
    const resultWithUndo: GameResult = {
      ...baseResult,
      undosUsed: 2,
    };
    const newBadges = checkNewBadges([], resultWithUndo, baseStats, {});
    const ids = newBadges.map((b) => b.id);

    expect(ids).not.toContain('no_undo');
    expect(ids).not.toContain('perfect_game');
    expect(ids).toContain('flawless'); // still had 3 hearts
  });

  test('unlocks 3-streak, 5-streak and 10-streak correctly', () => {
    const statsStreak3 = { ...baseStats, streakGames: 3 };
    const badges3 = checkNewBadges([], { ...baseResult, heartsLeft: 1, hintsUsed: 1, seconds: 120 }, statsStreak3, {});
    expect(badges3.map((b) => b.id)).toContain('streak_3');
    expect(badges3.map((b) => b.id)).not.toContain('streak_5');

    const statsStreak5 = { ...baseStats, streakGames: 5 };
    const badges5 = checkNewBadges(['streak_3'], { ...baseResult, heartsLeft: 1, hintsUsed: 1, seconds: 120 }, statsStreak5, {});
    expect(badges5.map((b) => b.id)).toContain('streak_5');
    expect(badges5.map((b) => b.id)).not.toContain('streak_10');

    const statsStreak10 = { ...baseStats, streakGames: 10 };
    const badges10 = checkNewBadges(['streak_3', 'streak_5'], { ...baseResult, heartsLeft: 1, hintsUsed: 1, seconds: 120 }, statsStreak10, {});
    expect(badges10.map((b) => b.id)).toContain('streak_10');
  });

  test('unlocks difficulty badges: medium, hard, master and master_5', () => {
    const hardResult: GameResult = { ...baseResult, difficulty: 'hard' };
    const badgesHard = checkNewBadges([], hardResult, baseStats, {});
    expect(badgesHard.map((b) => b.id)).toContain('first_hard');

    const masterResult: GameResult = { ...baseResult, difficulty: 'master' };
    const master5Stats: Stats = {
      ...baseStats,
      bestBySize: {
        6: [
          { ...masterResult, score: 900 },
          { ...masterResult, score: 850 },
          { ...masterResult, score: 800 },
          { ...masterResult, score: 750 },
          { ...masterResult, score: 700 },
        ],
      },
    };
    const badgesMaster = checkNewBadges([], masterResult, master5Stats, {});
    expect(badgesMaster.map((b) => b.id)).toContain('first_master');
    expect(badgesMaster.map((b) => b.id)).toContain('master_5');
  });

  test('unlocks all_sizes badge when wins exist for 5, 6, 7, 8, 9 sizes', () => {
    const allSizesStats: Stats = {
      ...baseStats,
      bestBySize: {
        5: [baseResult],
        6: [{ ...baseResult, size: 6 }],
        7: [{ ...baseResult, size: 7 }],
        8: [{ ...baseResult, size: 8 }],
        9: [{ ...baseResult, size: 9 }],
      },
    };

    const newBadges = checkNewBadges([], baseResult, allSizesStats, {});
    expect(newBadges.map((b) => b.id)).toContain('all_sizes');
  });

  test('unlocks reward and pet-specific collector badges', () => {
    const rewards = { mouse: 16, bone: 15, carrot: 20 };
    const newBadges = checkNewBadges([], { ...baseResult, heartsLeft: 2, hintsUsed: 1, seconds: 80 }, baseStats, rewards);
    const ids = newBadges.map((b) => b.id);

    expect(ids).toContain('collector_10');
    expect(ids).toContain('collector_25');
    expect(ids).toContain('collector_50');
    expect(ids).toContain('cat_fan');
    expect(ids).toContain('dog_fan');
    expect(ids).toContain('rabbit_fan');
  });

  test('unlocks daily badges including streak milestones', () => {
    const dailyStats: DailyStats = {
      completedDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
      history: {},
      currentStreak: 7,
      bestStreak: 7,
      lastCompletedDate: '2026-11-22',
    };

    const dailyResult: GameResult = {
      ...baseResult,
      isDaily: true,
      dailyDate: '2026-11-22',
    };

    const newBadges = checkNewBadges([], dailyResult, baseStats, {}, dailyStats);
    const ids = newBadges.map((b) => b.id);

    expect(ids).toContain('daily_first');
    expect(ids).toContain('daily_streak_3');
    expect(ids).toContain('daily_streak_7');
    expect(ids).not.toContain('daily_streak_14');
  });
});
