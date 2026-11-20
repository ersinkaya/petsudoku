import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';

interface TutorialModalProps {
  visible: boolean;
  pet: Pet;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  icon: string;
  summary: string;
  detail: string;
  exampleBox?: React.ReactNode;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  visible,
  pet,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const petItem = PET_CONFIGS[pet] || PET_CONFIGS.cat;

  const STEPS: TutorialStep[] = [
    {
      title: 'Hedef & Temel Kural',
      icon: '🎯',
      summary: 'Her satır, sütun ve renkli bölgeye tam 1 hayvan yerleştir!',
      detail:
        'Izgara N adet renkli bölgeye ayrılmıştır. Her satırda, her sütunda ve her renkte tam olarak 1 sevimli hayvan bulunmalıdır.',
    },
    {
      title: 'Dokunma & Karar',
      icon: '👆',
      summary: 'Tek dokunuş [X] notu, çift dokunuş [Hayvan] koyar.',
      detail:
        'Bir kareye dokunarak "Burada hayvan olamaz" notu (✖️) düşebilirsin. Hızlı çift dokunarak kesin kararını verip hayvanını yerleştir!',
    },
    {
      title: 'X Notu Tamamen Ücretsiz',
      icon: '🆓',
      summary: 'X işareti asla kalp götürmez, bol bol kullan!',
      detail:
        'PedSudoku bir tahmin oyunu değil, mantık oyunudur. İhtimalleri elemek için X notlarını dilediğince kullanabilirsin.',
    },
    {
      title: 'Komşuluk Yasağı (8 Yön)',
      icon: '🚫',
      summary: 'Hayvanlar çapraz dahil birbirine ASLA değemez!',
      detail:
        'İki hayvan yatay, dikey veya çapraz olarak yan yana gelemez. Yanlış yere konan her hayvan 1 kalp götürür (Toplam 3 canın var).',
    },
  ];

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setCurrentStepIndex(0);
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStepIndex(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header row with Skip button */}
          <View style={styles.topRow}>
            <Text style={styles.stepIndicator}>
              Adım {currentStepIndex + 1} / {STEPS.length}
            </Text>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
              <Text style={styles.skipText}>Atla ✕</Text>
            </TouchableOpacity>
          </View>

          {/* Step Icon & Title */}
          <View style={styles.iconCircle}>
            <Text style={styles.stepIcon}>{currentStep.icon}</Text>
          </View>

          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepSummary}>{currentStep.summary}</Text>

          {/* Visual Miniature Demo Box */}
          <View style={styles.demoBox}>
            {currentStepIndex === 0 && (
              <View style={styles.miniGridRow}>
                <View style={[styles.miniCell, { backgroundColor: '#F6A265' }]}>
                  <Text style={styles.miniCellText}>{petItem.emoji}</Text>
                </View>
                <View style={[styles.miniCell, { backgroundColor: '#8C77CE' }]}>
                  <Text style={styles.miniCellText}>✖️</Text>
                </View>
                <View style={[styles.miniCell, { backgroundColor: '#9ED387' }]}>
                  <Text style={styles.miniCellText}>✖️</Text>
                </View>
              </View>
            )}

            {currentStepIndex === 1 && (
              <View style={styles.cycleRow}>
                <Text style={styles.cycleText}>Boş ➔</Text>
                <View style={styles.cycleBadge}>
                  <Text style={styles.cycleBadgeText}>✖️ Not</Text>
                </View>
                <Text style={styles.cycleText}>➔</Text>
                <View style={[styles.cycleBadge, { backgroundColor: '#E9D8FD' }]}>
                  <Text style={styles.cycleBadgeText}>{petItem.emoji} Karar</Text>
                </View>
              </View>
            )}

            {currentStepIndex === 2 && (
              <View style={styles.freeBox}>
                <Text style={styles.freeEmoji}>🛡️</Text>
                <Text style={styles.freeText}>
                  Emin olmadığın yerlere ✖️ koyarak eleme yap. Kalplerin güvende!
                </Text>
              </View>
            )}

            {currentStepIndex === 3 && (
              <View style={styles.neighborWarningBox}>
                <View style={styles.warningRow}>
                  <Text style={styles.warningPet}>{petItem.emoji}</Text>
                  <Text style={styles.forbiddenSign}>⚡🚫⚡</Text>
                  <Text style={styles.warningPet}>{petItem.emoji}</Text>
                </View>
                <Text style={styles.warningText}>Çapraz bile yasak!</Text>
              </View>
            )}
          </View>

          {/* Step Detailed Explanation */}
          <Text style={styles.stepDetail}>{currentStep.detail}</Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentStepIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>
              {isLastStep ? 'Anladım, Oyuna Başla! 🚀' : 'Sonraki Kural ➔'}
            </Text>
          </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '800',
    color: '#805AD5',
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A0AEC0',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E9D8FD',
  },
  stepIcon: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  stepSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B46C1',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  demoBox: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  miniGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniCell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniCellText: {
    fontSize: 20,
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cycleText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '700',
  },
  cycleBadge: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cycleBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2D3748',
  },
  freeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  freeEmoji: {
    fontSize: 26,
  },
  freeText: {
    flex: 1,
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
  },
  neighborWarningBox: {
    alignItems: 'center',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningPet: {
    fontSize: 26,
  },
  forbiddenSign: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E53E3E',
  },
  warningText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E53E3E',
    marginTop: 4,
  },
  stepDetail: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#805AD5',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  actionBtn: {
    backgroundColor: '#805AD5',
    borderRadius: 14,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#805AD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
