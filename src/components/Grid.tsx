import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { REGION_COLORS } from '../assets/petConfig';
import { CellCoord, CellState, Pet, Puzzle } from '../engine/types';
import { Cell } from './Cell';

interface GridProps {
  puzzle: Puzzle;
  cells: CellState[][];
  pet: Pet;
  activeHintCell: CellCoord | null;
  lastErrorCell?: CellCoord | null;
  onCellPress: (row: number, col: number) => void;
  onCellLongPress?: (row: number, col: number) => void;
}

export const Grid: React.FC<GridProps> = ({
  puzzle,
  cells,
  pet,
  activeHintCell,
  lastErrorCell,
  onCellPress,
  onCellLongPress,
}) => {
  const n = puzzle.size;
  const screenWidth = Dimensions.get('window').width;
  const gridContainerPadding = 12;
  const cardMargin = 28;
  const availableWidth = Math.min(screenWidth - cardMargin, 400);

  // Cell gap
  const cellGap = n <= 6 ? 4 : 3;
  const totalGaps = cellGap * (n - 1);
  const totalCellWidth = availableWidth - gridContainerPadding * 2 - totalGaps;
  const cellSize = Math.floor(totalCellWidth / n);
  const cardWidth = cellSize * n + totalGaps + gridContainerPadding * 2;

  // Track which regions have an animal already placed
  const completedRegions = new Set<number>();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cells[r]?.[c] === 'animal') {
        completedRegions.add(puzzle.regions[r][c]);
      }
    }
  }

  // Card-dealing entrance spring animation synchronized with deal sound
  const dealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dealAnim.setValue(0);
    Animated.spring(dealAnim, {
      toValue: 1,
      friction: 7,
      tension: 65,
      useNativeDriver: true,
    }).start();
  }, [puzzle.seed]);

  const translateY = dealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const scale = dealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1],
  });

  const opacity = dealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  return (
    <View style={styles.wrapper}>
      {/* Region Indicators Header (Cats row from screenshot) */}
      <Animated.View
        style={[
          styles.notchHeader,
          { opacity, transform: [{ scale }] },
        ]}
      >
        {Array.from({ length: n }).map((_, regIdx) => {
          const color = REGION_COLORS[regIdx % REGION_COLORS.length];
          const isDone = completedRegions.has(regIdx);

          return (
            <View
              key={`reg-cat-${regIdx}`}
              style={[
                styles.catBadge,
                { backgroundColor: color },
                isDone && styles.catBadgeDone,
              ]}
            >
              <Text style={styles.catBadgeIcon}>{isDone ? '✓' : '🐱'}</Text>
            </View>
          );
        })}
      </Animated.View>

      {/* Main Grid Card with card deal spring transition */}
      <Animated.View
        style={[
          styles.gridCard,
          {
            width: cardWidth,
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <View style={[styles.gridMatrix, { gap: cellGap }]}>
          {Array.from({ length: n }).map((_, r) => (
            <View key={`row-${r}`} style={[styles.row, { gap: cellGap }]}>
              {Array.from({ length: n }).map((_, c) => {
                const currentReg = puzzle.regions[r]?.[c] ?? 0;
                const state = cells[r]?.[c] ?? 'empty';

                const isHinted =
                  activeHintCell?.row === r && activeHintCell?.col === c;
                const isError =
                  lastErrorCell?.row === r && lastErrorCell?.col === c;

                return (
                  <Cell
                    key={`cell-${r}-${c}`}
                    row={r}
                    col={c}
                    state={state}
                    region={currentReg}
                    pet={pet}
                    cellSize={cellSize}
                    isHinted={isHinted}
                    isError={isError}
                    onPress={onCellPress}
                    onLongPress={onCellLongPress}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  notchHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#ECE4D8',
    marginBottom: -2,
    zIndex: 2,
  },
  catBadge: {
    width: 26,
    height: 22,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBadgeDone: {
    opacity: 0.35,
  },
  catBadgeIcon: {
    fontSize: 12,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    borderWidth: 2.5,
    borderColor: '#ECE4D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  gridMatrix: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
