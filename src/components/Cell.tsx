import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { PET_CONFIGS, REGION_COLORS, REGION_SYMBOLS } from '../assets/petConfig';
import { CellState, Pet } from '../engine/types';

interface CellProps {
  row: number;
  col: number;
  state: CellState;
  region: number;
  pet: Pet;
  size: number;
  cellSize: number;
  isHinted?: boolean;
  isError?: boolean;
  showSymbols?: boolean;
  borderRight: boolean;
  borderBottom: boolean;
  onPress: (row: number, col: number) => void;
}

export const Cell: React.FC<CellProps> = ({
  row,
  col,
  state,
  region,
  pet,
  size,
  cellSize,
  isHinted,
  isError,
  showSymbols = false,
  borderRight,
  borderBottom,
  onPress,
}) => {
  const bgColor = REGION_COLORS[region % REGION_COLORS.length];
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(row, col)}
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: bgColor,
          borderRightWidth: borderRight ? 2 : 0.5,
          borderBottomWidth: borderBottom ? 2 : 0.5,
          borderRightColor: borderRight ? '#4A5568' : 'rgba(0,0,0,0.06)',
          borderBottomColor: borderBottom ? '#4A5568' : 'rgba(0,0,0,0.06)',
        },
        isHinted && styles.hintedCell,
        isError && styles.errorCell,
      ]}
    >
      {/* Optional accessibility region symbol in corner */}
      {showSymbols && (
        <Text style={styles.regionSymbol}>
          {REGION_SYMBOLS[region % REGION_SYMBOLS.length]}
        </Text>
      )}

      {/* Cell Content */}
      {state === 'animal' && (
        <Text style={[styles.animalEmoji, { fontSize: cellSize * 0.55 }]}>
          {petItem.emoji}
        </Text>
      )}

      {state === 'mark' && (
        <Text style={[styles.markText, { fontSize: cellSize * 0.4 }]}>✕</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hintedCell: {
    backgroundColor: '#FEFCBF',
    borderColor: '#D69E2E',
    borderWidth: 2.5,
  },
  errorCell: {
    backgroundColor: '#FED7D7',
    borderColor: '#E53E3E',
    borderWidth: 2.5,
  },
  regionSymbol: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.2)',
  },
  animalEmoji: {
    textAlign: 'center',
  },
  markText: {
    color: '#718096',
    fontWeight: 'bold',
  },
});
