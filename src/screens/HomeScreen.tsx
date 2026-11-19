import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PET_CONFIGS } from '../assets/petConfig';
import { DifficultyLevel } from '../engine/types';
import {
  DIFFICULTY_CONFIG,
  getLevelConfig,
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

const SIZES = [5, 6, 7, 8, 9];
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

  // Custom Quick Play Selections
  const [selectedSize, setSelectedSize] = useState<number>(7);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

  const petInfo = PET_CONFIGS[pet];
  const petRewardCount = rewards[petInfo.rewardId] || 0;

  const campaignCfg = getLevelConfig(currentLevel);
  const campaignDiffInfo = DIFFICULTY_CONFIG[campaignCfg.difficulty];
  const selectedDiffInfo = DIFFICULTY_CONFIG[selectedDifficulty];

  const handlePlayCampaign = () => {
    Feedback.buttonPress(hapticsEnabled, soundEnabled);
    initNewGame({
      level: currentLevel,
      size: campaignCfg.size,
      difficulty: campaignCfg.difficulty,
    });
    onPlay();
  };

  const handlePlayCustom = () => {
    Feedback.buttonPress(hapticsEnabled, soundEnabled);
    initNewGame({
      level: currentLevel,
      size: selectedSize,
      difficulty: selectedDifficulty,
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
            Izgara: {campaignCfg.size}×{campaignCfg.size} • {campaignDiffInfo.descriptionTr}
          </Text>
        </TouchableOpacity>

        {/* 2. Custom Game / Boyut ve Mantık Seçimi */}
        <View style={styles.customCard}>
          <View style={styles.customHeader}>
            <Text style={styles.customTitle}>🎯 Hızlı & Özel Bulmaca</Text>
            <Text style={styles.customSubtitle}>Boyut ve mantık zorluğunu sen belirle</Text>
          </View>

          {/* Size Selector */}
          <Text style={styles.sectionLabel}>Izgara Boyutu (Kare Sayısı)</Text>
          <View style={styles.sizeRow}>
            {SIZES.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <TouchableOpacity
                  key={`sz-${sz}`}
                  style={[styles.sizePill, isSelected && styles.sizePillActive]}
                  onPress={() => {
                    Feedback.buttonPress(hapticsEnabled, soundEnabled);
                    setSelectedSize(sz);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sizePillText,
                      isSelected && styles.sizePillTextActive,
                    ]}
                  >
                    {sz}×{sz}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logic Difficulty Selector */}
          <Text style={styles.sectionLabel}>Mantık Zorluğu (Çıkarım Tekniği)</Text>
          <View style={styles.diffRow}>
            {DIFFICULTIES.map((diffKey) => {
              const diff = DIFFICULTY_CONFIG[diffKey];
              const isSelected = selectedDifficulty === diffKey;
              return (
                <TouchableOpacity
                  key={`diff-${diffKey}`}
                  style={[
                    styles.diffPill,
                    isSelected && {
                      borderColor: diff.color,
                      backgroundColor: diff.lightColor,
                    },
                  ]}
                  onPress={() => {
                    Feedback.buttonPress(hapticsEnabled, soundEnabled);
                    setSelectedDifficulty(diffKey);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.diffPillEmoji}>{diff.badgeEmoji}</Text>
                  <Text
                    style={[
                      styles.diffPillName,
                      isSelected && { color: diff.color, fontWeight: '900' },
                    ]}
                  >
                    {diff.nameTr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Technique explanation text */}
          <View style={styles.techniqueInfoBox}>
            <Text style={styles.techniqueInfoText}>
              ℹ️ {selectedDiffInfo.descriptionTr}
            </Text>
          </View>

          {/* Custom Play Action Button */}
          <TouchableOpacity
            style={styles.customPlayBtn}
            onPress={handlePlayCustom}
            activeOpacity={0.8}
          >
            <Text style={styles.customPlayBtnText}>
              {selectedSize}×{selectedSize} {selectedDiffInfo.nameTr} Başlat ▶
            </Text>
          </TouchableOpacity>
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
    fontSize: 18,
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
    marginTop: 4,
    fontWeight: '600',
  },
  // Custom Card
  customCard: {
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
  customHeader: {
    marginBottom: 12,
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2D3748',
  },
  customSubtitle: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A5568',
    marginBottom: 8,
    marginTop: 4,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 6,
  },
  sizePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  sizePillActive: {
    backgroundColor: '#3182CE',
    borderColor: '#3182CE',
  },
  sizePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A5568',
  },
  sizePillTextActive: {
    color: '#FFFFFF',
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 8,
  },
  diffPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  diffPillEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  diffPillName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5568',
  },
  techniqueInfoBox: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  techniqueInfoText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  customPlayBtn: {
    backgroundColor: '#48BB78',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  customPlayBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
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
