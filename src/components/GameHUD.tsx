import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { DifficultyLevel, Pet } from '../engine/types';
import { DIFFICULTY_CONFIG } from '../state/gameStore';

interface GameHUDProps {
  level: number;
  size?: number;
  difficulty?: DifficultyLevel;
  score: number;
  lives: number;
  maxLives?: number;
  pet: Pet;
  onExit: () => void;
  onSettings?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  size,
  difficulty = 'easy',
  score,
  lives,
  maxLives = 3,
  pet,
  onExit,
  onSettings,
}) => {
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;
  const petName = petItem.nameTr.toLowerCase();
  const petPlural = pet === 'cat' ? 'Kediler' : `${petItem.nameTr}'ler`;
  const diffInfo = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        {/* Back Button */}
        <TouchableOpacity style={styles.circleBtn} onPress={onExit} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Center: Bölüm, Boyut & Zorluk Rozeti */}
        <View style={styles.centerStats}>
          <View style={styles.statCol}>
            <View style={styles.levelRow}>
              <Text style={styles.statValue}>{level}</Text>
              {size && <Text style={styles.sizeBadge}>{size}×{size}</Text>}
            </View>
            <View style={[styles.diffPill, { backgroundColor: diffInfo.lightColor }]}>
              <Text style={[styles.diffText, { color: diffInfo.color }]}>
                {diffInfo.badgeEmoji} {diffInfo.nameTr}
              </Text>
            </View>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Skor</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
        </View>

        {/* Settings Button */}
        <TouchableOpacity style={styles.circleBtn} onPress={onSettings || onExit} activeOpacity={0.7}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Lives / Treats Pill (Golden Fishes from screenshot) */}
      <View style={styles.treatsPill}>
        {Array.from({ length: maxLives }).map((_, i) => {
          const isAlive = i < lives;
          return (
            <Text key={`treat-${i}`} style={[styles.treatEmoji, !isAlive && styles.treatInactive]}>
              {isAlive ? petItem.treatEmoji : '⚪'}
            </Text>
          );
        })}
      </View>

      {/* Rules Reminder Card (from screenshot) */}
      <View style={styles.rulesCard}>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleMiniIcon}>🟨</Text>
          <Text style={styles.ruleText}>Renk başına 1 {petName}</Text>
        </View>
        <View style={styles.ruleDivider} />
        <View style={styles.ruleItem}>
          <Text style={styles.ruleMiniIcon}>↔️</Text>
          <Text style={styles.ruleText}>Sütun ve satır başına 1 {petName}</Text>
        </View>
        <View style={styles.ruleDivider} />
        <View style={styles.ruleItem}>
          <Text style={styles.ruleMiniIcon}>🚫</Text>
          <Text style={styles.ruleText}>{petPlural} birbirine değemez</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0ECE4',
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6D4C41',
  },
  settingsIcon: {
    fontSize: 20,
  },
  centerStats: {
    flexDirection: 'row',
    gap: 36,
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8D6E63',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5D4037',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  sizeBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8D6E63',
    backgroundColor: '#F5EBE6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  diffPill: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
  },
  treatsPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0ECE4',
    marginBottom: 10,
  },
  treatEmoji: {
    fontSize: 22,
  },
  treatInactive: {
    opacity: 0.25,
  },
  rulesCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ECE4D8',
    marginBottom: 4,
  },
  ruleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  ruleMiniIcon: {
    fontSize: 13,
  },
  ruleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6D4C41',
    flexShrink: 1,
    lineHeight: 13,
  },
  ruleDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    backgroundColor: '#E6DCCE',
  },
});
