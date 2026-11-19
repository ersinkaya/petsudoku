import { create } from 'zustand';
import { generatePuzzle } from '../engine/generator';
import { getNextLogicalHint } from '../engine/techniques';
import {
  Action,
  CellCoord,
  CellState,
  ConflictDetail,
  DifficultyLevel,
  GameState,
  Puzzle,
  TechniqueDifficulty,
} from '../engine/types';
import { findConflicts, isCorrectPlacement, isSolved } from '../engine/validator';

export type TapMode = 'cycle' | 'toggle' | 'place_animal';

export interface GameStoreState extends GameState {
  isWon: boolean;
  isGameOver: boolean;
  activeHintCell: CellCoord | null;
  lastConflictDetails: ConflictDetail[] | null;
  lastErrorMessage: string | null;

  difficultyLevel: DifficultyLevel;
  // Actions
  initNewGame: (
    optionsOrLevel?: NewGameOptions | number,
    customSize?: number,
    customSeed?: number
  ) => void;
  loadSavedGame: (saved: GameState) => void;
  handleCellTap: (
    row: number,
    col: number,
    mode?: TapMode,
    autoMarkEnabled?: boolean
  ) => {
    status: 'noop' | 'mark' | 'animal_correct' | 'animal_wrong' | 'cleared';
    conflicts?: ConflictDetail[];
  };
  undo: () => boolean;
  useHint: () => CellCoord | null;
  clearActiveHint: () => void;
  continueWithRewardAd: () => boolean;
  addRewardHint: () => boolean;
  tickElapsedSecond: () => void;
}

export interface NewGameOptions {
  level?: number;
  size?: number;
  difficulty?: DifficultyLevel;
  seed?: number;
}

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  {
    nameTr: string;
    descriptionTr: string;
    badgeEmoji: string;
    color: string;
    lightColor: string;
    minTechnique?: TechniqueDifficulty;
    maxTechnique?: TechniqueDifficulty;
  }
> = {
  easy: {
    nameTr: 'Kolay',
    descriptionTr: 'Doğrudan çıkarımlar (Tek aday & komşuluk)',
    badgeEmoji: '🌱',
    color: '#38A169',
    lightColor: '#E6FFFA',
    maxTechnique: 2,
  },
  medium: {
    nameTr: 'Orta',
    descriptionTr: 'Bölge-hat izdüşümleri (Pointing & Claiming)',
    badgeEmoji: '💡',
    color: '#DD6B20',
    lightColor: '#FEEBC8',
    minTechnique: 2,
    maxTechnique: 3,
  },
  hard: {
    nameTr: 'Zor',
    descriptionTr: 'Alt küme analizleri (Box-line subsets)',
    badgeEmoji: '🔥',
    color: '#E53E3E',
    lightColor: '#FED7D7',
    minTechnique: 3,
    maxTechnique: 4,
  },
  master: {
    nameTr: 'Usta',
    descriptionTr: 'Derin mantık & çelişki analizi',
    badgeEmoji: '👑',
    color: '#805AD5',
    lightColor: '#E9D8FD',
    minTechnique: 4,
  },
};

export function getDifficultyTarget(diff: DifficultyLevel): {
  minTechnique?: TechniqueDifficulty;
  maxTechnique?: TechniqueDifficulty;
} {
  return DIFFICULTY_CONFIG[diff];
}

export const DIFFICULTY_UNLOCK_LEVELS: Record<DifficultyLevel, number> = {
  easy: 1,     // Her zaman açık (Başlangıç)
  medium: 5,   // Seviye 5'te açılır
  hard: 15,    // Seviye 15'te açılır
  master: 30,  // Seviye 30'da açılır
};

export function isDifficultyUnlocked(diff: DifficultyLevel, currentLevel: number): boolean {
  return currentLevel >= DIFFICULTY_UNLOCK_LEVELS[diff];
}

export function getDifficultyForLevel(level: number): DifficultyLevel {
  if (level < 5) return 'easy';
  if (level < 15) return 'medium';
  if (level < 30) return 'hard';
  return 'master';
}

/**
 * Returns a randomized grid size (5 to 9).
 * Size is not chosen by the player; it arrives as an organic variety.
 * Level 1 always starts with 5x5 for smooth onboarding.
 * Level 2+ produces randomized sizes between 5 and 9.
 */
export function getRandomGridSize(level?: number, seed?: number): number {
  if (level === 1) return 5;
  const sizes = [5, 6, 7, 8, 9];
  if (seed !== undefined) {
    const idx = Math.abs(seed * 7919 + (level || 0) * 31) % sizes.length;
    return sizes[idx];
  }
  return sizes[Math.floor(Math.random() * sizes.length)];
}

export function getLevelConfig(level: number): { size: number; difficulty: DifficultyLevel } {
  return {
    size: getRandomGridSize(level),
    difficulty: getDifficultyForLevel(level),
  };
}

export function getSizeForLevel(level: number): number {
  return getRandomGridSize(level);
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  puzzle: {
    size: 5,
    regions: [],
    solution: [],
    difficulty: { maxTechnique: 1, steps: 0 },
    seed: 0,
  },
  cells: [],
  lives: 3,
  hintsLeft: 2,
  hintsUsed: 0,
  adContinueUsed: false,
  adHintUsed: false,
  undoStack: [],
  level: 1,
  difficultyLevel: 'easy',
  elapsedSeconds: 0,
  isWon: false,
  isGameOver: false,
  activeHintCell: null,
  lastConflictDetails: null,
  lastErrorMessage: null,

  initNewGame: (
    optionsOrLevel?: NewGameOptions | number,
    customSize?: number,
    customSeed?: number
  ) => {
    let opts: NewGameOptions;
    if (typeof optionsOrLevel === 'number') {
      opts = {
        level: optionsOrLevel,
        size: customSize,
        seed: customSeed,
      };
    } else {
      opts = optionsOrLevel || {};
    }

    const currentLevel = opts.level ?? get().level ?? 1;
    const levelConfig = getLevelConfig(currentLevel);
    const size = opts.size ?? (customSize || levelConfig.size);
    const difficultyLevel = opts.difficulty ?? levelConfig.difficulty;
    const seed =
      opts.seed !== undefined
        ? opts.seed
        : Math.floor(Math.random() * 2147483647);

    const targetDifficulty = getDifficultyTarget(difficultyLevel);
    const puzzle = generatePuzzle({
      size,
      seed,
      targetDifficulty: {
        minTechnique: targetDifficulty.minTechnique,
        maxTechnique: targetDifficulty.maxTechnique,
      },
      maxAttempts: 300,
    });

    const cells: CellState[][] = Array.from({ length: size }, () =>
      new Array(size).fill('empty')
    );

    set({
      puzzle,
      cells,
      lives: 3,
      hintsLeft: 2,
      hintsUsed: 0,
      adContinueUsed: false,
      adHintUsed: false,
      undoStack: [],
      level: currentLevel,
      difficultyLevel,
      elapsedSeconds: 0,
      isWon: false,
      isGameOver: false,
      activeHintCell: null,
      lastConflictDetails: null,
      lastErrorMessage: null,
    });
  },

  loadSavedGame: (saved: GameState) => {
    set({
      ...saved,
      isWon: false,
      isGameOver: false,
      activeHintCell: null,
      lastConflictDetails: null,
      lastErrorMessage: null,
    });
  },

  handleCellTap: (
    row: number,
    col: number,
    mode: TapMode = 'cycle',
    autoMarkEnabled: boolean = false
  ) => {
    const state = get();
    if (state.isWon || state.isGameOver) {
      return { status: 'noop' };
    }

    const current = state.cells[row][col];
    let nextState: CellState = 'empty';

    if (mode === 'place_animal') {
      // Direct intent to place animal (double tap or long press)
      nextState = 'animal';
    } else if (mode === 'toggle') {
      // Safe toggle mode: empty -> mark, mark -> empty, animal -> empty
      if (current === 'empty') {
        nextState = 'mark';
      } else {
        nextState = 'empty';
      }
    } else {
      // Classic cycle: empty -> mark -> animal -> empty
      if (current === 'empty') {
        nextState = 'mark';
      } else if (current === 'mark') {
        nextState = 'animal';
      } else {
        nextState = 'empty';
      }
    }

    // Clone cells matrix
    const newCells = state.cells.map((r) => [...r]);

    // Handle MARK or CLEAR (free, zero penalty)
    if (nextState === 'mark' || nextState === 'empty') {
      newCells[row][col] = nextState;
      const newUndoStack: Action[] = [
        ...state.undoStack,
        { row, col, from: current, to: nextState },
      ];

      set({
        cells: newCells,
        undoStack: newUndoStack,
        lastConflictDetails: null,
        lastErrorMessage: null,
      });

      return { status: nextState === 'mark' ? 'mark' : 'cleared' };
    }

    // Handle ANIMAL placement: Check against hidden solution
    const isCorrect = isCorrectPlacement(state.puzzle, { row, col });

    if (!isCorrect) {
      // HATA KURALI:
      // 1. Hücre otomatik 'mark' olur.
      // 2. Bir kalp kırılır.
      // 3. Hata geri alma yığına yazılmaz.
      newCells[row][col] = 'mark';
      const remainingLives = state.lives - 1;
      const isGameOver = remainingLives <= 0;

      const conflicts = findConflicts(state.puzzle, state.cells, { row, col });

      set({
        cells: newCells,
        lives: remainingLives,
        isGameOver,
        lastConflictDetails: conflicts.length > 0 ? conflicts : null,
        lastErrorMessage: 'Bu hamleyle bulmaca çözülemez hale gelirdi.',
      });

      return {
        status: 'animal_wrong',
        conflicts,
      };
    }

    // CORRECT ANIMAL PLACEMENT
    newCells[row][col] = 'animal';
    const newUndoStack: Action[] = [
      ...state.undoStack,
      { row, col, from: current, to: 'animal' },
    ];

    // Optional Auto-Mark: mark same row, col, region, and 8-neighbors
    if (autoMarkEnabled) {
      const reg = state.puzzle.regions[row][col];
      const n = state.puzzle.size;

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (r === row && c === col) continue;
          if (newCells[r][c] === 'empty') {
            const isSameRow = r === row;
            const isSameCol = c === col;
            const isSameReg = state.puzzle.regions[r][c] === reg;
            const isAdj = Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1;

            if (isSameRow || isSameCol || isSameReg || isAdj) {
              newCells[r][c] = 'mark';
              newUndoStack.push({ row: r, col: c, from: 'empty', to: 'mark' });
            }
          }
        }
      }
    }

    const won = isSolved(state.puzzle, newCells);

    set({
      cells: newCells,
      undoStack: newUndoStack,
      isWon: won,
      lastConflictDetails: null,
      lastErrorMessage: null,
    });

    return { status: 'animal_correct' };
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0 || state.isWon || state.isGameOver) {
      return false;
    }

    const newUndoStack = [...state.undoStack];
    const lastAction = newUndoStack.pop()!;
    const newCells = state.cells.map((r) => [...r]);

    newCells[lastAction.row][lastAction.col] = lastAction.from;

    set({
      cells: newCells,
      undoStack: newUndoStack,
      lastConflictDetails: null,
      lastErrorMessage: null,
    });

    return true;
  },

  useHint: () => {
    const state = get();
    if (state.hintsLeft <= 0 || state.isWon || state.isGameOver) {
      return null;
    }

    const hintCoord = getNextLogicalHint(state.puzzle, state.cells);
    if (!hintCoord) return null;

    set({
      hintsLeft: state.hintsLeft - 1,
      hintsUsed: state.hintsUsed + 1,
      activeHintCell: hintCoord,
    });

    return hintCoord;
  },

  clearActiveHint: () => set({ activeHintCell: null }),

  continueWithRewardAd: () => {
    const state = get();
    if (state.adContinueUsed || !state.isGameOver) {
      return false;
    }

    set({
      lives: 1,
      isGameOver: false,
      adContinueUsed: true,
    });
    return true;
  },

  addRewardHint: () => {
    const state = get();
    if (state.adHintUsed) {
      return false;
    }

    set({
      hintsLeft: state.hintsLeft + 1,
      adHintUsed: true,
    });
    return true;
  },

  tickElapsedSecond: () => {
    const state = get();
    if (!state.isWon && !state.isGameOver) {
      set({ elapsedSeconds: state.elapsedSeconds + 1 });
    }
  },
}));
