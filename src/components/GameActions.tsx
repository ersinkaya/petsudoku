import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';

interface GameActionsProps {
  pet: Pet;
  canUndo: boolean;
  hintsLeft: number;
  onUndo: () => void;
  onHint: () => void;
  onPetAction?: () => void;
  onRewardAction?: () => void;
}

export const GameActions: React.FC<GameActionsProps> = ({
  pet,
  canUndo,
  hintsLeft,
  onUndo,
  onHint,
  onPetAction,
  onRewardAction,
}) => {
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;

  return (
    <View style={styles.container}>
      {/* 1. Pet / Auto-action Button */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={onPetAction}
        activeOpacity={0.75}
      >
        <Text style={styles.mainEmoji}>{petItem.emoji}</Text>
        <View style={styles.adBadge}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </TouchableOpacity>

      {/* 2. Hint / Lightbulb Button */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={onHint}
        activeOpacity={0.75}
      >
        <Text style={styles.mainEmoji}>💡</Text>
        <View style={styles.adBadge}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        {hintsLeft > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{hintsLeft}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 3. Reward / Treat Button */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={onRewardAction}
        activeOpacity={0.75}
      >
        <Text style={styles.mainEmoji}>{petItem.rewardEmoji}</Text>
        <View style={styles.adBadge}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </TouchableOpacity>

      {/* 4. Undo Button */}
      <TouchableOpacity
        style={[styles.circleBtn, !canUndo && styles.disabledBtn]}
        onPress={onUndo}
        disabled={!canUndo}
        activeOpacity={0.75}
      >
        <Text style={[styles.mainEmoji, !canUndo && styles.disabledEmoji]}>↩️</Text>
        <View style={[styles.adBadge, !canUndo && styles.disabledBadge]}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#EFE9DE',
    position: 'relative',
  },
  disabledBtn: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  mainEmoji: {
    fontSize: 28,
  },
  disabledEmoji: {
    opacity: 0.4,
  },
  adBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#38A169',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  disabledBadge: {
    backgroundColor: '#A0AEC0',
  },
  playIcon: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 1,
  },
  countBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: '#ED8936',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
