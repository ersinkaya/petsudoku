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

/**
 * Returns dynamic size and logic difficulty for each campaign level.
 * Sizes rotate early (5x5, 6x6, 7x7, 8x8, 9x9) so the player experiences
 * different grids while logic difficulty steadily deepens.
 */
export function getLevelConfig(level: number): { size: number; difficulty: DifficultyLevel } {
  const progression: Array<{ size: number; difficulty: DifficultyLevel }> = [
    { size: 5, difficulty: 'easy' },   // Bölüm 1: 5x5 Başlangıç
    { size: 6, difficulty: 'easy' },   // Bölüm 2: 6x6 Kolay
    { size: 5, difficulty: 'medium' }, // Bölüm 3: 5x5 Orta
    { size: 7, difficulty: 'easy' },   // Bölüm 4: 7x7 Kolay
    { size: 6, difficulty: 'medium' }, // Bölüm 5: 6x6 Orta
    { size: 8, difficulty: 'easy' },   // Bölüm 6: 8x8 Kolay
    { size: 9, difficulty: 'easy' },   // Bölüm 7: 9x9 Erken Deneyim!
    { size: 7, difficulty: 'medium' }, // Bölüm 8: 7x7 Orta
    { size: 6, difficulty: 'hard' },   // Bölüm 9: 6x6 Zor
    { size: 9, difficulty: 'medium' }, // Bölüm 10: 9x9 Orta
    { size: 8, difficulty: 'medium' }, // Bölüm 11: 8x8 Orta
    { size: 7, difficulty: 'hard' },   // Bölüm 12: 7x7 Zor
    { size: 9, difficulty: 'hard' },   // Bölüm 13: 9x9 Zor
    { size: 8, difficulty: 'hard' },   // Bölüm 14: 8x8 Zor
    { size: 9, difficulty: 'master' }, // Bölüm 15: 9x9 Usta
  ];

  if (level >= 1 && level <= progression.length) {
    return progression[level - 1];
  }

  // Seviye 16+ sonsuz döngü: zengin boyutlar ve ileri zorluklar
  const sizes = [7, 8, 9, 8, 9];
  const diffs: DifficultyLevel[] = ['medium', 'hard', 'hard', 'master', 'master'];
  const idx = (level - 1) % sizes.length;
  return {
    size: sizes[idx],
    difficulty: diffs[idx],
  };
}

export function getSizeForLevel(level: number): number {
  return getLevelConfig(level).size;
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
