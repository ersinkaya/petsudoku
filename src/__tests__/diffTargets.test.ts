import { generatePuzzle } from '../engine';

describe('Zorluk Kademeleri Testi', () => {
  it('farklı boyut ve mantık tekniklerinde bulmaca üretilebilmeli', () => {
    const configs = [
      { size: 5, diff: { maxTechnique: 2 as const }, label: '5x5 Easy' },
      { size: 5, diff: { minTechnique: 3 as const }, label: '5x5 Hard' },
      { size: 6, diff: { maxTechnique: 2 as const }, label: '6x6 Easy' },
      { size: 6, diff: { minTechnique: 4 as const }, label: '6x6 Hard' },
      { size: 7, diff: { maxTechnique: 2 as const }, label: '7x7 Easy' },
      { size: 7, diff: { minTechnique: 3 as const, maxTechnique: 4 as const }, label: '7x7 Medium' },
      { size: 8, diff: { maxTechnique: 3 as const }, label: '8x8 Easy/Med' },
      { size: 8, diff: { minTechnique: 4 as const }, label: '8x8 Hard' },
      { size: 9, diff: { maxTechnique: 3 as const }, label: '9x9 Easy/Med' },
      { size: 9, diff: { minTechnique: 4 as const }, label: '9x9 Hard/Master' },
    ];

    for (const c of configs) {
      const p = generatePuzzle({
        size: c.size,
        seed: 9999 + c.size * 31,
        targetDifficulty: c.diff,
        maxAttempts: 300,
      });
      expect(p.size).toBe(c.size);
      if (c.diff.maxTechnique) {
        expect(p.difficulty.maxTechnique).toBeLessThanOrEqual(c.diff.maxTechnique);
      }
      if (c.diff.minTechnique) {
        expect(p.difficulty.maxTechnique).toBeGreaterThanOrEqual(c.diff.minTechnique);
      }
    }
  });
});
