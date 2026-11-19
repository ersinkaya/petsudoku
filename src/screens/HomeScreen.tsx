import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { useGameStore } from '../state/gameStore';
import { useProfileStore } from '../state/profileStore';

interface HomeScreenProps {
  onPlay: () => void;
  onOpenRecords: () => void;
  onOpenCollection: () => void;
  onOpenSettings: () => void;
}

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

  const petInfo = PET_CONFIGS[pet];
  const petRewardCount = rewards[petInfo.rewardId] || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>⭐ {totalScore}</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>🔥 {streakGames} Seri</Text>
        </View>
      </View>

      <View style={styles.centerContent}>
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

        {/* Play Button */}
        <TouchableOpacity style={styles.playBtn} onPress={onPlay} activeOpacity={0.8}>
          <Text style={styles.playBtnText}>Oyna • Seviye {currentLevel} ▶</Text>
        </TouchableOpacity>

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
      </View>

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
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  scorePill: {
    backgroundColor: '#FEFCBF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECC94B',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#744210',
  },
  streakPill: {
    backgroundColor: '#FEEBC8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBD38D',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7B341E',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2B6CB0',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#718096',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 20,
  },
  petAvatarBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  petEmoji: {
    fontSize: 80,
  },
  petNameBadge: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4A5568',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  rewardSummary: {
    marginBottom: 28,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
  },
  playBtn: {
    width: '100%',
    backgroundColor: '#3182CE',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  playBtnText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  menuBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
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
    fontSize: 22,
    marginBottom: 4,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
  },
  bannerPlaceholder: {
    height: 52,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  bannerText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '600',
  },
});
