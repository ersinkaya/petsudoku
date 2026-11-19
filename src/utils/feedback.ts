import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { generateWavDataUri } from './audioSynthesizer';

const SAMPLE_RATE = 22050;

// Synthesize sound data URIs once at module load
const SOUND_URIS = {
  // Short pleasant tap (60ms)
  tap: generateWavDataUri(60, SAMPLE_RATE, (t) => {
    const freq = 600 - t * 2000;
    const env = Math.exp(-t * 60);
    return Math.sin(2 * Math.PI * freq * t) * env;
  }),

  // Crisp mark 'X' click (50ms)
  mark: generateWavDataUri(50, SAMPLE_RATE, (t) => {
    const freq = 1200;
    const env = Math.exp(-t * 80);
    return Math.sin(2 * Math.PI * freq * t) * env;
  }),

  // Cheerful animal placement "pop" (100ms)
  animal: generateWavDataUri(100, SAMPLE_RATE, (t) => {
    const freq = 450 + t * 800;
    const env = Math.exp(-t * 30);
    return Math.sin(2 * Math.PI * freq * t) * env;
  }),

  // Sad error buzz / drop (250ms)
  error: generateWavDataUri(250, SAMPLE_RATE, (t) => {
    const freq = 220 - t * 400;
    const env = Math.exp(-t * 12);
    const wobble = Math.sin(2 * Math.PI * 18 * t);
    return Math.sin(2 * Math.PI * freq * t) * env * (1 + 0.3 * wobble);
  }),

  // Soft undo chirp (90ms)
  undo: generateWavDataUri(90, SAMPLE_RATE, (t) => {
    const freq = 800 - t * 3000;
    const env = Math.exp(-t * 35);
    return Math.sin(2 * Math.PI * freq * t) * env;
  }),

  // Sparkly bell hint (180ms)
  hint: generateWavDataUri(180, SAMPLE_RATE, (t) => {
    const freq1 = 880;
    const freq2 = 1320;
    const env = Math.exp(-t * 18);
    return (0.6 * Math.sin(2 * Math.PI * freq1 * t) + 0.4 * Math.sin(2 * Math.PI * freq2 * t)) * env;
  }),

  // Celebration fanfare for winning (450ms)
  win: generateWavDataUri(450, SAMPLE_RATE, (t) => {
    let freq = 523.25; // C5
    if (t > 0.1) freq = 659.25; // E5
    if (t > 0.2) freq = 783.99; // G5
    if (t > 0.3) freq = 1046.5; // C6
    const env = Math.min(1, t * 20) * Math.exp(-(t % 0.1) * 15);
    return Math.sin(2 * Math.PI * freq * t) * env;
  }),
};

// Cached sound objects for zero latency
const soundPool: Partial<Record<keyof typeof SOUND_URIS, Audio.Sound>> = {};

async function getOrLoadSound(type: keyof typeof SOUND_URIS): Promise<Audio.Sound | null> {
  try {
    if (!soundPool[type]) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUND_URIS[type] },
        { shouldPlay: false, volume: 0.8 }
      );
      soundPool[type] = sound;
    }
    return soundPool[type] || null;
  } catch (e) {
    return null;
  }
}

async function playSound(type: keyof typeof SOUND_URIS, soundEnabled: boolean) {
  if (!soundEnabled) return;
  try {
    const sound = await getOrLoadSound(type);
    if (sound) {
      await sound.replayAsync();
    }
  } catch (e) {
    // Ignore audio playback errors silently
  }
}

export const Feedback = {
  // Cell tapped -> Mark placed
  mark(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
    playSound('mark', soundEnabled);
  },

  // Cell tapped -> Animal placed correctly
  correctAnimal(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    playSound('animal', soundEnabled);
  },

  // Cell tapped -> Cell cleared back to empty
  clear(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
    playSound('tap', soundEnabled);
  },

  // Wrong animal placed (Error / Lost heart)
  error(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    playSound('error', soundEnabled);
  },

  // Undo button pressed
  undo(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    playSound('undo', soundEnabled);
  },

  // Hint button pressed
  hint(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    playSound('hint', soundEnabled);
  },

  // Level won
  win(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    playSound('win', soundEnabled);
  },

  // Generic button press
  buttonPress(hapticsEnabled: boolean = true, soundEnabled: boolean = true) {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    playSound('tap', soundEnabled);
  },
};
