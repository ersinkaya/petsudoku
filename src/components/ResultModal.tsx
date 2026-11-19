import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';

interface ResultModalProps {
  visible: boolean;
  score: number;
  seconds: number;
  heartsLeft: number;
  hintsUsed: number;
  level: number;
  pet: Pet;
  isNewHighScore?: boolean;
  isNewBestTime?: boolean;
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
  pet,
  isNewHighScore,
  isNewBestTime,
  onNextLevel,
  onDoubleRewardAd,
  onHome,
}) => {
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;
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
          <Text style={styles.title}>Tebrikler!</Text>
          <Text style={styles.subtitle}>Seviye {level} Tamamlandı</Text>

          {/* Pet eating reward celebration */}
          <View style={styles.petBox}>
            <Text style={styles.petEmoji}>{petItem.emoji}</Text>
            <Text style={styles.eatingText}>yum yum!</Text>
            <Text style={styles.rewardEmoji}>{petItem.rewardEmoji}</Text>
          </View>
          <Text style={styles.rewardCountText}>+1 {petItem.rewardNameTr} Kazandın!</Text>

          {/* Stats summary */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Puan</Text>
              <Text style={styles.statValue}>{score}</Text>
              {isNewHighScore && <Text style={styles.badge}>Yeni Rekor!</Text>}
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Süre</Text>
              <Text style={styles.statValue}>{formatTime(seconds)}</Text>
              {isNewBestTime && <Text style={styles.badge}>En Hızlı!</Text>}
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Kalan Kalp</Text>
              <Text style={styles.statValue}>{'❤️'.repeat(heartsLeft)}</Text>
            </View>
          </View>

          {/* Double reward ad button */}
          <TouchableOpacity
            style={styles.doubleAdBtn}
            onPress={onDoubleRewardAd}
            activeOpacity={0.8}
          >
            <Text style={styles.doubleAdText}>🎬 Ödülü 2'ye Katla (+2 {petItem.rewardNameTr})</Text>
          </TouchableOpacity>

          {/* Next Level & Home buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.homeBtn} onPress={onHome} activeOpacity={0.7}>
              <Text style={styles.homeBtnText}>Ana Ekran</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={onNextLevel} activeOpacity={0.7}>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  confetti: {
    fontSize: 28,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    marginTop: 4,
  },
  petBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 18,
    backgroundColor: '#F7FAFC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  petEmoji: {
    fontSize: 44,
  },
  eatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ED8936',
    fontStyle: 'italic',
  },
  rewardEmoji: {
    fontSize: 36,
  },
  rewardCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38A169',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#F7FAFC',
    paddingVertical: 12,
    borderRadius: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    marginTop: 2,
  },
  badge: {
    fontSize: 9,
    color: '#E53E3E',
    fontWeight: '800',
    marginTop: 2,
  },
  doubleAdBtn: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  doubleAdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  homeBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#EDF2F7',
    borderRadius: 14,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A5568',
  },
  nextBtn: {
    flex: 1.4,
    paddingVertical: 14,
    backgroundColor: '#48BB78',
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
