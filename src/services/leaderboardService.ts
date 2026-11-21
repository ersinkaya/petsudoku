import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';

export interface LeaderboardPlayer {
  id: string;
  rank: number;
  name: string;
  pet: Pet;
  petEmoji: string;
  treatCount: number;
  treatEmoji: string;
  cheerHearts: number;
  level: number;
  activityTimeTr: string;
  isCurrentUser?: boolean;
  avatarBgColor: string;
}

export interface TournamentInfo {
  timeLeftSeconds: number;
  multiplierTier: string;
  bonusRewardText: string;
}

/**
 * Generates deterministic, lively daily leaderboard data based on the current date,
 * dynamically positioning the user based on their actual earned treats and level.
 */
export function getLeaderboardData(
  userPet: Pet = 'cat',
  userTreats: number = 0,
  userLevel: number = 1
): {
  podium: LeaderboardPlayer[];
  rankings: LeaderboardPlayer[];
  userRank: number;
  tournament: TournamentInfo;
} {
  const userPetConfig = PET_CONFIGS[userPet] || PET_CONFIGS.cat;

  // Global simulated active players
  const rawCompetitors: Omit<LeaderboardPlayer, 'rank'>[] = [
    {
      id: 'p_1',
      name: 'ST0CR6',
      pet: 'dog',
      petEmoji: '🐶',
      treatCount: Math.max(52, userTreats + 4),
      treatEmoji: '🦴',
      cheerHearts: 12,
      level: 10,
      activityTimeTr: '18 dk önce',
      avatarBgColor: '#FEF3C7',
    },
    {
      id: 'p_2',
      name: 'T6QLFN',
      pet: 'cat',
      petEmoji: '🐱',
      treatCount: Math.max(48, userTreats + 2),
      treatEmoji: '🐟',
      cheerHearts: 9,
      level: 8,
      activityTimeTr: '2 sa önce',
      avatarBgColor: '#EDE9FE',
    },
    {
      id: 'p_3',
      name: 'Shen',
      pet: 'rabbit',
      petEmoji: '🐰',
      treatCount: Math.max(41, userTreats + 1),
      treatEmoji: '🥕',
      cheerHearts: 15,
      level: 7,
      activityTimeTr: '2 sa 9 dk önce',
      avatarBgColor: '#FFEDD5',
    },
    {
      id: 'p_4',
      name: 'Luna_M',
      pet: 'cat',
      petEmoji: '🐱',
      treatCount: 38,
      treatEmoji: '🐟',
      cheerHearts: 6,
      level: 6,
      activityTimeTr: '45 dk önce',
      avatarBgColor: '#FEE2E2',
    },
    {
      id: 'p_5',
      name: 'BarkMaster',
      pet: 'dog',
      petEmoji: '🐶',
      treatCount: 35,
      treatEmoji: '🦴',
      cheerHearts: 8,
      level: 6,
      activityTimeTr: 'Şimdi çevrimiçi',
      avatarBgColor: '#E0F2FE',
    },
    {
      id: 'p_6',
      name: 'ZıpZıp',
      pet: 'rabbit',
      petEmoji: '🐰',
      treatCount: 32,
      treatEmoji: '🥕',
      cheerHearts: 4,
      level: 5,
      activityTimeTr: '1 sa önce',
      avatarBgColor: '#DCFCE7',
    },
    {
      id: 'p_7',
      name: 'Elizabeth Kelly',
      pet: 'cat',
      petEmoji: '🐱',
      treatCount: 28,
      treatEmoji: '🐟',
      cheerHearts: 5,
      level: 4,
      activityTimeTr: '2 dk önce',
      avatarBgColor: '#FEF9C3',
    },
    {
      id: 'p_8',
      name: 'X4CYF9',
      pet: 'cat',
      petEmoji: '🐱',
      treatCount: 24,
      treatEmoji: '🐟',
      cheerHearts: 7,
      level: 4,
      activityTimeTr: 'Şimdi çevrimiçi',
      avatarBgColor: '#FFEDD5',
    },
    {
      id: 'p_9',
      name: 'PatiSever',
      pet: 'dog',
      petEmoji: '🐶',
      treatCount: 21,
      treatEmoji: '🦴',
      cheerHearts: 3,
      level: 3,
      activityTimeTr: '3 sa önce',
      avatarBgColor: '#F3E8FF',
    },
    {
      id: 'p_10',
      name: 'VCD3AK',
      pet: 'cat',
      petEmoji: '🐱',
      treatCount: 19,
      treatEmoji: '🐟',
      cheerHearts: 2,
      level: 3,
      activityTimeTr: '8 sa önce',
      avatarBgColor: '#ECFDF5',
    },
    {
      id: 'p_11',
      name: 'FluffyBun',
      pet: 'rabbit',
      petEmoji: '🐰',
      treatCount: 16,
      treatEmoji: '🥕',
      cheerHearts: 6,
      level: 2,
      activityTimeTr: '15 dk önce',
      avatarBgColor: '#FFF1F2',
    },
    {
      id: 'p_12',
      name: 'KediCan',
      pet: 'cat',
      petEmoji: '🐱',
      treatCount: 12,
      treatEmoji: '🐟',
      cheerHearts: 1,
      level: 2,
      activityTimeTr: '5 sa önce',
      avatarBgColor: '#FEF3C7',
    },
    {
      id: 'p_13',
      name: 'Milo_99',
      pet: 'dog',
      petEmoji: '🐶',
      treatCount: 8,
      treatEmoji: '🦴',
      cheerHearts: 0,
      level: 1,
      activityTimeTr: '1 gün önce',
      avatarBgColor: '#F1F5F9',
    },
  ];

  // Insert current user
  const userEntry: Omit<LeaderboardPlayer, 'rank'> = {
    id: 'user_current',
    name: 'Sen (Senin Dostun)',
    pet: userPet,
    petEmoji: userPetConfig.emoji,
    treatCount: userTreats,
    treatEmoji: userPetConfig.treatEmoji,
    cheerHearts: 7,
    level: userLevel,
    activityTimeTr: 'Şimdi çevrimiçi',
    isCurrentUser: true,
    avatarBgColor: '#FEF3C7',
  };

  const allPlayers = [...rawCompetitors, userEntry].sort(
    (a, b) => b.treatCount - a.treatCount
  );

  // Assign ranks
  const ranked: LeaderboardPlayer[] = allPlayers.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  const podium = ranked.slice(0, 3);
  const rankings = ranked.slice(3);
  const userRank = ranked.find((p) => p.isCurrentUser)?.rank || ranked.length;

  // Calculate remaining seconds until midnight reset
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const timeLeftSeconds = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));

  return {
    podium,
    rankings,
    userRank,
    tournament: {
      timeLeftSeconds,
      multiplierTier: 'x3',
      bonusRewardText: `+6 ${userPetConfig.treatEmoji}`,
    },
  };
}
