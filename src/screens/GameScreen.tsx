import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameActions } from '../components/GameActions';
import { GameHUD } from '../components/GameHUD';
import { GameOverModal } from '../components/GameOverModal';
import { Grid } from '../components/Grid';
import { ResultModal } from '../components/ResultModal';
import { TutorialModal } from '../components/TutorialModal';
import { calculateScore } from '../stats/score';
import { useGameStore } from '../state/gameStore';
import { GameRecordReturn, useProfileStore } from '../state/profileStore';
import { Feedback } from '../utils/feedback';

interface GameScreenProps {
  onBackToHome: () => void;
  onOpenSettings?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToHome, onOpenSettings }) => {
  const pet = useProfileStore((state) => state.pet) || 'cat';
  const autoMark = useProfileStore((state) => state.settings.autoMark);
  const hapticsEnabled = useProfileStore((state) => state.settings.haptics);
  const soundEnabled = useProfileStore((state) => state.settings.sound);
  const currentLevel = useProfileStore((state) => state.currentLevel);
  const hasSeenTutorial = useProfileStore((state) => state.hasSeenTutorial);
  const setHasSeenTutorial = useProfileStore((state) => state.setHasSeenTutorial);
  const totalScore = useProfileStore((state) => state.stats.totalScore);
  const advanceLevel = useProfileStore((state) => state.advanceLevel);
  const addReward = useProfileStore((state) => state.addReward);
  const recordGameResult = useProfileStore((state) => state.recordGameResult);

  // Game store state
  const puzzle = useGameStore((state) => state.puzzle);
  const cells = useGameStore((state) => state.cells);
  const lives = useGameStore((state) => state.lives);
  const hintsLeft = useGameStore((state) => state.hintsLeft);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const undoStack = useGameStore((state) => state.undoStack);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const isWon = useGameStore((state) => state.isWon);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const activeHintCell = useGameStore((state) => state.activeHintCell);
  const lastErrorMessage = useGameStore((state) => state.lastErrorMessage);
  const adContinueUsed = useGameStore((state) => state.adContinueUsed);
  const adHintUsed = useGameStore((state) => state.adHintUsed);
  const difficultyLevel = useGameStore((state) => state.difficultyLevel);

  // Store actions
  const initNewGame = useGameStore((state) => state.initNewGame);
  const handleCellTap = useGameStore((state) => state.handleCellTap);
  const undo = useGameStore((state) => state.undo);
  const useHint = useGameStore((state) => state.useHint);
  const clearActiveHint = useGameStore((state) => state.clearActiveHint);
  const continueWithRewardAd = useGameStore((state) => state.continueWithRewardAd);
  const addRewardHint = useGameStore((state) => state.addRewardHint);
  const tickElapsedSecond = useGameStore((state) => state.tickElapsedSecond);

  const [lastErrorCell, setLastErrorCell] = useState<{ row: number; col: number } | null>(null);
  const [winRecordInfo, setWinRecordInfo] = useState<GameRecordReturn | null>(null);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Debounce & double-tap tracking refs
  const lastTapRef = useRef<{ row: number; col: number; time: number }>({
    row: -1,
    col: -1,
    time: 0,
  });
  const lastUndoRef = useRef<number>(0);
  const lastDealtSeedRef = useRef<number | null>(null);

  // Start new game on mount if level changed or empty
  useEffect(() => {
    if (!puzzle.size || cells.length === 0) {
      initNewGame({ level: currentLevel });
    }
  }, [currentLevel]);

  // Show tutorial on Level 1-3 if not seen yet
  useEffect(() => {
    if (currentLevel <= 3 && !hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [currentLevel, hasSeenTutorial]);

  // Card dealing sound effect when initial tiles appear
  useEffect(() => {
    if (puzzle.size > 0 && puzzle.seed !== lastDealtSeedRef.current) {
      lastDealtSeedRef.current = puzzle.seed;
      const timer = setTimeout(() => {
        Feedback.dealCards(hapticsEnabled, soundEnabled);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [puzzle.seed, puzzle.size]);

  // Timer interval
  useEffect(() => {
    if (isWon || isGameOver) return;
    const interval = setInterval(() => {
      tickElapsedSecond();
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon, isGameOver]);

  // Handle Win
  useEffect(() => {
    if (isWon) {
      Feedback.win(hapticsEnabled, soundEnabled);

      const score = calculateScore({
        size: puzzle.size,
        seconds: elapsedSeconds,
        heartsLeft: lives,
        hintsUsed,
        isWon: true,
      });
      setCalculatedScore(score);

      const record = recordGameResult({
        level: currentLevel,
        size: puzzle.size,
        score,
        seconds: elapsedSeconds,
        heartsLeft: lives,
        hintsUsed,
        playedAt: Date.now(),
      });
      setWinRecordInfo(record);

      const rewardId = pet === 'cat' ? 'mouse' : pet === 'dog' ? 'bone' : 'carrot';
      addReward(rewardId, 1);
    }
  }, [isWon]);

  const onCellPress = (row: number, col: number) => {
    if (activeHintCell) {
      clearActiveHint();
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current.time;
    const isSameCell = lastTapRef.current.row === row && lastTapRef.current.col === col;

    // Ignore electrical bounce/jitter under 70ms
    if (isSameCell && timeSinceLastTap < 70) {
      return;
    }

    const currentCell = cells[row]?.[col] ?? 'empty';
    let res;

    // Check if quick double-tap on same cell to place animal:
    if (isSameCell && timeSinceLastTap < 350 && currentCell === 'mark') {
      lastTapRef.current = { row: -1, col: -1, time: 0 };
      res = handleCellTap(row, col, 'place_animal', autoMark);
    } else {
      // Single tap: safe toggle (empty -> mark, mark -> empty, animal -> empty)
      lastTapRef.current = { row, col, time: now };
      res = handleCellTap(row, col, 'toggle', autoMark);
    }

    if (res.status === 'mark') {
      Feedback.mark(hapticsEnabled, soundEnabled);
    } else if (res.status === 'animal_correct') {
      Feedback.correctAnimal(hapticsEnabled, soundEnabled);
    } else if (res.status === 'cleared') {
      Feedback.clear(hapticsEnabled, soundEnabled);
    } else if (res.status === 'animal_wrong') {
      Feedback.error(hapticsEnabled, soundEnabled);
      setLastErrorCell({ row, col });
      setTimeout(() => setLastErrorCell(null), 1200);
    }
  };

  const onCellLongPress = (row: number, col: number) => {
    if (activeHintCell) {
      clearActiveHint();
    }
    // Long press directly attempts to place animal
    const res = handleCellTap(row, col, 'place_animal', autoMark);
    if (res.status === 'animal_correct') {
      Feedback.correctAnimal(hapticsEnabled, soundEnabled);
    } else if (res.status === 'animal_wrong') {
      Feedback.error(hapticsEnabled, soundEnabled);
      setLastErrorCell({ row, col });
      setTimeout(() => setLastErrorCell(null), 1200);
    }
  };

  const handleUndo = () => {
    const now = Date.now();
    if (now - lastUndoRef.current < 250) {
      return; // prevent duplicate rapid clicks
    }
    lastUndoRef.current = now;

    const success = undo();
    if (success) {
      Feedback.undo(hapticsEnabled, soundEnabled);
    }
  };

  const handleHint = () => {
    const hint = useHint();
    if (hint) {
      Feedback.hint(hapticsEnabled, soundEnabled);
    }
  };

  const handleNextLevel = () => {
    Feedback.buttonPress(hapticsEnabled, soundEnabled);
    const nextLevel = currentLevel + 1;
    advanceLevel();
    initNewGame({ level: nextLevel });
  };

  const handleDoubleReward = () => {
    Feedback.buttonPress(hapticsEnabled, soundEnabled);
    const rewardId = pet === 'cat' ? 'mouse' : pet === 'dog' ? 'bone' : 'carrot';
    addReward(rewardId, 2);
    handleNextLevel();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header HUD */}
      <GameHUD
        level={currentLevel}
        size={puzzle.size}
        difficulty={difficultyLevel}
        score={totalScore}
        lives={lives}
        maxLives={3}
        pet={pet}
        onExit={() => {
          Feedback.buttonPress(hapticsEnabled, soundEnabled);
          onBackToHome();
        }}
        onSettings={() => {
          Feedback.buttonPress(hapticsEnabled, soundEnabled);
          onOpenSettings?.();
        }}
        onHelp={() => {
          Feedback.buttonPress(hapticsEnabled, soundEnabled);
          setShowTutorial(true);
        }}
      />

      {/* Main Grid Area */}
      <View style={styles.centerContainer}>
        {lastErrorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {lastErrorMessage}</Text>
          </View>
        )}

        {puzzle.size > 0 && cells.length > 0 && (
          <Grid
            puzzle={puzzle}
            cells={cells}
            pet={pet}
            activeHintCell={activeHintCell}
            lastErrorCell={lastErrorCell}
            onCellPress={onCellPress}
            onCellLongPress={onCellLongPress}
          />
        )}
      </View>

      {/* Bottom Floating Action Controls */}
      <GameActions
        pet={pet}
        canUndo={undoStack.length > 0 && !isWon && !isGameOver}
        hintsLeft={hintsLeft}
        onUndo={handleUndo}
        onHint={handleHint}
        onPetAction={() => Feedback.buttonPress(hapticsEnabled, soundEnabled)}
        onRewardAction={() => {
          Feedback.buttonPress(hapticsEnabled, soundEnabled);
          addRewardHint();
        }}
      />

      {/* Win Modal */}
      <ResultModal
        visible={isWon}
        score={calculatedScore}
        seconds={elapsedSeconds}
        heartsLeft={lives}
        hintsUsed={hintsUsed}
        level={currentLevel}
        size={puzzle.size}
        pet={pet}
        isNewHighScore={winRecordInfo?.isNewHighScore}
        isNewBestTime={winRecordInfo?.isNewBestTime}
        rankInSize={winRecordInfo?.rankInSize}
        newBadges={winRecordInfo?.newBadges}
        onNextLevel={handleNextLevel}
        onDoubleRewardAd={handleDoubleReward}
        onHome={() => {
          Feedback.buttonPress(hapticsEnabled, soundEnabled);
          onBackToHome();
        }}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        canWatchAdToContinue={!adContinueUsed}
        pet={pet}
        onWatchAd={() => {
          Feedback.buttonPress(hapticsEnabled, soundEnabled);
          continueWithRewardAd();
        }}
        onGiveUp={() => {
          Feedback.buttonPress(hapticsEnabled, soundEnabled);
          initNewGame(currentLevel);
          onBackToHome();
        }}
      />

      {/* Tutorial Guide Modal (Level 1-3 or when '?' is pressed) */}
      <TutorialModal
        visible={showTutorial}
        pet={pet}
        onClose={() => {
          setShowTutorial(false);
          setHasSeenTutorial(true);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F2',
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  errorBanner: {
    backgroundColor: '#FED7D7',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEB2B2',
  },
  errorText: {
    color: '#C53030',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBanner: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerBrand: {
    fontSize: 13,
    fontWeight: '900',
    color: '#005696',
  },
  bannerAdLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A0AEC0',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 3,
    paddingHorizontal: 3,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3748',
  },
});
