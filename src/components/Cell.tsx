import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_CONFIGS, REGION_COLORS, REGION_SYMBOLS } from '../assets/petConfig';
import { CellCoord, CellState, Pet } from '../engine/types';

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
  borderTop: boolean;
  borderBottom: boolean;
  borderLeft: boolean;
  borderRight: boolean;
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
  showSymbols = true,
  borderTop,
  borderBottom,
  borderLeft,
  borderRight,
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
          borderTopWidth: borderTop ? 3 : 0.5,
          borderBottomWidth: borderBottom ? 3 : 0.5,
          borderLeftWidth: borderLeft ? 3 : 0.5,
          borderRightWidth: borderRight ? 3 : 0.5,
          borderTopColor: borderTop ? '#2D3748' : 'rgba(0,0,0,0.1)',
          borderBottomColor: borderBottom ? '#2D3748' : 'rgba(0,0,0,0.1)',
          borderLeftColor: borderLeft ? '#2D3748' : 'rgba(0,0,0,0.1)',
          borderRightColor: borderRight ? '#2D3748' : 'rgba(0,0,0,0.1)',
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
    backgroundColor: '#FFF9C4',
    borderColor: '#FBC02D',
    borderWidth: 3,
  },
  errorCell: {
    backgroundColor: '#FFCDD2',
    borderColor: '#E53935',
    borderWidth: 3,
  },
  regionSymbol: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.25)',
  },
  animalEmoji: {
    textAlign: 'center',
  },
  markText: {
    color: '#718096',
    fontWeight: 'bold',
  },
});
