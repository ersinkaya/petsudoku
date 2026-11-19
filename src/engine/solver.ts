export interface SolverResult {
  count: number;
  solutions: number[][]; // each solution is an array where solution[r] is the column in row r
}

/**
 * High-performance bitmask backtracking solver to count solutions for a given N x N board.
 * Uses 32-bit bitmasks for instantaneous constraint propagation.
 */
export function countSolutions(
  size: number,
  regions: number[][],
  maxSolutions: number = 2
): number {
  return solvePuzzle(size, regions, maxSolutions).count;
}

/**
 * Finds solutions up to maxSolutions using bitmask-accelerated backtracking.
 */
export function solvePuzzle(
  size: number,
  regions: number[][],
  maxSolutions: number = 2
): SolverResult {
  const solutions: number[][] = [];
  const currentPlacement: number[] = new Array(size).fill(-1);

  function backtrack(row: number, colMask: number, regionMask: number, prevCol: number): void {
    if (row === size) {
      solutions.push([...currentPlacement]);
      return;
    }

    const rowRegions = regions[row];

    for (let col = 0; col < size; col++) {
      // Column check
      if ((colMask & (1 << col)) !== 0) continue;

      // 8-direction adjacency with previous row
      if (prevCol >= 0 && Math.abs(col - prevCol) <= 1) continue;

      // Region check
      const reg = rowRegions[col];
      if ((regionMask & (1 << reg)) !== 0) continue;

      currentPlacement[row] = col;

      backtrack(
        row + 1,
        colMask | (1 << col),
        regionMask | (1 << reg),
        col
      );

      currentPlacement[row] = -1;

      if (solutions.length >= maxSolutions) {
        return;
      }
    }
  }

  backtrack(0, 0, 0, -99);

  return {
    count: solutions.length,
    solutions,
  };
}
