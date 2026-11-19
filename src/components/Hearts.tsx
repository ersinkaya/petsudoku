import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HeartsProps {
  lives: number;
  maxLives?: number;
}

export const Hearts: React.FC<HeartsProps> = ({ lives, maxLives = 3 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxLives }).map((_, i) => {
        const isAlive = i < lives;
        return (
          <Text key={`heart-${i}`} style={[styles.heart, !isAlive && styles.heartEmpty]}>
            {isAlive ? '❤️' : '🤍'}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heart: {
    fontSize: 22,
  },
  heartEmpty: {
    opacity: 0.35,
  },
});
