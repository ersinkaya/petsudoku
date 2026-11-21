import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DEFAULT_AD_CONFIG,
  InterstitialPlacement,
  PLACEMENT_INFO,
  RewardedPlacement,
} from '../services/adService';
import { trackEvent } from '../services/analytics';
import { Feedback } from '../utils/feedback';

export interface AdModalProps {
  visible: boolean;
  type: 'rewarded' | 'interstitial';
  placement: RewardedPlacement | InterstitialPlacement;
  onRewarded?: () => void;
  onClose: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({
  visible,
  type,
  placement,
  onRewarded,
  onClose,
}) => {
  const isRewarded = type === 'rewarded';
  const duration = isRewarded
    ? DEFAULT_AD_CONFIG.rewardedDurationSeconds
    : DEFAULT_AD_CONFIG.interstitialDurationSeconds;

  const [secondsRemaining, setSecondsRemaining] = useState(duration);
  const [rewardGranted, setRewardGranted] = useState(false);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const info = PLACEMENT_INFO[placement] || PLACEMENT_INFO.continue_game;

  useEffect(() => {
    if (visible) {
      setSecondsRemaining(duration);
      setRewardGranted(false);
      progressAnim.setValue(0);

      // Track ad started
      if (isRewarded) {
        trackEvent('reward_ad_started', { placement });
      }

      // Smooth progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Gentle floating mascot loop
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 8,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();

      // Countdown interval
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setRewardGranted(true);
            if (!isRewarded) {
              trackEvent('interstitial_shown', { placement });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        floatLoop.stop();
      };
    }
  }, [visible, duration, isRewarded, placement]);

  // Pulse animation when reward is ready
  useEffect(() => {
    if (rewardGranted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [rewardGranted]);

  const handleClaimReward = () => {
    if (isRewarded && rewardGranted) {
      trackEvent('reward_ad_completed', { placement });
      if (onRewarded) {
        onRewarded();
      }
    }
    onClose();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Bar with Ad Badge & Countdown */}
          <View style={styles.topBar}>
            <View style={styles.adTag}>
              <Text style={styles.adTagText}>🎬 SPONSORLU TANITIM</Text>
            </View>
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownText}>
                {rewardGranted
                  ? isRewarded
                    ? '✓ Ödül Hazır!'
                    : '✓ Tamamlandı'
                  : `⏳ ${secondsRemaining} sn`}
              </Text>
            </View>
          </View>

          {/* Progress Track */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          {/* Content Area */}
          <View style={styles.contentBox}>
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <Text style={styles.mainEmoji}>{info.icon}</Text>
            </Animated.View>

            <Text style={styles.adTitle}>{info.titleTr}</Text>
            <Text style={styles.adDescription}>{info.descriptionTr}</Text>

            {/* Reward Highlight Badge */}
            <View
              style={[
                styles.rewardBox,
                rewardGranted ? styles.rewardBoxReady : styles.rewardBoxPending,
              ]}
            >
              <Text style={styles.rewardBoxText}>
                {rewardGranted ? `🎉 ${info.rewardTextTr}` : `🎁 Beklenen Ödül: ${info.rewardTextTr}`}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            {rewardGranted ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                <TouchableOpacity
                  style={styles.claimBtn}
                  onPress={handleClaimReward}
                  activeOpacity={0.85}
                >
                  <Text style={styles.claimBtnText}>
                    {isRewarded ? '✓ Ödülü Al & Devam Et' : 'Kapat & Devam Et'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.waitingBtn}>
                <Text style={styles.waitingBtnText}>
                  {isRewarded ? `Ödül için bekleniyor (${secondsRemaining}s)...` : `Kapanıyor (${secondsRemaining}s)...`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 11, 22, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#0F172A',
  },
  adTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  adTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  countdownBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#334155',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
  },
  contentBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainEmoji: {
    fontSize: 42,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  adDescription: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  rewardBox: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  rewardBoxPending: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderColor: '#475569',
  },
  rewardBoxReady: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22C55E',
  },
  rewardBoxText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  actionContainer: {
    padding: 16,
    paddingTop: 0,
  },
  claimBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  claimBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  waitingBtn: {
    backgroundColor: '#334155',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  waitingBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
