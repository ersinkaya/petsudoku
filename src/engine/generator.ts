import { SeededRNG } from './rng';
import { countSolutions, solvePuzzle } from './solver';
import { solveWithLogic } from './techniques';
import { Puzzle, TechniqueDifficulty } from './types';

export interface GenerationOptions {
  size: number;
  seed?: number;
  targetDifficulty?: {
    minTechnique?: TechniqueDifficulty;
    maxTechnique?: TechniqueDifficulty;
  };
  maxAttempts?: number;
}

const ORTHOGONAL_DIRS = [
  [-1, 0], [1, 0], [0, -1], [0, 1]
];

/**
 * Generates a valid unique solution layout (N animals, one per row and col,
 * with no 8-way adjacent animals).
 */
export function generateSolutionLayout(size: number, rng: SeededRNG): number[] | null {
  const n = size;
  const solution: number[] = new Array(n).fill(-1);
  const colUsed: boolean[] = new Array(n).fill(false);

  function backtrack(row: number): boolean {
    if (row === n) {
      return true;
    }

    const cols: number[] = [];
    for (let c = 0; c < n; c++) cols.push(c);
    rng.shuffle(cols);

    const prevCol = row > 0 ? solution[row - 1] : -99;

    for (const c of cols) {
      if (colUsed[c]) continue;
      if (row > 0 && Math.abs(c - prevCol) <= 1) continue;

      colUsed[c] = true;
      solution[row] = c;

      if (backtrack(row + 1)) {
        return true;
      }

      colUsed[c] = false;
      solution[row] = -1;
    }

    return false;
  }

  return backtrack(0) ? solution : null;
}

/**
 * Checks whether all N regions are contiguous (connected via 4 orthogonal directions).
 */
export function areRegionsContiguous(size: number, regions: number[][]): boolean {
  const n = size;

  for (let reg = 0; reg < n; reg++) {
    const cells: [number, number][] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (regions[r][c] === reg) {
          cells.push([r, c]);
        }
      }
    }

    if (cells.length === 0) return false;

    // BFS
    const visited = new Uint8Array(n * n);
    const startIdx = cells[0][0] * n + cells[0][1];
    visited[startIdx] = 1;
    let visitCount = 1;
    const queue: number[] = [startIdx];

    while (queue.length > 0) {
      const idx = queue.shift()!;
      const r = (idx / n) | 0;
      const c = idx % n;

      for (const [dr, dc] of ORTHOGONAL_DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
          if (regions[nr][nc] === reg) {
            const nIdx = nr * n + nc;
            if (!visited[nIdx]) {
              visited[nIdx] = 1;
              visitCount++;
              queue.push(nIdx);
            }
          }
        }
      }
    }

    if (visitCount !== cells.length) {
      return false;
    }
  }

  return true;
}

/**
 * Multi-source randomized BFS to grow contiguous, organic Voronoi-like regions around N seeds.
 * Extremely fast (O(N^2) < 0.1ms) and produces compact regions with minimal duplicate solutions.
 */
export function growRegions(
  size: number,
  solution: number[],
  rng: SeededRNG
): number[][] {
  const n = size;
  const regions: number[][] = Array.from({ length: n }, () => new Array(n).fill(-1));

  // Frontier list: cells that belong to a region and can expand
  interface FrontierItem {
    r: number;
    c: number;
    reg: number;
    seedR: number;
    seedC: number;
  }

  const frontier: FrontierItem[] = [];

  // Seed permutation
  const regionOrder: number[] = [];
  for (let r = 0; r < n; r++) regionOrder.push(r);
  rng.shuffle(regionOrder);

  for (let r = 0; r < n; r++) {
    const c = solution[r];
    const reg = regionOrder[r];
    regions[r][c] = reg;
    frontier.push({ r, c, reg, seedR: r, seedC: c });
  }

  let unassigned = n * n - n;

  while (unassigned > 0 && frontier.length > 0) {
    // Pick a random index from frontier
    const fIdx = (rng.nextInt() % frontier.length) >>> 0;
    const current = frontier[fIdx];

    // Find all empty orthogonal neighbors
    const validNeighbors: [number, number][] = [];
    for (const [dr, dc] of ORTHOGONAL_DIRS) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && regions[nr][nc] === -1) {
        validNeighbors.push([nr, nc]);
      }
    }

    if (validNeighbors.length === 0) {
      // Remove from frontier since it cannot expand anymore
      frontier[fIdx] = frontier[frontier.length - 1];
      frontier.pop();
      continue;
    }

    // Pick neighbor that minimizes distance to seed (compact Voronoi)
    let bestDist = 999;
    for (const [nr, nc] of validNeighbors) {
      const d = Math.abs(nr - current.seedR) + Math.abs(nc - current.seedC);
      if (d < bestDist) bestDist = d;
    }

    const bestNeighbors = validNeighbors.filter(
      ([nr, nc]) => (Math.abs(nr - current.seedR) + Math.abs(nc - current.seedC)) <= bestDist + 1
    );

    const picked = rng.sample(bestNeighbors)!;
    regions[picked[0]][picked[1]] = current.reg;
    unassigned--;

    frontier.push({
      r: picked[0],
      c: picked[1],
      reg: current.reg,
      seedR: current.seedR,
      seedC: current.seedC,
    });
  }

  // Safety fallback for any unreached cells
  if (unassigned > 0) {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (regions[r][c] === -1) {
          for (const [dr, dc] of ORTHOGONAL_DIRS) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < n && nc >= 0 && nc < n && regions[nr][nc] !== -1) {
              regions[r][c] = regions[nr][nc];
              unassigned--;
              break;
            }
          }
        }
      }
    }
  }

  return regions;
}

/**
 * Checks if a specific region remains contiguous if cell (remR, remC) is removed from it.
 */
function isRegionStillContiguousWithoutCell(
  size: number,
  regions: number[][],
  reg: number,
  remR: number,
  remC: number
): boolean {
  const n = size;
  const remainingCells: [number, number][] = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (regions[r][c] === reg && (r !== remR || c !== remC)) {
        remainingCells.push([r, c]);
      }
    }
  }

  if (remainingCells.length === 0) return false;

  const visited = new Uint8Array(n * n);
  const startIdx = remainingCells[0][0] * n + remainingCells[0][1];
  visited[startIdx] = 1;
  let visitCount = 1;
  const queue: number[] = [startIdx];

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const r = (idx / n) | 0;
    const c = idx % n;

    for (const [dr, dc] of ORTHOGONAL_DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        if (regions[nr][nc] === reg && (nr !== remR || nc !== remC)) {
          const nIdx = nr * n + nc;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            visitCount++;
            queue.push(nIdx);
          }
        }
      }
    }
  }

  return visitCount === remainingCells.length;
}

/**
 * Mutates region boundaries to invalidate alternative solutions without affecting the true solution.
 */
export function repairRegionsTowardsUnique(
  size: number,
  regions: number[][],
  solution: number[],
  altSolution: number[],
  rng: SeededRNG
): boolean {
  const n = size;
  const diffCells: [number, number][] = [];
  for (let r = 0; r < n; r++) {
    const altC = altSolution[r];
    if (altC !== solution[r]) {
      diffCells.push([r, altC]);
    }
  }

  rng.shuffle(diffCells);

  for (const [r, c] of diffCells) {
    const currentReg = regions[r][c];

    const neighborRegs = new Set<number>();
    for (const [dr, dc] of ORTHOGONAL_DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        const adjReg = regions[nr][nc];
        if (adjReg !== currentReg) {
          neighborRegs.add(adjReg);
        }
      }
    }

    const candRegList = Array.from(neighborRegs);
    rng.shuffle(candRegList);

    for (const targetReg of candRegList) {
      if (isRegionStillContiguousWithoutCell(size, regions, currentReg, r, c)) {
        regions[r][c] = targetReg;
        return true;
      }
    }
  }

  return false;
}

/**
 * Generates a complete, unique-solution puzzle.
 */
export function generatePuzzle(options: GenerationOptions): Puzzle {
  const size = options.size;
  const seed = options.seed !== undefined ? options.seed : Math.floor(Math.random() * 2147483647);
  const rng = new SeededRNG(seed);
  const maxAttempts = options.maxAttempts || 300;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const solution = generateSolutionLayout(size, rng);
    if (!solution) continue;

    for (let growAttempt = 0; growAttempt < 25; growAttempt++) {
      const regions = growRegions(size, solution, rng);
      if (!areRegionsContiguous(size, regions)) continue;

      let solResult = solvePuzzle(size, regions, 2);
      if (solResult.count === 1) {
        const logic = solveWithLogic(size, regions, 5);
        if (options.targetDifficulty?.minTechnique && logic.maxTechnique < options.targetDifficulty.minTechnique) {
          continue;
        }
        if (options.targetDifficulty?.maxTechnique && logic.maxTechnique > options.targetDifficulty.maxTechnique) {
          continue;
        }

        return {
          size,
          regions,
          solution,
          difficulty: {
            maxTechnique: logic.maxTechnique,
            steps: logic.stepCount,
          },
          seed,
        };
      }

      // Quick repair iterations
      for (let repairStep = 0; repairStep < 15; repairStep++) {
        const altSol = solResult.solutions.find(
          (s) => s.some((col, r) => col !== solution[r])
        );
        if (!altSol) break;

        const repaired = repairRegionsTowardsUnique(size, regions, solution, altSol, rng);
        if (!repaired) break;

        solResult = solvePuzzle(size, regions, 2);
        if (solResult.count === 1) {
          const logic = solveWithLogic(size, regions, 5);
          if (options.targetDifficulty?.minTechnique && logic.maxTechnique < options.targetDifficulty.minTechnique) {
            break;
          }
          if (options.targetDifficulty?.maxTechnique && logic.maxTechnique > options.targetDifficulty.maxTechnique) {
            break;
          }

          return {
            size,
            regions,
            solution,
            difficulty: {
              maxTechnique: logic.maxTechnique,
              steps: logic.stepCount,
            },
            seed,
          };
        }
      }
    }
  }

  throw new Error(`Failed to generate puzzle of size ${size} after ${maxAttempts} attempts`);
}
