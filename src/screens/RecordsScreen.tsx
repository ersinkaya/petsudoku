import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProfileStore } from '../state/profileStore';

interface RecordsScreenProps {
  onBack: () => void;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({ onBack }) => {
  const stats = useProfileStore((state) => state.stats);
  const [selectedSize, setSelectedSize] = useState<number>(5);

  const sizes = [5, 6, 7, 8, 9];
  const list = stats.bestBySize[selectedSize] || [];
  const bestTime = stats.bestTimeBySize[selectedSize];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>◀ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rekorlarım</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Toplam Puan</Text>
          <Text style={styles.summaryValue}>{stats.totalScore}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Kazanma Serisi</Text>
          <Text style={styles.summaryValue}>{stats.streakGames} Oyun</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Günlük Seri</Text>
          <Text style={styles.summaryValue}>{stats.streakDays} Gün</Text>
        </View>
      </View>

      {/* Size Tabs */}
      <View style={styles.tabsRow}>
        {sizes.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, selectedSize === s && styles.tabActive]}
            onPress={() => setSelectedSize(s)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedSize === s && styles.tabTextActive]}>
              {s}×{s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Best time highlight */}
      <View style={styles.bestTimeBox}>
        <Text style={styles.bestTimeText}>
          ⚡ En Hızlı Çözüm: {bestTime !== undefined ? formatTime(bestTime) : '-'}
        </Text>
      </View>

      {/* Top 10 list */}
      <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.listTitle}>En İyi 10 Skor</Text>
        {list.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Henüz bu boyutta kayıtlı oyun yok.</Text>
          </View>
        ) : (
          list.map((item, index) => (
            <View key={`rec-${index}`} style={styles.recordItem}>
              <View style={styles.recordRankBox}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.recordMain}>
                <Text style={styles.recordScore}>{item.score} Puan</Text>
                <Text style={styles.recordSub}>
                  ⏱️ {formatTime(item.seconds)} • ❤️ {item.heartsLeft} Kalp
                </Text>
              </View>
              <Text style={styles.recordLevel}>Sv. {item.level}</Text>
            </View>
          ))
        )}
      </ScrollView>
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#EDF2F7',
  },
  tabActive: {
    backgroundColor: '#3182CE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  bestTimeBox: {
    alignSelf: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 16,
  },
  bestTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B6CB0',
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4A5568',
    marginBottom: 10,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  recordRankBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A5568',
  },
  recordMain: {
    flex: 1,
  },
  recordScore: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D3748',
  },
  recordSub: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  recordLevel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
  },
});
