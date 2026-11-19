import { Pet } from '../engine/types';

export interface PetConfigItem {
  id: Pet;
  name: string;
  nameTr: string;
  emoji: string;
  rewardId: string;
  rewardNameTr: string;
  rewardEmoji: string;
  color: string;
}

export const PET_CONFIGS: Record<Pet, PetConfigItem> = {
  cat: {
    id: 'cat',
    name: 'Cat',
    nameTr: 'Kedi',
    emoji: '🐱',
    rewardId: 'mouse',
    rewardNameTr: 'Fare',
    rewardEmoji: '🐭',
    color: '#FFB86C',
  },
  dog: {
    id: 'dog',
    name: 'Dog',
    nameTr: 'Köpek',
    emoji: '🐶',
    rewardId: 'bone',
    rewardNameTr: 'Kemik',
    rewardEmoji: '🦴',
    color: '#8BE9FD',
  },
  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    nameTr: 'Tavşan',
    emoji: '🐰',
    rewardId: 'carrot',
    rewardNameTr: 'Havuç',
    rewardEmoji: '🥕',
    color: '#FF79C6',
  },
};

// Harmonious, soft, modern pastel palette for up to 9 regions
export const REGION_COLORS = [
  '#FFDFD3', // Şeftali Pembe
  '#E0BBE4', // Pastel Lavanta
  '#D4F0F0', // Buz Mavisi
  '#FCF4D9', // Krem Sarı
  '#CCE2CB', // Pastel Nane Yeşili
  '#C8D9EB', // Gökyüzü Mavi
  '#FFC6FF', // Gül Pembe
  '#BFFCC6', // Açık Çimen
  '#E8DFF5', // Morumsu Beyaz
];

export const REGION_SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
