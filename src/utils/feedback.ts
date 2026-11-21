// Audio build: neural combo v2
import * as Haptics from 'expo-haptics';

// Sound asset mapping
const SOUNDS = {
  mark: require('../../assets/sounds/mark.wav'),
  clear: require('../../assets/sounds/clear.wav'),
  animal: require('../../assets/sounds/animal.wav'),
  error: require('../../assets/sounds/error.wav'),
  undo: require('../../assets/sounds/undo.wav'),
  hint: require('../../assets/sounds/hint.wav'),
  win: require('../../assets/sounds/win.wav'),
  click: require('../../assets/sounds/click.wav'),
  deal: require('../../assets/sounds/deal.wav'),
  great: require('../../assets/sounds/great.wav'),
  amazing: require('../../assets/sounds/amazing.wav'),
  unbelievable: require('../../assets/sounds/unbelievable.wav'),
};

type SoundKey = keyof typeof SOUNDS;

// Safe dynamic require so Expo Go never throws a blue screen if native audio is missing
let AudioModule: any = null;
try {
  AudioModule = require('expo-audio');
} catch {
  AudioModule = null;
}

let isAudioConfigured = false;
function ensureAudioMode() {
  if (isAudioConfigured || !AudioModule?.setAudioModeAsync) return;
  try {
    AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
    }).catch(() => {});
    isAudioConfigured = true;
  } catch {}
}

// Pool of players to allow fast overlapping sound triggers
const playerPools: Partial<Record<SoundKey, any[]>> = {};
const poolIndices: Partial<Record<SoundKey, number>> = {};

function playSound(key: SoundKey, poolSize: number = 1) {
  if (!AudioModule?.createAudioPlayer) return;

  ensureAudioMode();

  try {
    if (!playerPools[key]) {
      playerPools[key] = [];
      poolIndices[key] = 0;
      for (let i = 0; i < poolSize; i++) {
        try {
          const player = AudioModule.createAudioPlayer(SOUNDS[key]);
          if (player) {
            playerPools[key]!.push(player);
          }
        } catch {}
      }
    }

    const pool = playerPools[key];
    if (!pool || pool.length === 0) return;

    const idx = (poolIndices[key] ?? 0) % pool.length;
    poolIndices[key] = (idx + 1) % pool.length;

    const player = pool[idx];
    if (player) {
      try {
        const seekRes = player.seekTo(0);
        if (seekRes && typeof seekRes.then === 'function') {
          seekRes.then(() => {
            player.play();
          }).catch(() => {
            player.play();
          });
        } else {
          player.play();
        }
      } catch {
        try {
          player.play();
        } catch {}
      }
    }
  } catch {}
}

export const Feedback = {
  // Cell tapped -> Mark placed (e.g. ✕)
  mark(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.selectionAsync().catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('mark', 3);
    }
  },

  // Cell tapped -> Animal placed correctly (Pet queen placed)
  correctAnimal(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('animal', 2);
    }
  },

  // Cell tapped -> Cell cleared back to empty
  clear(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.selectionAsync().catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('clear', 2);
    }
  },

  // Wrong animal placed (Error / Lost heart)
  error(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('error', 1);
    }
  },

  // Undo button pressed
  undo(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('undo', 1);
    }
  },

  // Hint button pressed
  hint(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('hint', 1);
    }
  },

  // Level won
  win(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('win', 1);
    }
  },

  // Generic button press
  buttonPress(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('click', 1);
    }
  },

  // Initial grid deal / card dealing sound effect when puzzle opens
  dealCards(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }, 110);
      } catch {}
    }
    if (soundEnabled) {
      playSound('deal', 2);
    }
  },

  // Combo announcement sounds (2x Great, 3x Amazing, 4x+ Unbelievable)
  comboGreat(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('great', 1);
    }
  },

  comboAmazing(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('amazing', 1);
    }
  },

  comboUnbelievable(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}
    }
    if (soundEnabled) {
      playSound('unbelievable', 1);
    }
  },
};
