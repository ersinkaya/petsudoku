import AsyncStorage from '@react-native-async-storage/async-storage';

export type AnalyticsEventName =
  | 'app_open'
  | 'tutorial_completed'
  | 'game_started'
  | 'game_completed'
  | 'game_over'
  | 'hint_used'
  | 'undo_used'
  | 'mistake_made'
  | 'reward_ad_started'
  | 'reward_ad_completed'
  | 'interstitial_shown'
  | 'difficulty_selected'
  | 'pet_changed'
  | 'achievement_unlocked'
  | 'daily_puzzle_started'
  | 'daily_puzzle_completed';

export interface AnalyticsEvent<T = Record<string, any>> {
  id: string;
  name: AnalyticsEventName;
  params: T;
  timestamp: number;
  sessionId: string;
}

const ANALYTICS_STORAGE_KEY = '@petsudoku_analytics_events_v1';
const MAX_STORED_EVENTS = 200;

// Generate persistent session ID for the app lifecycle
const currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

let memoryEventQueue: AnalyticsEvent[] = [];

/**
 * Logs an analytics event, buffers it in memory, and persists it to AsyncStorage.
 * Prepared for pluggable forwarding to Firebase Analytics, Mixpanel, or custom backends.
 */
export async function trackEvent<T extends Record<string, any>>(
  name: AnalyticsEventName,
  params: T = {} as T
): Promise<AnalyticsEvent<T>> {
  const event: AnalyticsEvent<T> = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    params,
    timestamp: Date.now(),
    sessionId: currentSessionId,
  };

  memoryEventQueue.push(event);
  if (memoryEventQueue.length > MAX_STORED_EVENTS) {
    memoryEventQueue = memoryEventQueue.slice(-MAX_STORED_EVENTS);
  }

  // Debug log in dev mode
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // console.log(`[Analytics] 📊 ${name}:`, params);
  }

  try {
    if (AsyncStorage) {
      await AsyncStorage.setItem(
        ANALYTICS_STORAGE_KEY,
        JSON.stringify(memoryEventQueue)
      );
    }
  } catch (err) {
    // Graceful fallback: memory buffer continues uninterrupted
  }

  return event;
}

/**
 * Retrieves all stored analytics events for inspection or bulk upload.
 */
export async function getStoredAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    if (AsyncStorage) {
      const data = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          memoryEventQueue = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    // Ignore read errors
  }
  return [...memoryEventQueue];
}

/**
 * Clears stored events after successful batch dispatch or for testing.
 */
export async function clearStoredAnalyticsEvents(): Promise<void> {
  memoryEventQueue = [];
  try {
    if (AsyncStorage) {
      await AsyncStorage.removeItem(ANALYTICS_STORAGE_KEY);
    }
  } catch (err) {
    // Ignore error
  }
}

export function getCurrentSessionId(): string {
  return currentSessionId;
}
