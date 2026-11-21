import { DifficultyLevel } from './types';

export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const TURKISH_DAYS = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTurkishDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  const monthName = TURKISH_MONTHS[month] || '';
  const dayName = TURKISH_DAYS[d.getDay()] || '';
  return `${day} ${monthName} ${dayName}`;
}

export interface DailyPuzzleConfig {
  dateStr: string;
  size: number;
  difficulty: DifficultyLevel;
  seed: number;
  formattedDateTr: string;
}

/**
 * Returns deterministic configuration for a given calendar day.
 * Everyone around the world receives the exact same puzzle on that date.
 */
export function getDailyPuzzleConfig(dateStr: string = getTodayDateString()): DailyPuzzleConfig {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat

  let size: number;
  let difficulty: DifficultyLevel;

  switch (dayOfWeek) {
    case 1: // Pazartesi
      size = 6;
      difficulty = 'medium';
      break;
    case 2: // Salı
      size = 7;
      difficulty = 'medium';
      break;
    case 3: // Çarşamba
      size = 7;
      difficulty = 'hard';
      break;
    case 4: // Perşembe
      size = 8;
      difficulty = 'hard';
      break;
    case 5: // Cuma
      size = 8;
      difficulty = 'hard';
      break;
    case 6: // Cumartesi (Hafta sonu mücadelesi)
      size = 9;
      difficulty = 'master';
      break;
    case 0: // Pazar (Süper Usta)
    default:
      size = 9;
      difficulty = 'master';
      break;
  }

  const seed = stringToSeed(`petsudoku-daily-v1-${dateStr}`);
  const formattedDateTr = formatTurkishDate(dateStr);

  return {
    dateStr,
    size,
    difficulty,
    seed,
    formattedDateTr,
  };
}
