export type Pet = 'cat' | 'dog' | 'rabbit';
export type CellState = 'empty' | 'mark' | 'animal';

export type TechniqueDifficulty = 1 | 2 | 3 | 4 | 5;
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'master';

export interface PuzzleDifficulty {
  maxTechnique: TechniqueDifficulty;
  steps: number;
}

export interface Puzzle {
  size: number; // N
  regions: number[][]; // regions[r][c] = bölge numarası (0..N-1)
  solution: number[]; // solution[r] = o satırdaki hayvanın sütunu
  difficulty: PuzzleDifficulty;
  seed: number;
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface Action {
  row: number;
  col: number;
  from: CellState;
  to: CellState;
}

export interface GameState {
  puzzle: Puzzle;
  cells: CellState[][];
  lives: number; // 3 ile başlar (reklamla devam sonrası 1)
  hintsLeft: number; // 2 ile başlar (reklamla +1 olabilir)
  hintsUsed: number; // puan cezası için
  adContinueUsed: boolean; // 3. kalpte reklamla devam hakkı kullanıldı mı
  adHintUsed: boolean; // reklamla +1 ipucu hakkı kullanıldı mı
  undoStack: Action[];
  level: number;
  difficultyLevel?: DifficultyLevel;
  elapsedSeconds: number; // duraklatılabilir süre sayacı
}

export interface ConflictDetail {
  type: 'row' | 'col' | 'region' | 'adjacent';
  row?: number;
  col?: number;
  region?: number;
  otherCell?: CellCoord;
}

export interface AdState {
  levelsSinceInterstitial: number;
  lastInterstitialAt: number;
}

export interface GameResult {
  level: number;
  size: number;
  score: number;
  seconds: number;
  heartsLeft: number;
  hintsUsed: number;
  playedAt: number;
}

export interface Stats {
  totalScore: number;
  bestBySize: Record<number, GameResult[]>;
  bestTimeBySize: Record<number, number>;
  streakGames: number;
  streakDays: number;
  lastPlayedDay: string; // 'YYYY-MM-DD'
  badges: string[];
}

export interface Profile {
  pet: Pet | null;
  currentLevel: number;
  hasSeenTutorial?: boolean;
  rewards: Record<string, number>;
  settings: {
    sound: boolean;
    haptics: boolean;
    autoMark: boolean;
  };
  savedGame: GameState | null;
  stats: Stats;
  ads: AdState;
}
