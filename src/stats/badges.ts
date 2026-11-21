import { DailyStats, GameResult, Stats } from '../engine/types';

export type BadgeCategory = 'skill' | 'speed' | 'difficulty' | 'streak' | 'collection';

export interface BadgeDefinition {
  id: string;
  titleTr: string;
  descriptionTr: string;
  icon: string;
  category: BadgeCategory;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  // --- BECERİ (SKILL) ---
  first_win: {
    id: 'first_win',
    titleTr: 'İlk Zafer',
    descriptionTr: 'İlk bulmacanı başarıyla tamamla.',
    icon: '🎯',
    category: 'skill',
  },
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
    descriptionTr: 'Hiç ipucu kullanmadan bir bulmaca bitir.',
    icon: '🧠',
    category: 'skill',
  },
  no_undo: {
    id: 'no_undo',
    titleTr: 'Kararlı Adımlar',
    descriptionTr: 'Hiç geri al (Undo) kullanmadan bir bulmaca tamamla.',
    icon: '👣',
    category: 'skill',
  },
  perfect_game: {
    id: 'perfect_game',
    titleTr: 'Kusursuz Deha',
    descriptionTr: '3 can, 0 ipucu ve 0 geri alma ile bir bulmaca kazan.',
    icon: '💎',
    category: 'skill',
  },
  all_sizes: {
    id: 'all_sizes',
    titleTr: 'Bütün Boyutlar',
    descriptionTr: '5x5, 6x6, 7x7, 8x8 ve 9x9 boyutlarının her birinde en az 1 galibiyet al.',
    icon: '👑',
    category: 'skill',
  },

  // --- HIZ (SPEED) ---
  speed_300: {
    id: 'speed_300',
    titleTr: 'Çevik Zihin',
    descriptionTr: '5 dakikanın (300 sn) altında bir bulmaca çöz.',
    icon: '⏱️',
    category: 'speed',
  },
  speed_180: {
    id: 'speed_180',
    titleTr: 'Hızlı Pati',
    descriptionTr: '3 dakikanın (180 sn) altında bir bulmaca çöz.',
    icon: '🐇',
    category: 'speed',
  },
  speed_90: {
    id: 'speed_90',
    titleTr: 'Rüzgar Gibi',
    descriptionTr: '90 saniyenin altında bir bulmaca çöz.',
    icon: '🌪️',
    category: 'speed',
  },
  speed_demon: {
    id: 'speed_demon',
    titleTr: 'Şimşek Hızında',
    descriptionTr: '60 saniyeden kısa sürede bir bulmaca çöz.',
    icon: '⚡',
    category: 'speed',
  },

  // --- ZORLUK (DIFFICULTY) ---
  first_medium: {
    id: 'first_medium',
    titleTr: 'Orta Seviye Ustası',
    descriptionTr: 'Orta (Medium) zorlukta bir bulmaca tamamla.',
    icon: '🥉',
    category: 'difficulty',
  },
  first_hard: {
    id: 'first_hard',
    titleTr: 'Zorlu Sınav',
    descriptionTr: 'Zor (Hard) seviyede bir bulmaca tamamla.',
    icon: '🥈',
    category: 'difficulty',
  },
  first_master: {
    id: 'first_master',
    titleTr: 'Usta Seviye',
    descriptionTr: 'Usta (Master) seviyesinde bir bulmaca tamamla.',
    icon: '🥇',
    category: 'difficulty',
  },
  master_5: {
    id: 'master_5',
    titleTr: 'Usta Avcısı',
    descriptionTr: '5 adet Usta seviye bulmaca çöz.',
    icon: '🎖️',
    category: 'difficulty',
  },

  // --- KAZANMA SERİSİ & GÜNLÜK (STREAK) ---
  streak_3: {
    id: 'streak_3',
    titleTr: '3 Oyunluk Seri',
    descriptionTr: 'Art arda 3 bulmaca kazan.',
    icon: '🌟',
    category: 'streak',
  },
  streak_5: {
    id: 'streak_5',
    titleTr: '5 Oyunluk Seri',
    descriptionTr: 'Art arda 5 bulmaca kazan.',
    icon: '✨',
    category: 'streak',
  },
  streak_10: {
    id: 'streak_10',
    titleTr: '10 Oyunluk Seri',
    descriptionTr: 'Art arda 10 bulmaca kazanarak seriyi taçlandır.',
    icon: '🔥',
    category: 'streak',
  },
  daily_first: {
    id: 'daily_first',
    titleTr: 'Günün Kahramanı',
    descriptionTr: 'İlk Günün Bulmacasını tamamla.',
    icon: '📅',
    category: 'streak',
  },
  daily_streak_3: {
    id: 'daily_streak_3',
    titleTr: '3 Günlük Sadakat',
    descriptionTr: 'Art arda 3 gün Günün Bulmacasını çöz.',
    icon: '🥉',
    category: 'streak',
  },
  daily_streak_7: {
    id: 'daily_streak_7',
    titleTr: 'Haftalık Rutin',
    descriptionTr: 'Art arda 7 gün Günün Bulmacasını çöz.',
    icon: '🥈',
    category: 'streak',
  },
  daily_streak_14: {
    id: 'daily_streak_14',
    titleTr: '14 Günlük İrade',
    descriptionTr: 'Art arda 14 gün Günün Bulmacasını çöz.',
    icon: '🏅',
    category: 'streak',
  },
  daily_streak_30: {
    id: 'daily_streak_30',
    titleTr: 'Aylık Efsane',
    descriptionTr: 'Art arda 30 gün Günün Bulmacasını çöz.',
    icon: '🏆',
    category: 'streak',
  },

  // --- KOLEKSİYON & SEVİMLİ DOSTLAR (COLLECTION) ---
  collector_10: {
    id: 'collector_10',
    titleTr: 'Büyük Koleksiyoncu',
    descriptionTr: 'Toplam 10 veya daha fazla ödül biriktir.',
    icon: '🧺',
    category: 'collection',
  },
  collector_25: {
    id: 'collector_25',
    titleTr: 'Hazine Avcısı',
    descriptionTr: 'Toplam 25 veya daha fazla ödül biriktir.',
    icon: '🎁',
    category: 'collection',
  },
  collector_50: {
    id: 'collector_50',
    titleTr: 'Usta Koleksiyoncu',
    descriptionTr: 'Toplam 50 veya daha fazla ödül biriktir.',
    icon: '💎',
    category: 'collection',
  },
  collector_100: {
    id: 'collector_100',
    titleTr: 'Efsanevi Kiler',
    descriptionTr: 'Toplam 100 veya daha fazla ödül biriktir.',
    icon: '🏰',
    category: 'collection',
  },
  cat_fan: {
    id: 'cat_fan',
    titleTr: 'Kedi Dostu',
    descriptionTr: '15 veya daha fazla Fare ödülü topla.',
    icon: '🐱',
    category: 'collection',
  },
  dog_fan: {
    id: 'dog_fan',
    titleTr: 'Sadık Yoldaş',
    descriptionTr: '15 veya daha fazla Kemik ödülü topla.',
    icon: '🐶',
    category: 'collection',
  },
  rabbit_fan: {
    id: 'rabbit_fan',
    titleTr: 'Havuç Tutkunu',
    descriptionTr: '15 veya daha fazla Havuç ödülü topla.',
    icon: '🐰',
    category: 'collection',
  },

  // --- BOYUT USTALARI (SIZES) ---
  size_5_win: {
    id: 'size_5_win',
    titleTr: '5x5 Başlangıç',
    descriptionTr: '5x5 tahtada bir bulmaca çöz.',
    icon: '🌱',
    category: 'skill',
  },
  size_7_win: {
    id: 'size_7_win',
    titleTr: '7x7 Taktisyen',
    descriptionTr: '7x7 tahtada bir bulmaca çöz.',
    icon: '🎯',
    category: 'skill',
  },
  size_9_win: {
    id: 'size_9_win',
    titleTr: '9x9 Şampiyonu',
    descriptionTr: 'En büyük tahta olan 9x9 boyutunda bir bulmaca çöz.',
    icon: '🦁',
    category: 'skill',
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
  profileRewards: Record<string, number>,
  dailyStats?: DailyStats
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

  // 1. İlk Zafer
  grantBadge('first_win');

  // 2. Hatasız: 3 kalple bitir
  if (lastResult.heartsLeft >= 3) {
    grantBadge('flawless');
  }

  // 3. Saf Mantık: 0 ipucu
  if (lastResult.hintsUsed === 0) {
    grantBadge('no_hints');
  }

  // 4. Kararlı Adımlar: 0 undo
  if (lastResult.undosUsed !== undefined && lastResult.undosUsed === 0) {
    grantBadge('no_undo');
  }

  // 5. Kusursuz Deha: 3 can, 0 ipucu, 0 undo
  if (
    lastResult.heartsLeft >= 3 &&
    lastResult.hintsUsed === 0 &&
    (lastResult.undosUsed === 0 || lastResult.undosUsed === undefined)
  ) {
    grantBadge('perfect_game');
  }

  // 6. Hız rozetleri
  if (lastResult.seconds < 300) grantBadge('speed_300');
  if (lastResult.seconds < 180) grantBadge('speed_180');
  if (lastResult.seconds < 90) grantBadge('speed_90');
  if (lastResult.seconds < 60) grantBadge('speed_demon');

  // 7. Zorluk rozetleri
  const diff = lastResult.difficulty;
  if (diff === 'medium') grantBadge('first_medium');
  if (diff === 'hard') grantBadge('first_hard');
  if (diff === 'master') grantBadge('first_master');

  // Master sayısı kontrolü
  let masterCount = 0;
  for (const list of Object.values(updatedStats.bestBySize || {})) {
    for (const r of list) {
      if (r.difficulty === 'master') {
        masterCount++;
      }
    }
  }
  if (masterCount >= 5) grantBadge('master_5');

  // 8. Seri rozetleri
  if (updatedStats.streakGames >= 3) grantBadge('streak_3');
  if (updatedStats.streakGames >= 5) grantBadge('streak_5');
  if (updatedStats.streakGames >= 10) grantBadge('streak_10');

  // 9. Boyut rozetleri
  if (lastResult.size === 5) grantBadge('size_5_win');
  if (lastResult.size === 7) grantBadge('size_7_win');
  if (lastResult.size === 9) grantBadge('size_9_win');

  const sizes = [5, 6, 7, 8, 9];
  const hasAllSizes = sizes.every(
    (sz) => updatedStats.bestBySize[sz] && updatedStats.bestBySize[sz].length > 0
  );
  if (hasAllSizes) {
    grantBadge('all_sizes');
  }

  // 10. Ödül / Koleksiyon rozetleri
  const totalRewards = Object.values(profileRewards || {}).reduce((sum, n) => sum + (n || 0), 0);
  if (totalRewards >= 10) grantBadge('collector_10');
  if (totalRewards >= 25) grantBadge('collector_25');
  if (totalRewards >= 50) grantBadge('collector_50');
  if (totalRewards >= 100) grantBadge('collector_100');

  if ((profileRewards?.mouse || 0) >= 15) grantBadge('cat_fan');
  if ((profileRewards?.bone || 0) >= 15) grantBadge('dog_fan');
  if ((profileRewards?.carrot || 0) >= 15) grantBadge('rabbit_fan');

  // 11. Günlük bulmaca rozetleri
  if (lastResult.isDaily || (dailyStats && dailyStats.completedDates.length > 0)) {
    grantBadge('daily_first');
  }
  if (dailyStats) {
    const maxStreak = Math.max(dailyStats.currentStreak, dailyStats.bestStreak);
    if (maxStreak >= 3) grantBadge('daily_streak_3');
    if (maxStreak >= 7) grantBadge('daily_streak_7');
    if (maxStreak >= 14) grantBadge('daily_streak_14');
    if (maxStreak >= 30) grantBadge('daily_streak_30');
  }

  return newlyEarned;
}
