import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { CellCoord, CellState, Pet, Puzzle } from '../engine/types';
import { Cell } from './Cell';

interface GridProps {
  puzzle: Puzzle;
  cells: CellState[][];
  pet: Pet;
  activeHintCell: CellCoord | null;
  lastErrorCell?: CellCoord | null;
  showSymbols?: boolean;
  onCellPress: (row: number, col: number) => void;
}

export const Grid: React.FC<GridProps> = ({
  puzzle,
  cells,
  pet,
  activeHintCell,
  lastErrorCell,
  showSymbols = true,
  onCellPress,
}) => {
  const n = puzzle.size;
  const screenWidth = Dimensions.get('window').width;
  const gridPadding = 32;
  const availableWidth = Math.min(screenWidth - gridPadding, 420);
  const cellSize = Math.floor(availableWidth / n);

  return (
    <View style={[styles.gridContainer, { width: cellSize * n, height: cellSize * n }]}>
      {Array.from({ length: n }).map((_, r) => (
        <View key={`row-${r}`} style={styles.row}>
          {Array.from({ length: n }).map((_, c) => {
            const currentReg = puzzle.regions[r]?.[c] ?? 0;
            const state = cells[r]?.[c] ?? 'empty';

            // Determine if border should be thick (region boundary or grid edge)
            const borderTop = r === 0 || puzzle.regions[r - 1]?.[c] !== currentReg;
            const borderBottom = r === n - 1 || puzzle.regions[r + 1]?.[c] !== currentReg;
            const borderLeft = c === 0 || puzzle.regions[r]?.[c - 1] !== currentReg;
            const borderRight = c === n - 1 || puzzle.regions[r]?.[c + 1] !== currentReg;

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
                size={n}
                cellSize={cellSize}
                isHinted={isHinted}
                isError={isError}
                showSymbols={showSymbols}
                borderTop={borderTop}
                borderBottom={borderBottom}
                borderLeft={borderLeft}
                borderRight={borderRight}
                onPress={onCellPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#2D3748',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
});
