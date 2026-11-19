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

export const REGION_COLORS = [
  '#FFB3BA', // Pastel Pembe
  '#BAFFC9', // Pastel Yeşil
  '#BAE1FF', // Pastel Mavi
  '#FFFFBA', // Pastel Sarı
  '#FFDFBA', // Pastel Turuncu
  '#E8BAFF', // Pastel Mor
  '#BFFCC6', // Nane Yeşili
  '#D5AAFF', // Lavanta
  '#FFC6FF', // Gül Pembe
];

export const REGION_SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
