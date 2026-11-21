import { trackEvent } from './analytics';

export type RewardedPlacement = 'continue_game' | 'hint' | 'double_reward';
export type InterstitialPlacement = 'level_complete' | 'game_restart' | 'home_navigation';

export interface AdConfig {
  minLevelsBetweenInterstitials: number;
  minSecondsBetweenInterstitials: number;
  rewardedDurationSeconds: number;
  interstitialDurationSeconds: number;
  testMode: boolean;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  minLevelsBetweenInterstitials: 2, // At least 2 games completed
  minSecondsBetweenInterstitials: 90, // Minimum 90 seconds between popups
  rewardedDurationSeconds: 5, // 5s simulation in Expo Go
  interstitialDurationSeconds: 3, // 3s simulation in Expo Go
  testMode: true,
};

export interface ShowAdOptions {
  placement: RewardedPlacement | InterstitialPlacement;
  onRewarded?: () => void;
  onDismiss?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Checks whether an interstitial ad is eligible to be shown based on
 * frequency capping and cooldown intervals.
 */
export function canShowInterstitial(
  levelsSinceInterstitial: number,
  lastInterstitialAt: number,
  config: AdConfig = DEFAULT_AD_CONFIG,
  now: number = Date.now()
): boolean {
  if (levelsSinceInterstitial < config.minLevelsBetweenInterstitials) {
    return false;
  }
  const elapsedSeconds = (now - lastInterstitialAt) / 1000;
  if (elapsedSeconds < config.minSecondsBetweenInterstitials) {
    return false;
  }
  return true;
}

/**
 * Returns remaining seconds until next interstitial ad can be displayed.
 */
export function getInterstitialCooldownRemaining(
  lastInterstitialAt: number,
  config: AdConfig = DEFAULT_AD_CONFIG,
  now: number = Date.now()
): number {
  const elapsedSeconds = (now - lastInterstitialAt) / 1000;
  const remaining = config.minSecondsBetweenInterstitials - elapsedSeconds;
  return Math.max(0, Math.ceil(remaining));
}

/**
 * Metadata descriptions for each ad placement (for clean UI presentation).
 */
export const PLACEMENT_INFO: Record<
  RewardedPlacement | InterstitialPlacement,
  { titleTr: string; descriptionTr: string; rewardTextTr: string; icon: string }
> = {
  continue_game: {
    titleTr: 'Can Yenileme',
    descriptionTr: 'Oyuna 3 can ile kaldığın yerden devam etmek için kısa tanıtımı izle.',
    rewardTextTr: '+3 Can Kazanıldı! ❤️❤️❤️',
    icon: '❤️',
  },
  hint: {
    titleTr: 'Ekstra İpucu',
    descriptionTr: 'Sıkıştığın bu hücre için +1 ipucu kazanmak üzere kısa tanıtımı izle.',
    rewardTextTr: '+1 İpucu Eklendi! 💡',
    icon: '💡',
  },
  double_reward: {
    titleTr: 'Çift Ödül Bonusu',
    descriptionTr: 'Bu zaferden kazandığın sevimli ödül mamasını 2 katına çıkar!',
    rewardTextTr: '2× Ödül Maması Kazanıldı! 🎁',
    icon: '🎁',
  },
  level_complete: {
    titleTr: 'Bölüm Tamamlandı',
    descriptionTr: 'PetSudoku ücretsiz bir oyundur. Bizi desteklediğiniz için teşekkürler!',
    rewardTextTr: 'Teşekkürler!',
    icon: '🌟',
  },
  game_restart: {
    titleTr: 'Yeniden Başlatılıyor',
    descriptionTr: 'Yeni bir şans! Odaklan ve saf mantıkla bulmacayı fethet.',
    rewardTextTr: 'İyi Şanslar!',
    icon: '🎮',
  },
  home_navigation: {
    titleTr: 'Ana Menüye Dönülüyor',
    descriptionTr: 'Günün bir sonraki bulmacasında görüşmek üzere!',
    rewardTextTr: 'Görüşmek Üzere!',
    icon: '🏠',
  },
};
