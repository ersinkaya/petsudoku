import { useProfileStore } from '../state/profileStore';
import { useGameStore } from '../state/gameStore';
import { generatePuzzle, techniqueToDifficultyLevel } from '../engine';

describe('Phase 1 Critical Fixes & Features', () => {
  beforeEach(() => {
    useProfileStore.getState().resetProgress();
  });

  describe('1. Atomic completeGame & Badge Bug Fix', () => {
    it('unlocks collector_10 immediately when the 10th reward is earned in the same win', () => {
      const store = useProfileStore.getState();

      // Set initial rewards to 9
      useProfileStore.setState({
        rewards: { mouse: 9 },
      });

      expect(useProfileStore.getState().rewards['mouse']).toBe(9);
      expect(useProfileStore.getState().stats.badges).not.toContain('collector_10');

      // Now complete game earning the 10th reward
      const record = useProfileStore.getState().completeGame({
        result: {
          level: 1,
          size: 5,
          score: 1000,
          seconds: 45,
          heartsLeft: 3,
          hintsUsed: 0,
          playedAt: Date.now(),
        },
        rewardId: 'mouse',
        rewardCount: 1,
      });

      // Verification: 10 rewards reached
      expect(useProfileStore.getState().rewards['mouse']).toBe(10);

      // CRITICAL CHECK: Badge MUST be granted in this exact win record!
      const unlockedIds = record.newBadges.map((b) => b.id);
      expect(unlockedIds).toContain('collector_10');

      // Also present in profile stats badges
      expect(useProfileStore.getState().stats.badges).toContain('collector_10');
    });

    it('clears savedGame atomically when game is completed', () => {
      // Set dummy saved game
      useProfileStore.setState({
        savedGame: {
          puzzle: { size: 5, regions: [], solution: [], difficulty: { maxTechnique: 1, steps: 0 }, seed: 1 },
          cells: [],
          lives: 3,
          hintsLeft: 2,
          hintsUsed: 0,
          adContinueUsed: false,
          adHintUsed: false,
          undoStack: [],
          level: 1,
          elapsedSeconds: 30,
        },
      });

      expect(useProfileStore.getState().savedGame).not.toBeNull();

      useProfileStore.getState().completeGame({
        result: {
          level: 1,
          size: 5,
          score: 800,
          seconds: 30,
          heartsLeft: 3,
          hintsUsed: 0,
          playedAt: Date.now(),
        },
        rewardId: 'mouse',
      });

      expect(useProfileStore.getState().savedGame).toBeNull();
    });
  });

  describe('2. Timestamp-Based Timer & Game Snapshot', () => {
    it('correctly snapshots and restores in-progress game state', () => {
      const gStore = useGameStore.getState();
      gStore.initNewGame({ level: 2, size: 5, seed: 1234 });

      // Place a mark
      gStore.handleCellTap(0, 0, 'cycle');

      const snapshot = gStore.getSnapshot();
      expect(snapshot.cells[0][0]).toBe('mark');
      expect(snapshot.puzzle.seed).toBe(1234);

      // Start fresh different game
      gStore.initNewGame({ level: 5, size: 6, seed: 9999 });
      expect(useGameStore.getState().puzzle.seed).toBe(9999);

      // Restore snapshot
      gStore.loadSavedGame(snapshot);
      expect(useGameStore.getState().cells[0][0]).toBe('mark');
      expect(useGameStore.getState().puzzle.seed).toBe(1234);
    });

    it('pauses and accumulates timer seconds without drift', () => {
      const gStore = useGameStore.getState();
      gStore.initNewGame({ level: 1, size: 5, seed: 555 });

      expect(useGameStore.getState().elapsedSeconds).toBe(0);

      // Advance timer by simulating 3 seconds
      const now = Date.now();
      useGameStore.setState({
        timerStartedAt: now - 3500, // 3.5 seconds ago
        accumulatedSeconds: 0,
      });

      gStore.syncTimer();
      expect(useGameStore.getState().elapsedSeconds).toBe(3);

      // Pause timer
      gStore.pauseTimer();
      expect(useGameStore.getState().timerStartedAt).toBeNull();
      expect(useGameStore.getState().accumulatedSeconds).toBe(3);
      expect(useGameStore.getState().elapsedSeconds).toBe(3);

      // Simulate 5 seconds in background/paused: should NOT advance while paused
      gStore.syncTimer();
      expect(useGameStore.getState().elapsedSeconds).toBe(3);

      // Resume timer
      gStore.startTimer();
      expect(useGameStore.getState().timerStartedAt).not.toBeNull();

      // Simulate 2 more seconds active
      useGameStore.setState({
        timerStartedAt: Date.now() - 2000,
      });
      gStore.syncTimer();
      expect(useGameStore.getState().elapsedSeconds).toBe(5); // 3 accumulated + 2 new
    });
  });

  describe('3. Difficulty Validation & Fallback Tags', () => {
    it('sets actualDifficulty and requestedDifficulty accurately on puzzles', () => {
      const p = generatePuzzle({
        size: 5,
        seed: 42,
        requestedDifficulty: 'easy',
      });

      expect(p.requestedDifficulty).toBe('easy');
      expect(p.actualDifficulty).toBeDefined();
      expect(['easy', 'medium', 'hard', 'master']).toContain(p.actualDifficulty);
      expect(p.isFallback).toBeDefined();
    });

    it('correctly maps technique difficulty numbers to levels', () => {
      expect(techniqueToDifficultyLevel(1)).toBe('easy');
      expect(techniqueToDifficultyLevel(2)).toBe('easy');
      expect(techniqueToDifficultyLevel(3)).toBe('medium');
      expect(techniqueToDifficultyLevel(4)).toBe('hard');
      expect(techniqueToDifficultyLevel(5)).toBe('master');
    });
  });
});
