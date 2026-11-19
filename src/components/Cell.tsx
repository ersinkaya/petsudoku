import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { PET_CONFIGS, REGION_COLORS } from '../assets/petConfig';
import { CellState, Pet } from '../engine/types';

interface CellProps {
  row: number;
  col: number;
  state: CellState;
  region: number;
  pet: Pet;
  cellSize: number;
  isHinted?: boolean;
  isError?: boolean;
  onPress: (row: number, col: number) => void;
}

export const Cell: React.FC<CellProps> = ({
  row,
  col,
  state,
  region,
  pet,
  cellSize,
  isHinted,
  isError,
  onPress,
}) => {
  const bgColor = REGION_COLORS[region % REGION_COLORS.length];
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;
  const borderRadius = Math.max(5, Math.floor(cellSize * 0.18));

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
          borderRadius,
        },
        isHinted && styles.hintedCell,
        isError && styles.errorCell,
      ]}
    >
      {/* Animal placed */}
      {state === 'animal' && (
        <Text style={[styles.animalEmoji, { fontSize: cellSize * 0.6 }]}>
          {petItem.emoji}
        </Text>
      )}

      {/* Mark (X) */}
      {state === 'mark' && (
        <Text style={[styles.markText, { fontSize: cellSize * 0.45 }]}>✕</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintedCell: {
    borderWidth: 3,
    borderColor: '#F6E05E',
    shadowColor: '#ECC94B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  errorCell: {
    borderWidth: 3,
    borderColor: '#E53E3E',
    backgroundColor: '#FC8181',
  },
  animalEmoji: {
    textAlign: 'center',
  },
  markText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
