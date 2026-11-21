import {
  canShowInterstitial,
  DEFAULT_AD_CONFIG,
  getInterstitialCooldownRemaining,
  PLACEMENT_INFO,
} from '../services/adService';

describe('Ad Service - Monetization & Frequency Capping', () => {
  const baseNow = 1000000;

  test('blocks interstitial if levels played is under threshold', () => {
    // 0 levels played, plenty of time passed
    const canShow0 = canShowInterstitial(0, 0, DEFAULT_AD_CONFIG, baseNow);
    expect(canShow0).toBe(false);

    // 1 level played, plenty of time passed
    const canShow1 = canShowInterstitial(1, 0, DEFAULT_AD_CONFIG, baseNow);
    expect(canShow1).toBe(false);
  });

  test('blocks interstitial if cooldown interval has not elapsed', () => {
    // 3 levels played, but last ad shown only 30s ago (interval is 90s)
    const lastAt = baseNow - 30 * 1000;
    const canShow = canShowInterstitial(3, lastAt, DEFAULT_AD_CONFIG, baseNow);
    expect(canShow).toBe(false);

    const remaining = getInterstitialCooldownRemaining(lastAt, DEFAULT_AD_CONFIG, baseNow);
    expect(remaining).toBe(60);
  });

  test('allows interstitial when both level count and time cooldown are satisfied', () => {
    // 2 levels played, last ad was 100s ago (> 90s)
    const lastAt = baseNow - 100 * 1000;
    const canShow = canShowInterstitial(2, lastAt, DEFAULT_AD_CONFIG, baseNow);
    expect(canShow).toBe(true);

    const remaining = getInterstitialCooldownRemaining(lastAt, DEFAULT_AD_CONFIG, baseNow);
    expect(remaining).toBe(0);
  });

  test('has complete placement metadata for rewarded and interstitial ad units', () => {
    const placements = [
      'continue_game',
      'hint',
      'double_reward',
      'level_complete',
      'game_restart',
      'home_navigation',
    ] as const;

    placements.forEach((placement) => {
      const info = PLACEMENT_INFO[placement];
      expect(info).toBeDefined();
      expect(info.titleTr.length).toBeGreaterThan(0);
      expect(info.descriptionTr.length).toBeGreaterThan(0);
      expect(info.rewardTextTr.length).toBeGreaterThan(0);
      expect(info.icon.length).toBeGreaterThan(0);
    });
  });
});
