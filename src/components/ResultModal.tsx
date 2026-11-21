import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';
import { BadgeDefinition } from '../stats/badges';

interface ResultModalProps {
  visible: boolean;
  score: number;
  seconds: number;
  heartsLeft: number;
  hintsUsed: number;
  level: number;
  size: number;
  pet: Pet;
  isDaily?: boolean;
  isNewHighScore?: boolean;
  isNewBestTime?: boolean;
  rankInSize?: number;
  newBadges?: BadgeDefinition[];
  onNextLevel: () => void;
  onDoubleRewardAd: () => void;
  onHome: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  score,
  seconds,
  heartsLeft,
  hintsUsed,
  level,
  size,
  pet,
  isDaily = false,
  isNewHighScore,
  isNewBestTime,
  rankInSize,
  newBadges = [],
  onNextLevel,
  onDoubleRewardAd,
  onHome,
}) => {
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;
  const [boxOpened, setBoxOpened] = useState(false);
  const [bounceAnim] = useState(new Animated.Value(1));

  // Reset gift box state whenever modal becomes visible
  useEffect(() => {
    if (visible) {
      setBoxOpened(false);
      // Continuous gentle pulse animation on gift box until opened
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1.0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto-open after 900ms if player hasn't tapped yet
      const timer = setTimeout(() => {
        setBoxOpened(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleOpenBox = () => {
    setBoxOpened(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.confetti}>🎉 🌟 🎊</Text>
          <Text style={styles.title}>{isDaily ? 'Günün Zaferi!' : 'Tebrikler!'}</Text>
          <Text style={styles.subtitle}>
            {isDaily ? `📅 Günün Bulmacası Tamamlandı (${size}×${size})` : `Seviye ${level} Tamamlandı (${size}×${size})`}
          </Text>

          {/* Interactive Gift Box / Pet Eating Celebration */}
          {!boxOpened ? (
            <TouchableOpacity
              style={styles.giftBoxContainer}
              onPress={handleOpenBox}
              activeOpacity={0.8}
            >
              <Animated.Text
                style={[
                  styles.giftBoxEmoji,
                  { transform: [{ scale: bounceAnim }] },
                ]}
              >
                🎁
              </Animated.Text>
              <Text style={styles.giftBoxHint}>Ödülünü Açmak İçin Dokun!</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.petCelebrationBox}>
              <View style={styles.petRow}>
                <Text style={styles.petEmoji}>{petItem.emoji}</Text>
                <Text style={styles.eatingBubble}>😋 Ham ham!</Text>
                <Text style={styles.rewardEmoji}>{petItem.rewardEmoji}</Text>
              </View>
              <Text style={styles.rewardCountText}>
                +1 {petItem.rewardNameTr} Kazandın!
              </Text>
            </View>
          )}

          {/* New Badge Alert if any unlocked this game */}
          {newBadges.length > 0 && (
            <View style={styles.newBadgeCard}>
              <Text style={styles.newBadgeHeader}>🏆 YENİ ROZET AÇILDI!</Text>
              {newBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeItemRow}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <View style={styles.badgeTextCol}>
                    <Text style={styles.badgeTitle}>{badge.titleTr}</Text>
                    <Text style={styles.badgeDesc}>{badge.descriptionTr}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Personal Rank inside size */}
          {rankInSize && rankInSize <= 10 && (
            <View style={styles.rankPill}>
              <Text style={styles.rankPillText}>
                🏅 Bu, {size}×{size} boyutundaki en iyi #{rankInSize}. sonucun!
              </Text>
            </View>
          )}

          {/* Stats summary */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Puan</Text>
              <Text style={styles.statValue}>{score}</Text>
              {isNewHighScore && <Text style={styles.badgePill}>Yeni Rekor!</Text>}
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Süre</Text>
              <Text style={styles.statValue}>{formatTime(seconds)}</Text>
              {isNewBestTime && <Text style={styles.badgePill}>En Hızlı!</Text>}
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Kalan Kalp</Text>
              <Text style={styles.statValue}>
                {heartsLeft > 0 ? '❤️'.repeat(heartsLeft) : '💔'}
              </Text>
            </View>
          </View>

          {/* Double reward ad button */}
          <TouchableOpacity
            style={styles.doubleAdBtn}
            onPress={onDoubleRewardAd}
            activeOpacity={0.8}
          >
            <Text style={styles.doubleAdText}>
              🎬 Ödülü 2'ye Katla (+2 {petItem.rewardNameTr})
            </Text>
          </TouchableOpacity>

          {/* Next Level & Home buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={onHome}
              activeOpacity={0.7}
            >
              <Text style={styles.homeBtnText}>Ana Ekran</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={onNextLevel}
              activeOpacity={0.7}
            >
              <Text style={styles.nextBtnText}>Sonraki Seviye ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 15, 38, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  confetti: {
    fontSize: 28,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#322659',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 12,
  },
  giftBoxContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FEB2B2',
    borderStyle: 'dashed',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  giftBoxEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  giftBoxHint: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E53E3E',
  },
  petCelebrationBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E9D8FD',
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  petEmoji: {
    fontSize: 38,
  },
  eatingBubble: {
    fontSize: 13,
    fontWeight: '800',
    color: '#805AD5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D6BCFA',
  },
  rewardEmoji: {
    fontSize: 34,
  },
  rewardCountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#553C9A',
    marginTop: 4,
  },
  newBadgeCard: {
    backgroundColor: '#FFFAF0',
    borderWidth: 1.5,
    borderColor: '#FBD38D',
    borderRadius: 14,
    padding: 10,
    width: '100%',
    marginBottom: 10,
  },
  newBadgeHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#C05621',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  badgeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeTextCol: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7B341E',
  },
  badgeDesc: {
    fontSize: 11,
    color: '#9C4221',
  },
  rankPill: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  rankPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B6CB0',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2D3748',
  },
  badgePill: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D69E2E',
    backgroundColor: '#FEFCBF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
    overflow: 'hidden',
  },
  doubleAdBtn: {
    backgroundColor: '#ED8936',
    borderRadius: 14,
    paddingVertical: 11,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#ED8936',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  doubleAdText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  homeBtn: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1.4,
    backgroundColor: '#805AD5',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#805AD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
