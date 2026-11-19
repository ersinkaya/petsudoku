import { CellCoord, Puzzle, TechniqueDifficulty } from './types';

export interface DeductionStep {
  technique: TechniqueDifficulty;
  description: string;
  action: 'place' | 'eliminate';
  targetCell?: CellCoord;
  eliminatedCells?: CellCoord[];
}

export interface LogicalSolveResult {
  solved: boolean;
  maxTechnique: TechniqueDifficulty;
  steps: DeductionStep[];
  stepCount: number;
  placements: number[]; // row -> col
}

/**
 * Human-like logical solver that solves a PedSudoku/Queens puzzle step-by-step
 * using deductive techniques (1 to 5) without backtracking.
 */
export function solveWithLogic(
  size: number,
  regions: number[][],
  maxAllowedTechnique: TechniqueDifficulty = 5
): LogicalSolveResult {
  const n = size;
  // candidate[r][c] is true if cell (r, c) could still contain an animal
  const candidates: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(true));
  const placements: number[] = new Array(n).fill(-1);
  const steps: DeductionStep[] = [];
  let maxTechniqueUsed: TechniqueDifficulty = 1;
  let placedCount = 0;

  // Directions for 8-way adjacency
  const ADJ_DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  // Helper to place an animal at (r, c)
  function placeAnimal(r: number, c: number, technique: TechniqueDifficulty, reason: string): void {
    if (placements[r] !== -1) return;
    placements[r] = c;
    placedCount++;
    if (technique > maxTechniqueUsed) maxTechniqueUsed = technique;

    steps.push({
      technique,
      description: reason,
      action: 'place',
      targetCell: { row: r, col: c },
    });

    // Technique 2: Eliminate row, col, region, and 8-neighbors
    const reg = regions[r][c];
    const eliminated: CellCoord[] = [];

    // Row & Col
    for (let i = 0; i < n; i++) {
      if (i !== c && candidates[r][i]) {
        candidates[r][i] = false;
        eliminated.push({ row: r, col: i });
      }
      if (i !== r && candidates[i][c]) {
        candidates[i][c] = false;
        eliminated.push({ row: i, col: c });
      }
    }

    // Region
    for (let rowIdx = 0; rowIdx < n; rowIdx++) {
      for (let colIdx = 0; colIdx < n; colIdx++) {
        if ((rowIdx !== r || colIdx !== c) && regions[rowIdx][colIdx] === reg && candidates[rowIdx][colIdx]) {
          candidates[rowIdx][colIdx] = false;
          eliminated.push({ row: rowIdx, col: colIdx });
        }
      }
    }

    // 8-way neighbors
    for (const [dr, dc] of ADJ_DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && candidates[nr][nc]) {
        candidates[nr][nc] = false;
        eliminated.push({ row: nr, col: nc });
      }
    }

    if (eliminated.length > 0) {
      steps.push({
        technique: Math.max(technique, 2) as TechniqueDifficulty,
        description: `Eliminate neighbors/row/col/region of (${r},${c})`,
        action: 'eliminate',
        eliminatedCells: eliminated,
      });
      if (2 > maxTechniqueUsed && technique < 2) {
        maxTechniqueUsed = 2;
      }
    }
  }

  // Technique 1: Single candidate in row, col, or region
  function tryTechnique1(): boolean {
    // 1. Single in Row
    for (let r = 0; r < n; r++) {
      if (placements[r] !== -1) continue;
      let candCol = -1;
      let count = 0;
      for (let c = 0; c < n; c++) {
        if (candidates[r][c]) {
          count++;
          candCol = c;
        }
      }
      if (count === 1) {
        placeAnimal(r, candCol, 1, `Tek aday (Satır ${r + 1})`);
        return true;
      }
    }

    // 2. Single in Col
    for (let c = 0; c < n; c++) {
      let isColUsed = false;
      for (let r = 0; r < n; r++) {
        if (placements[r] === c) {
          isColUsed = true;
          break;
        }
      }
      if (isColUsed) continue;

      let candRow = -1;
      let count = 0;
      for (let r = 0; r < n; r++) {
        if (candidates[r][c]) {
          count++;
          candRow = r;
        }
      }
      if (count === 1) {
        placeAnimal(candRow, c, 1, `Tek aday (Sütun ${c + 1})`);
        return true;
      }
    }

    // 3. Single in Region
    for (let reg = 0; reg < n; reg++) {
      let isRegionUsed = false;
      for (let r = 0; r < n; r++) {
        const c = placements[r];
        if (c !== -1 && regions[r][c] === reg) {
          isRegionUsed = true;
          break;
        }
      }
      if (isRegionUsed) continue;

      let candRow = -1;
      let candCol = -1;
      let count = 0;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (regions[r][c] === reg && candidates[r][c]) {
            count++;
            candRow = r;
            candCol = c;
          }
        }
      }
      if (count === 1) {
        placeAnimal(candRow, candCol, 1, `Tek aday (Bölge ${reg + 1})`);
        return true;
      }
    }

    return false;
  }

  // Technique 3: Region fits in single Row or Column (Pointing / Claiming)
  function tryTechnique3(): boolean {
    if (maxAllowedTechnique < 3) return false;

    // Check each unplaced region
    for (let reg = 0; reg < n; reg++) {
      let isRegionUsed = false;
      for (let r = 0; r < n; r++) {
        const c = placements[r];
        if (c !== -1 && regions[r][c] === reg) {
          isRegionUsed = true;
          break;
        }
      }
      if (isRegionUsed) continue;

      const regCands: CellCoord[] = [];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (regions[r][c] === reg && candidates[r][c]) {
            regCands.push({ row: r, col: c });
          }
        }
      }
      if (regCands.length <= 1) continue;

      // Are all candidates in the same row?
      const targetRow = regCands[0].row;
      const allInSameRow = regCands.every((cell) => cell.row === targetRow);
      if (allInSameRow) {
        // Eliminate candidates in targetRow outside this region
        const eliminated: CellCoord[] = [];
        for (let c = 0; c < n; c++) {
          if (regions[targetRow][c] !== reg && candidates[targetRow][c]) {
            candidates[targetRow][c] = false;
            eliminated.push({ row: targetRow, col: c });
          }
        }
        if (eliminated.length > 0) {
          if (3 > maxTechniqueUsed) maxTechniqueUsed = 3;
          steps.push({
            technique: 3,
            description: `Bölge ${reg + 1} yalnızca Satır ${targetRow + 1}'e sığıyor`,
            action: 'eliminate',
            eliminatedCells: eliminated,
          });
          return true;
        }
      }

      // Are all candidates in the same col?
      const targetCol = regCands[0].col;
      const allInSameCol = regCands.every((cell) => cell.col === targetCol);
      if (allInSameCol) {
        const eliminated: CellCoord[] = [];
        for (let r = 0; r < n; r++) {
          if (regions[r][targetCol] !== reg && candidates[r][targetCol]) {
            candidates[r][targetCol] = false;
            eliminated.push({ row: r, col: targetCol });
          }
        }
        if (eliminated.length > 0) {
          if (3 > maxTechniqueUsed) maxTechniqueUsed = 3;
          steps.push({
            technique: 3,
            description: `Bölge ${reg + 1} yalnızca Sütun ${targetCol + 1}'e sığıyor`,
            action: 'eliminate',
            eliminatedCells: eliminated,
          });
          return true;
        }
      }
    }

    // Inverted: All candidates in row r belong to region reg
    for (let r = 0; r < n; r++) {
      if (placements[r] !== -1) continue;
      const rowCands: CellCoord[] = [];
      for (let c = 0; c < n; c++) {
        if (candidates[r][c]) rowCands.push({ row: r, col: c });
      }
      if (rowCands.length <= 1) continue;
      const firstReg = regions[r][rowCands[0].col];
      if (rowCands.every((cell) => regions[r][cell.col] === firstReg)) {
        // Eliminate candidates in firstReg outside row r
        const eliminated: CellCoord[] = [];
        for (let rowIdx = 0; rowIdx < n; rowIdx++) {
          if (rowIdx === r) continue;
          for (let colIdx = 0; colIdx < n; colIdx++) {
            if (regions[rowIdx][colIdx] === firstReg && candidates[rowIdx][colIdx]) {
              candidates[rowIdx][colIdx] = false;
              eliminated.push({ row: rowIdx, col: colIdx });
            }
          }
        }
        if (eliminated.length > 0) {
          if (3 > maxTechniqueUsed) maxTechniqueUsed = 3;
          steps.push({
            technique: 3,
            description: `Satır ${r + 1} adayları yalnızca Bölge ${firstReg + 1}'de`,
            action: 'eliminate',
            eliminatedCells: eliminated,
          });
          return true;
        }
      }
    }

    return false;
  }

  // Technique 4: K regions fit into K rows/cols (K = 2 or 3)
  function tryTechnique4(): boolean {
    if (maxAllowedTechnique < 4) return false;

    // Collect candidates for each active region
    const activeRegions: { reg: number; rows: Set<number>; cols: Set<number> }[] = [];
    for (let reg = 0; reg < n; reg++) {
      let isRegionUsed = false;
      for (let r = 0; r < n; r++) {
        if (placements[r] !== -1 && regions[r][placements[r]] === reg) {
          isRegionUsed = true;
          break;
        }
      }
      if (isRegionUsed) continue;

      const rows = new Set<number>();
      const cols = new Set<number>();
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (regions[r][c] === reg && candidates[r][c]) {
            rows.add(r);
            cols.add(c);
          }
        }
      }
      if (rows.size > 0) {
        activeRegions.push({ reg, rows, cols });
      }
    }

    if (activeRegions.length < 2) return false;

    // Check pairs (K=2)
    for (let i = 0; i < activeRegions.length; i++) {
      for (let j = i + 1; j < activeRegions.length; j++) {
        const r1 = activeRegions[i];
        const r2 = activeRegions[j];

        // Union of rows
        const unionRows = new Set([...r1.rows, ...r2.rows]);
        if (unionRows.size === 2) {
          const rowsArr = Array.from(unionRows);
          const eliminated: CellCoord[] = [];
          for (const row of rowsArr) {
            for (let c = 0; c < n; c++) {
              const reg = regions[row][c];
              if (reg !== r1.reg && reg !== r2.reg && candidates[row][c]) {
                candidates[row][c] = false;
                eliminated.push({ row, col: c });
              }
            }
          }
          if (eliminated.length > 0) {
            if (4 > maxTechniqueUsed) maxTechniqueUsed = 4;
            steps.push({
              technique: 4,
              description: `2 bölge (${r1.reg + 1}, ${r2.reg + 1}) 2 satıra sığıyor`,
              action: 'eliminate',
              eliminatedCells: eliminated,
            });
            return true;
          }
        }

        // Union of cols
        const unionCols = new Set([...r1.cols, ...r2.cols]);
        if (unionCols.size === 2) {
          const colsArr = Array.from(unionCols);
          const eliminated: CellCoord[] = [];
          for (const col of colsArr) {
            for (let r = 0; r < n; r++) {
              const reg = regions[r][col];
              if (reg !== r1.reg && reg !== r2.reg && candidates[r][col]) {
                candidates[r][col] = false;
                eliminated.push({ row: r, col });
              }
            }
          }
          if (eliminated.length > 0) {
            if (4 > maxTechniqueUsed) maxTechniqueUsed = 4;
            steps.push({
              technique: 4,
              description: `2 bölge (${r1.reg + 1}, ${r2.reg + 1}) 2 sütuna sığıyor`,
              action: 'eliminate',
              eliminatedCells: eliminated,
            });
            return true;
          }
        }
      }
    }

    return false;
  }

  // Technique 5: Proof by Contradiction (Varsayım-Çelişki)
  function tryTechnique5(): boolean {
    if (maxAllowedTechnique < 5) return false;

    for (let r = 0; r < n; r++) {
      if (placements[r] !== -1) continue;
      for (let c = 0; c < n; c++) {
        if (!candidates[r][c]) continue;

        // Clone current state and test assumption: cell (r, c) is an animal
        const testSolve = solveWithLogic(n, regions, 4);
        // If placing at (r, c) immediately or logically leads to a contradiction,
        // then candidate (r, c) must be false!
        if (leadsToContradiction(r, c)) {
          candidates[r][c] = false;
          if (5 > maxTechniqueUsed) maxTechniqueUsed = 5;
          steps.push({
            technique: 5,
            description: `Varsayım (${r},${c}) çelişkiye yol açar`,
            action: 'eliminate',
            eliminatedCells: [{ row: r, col: c }],
          });
          return true;
        }
      }
    }
    return false;
  }

  function leadsToContradiction(testR: number, testC: number): boolean {
    // Clone candidates
    const simCands = candidates.map((row) => [...row]);
    const simPlacements = [...placements];
    simPlacements[testR] = testC;

    // Eliminate for (testR, testC)
    const testReg = regions[testR][testC];
    for (let i = 0; i < n; i++) {
      if (i !== testC) simCands[testR][i] = false;
      if (i !== testR) simCands[i][testC] = false;
    }
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if ((r !== testR || c !== testC) && regions[r][c] === testReg) {
          simCands[r][c] = false;
        }
      }
    }
    for (const [dr, dc] of ADJ_DIRS) {
      const nr = testR + dr;
      const nc = testC + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        simCands[nr][nc] = false;
      }
    }

    // Check if any row, col, or region has 0 candidates
    for (let r = 0; r < n; r++) {
      if (simPlacements[r] === -1 && simCands[r].every((val) => !val)) {
        return true;
      }
    }
    for (let c = 0; c < n; c++) {
      let hasCand = false;
      for (let r = 0; r < n; r++) {
        if (simPlacements[r] === c || simCands[r][c]) {
          hasCand = true;
          break;
        }
      }
      if (!hasCand) return true;
    }
    for (let reg = 0; reg < n; reg++) {
      let hasCand = false;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (regions[r][c] === reg && (simPlacements[r] === c || simCands[r][c])) {
            hasCand = true;
            break;
          }
        }
        if (hasCand) break;
      }
      if (!hasCand) return true;
    }

    return false;
  }

  // Deduction loop
  let progress = true;
  while (placedCount < n && progress) {
    progress = false;

    if (tryTechnique1()) {
      progress = true;
      continue;
    }
    if (tryTechnique3()) {
      progress = true;
      continue;
    }
    if (tryTechnique4()) {
      progress = true;
      continue;
    }
    if (tryTechnique5()) {
      progress = true;
      continue;
    }
  }

  return {
    solved: placedCount === n,
    maxTechnique: maxTechniqueUsed,
    steps,
    stepCount: steps.length,
    placements,
  };
}

/**
 * Returns the next logical hint for a game state.
 * Finds the first placement step from logical deduction, or falls back to any unplaced solution cell.
 */
export function getNextLogicalHint(puzzle: Puzzle, currentCells: string[][]): CellCoord | null {
  const n = puzzle.size;
  // Convert currentCells to placed list
  const placedRowCols: { row: number; col: number }[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (currentCells[r][c] === 'animal') {
        placedRowCols.push({ row: r, col: c });
      }
    }
  }

  // Try to find the next logical move
  const logicResult = solveWithLogic(n, puzzle.regions, 5);
  for (const step of logicResult.steps) {
    if (step.action === 'place' && step.targetCell) {
      const alreadyPlaced = placedRowCols.some(
        (p) => p.row === step.targetCell!.row && p.col === step.targetCell!.col
      );
      if (!alreadyPlaced) {
        return step.targetCell;
      }
    }
  }

  // Fallback: any unplaced cell from puzzle.solution
  for (let r = 0; r < n; r++) {
    const c = puzzle.solution[r];
    const isPlaced = currentCells[r][c] === 'animal';
    if (!isPlaced) {
      return { row: r, col: c };
    }
  }

  return null;
}
