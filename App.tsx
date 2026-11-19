import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PetSelectScreen } from './src/screens/PetSelectScreen';
import { RecordsScreen } from './src/screens/RecordsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { useProfileStore } from './src/state/profileStore';

type Screen = 'home' | 'game' | 'records' | 'collection' | 'settings' | 'change_pet';

export default function App() {
  const pet = useProfileStore((state) => state.pet);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // If no pet selected yet, force onboarding Pet Selection
  if (!pet) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <PetSelectScreen onSelectComplete={() => setCurrentScreen('home')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {currentScreen === 'home' && (
        <HomeScreen
          onPlay={() => setCurrentScreen('game')}
          onOpenRecords={() => setCurrentScreen('records')}
          onOpenCollection={() => setCurrentScreen('collection')}
          onOpenSettings={() => setCurrentScreen('settings')}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          onBackToHome={() => setCurrentScreen('home')}
          onOpenSettings={() => setCurrentScreen('settings')}
        />
      )}

      {currentScreen === 'records' && (
        <RecordsScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'collection' && (
        <CollectionScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('home')}
          onChangePet={() => setCurrentScreen('change_pet')}
        />
      )}

      {currentScreen === 'change_pet' && (
        <PetSelectScreen
          isSettingsMode
          onSelectComplete={() => setCurrentScreen('settings')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  },
});
