import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PET_CONFIGS } from '../assets/petConfig';
import { useProfileStore } from '../state/profileStore';

interface SettingsScreenProps {
  onBack: () => void;
  onChangePet: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onChangePet,
}) => {
  const pet = useProfileStore((state) => state.pet) || 'cat';
  const settings = useProfileStore((state) => state.settings);
  const updateSettings = useProfileStore((state) => state.updateSettings);
  const resetProgress = useProfileStore((state) => state.resetProgress);

  const petInfo = PET_CONFIGS[pet];

  const handleReset = () => {
    Alert.alert(
      'İlerlemeyi Sıfırla',
      'Tüm seviyeler, skorlar ve toplanan ödüller silinecek. Emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>◀ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ayarlar</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Active Pet Card */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Aktif Yoldaş</Text>
          <TouchableOpacity
            style={styles.petSettingCard}
            onPress={onChangePet}
            activeOpacity={0.7}
          >
            <View style={styles.petLeft}>
              <Text style={styles.petEmoji}>{petInfo.emoji}</Text>
              <View>
                <Text style={styles.petName}>{petInfo.nameTr}</Text>
                <Text style={styles.petSub}>Değiştirmek için dokun</Text>
              </View>
            </View>
            <Text style={styles.chevron}>➔</Text>
          </TouchableOpacity>
        </View>

        {/* Gameplay preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Oyun Tercihleri</Text>

          {/* Auto Mark switch */}
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowLabel}>Otomatik İşaret Koyma</Text>
              <Text style={styles.rowSub}>
                Hayvan konulunca satır/sütun/komşuya otomatik ✕ koy
              </Text>
            </View>
            <Switch
              value={settings.autoMark}
              onValueChange={(val) => updateSettings({ autoMark: val })}
              trackColor={{ false: '#CBD5E0', true: '#48BB78' }}
            />
          </View>

          {/* Sound switch */}
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowLabel}>Ses Efektleri</Text>
              <Text style={styles.rowSub}>Hamle ve kutlama sesleri</Text>
            </View>
            <Switch
              value={settings.sound}
              onValueChange={(val) => updateSettings({ sound: val })}
              trackColor={{ false: '#CBD5E0', true: '#48BB78' }}
            />
          </View>

          {/* Haptics switch */}
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowLabel}>Titreşim (Haptics)</Text>
              <Text style={styles.rowSub}>Dokunuş ve hata geri bildirimi</Text>
            </View>
            <Switch
              value={settings.haptics}
              onValueChange={(val) => updateSettings({ haptics: val })}
              trackColor={{ false: '#CBD5E0', true: '#48BB78' }}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetBtnText}>İlerlemeyi Sıfırla</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  petSettingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  petLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  petEmoji: {
    fontSize: 36,
  },
  petName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3748',
  },
  petSub: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: '#CBD5E0',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rowTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  rowSub: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
    lineHeight: 16,
  },
  resetBtn: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FEB2B2',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E53E3E',
  },
});
