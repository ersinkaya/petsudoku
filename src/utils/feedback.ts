import * as Haptics from 'expo-haptics';

// Safe dynamic require so Expo Go never throws a blue screen if native audio is missing
let AudioModule: any = null;
try {
  AudioModule = require('expo-audio');
} catch {
  AudioModule = null;
}

export const Feedback = {
  // Cell tapped -> Mark placed
  mark(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.selectionAsync().catch(() => {});
      } catch {}
    }
  },

  // Cell tapped -> Animal placed correctly
  correctAnimal(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}
    }
  },

  // Cell tapped -> Cell cleared back to empty
  clear(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.selectionAsync().catch(() => {});
      } catch {}
    }
  },

  // Wrong animal placed (Error / Lost heart)
  error(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } catch {}
    }
  },

  // Undo button pressed
  undo(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {}
    }
  },

  // Hint button pressed
  hint(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}
    }
  },

  // Level won
  win(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}
    }
  },

  // Generic button press
  buttonPress(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {}
    }
  },
};
