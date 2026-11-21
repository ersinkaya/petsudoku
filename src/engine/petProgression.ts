import { Pet } from './types';

export interface PetTier {
  level: number;
  titleTr: string;
  minTreats: number;
  nextLevelTreats: number | null; // null if max level reached
  tierEmoji: string;
  perkTr: string;
}

export const PET_TIERS: PetTier[] = [
  {
    level: 1,
    titleTr: 'Yavru Dost',
    minTreats: 0,
    nextLevelTreats: 10,
    tierEmoji: '🐾',
    perkTr: 'Maceraya yeni başlayan hevesli dost',
  },
  {
    level: 2,
    titleTr: 'Neşeli Yoldaş',
    minTreats: 10,
    nextLevelTreats: 25,
    tierEmoji: '✨',
    perkTr: 'Oyunlarda neşe ve pozitif enerji saçar',
  },
  {
    level: 3,
    titleTr: 'Usta Pati',
    minTreats: 25,
    nextLevelTreats: 50,
    tierEmoji: '🌟',
    perkTr: 'Zorlu bulmacalarda güvenilir bir rehber',
  },
  {
    level: 4,
    titleTr: 'Efsanevi Yoldaş',
    minTreats: 50,
    nextLevelTreats: null,
    tierEmoji: '👑',
    perkTr: 'Tüm tahtaların ve mantığın bilge efendisi',
  },
];

export interface PetProgressionInfo {
  level: number;
  titleTr: string;
  tierEmoji: string;
  currentTreats: number;
  minTreats: number;
  nextLevelTreats: number | null;
  treatsRemaining: number;
  progress: number; // 0 to 1
  isMaxLevel: boolean;
  perkTr: string;
}

/**
 * Calculates current level, title, XP progress, and remaining treats for any pet
 * based on the number of treats collected for that pet.
 */
export function getPetProgression(treatsCount: number): PetProgressionInfo {
  const count = Math.max(0, treatsCount || 0);

  let currentTier = PET_TIERS[0];
  for (let i = PET_TIERS.length - 1; i >= 0; i--) {
    if (count >= PET_TIERS[i].minTreats) {
      currentTier = PET_TIERS[i];
      break;
    }
  }

  const isMaxLevel = currentTier.nextLevelTreats === null;
  const nextLevelTreats = currentTier.nextLevelTreats;

  let progress = 1;
  let treatsRemaining = 0;

  if (!isMaxLevel && nextLevelTreats !== null) {
    const range = nextLevelTreats - currentTier.minTreats;
    const gained = count - currentTier.minTreats;
    progress = range > 0 ? Math.min(1, Math.max(0, gained / range)) : 0;
    treatsRemaining = Math.max(0, nextLevelTreats - count);
  }

  return {
    level: currentTier.level,
    titleTr: currentTier.titleTr,
    tierEmoji: currentTier.tierEmoji,
    currentTreats: count,
    minTreats: currentTier.minTreats,
    nextLevelTreats,
    treatsRemaining,
    progress,
    isMaxLevel,
    perkTr: currentTier.perkTr,
  };
}
