import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export type ComboLevel = 'great' | 'amazing' | 'unbelievable';

export interface ComboEvent {
  id: number;
  count: number;
  level: ComboLevel;
  text: string;
}

interface ComboBannerProps {
  combo: ComboEvent | null;
}

export const ComboBanner: React.FC<ComboBannerProps> = ({ combo }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (combo) {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      translateYAnim.setValue(25);

      Animated.sequence([
        // Pop in & float up
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 70,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -15,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        // Fade out
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -40,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [combo?.id]);

  if (!combo) return null;

  const isUnbelievable = combo.level === 'unbelievable';
  const isAmazing = combo.level === 'amazing';

  const badgeColor = isUnbelievable
    ? '#8B5CF6'
    : isAmazing
    ? '#F59E0B'
    : '#10B981';

  const glowShadow = isUnbelievable
    ? '#6D28D9'
    : isAmazing
    ? '#D97706'
    : '#047857';

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: badgeColor,
            shadowColor: glowShadow,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        <Text style={styles.streakText}>
          {isUnbelievable ? '👑' : isAmazing ? '⚡' : '🔥'} {combo.count}x STREAK!
        </Text>
        <Text style={styles.comboText}>{combo.text}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  pill: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    marginBottom: 2,
    opacity: 0.95,
  },
  comboText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
