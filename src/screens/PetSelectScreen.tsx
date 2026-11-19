import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PET_CONFIGS } from '../assets/petConfig';
import { Pet } from '../engine/types';
import { useProfileStore } from '../state/profileStore';

interface PetSelectScreenProps {
  onSelectComplete: () => void;
  isSettingsMode?: boolean;
}

export const PetSelectScreen: React.FC<PetSelectScreenProps> = ({
  onSelectComplete,
  isSettingsMode = false,
}) => {
  const currentPet = useProfileStore((state) => state.pet);
  const setPet = useProfileStore((state) => state.setPet);
  const [selected, setSelected] = useState<Pet>(currentPet || 'cat');

  const pets: Pet[] = ['cat', 'dog', 'rabbit'];

  const handleConfirm = () => {
    setPet(selected);
    onSelectComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isSettingsMode ? 'Hayvanını Değiştir' : 'Yoldaşını Seç'}
        </Text>
        <Text style={styles.subtitle}>
          Bulmacaları çözerken sana eşlik edecek sevimli dostunu seç:
        </Text>

        <View style={styles.petsRow}>
          {pets.map((p) => {
            const petInfo = PET_CONFIGS[p];
            const isChosen = selected === p;

            return (
              <TouchableOpacity
                key={p}
                style={[styles.petCard, isChosen && styles.petCardActive]}
                onPress={() => setSelected(p)}
                activeOpacity={0.8}
              >
                <Text style={styles.petEmoji}>{petInfo.emoji}</Text>
                <Text style={styles.petName}>{petInfo.nameTr}</Text>
                <View style={styles.rewardPill}>
                  <Text style={styles.rewardEmoji}>{petInfo.rewardEmoji}</Text>
                  <Text style={styles.rewardText}>{petInfo.rewardNameTr}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmBtnText}>
            {isSettingsMode ? 'Kaydet' : 'Maceraya Başla 🐾'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  petsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
    marginBottom: 40,
  },
  petCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  petCardActive: {
    borderColor: '#9F7AEA',
    backgroundColor: '#FAF5FF',
    transform: [{ scale: 1.05 }],
  },
  petEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 10,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  rewardEmoji: {
    fontSize: 12,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A5568',
  },
  confirmBtn: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#805AD5',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#805AD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
