import { getLeaderboardData } from '../services/leaderboardService';

describe('Leaderboard Service', () => {
  it('returns podium with top 3 players', () => {
    const data = getLeaderboardData('cat', 10, 3);

    expect(data.podium).toBeDefined();
    expect(data.podium.length).toBe(3);

    const ranks = data.podium.map((p) => p.rank).sort();
    expect(ranks).toEqual([1, 2, 3]);
  });

  it('includes current user correctly positioned in rankings', () => {
    const userTreats = 25;
    const userLevel = 5;
    const data = getLeaderboardData('dog', userTreats, userLevel);

    expect(data.rankings).toBeDefined();
    expect(data.rankings.length).toBeGreaterThan(0);

    const userEntry = data.rankings.find((p) => p.isCurrentUser);
    expect(userEntry).toBeDefined();
    expect(userEntry?.name).toBe('Sen (Senin Dostun)');
    expect(userEntry?.pet).toBe('dog');
    expect(userEntry?.petEmoji).toBe('🐶');
    expect(userEntry?.treatCount).toBe(userTreats);
    expect(userEntry?.level).toBe(userLevel);
    expect(data.userRank).toBe(userEntry?.rank);
  });

  it('returns valid tournament countdown and multiplier tier', () => {
    const data = getLeaderboardData('rabbit', 5, 2);

    expect(data.tournament).toBeDefined();
    expect(data.tournament.timeLeftSeconds).toBeGreaterThan(0);
    expect(data.tournament.multiplierTier).toMatch(/^x\d$/);
    expect(data.tournament.bonusRewardText).toBeTruthy();
  });
});
