import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';
import { BadgeDefinition } from '../stats/badges';

const WIN_PET_IMAGES: Record<Pet, any> = {
  cat: require('../../assets/images/win_cat.png'),
  dog: require('../../assets/images/win_dog.png'),
  rabbit: require('../../assets/images/win_rabbit.png'),
};

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

  // Animations
  const popAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseBtnAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      popAnim.setValue(0.75);

      // Entrance Pop
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(popAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous Sunburst Rotation
      const spinLoop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 22000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoop.start();

      // Gentle Mascot Floating
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 6,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();

      // Primary Button Pulse
      const btnLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseBtnAnim, {
            toValue: 1.03,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseBtnAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      btnLoop.start();

      return () => {
        spinLoop.stop();
        floatLoop.stop();
        btnLoop.stop();
      };
    }
  }, [visible]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Determine dynamic 3D bubbly title based on performance
  let titleText = 'Başardın';
  if (isDaily) {
    titleText = 'Günün Zaferi';
  } else if (size >= 8) {
    titleText = 'Tahta Ustası';
  } else if (seconds <= 75) {
    titleText = 'Şimşek Zihin';
  } else if (heartsLeft >= 3 && hintsUsed === 0) {
    titleText = 'Zeki';
  }

  // Calculate realistic, encouraging player benchmark percentile
  const basePercent = 78.5 + (heartsLeft === 3 ? 10.2 : heartsLeft === 2 ? 5.1 : 0) + (hintsUsed === 0 ? 6.5 : 0) + (seconds < 100 ? 3.6 : 0);
  const percentile = Math.min(99.4, Math.max(78.5, basePercent)).toFixed(1).replace('.', ',');

  // Contextual encouragement copy
  let praiseCopy = 'Kolay değildi ama mantığın kazandı!';
  if (heartsLeft >= 3 && hintsUsed === 0) {
    praiseCopy = 'Olağanüstü bir saf mantık gösterdin!';
  } else if (seconds <= 60) {
    praiseCopy = 'Rüzgar gibi çözdün, harika bir hız!';
  } else if (size >= 8) {
    praiseCopy = 'Dev tahtayı tek bir şüphe duymadan fethettin!';
  }

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const { height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight < 760;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ scale: popAnim }],
              },
            ]}
          >
            {/* Top 3D Bubble Title with Double Shadow */}
            <View style={styles.titleWrapper}>
              <Text style={styles.titleShadow}>{titleText}</Text>
              <Text style={styles.titleText}>{titleText}</Text>
            </View>

            {/* Level / Board Size Tag */}
            <View style={styles.modeTag}>
              <Text style={styles.modeTagText}>
                {isDaily
                  ? `📅 Günün Bulmacası (${size}×${size})`
                  : `Seviye ${level} Tamamlandı (${size}×${size})`}
              </Text>
            </View>

            {/* Center Mascot with Rotating Sunburst Rays */}
            <View
              style={[
                styles.characterStage,
                isCompact && { width: 160, height: 160, marginVertical: 2 },
              ]}
            >
              {/* Rotating Sunburst Radial Rays */}
              <Animated.View
                style={[
                  styles.sunburstContainer,
                  isCompact && { width: 170, height: 170 },
                  { transform: [{ rotate: spinInterpolation }] },
                ]}
              >
                {[0, 30, 60, 90, 120, 150].map((deg) => (
                  <View
                    key={`ray-${deg}`}
                    style={[
                      styles.sunburstRay,
                      isCompact && { width: 24, height: 170 },
                      { transform: [{ rotate: `${deg}deg` }] },
                    ]}
                  />
                ))}
              </Animated.View>

              {/* Floating Sparkles */}
              <View style={[styles.sparkle, { top: 6, left: 16 }]}>
                <Text style={{ fontSize: isCompact ? 18 : 22 }}>✨</Text>
              </View>
              <View style={[styles.sparkle, { top: 12, right: 20 }]}>
                <Text style={{ fontSize: isCompact ? 18 : 22 }}>⭐</Text>
              </View>
              <View style={[styles.sparkle, { bottom: 15, left: 12 }]}>
                <Text style={{ fontSize: isCompact ? 16 : 20 }}>🎉</Text>
              </View>
              <View style={[styles.sparkle, { bottom: 20, right: 14 }]}>
                <Text style={{ fontSize: isCompact ? 18 : 22 }}>🎊</Text>
              </View>

              {/* 3D Render Character */}
              <Animated.View
                style={[
                  styles.characterContainer,
                  isCompact && { width: 140, height: 140 },
                  { transform: [{ translateY: floatAnim }] },
                ]}
              >
                <Image
                  source={WIN_PET_IMAGES[pet] || WIN_PET_IMAGES.cat}
                  style={[styles.petImage, isCompact && { width: 140, height: 140 }]}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>

            {/* Social Proof & Benchmark Callout */}
            <View style={styles.socialBox}>
              <Text style={styles.percentileText}>
                Oyuncuların <Text style={styles.percentileHighlight}>%{percentile}</Text> kadarını geçtin!
              </Text>
              <Text style={styles.praiseText}>{praiseCopy}</Text>
            </View>

            {/* Mini Stats Summary Pill */}
            <View style={styles.statsPill}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>⏱ Süre</Text>
                <Text style={styles.statValue}>{formatTime(seconds)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>🏆 Puan</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>❤️ Kalan</Text>
                <Text style={styles.statValue}>
                  {heartsLeft > 0 ? '❤️'.repeat(heartsLeft) : '💔'}
                </Text>
              </View>
            </View>

            {/* New Badge Alert if any unlocked this game */}
            {newBadges.length > 0 && (
              <View style={styles.newBadgeCard}>
                <Text style={styles.newBadgeHeader}>
                  🏆 {newBadges.length > 1 ? `${newBadges.length} YENİ ROZET KAZANILDI!` : 'YENİ ROZET KAZANILDI!'}
                </Text>
                <ScrollView
                  style={[styles.badgeScrollList, isCompact && { maxHeight: 90 }]}
                  contentContainerStyle={styles.badgeScrollContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={newBadges.length > 2}
                >
                  {newBadges.map((badge) => (
                    <View key={badge.id} style={styles.badgeItemRow}>
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                      <View style={styles.badgeTextCol}>
                        <Text style={styles.badgeTitle}>{badge.titleTr}</Text>
                        <Text style={styles.badgeDesc} numberOfLines={1}>{badge.descriptionTr}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Primary Action Button: Large Orange Rounded Pill */}
            <Animated.View style={{ transform: [{ scale: pulseBtnAnim }], width: '100%' }}>
              <TouchableOpacity
                style={styles.primaryNextBtn}
                onPress={onNextLevel}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryNextText}>
                  {isDaily ? 'Tebrikler! Ana Menüye Dön' : `Bölüm ${level + 1} ➔`}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Secondary Action: Double Reward with Ad */}
            <TouchableOpacity
              style={styles.doubleRewardBtn}
              onPress={onDoubleRewardAd}
              activeOpacity={0.8}
            >
              <Text style={styles.doubleRewardText}>
                🎬 Ödülü 2'ye Katla (+2 {petItem.rewardNameTr})
              </Text>
            </TouchableOpacity>

            {/* Tertiary: Home Navigation */}
            {!isDaily && (
              <TouchableOpacity style={styles.homeLinkBtn} onPress={onHome} activeOpacity={0.7}>
                <Text style={styles.homeLinkText}>Ana Ekrana Dön</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 26, 0.92)',
  },
  scrollWrapper: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  titleShadow: {
    position: 'absolute',
    top: 2,
    fontSize: 34,
    fontWeight: '900',
    color: '#8A4A00',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFB800',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  modeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  modeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  characterStage: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  sunburstContainer: {
    position: 'absolute',
    width: 210,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunburstRay: {
    position: 'absolute',
    width: 30,
    height: 210,
    backgroundColor: 'rgba(251, 191, 36, 0.16)',
    borderRadius: 15,
  },
  sparkle: {
    position: 'absolute',
  },
  characterContainer: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  petImage: {
    width: 170,
    height: 170,
  },
  socialBox: {
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  percentileText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  percentileHighlight: {
    color: '#34D399',
    fontSize: 18,
    fontWeight: '900',
  },
  praiseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FEF08A',
    textAlign: 'center',
    marginTop: 2,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  newBadgeCard: {
    width: '100%',
    backgroundColor: '#FFFDF5',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F6E05E',
  },
  newBadgeHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D69E2E',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeScrollList: {
    maxHeight: 110,
  },
  badgeScrollContent: {
    paddingVertical: 2,
  },
  badgeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FEEBC8',
  },
  badgeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  badgeTextCol: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#744210',
  },
  badgeDesc: {
    fontSize: 10,
    color: '#718096',
  },
  primaryNextBtn: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  primaryNextText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  doubleRewardBtn: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  doubleRewardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FDE68A',
  },
  homeLinkBtn: {
    marginTop: 8,
    paddingVertical: 4,
  },
  homeLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
