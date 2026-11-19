import { CellCoord, CellState, ConflictDetail, Puzzle } from './types';

/**
 * Checks if the given cell coordinate is part of the puzzle's hidden unique solution.
 */
export function isCorrectPlacement(puzzle: Puzzle, cell: CellCoord): boolean {
  if (cell.row < 0 || cell.row >= puzzle.size || cell.col < 0 || cell.col >= puzzle.size) {
    return false;
  }
  return puzzle.solution[cell.row] === cell.col;
}

/**
 * Checks if the puzzle is completely and correctly solved.
 * Exactly N animals must be placed, and each row r must have animal at solution[r].
 */
export function isSolved(puzzle: Puzzle, cells: CellState[][]): boolean {
  const n = puzzle.size;
  let animalCount = 0;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cells[r][c] === 'animal') {
        animalCount++;
        if (puzzle.solution[r] !== c) {
          return false;
        }
      }
    }
  }

  return animalCount === n;
}

/**
 * Checks for visible rule conflicts if an animal is at `cell` (or placed at `cell`).
 * Examines same row, column, region, and 8-way adjacent cells.
 */
export function findConflicts(
  puzzle: Puzzle,
  cells: CellState[][],
  cell: CellCoord
): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];
  const n = puzzle.size;
  const targetRegion = puzzle.regions[cell.row][cell.col];

  // 1. Same row conflict
  for (let c = 0; c < n; c++) {
    if (c !== cell.col && cells[cell.row][c] === 'animal') {
      conflicts.push({
        type: 'row',
        row: cell.row,
        otherCell: { row: cell.row, col: c },
      });
    }
  }

  // 2. Same column conflict
  for (let r = 0; r < n; r++) {
    if (r !== cell.row && cells[r][cell.col] === 'animal') {
      conflicts.push({
        type: 'col',
        col: cell.col,
        otherCell: { row: r, col: cell.col },
      });
    }
  }

  // 3. Same region conflict
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if ((r !== cell.row || c !== cell.col) && puzzle.regions[r][c] === targetRegion) {
        if (cells[r][c] === 'animal') {
          conflicts.push({
            type: 'region',
            region: targetRegion,
            otherCell: { row: r, col: c },
          });
        }
      }
    }
  }

  // 4. 8-direction adjacent conflict
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  for (const [dr, dc] of directions) {
    const nr = cell.row + dr;
    const nc = cell.col + dc;
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
      if (cells[nr][nc] === 'animal') {
        conflicts.push({
          type: 'adjacent',
          otherCell: { row: nr, col: nc },
        });
      }
    }
  }

  return conflicts;
}
