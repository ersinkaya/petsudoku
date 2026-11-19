import { areRegionsContiguous, countSolutions, generatePuzzle } from '../engine';

describe('Toplu Üretim ve Kalite Doğrulaması (Aşama 1 Kabul Kriterleri)', () => {
  it('her boyuttan (5-9) ardışık üretilen tüm bulmacalar tek çözümlü ve bitişik olmalıdır', () => {
    const sizes = [5, 6, 7, 8, 9];
    const puzzlesPerSize = 20; // 100 total puzzles across all sizes

    for (const size of sizes) {
      let totalTime = 0;

      const techCounts: Record<number, number> = {};
      for (let i = 0; i < puzzlesPerSize; i++) {
        const seed = size * 10000 + i * 37 + 7;
        const start = Date.now();
        const puzzle = generatePuzzle({ size, seed });
        const elapsed = Date.now() - start;
        totalTime += elapsed;
        techCounts[puzzle.difficulty.maxTechnique] = (techCounts[puzzle.difficulty.maxTechnique] || 0) + 1;

        // 1. Tek çözüm garantisi
        expect(countSolutions(size, puzzle.regions, 2)).toBe(1);

        // 2. Bölgelerin bitişikliği
        expect(areRegionsContiguous(size, puzzle.regions)).toBe(true);

        // 3. Hayvan yerleşimi geçerliliği
        expect(puzzle.solution).toHaveLength(size);
        for (let r = 1; r < size; r++) {
          expect(Math.abs(puzzle.solution[r] - puzzle.solution[r - 1])).toBeGreaterThanOrEqual(2);
        }
      }

      const avgTime = totalTime / puzzlesPerSize;
      console.log(`Size ${size}x${size} avgTime=${avgTime.toFixed(1)}ms techniques=`, techCounts);
      // Ortalama üretim süresi 1 saniyenin çok altında olmalı (hedef: < 1000ms, genellikle < 50ms)
      expect(avgTime).toBeLessThan(500);
    }
  });
});
