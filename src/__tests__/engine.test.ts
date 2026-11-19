import {
  areRegionsContiguous,
  countSolutions,
  findConflicts,
  generatePuzzle,
  generateSolutionLayout,
  getNextLogicalHint,
  growRegions,
  isCorrectPlacement,
  isSolved,
  Puzzle,
  SeededRNG,
  solvePuzzle,
  solveWithLogic,
} from '../engine';

describe('Bulmaca Motoru (Engine Tests)', () => {
  describe('SeededRNG', () => {
    it('aynı tohum ile aynı dizilimi üretmelidir (reproducibility)', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(12345);

      const seq1 = Array.from({ length: 50 }, () => rng1.nextInt());
      const seq2 = Array.from({ length: 50 }, () => rng2.nextInt());

      expect(seq1).toEqual(seq2);
    });

    it('farklı tohumlar farklı dizilimler üretmelidir', () => {
      const rng1 = new SeededRNG(111);
      const rng2 = new SeededRNG(222);

      const v1 = rng1.nextInt();
      const v2 = rng2.nextInt();

      expect(v1).not.toBe(v2);
    });

    it('nextRange belirlenen aralık içinde tam sayılar üretmelidir', () => {
      const rng = new SeededRNG(999);
      for (let i = 0; i < 100; i++) {
        const val = rng.nextRange(3, 7);
        expect(val).toBeGreaterThanOrEqual(3);
        expect(val).toBeLessThanOrEqual(7);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    it('shuffle diziyi karıştırmalı ve eleman sayısını korumalıdır', () => {
      const rng = new SeededRNG(42);
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const shuffled = rng.shuffle([...arr]);

      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled.sort()).toEqual(arr);
    });
  });

  describe('Çözüm Düzeni Üretimi (Solution Layout)', () => {
    it('tüm boyutlar için (5-9) geçerli ve komşusuz yerleşim üretmelidir', () => {
      for (const size of [5, 6, 7, 8, 9]) {
        const rng = new SeededRNG(size * 100);
        const layout = generateSolutionLayout(size, rng);

        expect(layout).not.toBeNull();
        expect(layout).toHaveLength(size);

        // Her sütun tam 1 kez kullanılmış mı?
        const uniqueCols = new Set(layout!);
        expect(uniqueCols.size).toBe(size);

        // Çapraz/bitişik komşuluk kuralı (|col[r] - col[r-1]| >= 2)
        for (let r = 1; r < size; r++) {
          const diff = Math.abs(layout![r] - layout![r - 1]);
          expect(diff).toBeGreaterThanOrEqual(2);
        }
      }
    });
  });

  describe('Bölge Büyütme ve Bitişiklik (Regions & Contiguity)', () => {
    it('üretilen bölgeler 4 yönlü bitişik ve N adet olmalıdır', () => {
      const size = 6;
      const rng = new SeededRNG(777);
      const solution = generateSolutionLayout(size, rng)!;
      const regions = growRegions(size, solution, rng);

      expect(areRegionsContiguous(size, regions)).toBe(true);

      // Tüm hücreler atanmış mı?
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          expect(regions[r][c]).toBeGreaterThanOrEqual(0);
          expect(regions[r][c]).toBeLessThan(size);
        }
      }
    });
  });

  describe('Doğrulama Fonksiyonları (Validator)', () => {
    const mockPuzzle: Puzzle = {
      size: 5,
      regions: [
        [0, 0, 1, 1, 1],
        [0, 0, 1, 2, 2],
        [3, 3, 2, 2, 2],
        [3, 3, 4, 4, 2],
        [3, 4, 4, 4, 4],
      ],
      solution: [1, 3, 0, 2, 4],
      difficulty: { maxTechnique: 1, steps: 5 },
      seed: 1234,
    };

    it('isCorrectPlacement yalnızca çözüm hücreleri için true dönmelidir', () => {
      expect(isCorrectPlacement(mockPuzzle, { row: 0, col: 1 })).toBe(true);
      expect(isCorrectPlacement(mockPuzzle, { row: 0, col: 0 })).toBe(false);
      expect(isCorrectPlacement(mockPuzzle, { row: 2, col: 0 })).toBe(true);
      expect(isCorrectPlacement(mockPuzzle, { row: 2, col: 1 })).toBe(false);
    });

    it('isSolved yalnızca tüm hayvanlar doğru yerleştirildiğinde true dönmelidir', () => {
      const cells = Array.from({ length: 5 }, () => new Array(5).fill('empty'));
      expect(isSolved(mockPuzzle, cells)).toBe(false);

      // Doğru yerleştir
      mockPuzzle.solution.forEach((col, row) => {
        cells[row][col] = 'animal';
      });
      expect(isSolved(mockPuzzle, cells)).toBe(true);

      // Birini yanlış yap
      cells[0][1] = 'empty';
      cells[0][2] = 'animal';
      expect(isSolved(mockPuzzle, cells)).toBe(false);
    });

    it('findConflicts çakışan satır, sütun, bölge ve komşuları tespit etmelidir', () => {
      const cells = Array.from({ length: 5 }, () => new Array(5).fill('empty'));
      cells[0][1] = 'animal'; // Bölge 0'da

      // Aynı satıra başka hayvan koyarsak satır çakışması
      const rowConflicts = findConflicts(mockPuzzle, cells, { row: 0, col: 3 });
      expect(rowConflicts.some((c) => c.type === 'row')).toBe(true);

      // Aynı sütuna başka hayvan koyarsak sütun çakışması
      const colConflicts = findConflicts(mockPuzzle, cells, { row: 3, col: 1 });
      expect(colConflicts.some((c) => c.type === 'col')).toBe(true);

      // 8-yönlü komşuya koyarsak komşu çakışması
      const adjConflicts = findConflicts(mockPuzzle, cells, { row: 1, col: 2 });
      expect(adjConflicts.some((c) => c.type === 'adjacent')).toBe(true);

      // Aynı bölgeye (Bölge 0) koyarsak bölge çakışması
      const regConflicts = findConflicts(mockPuzzle, cells, { row: 1, col: 0 });
      expect(regConflicts.some((c) => c.type === 'region')).toBe(true);
    });
  });

  describe('Çözücü ve Mantıksal İpuçları (Solver & Logic)', () => {
    it('solvePuzzle tek çözümlü bulmacada tam 1 çözüm bulmalıdır', () => {
      const puzzle = generatePuzzle({ size: 5, seed: 42 });
      const res = solvePuzzle(puzzle.size, puzzle.regions, 2);

      expect(res.count).toBe(1);
      expect(res.solutions[0]).toEqual(puzzle.solution);
    });

    it('getNextLogicalHint geçerli bir sonraki hamle koordinatını dönmelidir', () => {
      const puzzle = generatePuzzle({ size: 5, seed: 101 });
      const currentCells = Array.from({ length: 5 }, () => new Array(5).fill('empty'));

      const hint = getNextLogicalHint(puzzle, currentCells);
      expect(hint).not.toBeNull();
      expect(isCorrectPlacement(puzzle, hint!)).toBe(true);
    });
  });

  describe('Bulmaca Üretimi ve Performans (generatePuzzle)', () => {
    it('aynı tohum aynı bulmacayı üretmelidir (Section 8 determinism)', () => {
      const p1 = generatePuzzle({ size: 6, seed: 888 });
      const p2 = generatePuzzle({ size: 6, seed: 888 });

      expect(p1.regions).toEqual(p2.regions);
      expect(p1.solution).toEqual(p2.solution);
      expect(p1.difficulty).toEqual(p2.difficulty);
    });

    it('5x5, 6x6, 7x7, 8x8, 9x9 boyutlarında tek çözümlü bulmacalar üretmelidir', () => {
      for (const size of [5, 6, 7, 8, 9]) {
        const start = Date.now();
        const puzzle = generatePuzzle({ size, seed: 1000 + size });
        const elapsed = Date.now() - start;

        expect(puzzle.size).toBe(size);
        expect(areRegionsContiguous(size, puzzle.regions)).toBe(true);
        expect(countSolutions(size, puzzle.regions, 2)).toBe(1);
        expect(puzzle.difficulty.maxTechnique).toBeGreaterThanOrEqual(1);

        // Hedef: 1 saniyenin altında üretim süresi
        expect(elapsed).toBeLessThan(1000);
      }
    });
  });
});
