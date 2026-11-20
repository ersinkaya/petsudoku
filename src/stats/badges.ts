import { GameResult, Profile, Stats } from '../engine/types';

export interface BadgeDefinition {
  id: string;
  titleTr: string;
  descriptionTr: string;
  icon: string;
  category: 'skill' | 'streak' | 'collection' | 'speed';
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  flawless: {
    id: 'flawless',
    titleTr: 'Hatasız',
    descriptionTr: 'Hiç kalp kaybetmeden (3 canla) bir bulmaca tamamla.',
    icon: '🛡️',
    category: 'skill',
  },
  no_hints: {
    id: 'no_hints',
    titleTr: 'Saf Mantık',
    descriptionTr: 'Hiç ipucu kullanmadan bir seviye bitir.',
    icon: '🧠',
    category: 'skill',
  },
  speed_demon: {
    id: 'speed_demon',
    titleTr: 'Şimşek Hızında',
    descriptionTr: '60 saniyeden kısa sürede bir bulmaca çöz.',
    icon: '⚡',
    category: 'speed',
  },
  streak_3: {
    id: 'streak_3',
    titleTr: '3 Oyunluk Seri',
    descriptionTr: 'Art arda 3 bulmaca kazan.',
    icon: '🌟',
    category: 'streak',
  },
  streak_10: {
    id: 'streak_10',
    titleTr: '10 Oyunluk Seri',
    descriptionTr: 'Art arda 10 bulmaca kazanarak ustalaş.',
    icon: '🔥',
    category: 'streak',
  },
  all_sizes: {
    id: 'all_sizes',
    titleTr: 'Bütün Boyutlar',
    descriptionTr: '5x5, 6x6, 7x7, 8x8 ve 9x9 boyutlarının her birinde en az 1 galibiyet al.',
    icon: '👑',
    category: 'skill',
  },
  collector_10: {
    id: 'collector_10',
    titleTr: 'Büyük Koleksiyoncu',
    descriptionTr: 'Toplam 10 veya daha fazla ödül biriktir.',
    icon: '🏆',
    category: 'collection',
  },
};

export const ALL_BADGES: BadgeDefinition[] = Object.values(BADGE_DEFINITIONS);

/**
 * Checks which new badges are unlocked based on the updated stats and game result.
 */
export function checkNewBadges(
  currentBadges: string[],
  lastResult: GameResult,
  updatedStats: Stats,
  profileRewards: Record<string, number>
): BadgeDefinition[] {
  const earnedSet = new Set(currentBadges);
  const newlyEarned: BadgeDefinition[] = [];

  const grantBadge = (id: string) => {
    if (!earnedSet.has(id)) {
      earnedSet.add(id);
      if (BADGE_DEFINITIONS[id]) {
        newlyEarned.push(BADGE_DEFINITIONS[id]);
      }
    }
  };

  // 1. Hatasız: 3 kalple bitir
  if (lastResult.heartsLeft >= 3) {
    grantBadge('flawless');
  }

  // 2. Saf Mantık: 0 ipucu
  if (lastResult.hintsUsed === 0) {
    grantBadge('no_hints');
  }

  // 3. Şimşek Hızında: < 60 saniye
  if (lastResult.seconds < 60) {
    grantBadge('speed_demon');
  }

  // 4. 3'lü Seri
  if (updatedStats.streakGames >= 3) {
    grantBadge('streak_3');
  }

  // 5. 10'lu Seri
  if (updatedStats.streakGames >= 10) {
    grantBadge('streak_10');
  }

  // 6. Bütün Boyutlar: 5, 6, 7, 8, 9 boyutlarında kayıt olması
  const sizes = [5, 6, 7, 8, 9];
  const hasAllSizes = sizes.every(
    (sz) => (updatedStats.bestBySize[sz] && updatedStats.bestBySize[sz].length > 0)
  );
  if (hasAllSizes) {
    grantBadge('all_sizes');
  }

  // 7. Toplam 10 ödül
  const totalRewards = Object.values(profileRewards).reduce((sum, n) => sum + (n || 0), 0);
  if (totalRewards >= 10) {
    grantBadge('collector_10');
  }

  return newlyEarned;
}
