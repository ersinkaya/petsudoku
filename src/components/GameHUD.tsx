import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Hearts } from './Hearts';

interface GameHUDProps {
  level: number;
  size: number;
  lives: number;
  seconds: number;
  onExit: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  size,
  lives,
  seconds,
  onExit,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.hudContainer}>
      <TouchableOpacity style={styles.exitButton} onPress={onExit} activeOpacity={0.7}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.centerInfo}>
        <Text style={styles.levelTitle}>Seviye {level}</Text>
        <Text style={styles.sizeSubtitle}>{size}×{size} Izgara • ⏱️ {formatTime(seconds)}</Text>
      </View>

      <Hearts lives={lives} maxLives={3} />
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  exitButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  centerInfo: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
  },
  sizeSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
    fontWeight: '500',
  },
});
