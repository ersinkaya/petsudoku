import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GameActions } from '../components/GameActions';
import { GameHUD } from '../components/GameHUD';
import { GameOverModal } from '../components/GameOverModal';
import { Grid } from '../components/Grid';
import { ResultModal } from '../components/ResultModal';
import { calculateScore } from '../stats/score';
import { useGameStore } from '../state/gameStore';
import { useProfileStore } from '../state/profileStore';

interface GameScreenProps {
  onBackToHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToHome }) => {
  const pet = useProfileStore((state) => state.pet) || 'cat';
  const autoMark = useProfileStore((state) => state.settings.autoMark);
  const currentLevel = useProfileStore((state) => state.currentLevel);
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
  const [winRecordInfo, setWinRecordInfo] = useState<{ isNewHighScore: boolean; isNewBestTime: boolean } | null>(null);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);

  // Start new game on mount if level changed or empty
  useEffect(() => {
    initNewGame(currentLevel);
  }, [currentLevel]);

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

      // Reward pet
      const rewardId = pet === 'cat' ? 'mouse' : pet === 'dog' ? 'bone' : 'carrot';
      addReward(rewardId, 1);
    }
  }, [isWon]);

  const onCellPress = (row: number, col: number) => {
    if (activeHintCell) {
      clearActiveHint();
    }

    const res = handleCellTap(row, col, autoMark);
    if (res.status === 'animal_wrong') {
      setLastErrorCell({ row, col });
      setTimeout(() => setLastErrorCell(null), 1200);
    }
  };

  const handleNextLevel = () => {
    advanceLevel();
  };

  const handleDoubleReward = () => {
    const rewardId = pet === 'cat' ? 'mouse' : pet === 'dog' ? 'bone' : 'carrot';
    addReward(rewardId, 2);
    handleNextLevel();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header HUD */}
      <GameHUD
        level={currentLevel}
        size={puzzle.size}
        lives={lives}
        seconds={elapsedSeconds}
        onExit={onBackToHome}
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
          />
        )}
      </View>

      {/* Bottom Controls */}
      <GameActions
        canUndo={undoStack.length > 0 && !isWon && !isGameOver}
        hintsLeft={hintsLeft}
        canAdHint={!adHintUsed}
        onUndo={undo}
        onHint={useHint}
        onAdHint={addRewardHint}
      />

      {/* Win Modal */}
      <ResultModal
        visible={isWon}
        score={calculatedScore}
        seconds={elapsedSeconds}
        heartsLeft={lives}
        hintsUsed={hintsUsed}
        level={currentLevel}
        pet={pet}
        isNewHighScore={winRecordInfo?.isNewHighScore}
        isNewBestTime={winRecordInfo?.isNewBestTime}
        onNextLevel={handleNextLevel}
        onDoubleRewardAd={handleDoubleReward}
        onHome={onBackToHome}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        canWatchAdToContinue={!adContinueUsed}
        pet={pet}
        onWatchAd={continueWithRewardAd}
        onGiveUp={() => {
          initNewGame(currentLevel);
          onBackToHome();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  errorBanner: {
    backgroundColor: '#FED7D7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEB2B2',
  },
  errorText: {
    color: '#C53030',
    fontSize: 13,
    fontWeight: '700',
  },
});
