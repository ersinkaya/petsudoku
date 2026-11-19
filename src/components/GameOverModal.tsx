import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';

interface GameOverModalProps {
  visible: boolean;
  canWatchAdToContinue: boolean;
  pet: Pet;
  onWatchAd: () => void;
  onGiveUp: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  canWatchAdToContinue,
  pet,
  onWatchAd,
  onGiveUp,
}) => {
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.petSad}>{petItem.emoji} 💔</Text>
          <Text style={styles.title}>Kalpler Tükendi!</Text>
          <Text style={styles.subtitle}>
            Üzülme, biraz mola verip tekrar deneyebilirsin.
          </Text>

          {canWatchAdToContinue && (
            <TouchableOpacity
              style={styles.continueAdBtn}
              onPress={onWatchAd}
              activeOpacity={0.8}
            >
              <Text style={styles.continueAdEmoji}>🎬 ❤️</Text>
              <Text style={styles.continueAdText}>Reklam İzle, 1 Kalple Devam Et</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.giveUpBtn} onPress={onGiveUp} activeOpacity={0.7}>
            <Text style={styles.giveUpText}>Ana Ekrana Dön</Text>
          </TouchableOpacity>
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
    maxWidth: 360,
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
  petSad: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E53E3E',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 20,
  },
  continueAdBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FEB2B2',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  continueAdEmoji: {
    fontSize: 18,
  },
  continueAdText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#C53030',
  },
  giveUpBtn: {
    width: '100%',
    paddingVertical: 13,
    backgroundColor: '#EDF2F7',
    borderRadius: 14,
    alignItems: 'center',
  },
  giveUpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
  },
});
