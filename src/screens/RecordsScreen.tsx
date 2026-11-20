import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_BADGES } from '../stats/badges';
import { useProfileStore } from '../state/profileStore';

interface RecordsScreenProps {
  onBack: () => void;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({ onBack }) => {
  const stats = useProfileStore((state) => state.stats);
  const [selectedSize, setSelectedSize] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'records' | 'badges'>('records');

  const sizes = [5, 6, 7, 8, 9];
  const list = stats.bestBySize[selectedSize] || [];
  const bestTime = stats.bestTimeBySize[selectedSize];
  const earnedBadgesSet = new Set(stats.badges || []);

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
        <Text style={styles.title}>Başarılar & Rekorlar</Text>
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
          <Text style={styles.summaryLabel}>Rozetler</Text>
          <Text style={styles.summaryValue}>
            {earnedBadgesSet.size}/{ALL_BADGES.length}
          </Text>
        </View>
      </View>

      {/* Main Mode Switcher: Rekorlar vs Rozetler */}
      <View style={styles.mainModeRow}>
        <TouchableOpacity
          style={[styles.mainModeBtn, activeTab === 'records' && styles.mainModeBtnActive]}
          onPress={() => setActiveTab('records')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.mainModeText,
              activeTab === 'records' && styles.mainModeTextActive,
            ]}
          >
            📊 Boyut Rekorları
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainModeBtn, activeTab === 'badges' && styles.mainModeBtnActive]}
          onPress={() => setActiveTab('badges')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.mainModeText,
              activeTab === 'badges' && styles.mainModeTextActive,
            ]}
          >
            🏆 Rozet Vitrini ({earnedBadgesSet.size})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'records' ? (
        <>
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
            <Text style={styles.listTitle}>En İyi 10 Skor ({selectedSize}×{selectedSize})</Text>
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
        </>
      ) : (
        /* Badges Showcase Tab */
        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.listTitle}>Kazanılan Başarı Rozetleri</Text>
          <View style={styles.badgesGrid}>
            {ALL_BADGES.map((badge) => {
              const isUnlocked = earnedBadgesSet.has(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, isUnlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked]}
                >
                  <View style={styles.badgeIconWrapper}>
                    <Text style={styles.badgeCardIcon}>{isUnlocked ? badge.icon : '🔒'}</Text>
                  </View>
                  <View style={styles.badgeCardContent}>
                    <View style={styles.badgeHeaderLine}>
                      <Text
                        style={[
                          styles.badgeCardTitle,
                          isUnlocked ? styles.badgeTitleUnlocked : styles.badgeTitleLocked,
                        ]}
                      >
                        {badge.titleTr}
                      </Text>
                      {isUnlocked && <Text style={styles.badgeEarnedTag}>✓ Kazanıldı</Text>}
                    </View>
                    <Text style={styles.badgeCardDesc}>{badge.descriptionTr}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#805AD5',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#322659',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#805AD5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#322659',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  mainModeRow: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  mainModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  mainModeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainModeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
  },
  mainModeTextActive: {
    color: '#805AD5',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  tabActive: {
    backgroundColor: '#805AD5',
    borderColor: '#805AD5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B46C1',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  bestTimeBox: {
    backgroundColor: '#EBF8FF',
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BEE3F8',
    alignItems: 'center',
  },
  bestTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B6CB0',
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A5568',
    marginBottom: 8,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  recordItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0E6FF',
  },
  recordRankBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#805AD5',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#805AD5',
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgesGrid: {
    gap: 8,
  },
  badgeCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  badgeCardUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FBD38D',
    shadowColor: '#D69E2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeCardLocked: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.65,
  },
  badgeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeCardIcon: {
    fontSize: 24,
  },
  badgeCardContent: {
    flex: 1,
  },
  badgeHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  badgeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  badgeTitleUnlocked: {
    color: '#744210',
  },
  badgeTitleLocked: {
    color: '#718096',
  },
  badgeEarnedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38A169',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeCardDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
});
