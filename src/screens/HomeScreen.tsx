import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PET_CONFIGS } from '../assets/petConfig';
import { DifficultyLevel } from '../engine/types';
import {
  DIFFICULTY_CONFIG,
  DIFFICULTY_UNLOCK_LEVELS,
  getDifficultyForLevel,
  isDifficultyUnlocked,
  useGameStore,
} from '../state/gameStore';
import { useProfileStore } from '../state/profileStore';
import { Feedback } from '../utils/feedback';

interface HomeScreenProps {
  onPlay: () => void;
  onOpenRecords: () => void;
  onOpenCollection: () => void;
  onOpenSettings: () => void;
}

const DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard', 'master'];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlay,
  onOpenRecords,
  onOpenCollection,
  onOpenSettings,
}) => {
  const pet = useProfileStore((state) => state.pet) || 'cat';
  const currentLevel = useProfileStore((state) => state.currentLevel);
  const rewards = useProfileStore((state) => state.rewards);
  const totalScore = useProfileStore((state) => state.stats.totalScore);
  const streakGames = useProfileStore((state) => state.stats.streakGames);
  const hapticsEnabled = useProfileStore((state) => state.settings.haptics);
  const soundEnabled = useProfileStore((state) => state.settings.sound);

  const initNewGame = useGameStore((state) => state.initNewGame);

  // Active selection for Quick Play (defaults to player's current campaign difficulty)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(() =>
    getDifficultyForLevel(currentLevel)
  );

  const petInfo = PET_CONFIGS[pet];
  const petRewardCount = rewards[petInfo.rewardId] || 0;

  const campaignDiffKey = getDifficultyForLevel(currentLevel);
  const campaignDiffInfo = DIFFICULTY_CONFIG[campaignDiffKey];
  const selectedDiffInfo = DIFFICULTY_CONFIG[selectedDifficulty];

  // 1. Play Campaign Level (random grid size, difficulty strictly follows player progression)
  const handlePlayCampaign = () => {
    Feedback.buttonPress(hapticsEnabled, soundEnabled);
    initNewGame({
      level: currentLevel,
      difficulty: campaignDiffKey,
    });
    onPlay();
  };

  // 2. Play Unlocked Logic Difficulty in Quick Play (random grid size)
  const handlePlayCustom = (diffKey: DifficultyLevel) => {
    const isUnlocked = isDifficultyUnlocked(diffKey, currentLevel);
    if (!isUnlocked) {
      const reqLevel = DIFFICULTY_UNLOCK_LEVELS[diffKey];
      Feedback.error(hapticsEnabled, soundEnabled);
      Alert.alert(
        '🔒 Kilitli Mantık Kademesi',
        `"${DIFFICULTY_CONFIG[diffKey].nameTr}" zorluğu Seviye ${reqLevel}'e ulaştığında açılacaktır. Bölüm modunda ilerleyerek kilidi açabilirsin!`,
        [{ text: 'Anladım', style: 'default' }]
      );
      return;
    }

    Feedback.buttonPress(hapticsEnabled, soundEnabled);
    setSelectedDifficulty(diffKey);
    initNewGame({
      level: currentLevel,
      difficulty: diffKey,
    });
    onPlay();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Status Bar */}
      <View style={styles.header}>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>⭐ {totalScore}</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>🔥 {streakGames} Seri</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.appTitle}>PedSudoku</Text>
        <Text style={styles.appSubtitle}>Mantık & Sevimli Dostlar</Text>

        {/* Pet Avatar display */}
        <View style={styles.petAvatarBox}>
          <Text style={styles.petEmoji}>{petInfo.emoji}</Text>
          <Text style={styles.petNameBadge}>{petInfo.nameTr}</Text>
        </View>

        {/* Reward counter preview */}
        <View style={styles.rewardSummary}>
          <Text style={styles.rewardText}>
            {petInfo.rewardEmoji} {petRewardCount} {petInfo.rewardNameTr} Toplandı
          </Text>
        </View>

        {/* 1. Main Campaign Level Play Button */}
        <TouchableOpacity
          style={styles.campaignBtn}
          onPress={handlePlayCampaign}
          activeOpacity={0.82}
        >
          <View style={styles.campaignTopRow}>
            <Text style={styles.campaignLevelText}>Bölüm {currentLevel} Oyna</Text>
            <View
              style={[
                styles.campaignBadge,
                { backgroundColor: campaignDiffInfo.lightColor },
              ]}
            >
              <Text
                style={[
                  styles.campaignBadgeText,
                  { color: campaignDiffInfo.color },
                ]}
              >
                {campaignDiffInfo.badgeEmoji} {campaignDiffInfo.nameTr}
              </Text>
            </View>
          </View>
          <Text style={styles.campaignSubText}>
            {campaignDiffInfo.descriptionTr} • Sürpriz Izgara Boyutu
          </Text>
        </TouchableOpacity>

        {/* 2. Mantık Kademeleri & Kademeli Kilit Açma */}
        <View style={styles.difficultyCard}>
          <View style={styles.diffHeader}>
            <Text style={styles.diffTitle}>🧩 Mantık Zorluğu Kademeleri</Text>
            <Text style={styles.diffSubtitle}>
              İlerledikçe yeni mantıksal çıkarım tekniklerinin kilidi açılır
            </Text>
          </View>

          <View style={styles.diffList}>
            {DIFFICULTIES.map((diffKey) => {
              const diff = DIFFICULTY_CONFIG[diffKey];
              const unlocked = isDifficultyUnlocked(diffKey, currentLevel);
              const reqLevel = DIFFICULTY_UNLOCK_LEVELS[diffKey];
              const isSelected = selectedDifficulty === diffKey;

              return (
                <TouchableOpacity
                  key={`diff-${diffKey}`}
                  style={[
                    styles.diffItem,
                    unlocked && isSelected && {
                      borderColor: diff.color,
                      backgroundColor: diff.lightColor,
                    },
                    !unlocked && styles.diffItemLocked,
                  ]}
                  onPress={() => handlePlayCustom(diffKey)}
                  activeOpacity={0.7}
                >
                  <View style={styles.diffLeft}>
                    <Text style={[styles.diffEmoji, !unlocked && styles.diffEmojiLocked]}>
                      {diff.badgeEmoji}
                    </Text>
                    <View style={styles.diffTextCol}>
                      <View style={styles.diffNameRow}>
                        <Text
                          style={[
                            styles.diffName,
                            unlocked && isSelected && { color: diff.color, fontWeight: '900' },
                            !unlocked && styles.diffNameLocked,
                          ]}
                        >
                          {diff.nameTr}
                        </Text>
                        {!unlocked && (
                          <View style={styles.lockBadge}>
                            <Text style={styles.lockBadgeText}>🔒 Seviye {reqLevel}</Text>
                          </View>
                        )}
                        {unlocked && (
                          <View
                            style={[
                              styles.unlockedBadge,
                              { backgroundColor: diff.lightColor },
                            ]}
                          >
                            <Text style={[styles.unlockedBadgeText, { color: diff.color }]}>
                              ✓ Açık
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.diffDesc}>
                        {diff.descriptionTr}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.playArrow, !unlocked && styles.playArrowLocked]}>
                    ▶
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Menu Buttons Grid */}
        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuBtn} onPress={onOpenRecords} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>🏆</Text>
            <Text style={styles.menuLabel}>Rekorlarım</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={onOpenCollection} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>🧺</Text>
            <Text style={styles.menuLabel}>Koleksiyon</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={onOpenSettings} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>⚙️</Text>
            <Text style={styles.menuLabel}>Ayarlar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Placeholder Banner for Menus (Section 7.1) */}
      <View style={styles.bannerPlaceholder}>
        <Text style={styles.bannerText}>📢 Reklam Alanı (Çocuk Uyumlu)</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scorePill: {
    backgroundColor: '#FEFCBF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECC94B',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#744210',
  },
  streakPill: {
    backgroundColor: '#FEEBC8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBD38D',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7B341E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4A5568',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 12,
  },
  petAvatarBox: {
    alignItems: 'center',
    marginBottom: 8,
  },
  petEmoji: {
    fontSize: 70,
  },
  petNameBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A5568',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  rewardSummary: {
    marginBottom: 18,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
  },
  // Campaign Button
  campaignBtn: {
    width: '100%',
    backgroundColor: '#3182CE',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  campaignTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignLevelText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  campaignBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  campaignBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  campaignSubText: {
    fontSize: 12,
    color: '#EBF8FF',
    marginTop: 5,
    fontWeight: '600',
  },
  // Difficulty List Card
  difficultyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 18,
  },
  diffHeader: {
    marginBottom: 12,
  },
  diffTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2D3748',
  },
  diffSubtitle: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginTop: 2,
  },
  diffList: {
    gap: 8,
  },
  diffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F7FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  diffItemLocked: {
    backgroundColor: '#F8F9FA',
    borderColor: '#EDF2F7',
    opacity: 0.75,
  },
  diffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  diffEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  diffEmojiLocked: {
    opacity: 0.6,
  },
  diffTextCol: {
    flex: 1,
  },
  diffNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diffName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D3748',
  },
  diffNameLocked: {
    color: '#A0AEC0',
  },
  lockBadge: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#718096',
  },
  unlockedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  unlockedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  diffDesc: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
    marginTop: 2,
  },
  playArrow: {
    fontSize: 15,
    fontWeight: '900',
    color: '#3182CE',
  },
  playArrowLocked: {
    color: '#CBD5E0',
  },
  // Menu Buttons
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  menuBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuEmoji: {
    fontSize: 20,
    marginBottom: 3,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
  },
  bannerPlaceholder: {
    height: 48,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  bannerText: {
    fontSize: 12,
    color: '#A0AEC0',
  },
});
