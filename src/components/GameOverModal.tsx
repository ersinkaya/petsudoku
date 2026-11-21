import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';

export interface GameOverModalProps {
  visible: boolean;
  canWatchAdToContinue: boolean;
  pet: Pet;
  remainingCount?: number;
  onWatchAd: () => void;
  onGiveUp?: () => void;
  onRestart?: () => void;
  onHome?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  canWatchAdToContinue,
  pet,
  remainingCount = 1,
  onWatchAd,
  onGiveUp,
  onRestart,
  onHome,
}) => {
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Entrance pop
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // Gentle sad floating loop
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 6,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();

      // Subtle pulse on the continue button
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => {
        floatLoop.stop();
        pulseLoop.stop();
      };
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
      floatAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const handleRestart = () => {
    if (onRestart) onRestart();
    else if (onGiveUp) onGiveUp();
  };

  const titleText = `${petItem.treatNameTr} Kalmadı`;
  const rewardAdText = `3 ${petItem.treatNameTr} Al`;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Top Title */}
          <View style={styles.titleWrapper}>
            <Text style={styles.titleShadow}>{titleText}</Text>
            <Text style={styles.titleText}>{titleText}</Text>
          </View>

          {/* Sad Pet Character */}
          <Animated.View
            style={[
              styles.characterContainer,
              { transform: [{ translateY: floatAnim }] },
            ]}
          >
            {pet === 'cat' ? (
              <Image
                source={require('../../assets/images/sad_cat.png')}
                style={styles.petImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.fallbackPetBox}>
                <Text style={styles.fallbackPetEmoji}>{petItem.emoji}</Text>
                <Text style={styles.brokenTreatEmoji}>💔 {petItem.treatEmoji}</Text>
              </View>
            )}
          </Animated.View>

          {/* Remaining Count Badge */}
          <View style={styles.remainingBadge}>
            <Text style={styles.remainingEmoji}>{petItem.emoji}</Text>
            <Text style={styles.remainingLabel}>
              Kalan:{' '}
              <Text style={styles.remainingCount}>{remainingCount}</Text>
            </Text>
          </View>

          {/* Primary Action: Watch Ad to Continue (3 Lives) */}
          {canWatchAdToContinue && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
              <TouchableOpacity
                style={styles.primaryAdBtn}
                onPress={onWatchAd}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryAdText}>{rewardAdText}</Text>
                {/* Green AD Badge in top right corner */}
                <View style={styles.adBadge}>
                  <Text style={styles.adBadgePlayIcon}>▶</Text>
                  <Text style={styles.adBadgeText}>AD</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Secondary Action: Restart */}
          <TouchableOpacity
            style={styles.restartBtn}
            onPress={handleRestart}
            activeOpacity={0.8}
          >
            <Text style={styles.restartBtnText}>Yeniden Başlat</Text>
          </TouchableOpacity>

          {/* Optional Home button */}
          {onHome && (
            <TouchableOpacity
              style={styles.homeLinkBtn}
              onPress={onHome}
              activeOpacity={0.6}
            >
              <Text style={styles.homeLinkText}>Ana Ekrana Dön</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 26, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  titleWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleShadow: {
    position: 'absolute',
    top: 3,
    fontSize: 34,
    fontWeight: '900',
    color: '#1B3E6D',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#5BA8FF',
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  characterContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  petImage: {
    width: 250,
    height: 250,
  },
  fallbackPetBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackPetEmoji: {
    fontSize: 100,
  },
  brokenTreatEmoji: {
    fontSize: 44,
    marginTop: -10,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 24,
    marginBottom: 32,
    gap: 8,
  },
  remainingEmoji: {
    fontSize: 20,
  },
  remainingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  remainingCount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  primaryAdBtn: {
    width: '100%',
    backgroundColor: '#5C9DEB',
    borderRadius: 30,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#7EBAFF',
  },
  primaryAdText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  adBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  adBadgePlayIcon: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  restartBtn: {
    width: '100%',
    backgroundColor: '#EDF4FC',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  restartBtnText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#3B72B8',
  },
  homeLinkBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  homeLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
