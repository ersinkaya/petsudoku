import { checkNewBadges } from '../stats/badges';
import { GameResult, Stats } from '../engine/types';

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
    playedAt: Date.now(),
  };

  test('unlocks Flawless, Pure Mind, and Speed Demon on a perfect quick 3-heart game', () => {
    const newBadges = checkNewBadges([], baseResult, baseStats, { mouse: 2 });
    const ids = newBadges.map((b) => b.id);

    expect(ids).toContain('flawless'); // 3 hearts
    expect(ids).toContain('no_hints'); // 0 hints
    expect(ids).toContain('speed_demon'); // 45s < 60s
  });

  test('does not grant already unlocked badges again', () => {
    const alreadyEarned = ['flawless', 'no_hints', 'speed_demon'];
    const newBadges = checkNewBadges(alreadyEarned, baseResult, baseStats, { mouse: 2 });

    expect(newBadges.length).toBe(0);
  });

  test('unlocks 3-streak and 10-streak correctly', () => {
    const statsStreak3 = { ...baseStats, streakGames: 3 };
    const badges3 = checkNewBadges([], { ...baseResult, heartsLeft: 1, hintsUsed: 1, seconds: 120 }, statsStreak3, {});
    expect(badges3.map((b) => b.id)).toContain('streak_3');
    expect(badges3.map((b) => b.id)).not.toContain('streak_10');

    const statsStreak10 = { ...baseStats, streakGames: 10 };
    const badges10 = checkNewBadges(['streak_3'], { ...baseResult, heartsLeft: 1, hintsUsed: 1, seconds: 120 }, statsStreak10, {});
    expect(badges10.map((b) => b.id)).toContain('streak_10');
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

  test('unlocks collector_10 badge when total treats reach 10', () => {
    const rewards = { mouse: 5, bone: 3, carrot: 2 };
    const newBadges = checkNewBadges([], { ...baseResult, heartsLeft: 2, hintsUsed: 1, seconds: 80 }, baseStats, rewards);
    expect(newBadges.map((b) => b.id)).toContain('collector_10');
  });
});
