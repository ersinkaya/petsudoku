import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  onDragMark?: (
    coords: Array<{ row: number; col: number }>,
    targetState: 'mark' | 'empty'
  ) => void;
}

export const Grid: React.FC<GridProps> = ({
  puzzle,
  cells,
  pet,
  activeHintCell,
  lastErrorCell,
  onCellPress,
  onCellLongPress,
  onDragMark,
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

  // Card-dealing entrance animation: sweeps sequentially from left to right
  const dealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dealAnim.setValue(0);
    Animated.timing(dealAnim, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [puzzle.seed]);

  // Precomputed staggered left-to-right slide animation for each column
  const colAnimStyles = useMemo(() => {
    return Array.from({ length: n }).map((_, c) => {
      const start = (c / n) * 0.48;
      const end = Math.min(1, start + 0.5);

      const translateX = dealAnim.interpolate({
        inputRange: [0, start, end, 1],
        outputRange: [-42, -42, 0, 0],
      });

      const opacity = dealAnim.interpolate({
        inputRange: [0, start, end, 1],
        outputRange: [0, 0, 1, 1],
      });

      const scale = dealAnim.interpolate({
        inputRange: [0, start, end, 1],
        outputRange: [0.86, 0.86, 1, 1],
      });

      return {
        opacity,
        transform: [{ translateX }, { scale }],
      };
    });
  }, [n, dealAnim]);

  const cardOpacity = dealAnim.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0.35, 1, 1],
  });

  // --- SWIPE / DRAG TO MARK LOGIC ---
  const matrixRef = useRef<React.ElementRef<typeof View>>(null);
  const matrixLayoutRef = useRef<{ pageX: number; pageY: number }>({
    pageX: (screenWidth - cardWidth) / 2 + gridContainerPadding,
    pageY: 0,
  });

  const dragModeRef = useRef<'mark' | 'empty' | null>(null);
  const lastCellRef = useRef<{ row: number; col: number } | null>(null);

  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  const onDragMarkRef = useRef(onDragMark);
  onDragMarkRef.current = onDragMark;

  const measureMatrix = () => {
    matrixRef.current?.measureInWindow((x: number, y: number) => {
      if (x !== undefined && y !== undefined && (x > 0 || y > 0)) {
        matrixLayoutRef.current = { pageX: x, pageY: y };
      }
    });
  };

  useEffect(() => {
    const t1 = setTimeout(measureMatrix, 80);
    const t2 = setTimeout(measureMatrix, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [n, puzzle.seed]);

  const getCellFromPosition = (
    pageX: number,
    pageY: number
  ): { row: number; col: number } | null => {
    const step = cellSize + cellGap;
    const relX = pageX - matrixLayoutRef.current.pageX;
    const relY = pageY - matrixLayoutRef.current.pageY;

    const col = Math.floor(relX / step);
    const row = Math.floor(relY / step);

    if (row < 0 || row >= n || col < 0 || col >= n) {
      // Small 12px margin outside borders to catch corner/edge swipes
      if (
        relX >= -12 &&
        relX <= n * step + 12 &&
        relY >= -12 &&
        relY <= n * step + 12
      ) {
        return {
          row: Math.max(0, Math.min(n - 1, row)),
          col: Math.max(0, Math.min(n - 1, col)),
        };
      }
      return null;
    }
    return { row, col };
  };

  // Interpolates between two cell coordinates so fast swipes don't skip cells in-between
  const getInterpolatedLine = (
    from: { row: number; col: number },
    to: { row: number; col: number }
  ): Array<{ row: number; col: number }> => {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return [to];

    const result: Array<{ row: number; col: number }> = [];
    for (let s = 1; s <= steps; s++) {
      result.push({
        row: Math.round(from.row + (dr * s) / steps),
        col: Math.round(from.col + (dc * s) / steps),
      });
    }
    return result;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,

        // Only capture once finger moves > 8 pixels (intentional swipe/drag)
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8
          );
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8
          );
        },

        onPanResponderGrant: (_, gestureState) => {
          measureMatrix();

          // Identify cell at start (x0, y0)
          const startCell = getCellFromPosition(
            gestureState.x0,
            gestureState.y0
          );
          if (!startCell) return;

          const currentVal =
            cellsRef.current[startCell.row]?.[startCell.col];
          // If starting on a mark (X), drag clears marks along path back to empty
          // If starting on empty, drag marks empty cells along path with X
          const target = currentVal === 'mark' ? 'empty' : 'mark';
          dragModeRef.current = target;
          lastCellRef.current = startCell;

          // Apply to the start cell immediately
          onDragMarkRef.current?.([startCell], target);

          // Also check where finger has already reached
          const currCell = getCellFromPosition(
            gestureState.moveX,
            gestureState.moveY
          );
          if (
            currCell &&
            (currCell.row !== startCell.row || currCell.col !== startCell.col)
          ) {
            const line = getInterpolatedLine(startCell, currCell);
            onDragMarkRef.current?.(line, target);
            lastCellRef.current = currCell;
          }
        },

        onPanResponderMove: (_, gestureState) => {
          if (!dragModeRef.current || !lastCellRef.current) return;

          const currCell = getCellFromPosition(
            gestureState.moveX,
            gestureState.moveY
          );
          if (!currCell) return;

          if (
            currCell.row !== lastCellRef.current.row ||
            currCell.col !== lastCellRef.current.col
          ) {
            const line = getInterpolatedLine(lastCellRef.current, currCell);
            onDragMarkRef.current?.(line, dragModeRef.current);
            lastCellRef.current = currCell;
          }
        },

        onPanResponderRelease: () => {
          dragModeRef.current = null;
          lastCellRef.current = null;
        },
        onPanResponderTerminate: () => {
          dragModeRef.current = null;
          lastCellRef.current = null;
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [n, cellSize, cellGap]
  );

  return (
    <View style={styles.wrapper}>
      {/* Region Indicators Header */}
      <View style={styles.notchHeader}>
        {Array.from({ length: n }).map((_, regIdx) => {
          const color = REGION_COLORS[regIdx % REGION_COLORS.length];
          const isDone = completedRegions.has(regIdx);

          return (
            <Animated.View
              key={`reg-cat-${regIdx}`}
              style={[
                styles.catBadge,
                { backgroundColor: color },
                isDone && styles.catBadgeDone,
                colAnimStyles[regIdx],
              ]}
            >
              <Text style={styles.catBadgeIcon}>{isDone ? '✓' : '🐱'}</Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Main Grid Card */}
      <Animated.View
        style={[
          styles.gridCard,
          {
            width: cardWidth,
            opacity: cardOpacity,
          },
        ]}
      >
        <View
          ref={matrixRef}
          onLayout={measureMatrix}
          {...panResponder.panHandlers}
          style={[styles.gridMatrix, { gap: cellGap }]}
        >
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
                  <Animated.View
                    key={`anim-cell-${r}-${c}`}
                    style={colAnimStyles[c]}
                  >
                    <Cell
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
                  </Animated.View>
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
