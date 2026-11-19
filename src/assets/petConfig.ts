import { Pet } from '../engine/types';

export interface PetConfigItem {
  id: Pet;
  name: string;
  nameTr: string;
  emoji: string;
  treatEmoji: string; // Lives icon (e.g. 🐟 for cat, 🦴 for dog, 🥕 for rabbit)
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
    treatEmoji: '🐟',
    rewardId: 'mouse',
    rewardNameTr: 'Fare',
    rewardEmoji: '🐭',
    color: '#F6A265',
  },
  dog: {
    id: 'dog',
    name: 'Dog',
    nameTr: 'Köpek',
    emoji: '🐶',
    treatEmoji: '🦴',
    rewardId: 'bone',
    rewardNameTr: 'Kemik',
    rewardEmoji: '🦴',
    color: '#A1BDD4',
  },
  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    nameTr: 'Tavşan',
    emoji: '🐰',
    treatEmoji: '🥕',
    rewardId: 'carrot',
    rewardNameTr: 'Havuç',
    rewardEmoji: '🥕',
    color: '#F4A6C4',
  },
};

// Exact, authentic color palette from screenshot
export const REGION_COLORS = [
  '#F6A265', // Şeftali / Turuncu (Orange/Peach)
  '#8C77CE', // Lavanta / Mor (Purple/Violet)
  '#9ED387', // Fıstık Yeşil (Light Green)
  '#A1BDD4', // Pastel Mavi (Baby Blue)
  '#3EB1A6', // Turkuaz / Camgöbeği (Teal)
  '#F4A6C4', // Bebek Pembe (Soft Pink)
  '#4967A4', // Koyu İndigo Mavi (Navy/Indigo)
  '#E2B43D', // Hardal Sarı (Mustard Gold)
  '#CC6D70', // Kiremit / Gül Kurusu (Terracotta Red)
];
