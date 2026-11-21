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
  isDaily?: boolean;
  placedAnimals?: number;
  totalAnimals?: number;
  onExit: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  onLeaderboard?: () => void;
}

const MiniRuleDiagram: React.FC<{ type: 'zone' | 'line' | 'neighbor' }> = ({ type }) => {
  if (type === 'zone') {
    return (
      <View style={styles.miniDiagram}>
        <View style={styles.miniRow}>
          <View style={[styles.miniCell, styles.cellZone, styles.cellZoneDot]}>
            <View style={styles.miniDot} />
          </View>
          <View style={[styles.miniCell, styles.cellZone]} />
          <View style={styles.miniCell} />
        </View>
        <View style={styles.miniRow}>
          <View style={[styles.miniCell, styles.cellZone]} />
          <View style={[styles.miniCell, styles.cellZone]} />
          <View style={styles.miniCell} />
        </View>
        <View style={styles.miniRow}>
          <View style={styles.miniCell} />
          <View style={styles.miniCell} />
          <View style={styles.miniCell} />
        </View>
      </View>
    );
  }

  if (type === 'line') {
    return (
      <View style={styles.miniDiagram}>
        <View style={styles.miniRow}>
          <View style={styles.miniCell} />
          <View style={[styles.miniCell, styles.cellLine]} />
          <View style={styles.miniCell} />
        </View>
        <View style={styles.miniRow}>
          <View style={[styles.miniCell, styles.cellLine]} />
          <View style={[styles.miniCell, styles.cellLine, styles.cellZoneDot]}>
            <View style={styles.miniDot} />
          </View>
          <View style={[styles.miniCell, styles.cellLine]} />
        </View>
        <View style={styles.miniRow}>
          <View style={styles.miniCell} />
          <View style={[styles.miniCell, styles.cellLine]} />
          <View style={styles.miniCell} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.miniDiagram}>
      <View style={styles.miniRow}>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
      </View>
      <View style={styles.miniRow}>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
        <View style={[styles.miniCell, styles.cellZoneDot]}>
          <View style={styles.miniDot} />
        </View>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
      </View>
      <View style={styles.miniRow}>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
        <View style={[styles.miniCell, styles.cellNoTouch]}>
          <Text style={styles.miniX}>×</Text>
        </View>
      </View>
    </View>
  );
};

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  size,
  difficulty = 'easy',
  score,
  lives,
  maxLives = 3,
  pet,
  isDaily = false,
  placedAnimals = 0,
  totalAnimals,
  onExit,
  onSettings,
  onHelp,
  onLeaderboard,
}) => {
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;
  const petName = petItem.nameTr.toLowerCase();
  const petPlural = pet === 'cat' ? 'Kediler' : `${petItem.nameTr}'ler`;
  const diffInfo = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  const targetCount = totalAnimals ?? size ?? 0;

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        {/* Back Button */}
        <TouchableOpacity style={styles.circleBtn} onPress={onExit} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Center: Bölüm/Günlük, Boyut & Zorluk Rozeti */}
        <View style={styles.centerStats}>
          <View style={styles.statCol}>
            <View style={styles.levelRow}>
              {isDaily ? (
                <Text style={[styles.statValue, { fontSize: 16, color: '#6B46C1' }]}>📅 Günün Bulmacası</Text>
              ) : (
                <Text style={styles.statValue}>{level}</Text>
              )}
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

        {/* Action Buttons: Leaderboard, Help & Settings */}
        <View style={styles.topActionsRow}>
          {onLeaderboard && (
            <TouchableOpacity style={styles.circleBtn} onPress={onLeaderboard} activeOpacity={0.7}>
              <Text style={styles.leaderboardIcon}>👑</Text>
            </TouchableOpacity>
          )}
          {onHelp && (
            <TouchableOpacity style={styles.circleBtn} onPress={onHelp} activeOpacity={0.7}>
              <Text style={styles.helpIcon}>❓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.circleBtn} onPress={onSettings || onExit} activeOpacity={0.7}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rules Reminder Card with 3x3 Mini Grid Diagrams (matches screenshot) */}
      <View style={styles.rulesCard}>
        <View style={styles.ruleItem}>
          <MiniRuleDiagram type="zone" />
          <Text style={styles.ruleText}>Renk başına 1 {petName}</Text>
        </View>
        <View style={styles.ruleDivider} />
        <View style={styles.ruleItem}>
          <MiniRuleDiagram type="line" />
          <Text style={styles.ruleText}>Sütun ve satır başına 1 {petName}</Text>
        </View>
        <View style={styles.ruleDivider} />
        <View style={styles.ruleItem}>
          <MiniRuleDiagram type="neighbor" />
          <Text style={styles.ruleText}>{petPlural} birbirine değemez</Text>
        </View>
      </View>

      {/* Progress & Lives Indicator Strip (matches screenshot under rule strip) */}
      <View style={styles.trackerRow}>
        {/* Left: Treats / Lives Counter */}
        <View style={styles.livesBadge}>
          <Text style={styles.livesEmoji}>{petItem.treatEmoji}</Text>
          <Text style={styles.livesCount}>{lives}</Text>
        </View>

        {/* Right: Placed Animal Progress Silhouettes */}
        {targetCount > 0 && (
          <View style={styles.animalsTrack}>
            {Array.from({ length: targetCount }).map((_, i) => {
              const isPlaced = i < placedAnimals;
              return (
                <Text
                  key={`pet-track-${i}`}
                  style={[styles.trackPetEmoji, !isPlaced && styles.trackPetDimmed]}
                >
                  {petItem.emoji}
                </Text>
              );
            })}
          </View>
        )}
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
  topActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  helpIcon: {
    fontSize: 18,
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
  leaderboardIcon: {
    fontSize: 20,
  },
  miniDiagram: {
    width: 22,
    height: 22,
    backgroundColor: '#F5EFEB',
    borderRadius: 4,
    padding: 1.5,
    justifyContent: 'space-between',
    borderWidth: 0.8,
    borderColor: '#E2D7CC',
  },
  miniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 5.5,
  },
  miniCell: {
    width: 5.5,
    height: 5.5,
    backgroundColor: '#FAF7F4',
    borderRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellZone: {
    backgroundColor: '#FDE68A',
  },
  cellLine: {
    backgroundColor: '#BFDBFE',
  },
  cellNoTouch: {
    backgroundColor: '#FEE2E2',
  },
  cellZoneDot: {
    backgroundColor: '#FED7AA',
  },
  miniDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#9A3412',
  },
  miniX: {
    fontSize: 6,
    lineHeight: 6,
    fontWeight: '900',
    color: '#EF4444',
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginTop: 4,
  },
  livesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE4D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  livesEmoji: {
    fontSize: 16,
  },
  livesCount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#5D4037',
  },
  animalsTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  trackPetEmoji: {
    fontSize: 15,
  },
  trackPetDimmed: {
    opacity: 0.2,
  },
  ruleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  ruleMiniIcon: {
    fontSize: 13,
  },
  ruleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6D4C41',
    flexShrink: 1,
    lineHeight: 12,
  },
  ruleDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    backgroundColor: '#E6DCCE',
  },
});
