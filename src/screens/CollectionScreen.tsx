import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PET_CONFIGS } from '../assets/petConfig';
import { getPetProgression } from '../engine/petProgression';
import { Pet } from '../engine/types';
import { useProfileStore } from '../state/profileStore';

interface CollectionScreenProps {
  onBack: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onBack }) => {
  const rewards = useProfileStore((state) => state.rewards);
  const selectedPet = useProfileStore((state) => state.pet) || 'cat';

  const petsList: Pet[] = ['cat', 'dog', 'rabbit'];

  const rewardItems = [
    { id: 'mouse', name: 'Lezzetli Fare', emoji: '🐭', pet: 'Kedi', count: rewards.mouse || 0, color: '#FFF7ED', accent: '#F6A265' },
    { id: 'bone', name: 'Sulu Kemik', emoji: '🦴', pet: 'Köpek', count: rewards.bone || 0, color: '#EFF6FF', accent: '#3B82F6' },
    { id: 'carrot', name: 'Taze Havuç', emoji: '🥕', pet: 'Tavşan', count: rewards.carrot || 0, color: '#FFF1F2', accent: '#F43F5E' },
  ];

  const totalRewards = Object.values(rewards).reduce((acc, curr) => acc + (curr || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>◀ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ödüller & Gelişim</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Total treats summary */}
        <View style={styles.totalBox}>
          <Text style={styles.totalEmoji}>🧺</Text>
          <Text style={styles.totalCount}>{totalRewards}</Text>
          <Text style={styles.totalLabel}>Toplam Kazanılan Ödül</Text>
        </View>

        {/* Section 1: Pet Progression */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🐾 Sevimli Dost Gelişimi</Text>
          <Text style={styles.sectionSubtitle}>Ödüllerle dostlarının seviyesini ve unvanını yükselt!</Text>
        </View>

        <View style={styles.progressionList}>
          {petsList.map((petKey) => {
            const petConfig = PET_CONFIGS[petKey];
            const treatsCount = rewards[petConfig.rewardId] || 0;
            const progressInfo = getPetProgression(treatsCount);
            const isCurrent = selectedPet === petKey;

            return (
              <View
                key={petKey}
                style={[
                  styles.petCard,
                  isCurrent && styles.petCardSelected,
                ]}
              >
                <View style={styles.petCardTop}>
                  <View style={styles.petAvatarWrapper}>
                    <Text style={styles.petEmoji}>{petConfig.emoji}</Text>
                  </View>
                  <View style={styles.petMainInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.petName}>{petConfig.nameTr}</Text>
                      {isCurrent && (
                        <View style={styles.currentTag}>
                          <Text style={styles.currentTagText}>Aktif Dost</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.tierBadge}>
                      <Text style={styles.tierBadgeText}>
                        {progressInfo.tierEmoji} Seviye {progressInfo.level}: {progressInfo.titleTr}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Perk text */}
                <Text style={styles.perkText}>💡 {progressInfo.perkTr}</Text>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.round(progressInfo.progress * 100)}%`,
                          backgroundColor: petConfig.color,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressCountText}>
                      {petConfig.rewardEmoji} {progressInfo.currentTreats}
                      {progressInfo.nextLevelTreats !== null ? ` / ${progressInfo.nextLevelTreats}` : ' (Maks)'} {petConfig.rewardNameTr}
                    </Text>
                    <Text style={styles.progressRemainingText}>
                      {progressInfo.isMaxLevel
                        ? '👑 Efsanevi Usta!'
                        : `${progressInfo.treatsRemaining} ödül kaldı`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Section 2: Reward Pantry details */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>🎁 Ödül Kileri</Text>
        </View>

        <View style={styles.cardsContainer}>
          {rewardItems.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: item.color }]}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPetLabel}>{item.pet} Ödülü</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.count} adet</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Banner Placeholder */}
      <View style={styles.bannerPlaceholder}>
        <Text style={styles.bannerText}>📢 Reklam Alanı (Banner)</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3182CE',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  totalBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  totalEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  totalCount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
  },
  totalLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  progressionList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  petCardSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
  },
  petCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petEmoji: {
    fontSize: 30,
  },
  petMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E293B',
  },
  currentTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  perkText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 10,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 2,
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  progressRemainingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardPetLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
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
