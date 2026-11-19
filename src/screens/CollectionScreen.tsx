import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PET_CONFIGS } from '../assets/petConfig';
import { useProfileStore } from '../state/profileStore';

interface CollectionScreenProps {
  onBack: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onBack }) => {
  const rewards = useProfileStore((state) => state.rewards);

  const rewardItems = [
    { id: 'mouse', name: 'Lezzetli Fare', emoji: '🐭', pet: 'Kedi', count: rewards.mouse || 0, color: '#FEFCBF' },
    { id: 'bone', name: 'Sulu Kemik', emoji: '🦴', pet: 'Köpek', count: rewards.bone || 0, color: '#EBF8FF' },
    { id: 'carrot', name: 'Taze Havuç', emoji: '🥕', pet: 'Tavşan', count: rewards.carrot || 0, color: '#FED7D7' },
  ];

  const totalRewards = Object.values(rewards).reduce((acc, curr) => acc + curr, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>◀ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ödül Koleksiyonu</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalEmoji}>🧺</Text>
        <Text style={styles.totalCount}>{totalRewards}</Text>
        <Text style={styles.totalLabel}>Toplam Kazanılan Ödül</Text>
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

      <View style={{ flex: 1 }} />

      {/* Banner Placeholder (Section 7.1) */}
      <View style={styles.bannerPlaceholder}>
        <Text style={styles.bannerText}>📢 Reklam Alanı (Banner)</Text>
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
    color: '#2D3748',
  },
  totalBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginVertical: 16,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  totalCount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2D3748',
  },
  totalLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardEmoji: {
    fontSize: 38,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3748',
  },
  cardPetLabel: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  countText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D3748',
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
