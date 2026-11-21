import {
  clearStoredAnalyticsEvents,
  getCurrentSessionId,
  getStoredAnalyticsEvents,
  trackEvent,
} from '../services/analytics';

describe('Analytics Infrastructure', () => {
  beforeEach(async () => {
    await clearStoredAnalyticsEvents();
  });

  test('creates a valid session id on app startup', () => {
    const sessionId = getCurrentSessionId();
    expect(sessionId).toBeDefined();
    expect(sessionId.startsWith('sess_')).toBe(true);
  });

  test('tracks event with correct payload, timestamp, and session ID', async () => {
    const event = await trackEvent('game_started', {
      level: 1,
      size: 5,
      difficulty: 'easy',
      isDaily: false,
    });

    expect(event.name).toBe('game_started');
    expect(event.params.level).toBe(1);
    expect(event.params.size).toBe(5);
    expect(event.params.difficulty).toBe('easy');
    expect(event.timestamp).toBeGreaterThan(0);
    expect(event.sessionId).toBe(getCurrentSessionId());
  });

  test('buffers and retrieves multiple events in sequence', async () => {
    await trackEvent('app_open', { timestamp: Date.now() });
    await trackEvent('hint_used', { hintsRemaining: 1, hintsUsed: 1 });
    await trackEvent('game_completed', { score: 850, seconds: 40 });

    const stored = await getStoredAnalyticsEvents();
    expect(stored.length).toBe(3);
    expect(stored[0].name).toBe('app_open');
    expect(stored[1].name).toBe('hint_used');
    expect(stored[2].name).toBe('game_completed');
  });

  test('clears stored events on demand', async () => {
    await trackEvent('tutorial_completed', { steps: 4 });
    let stored = await getStoredAnalyticsEvents();
    expect(stored.length).toBe(1);

    await clearStoredAnalyticsEvents();
    stored = await getStoredAnalyticsEvents();
    expect(stored.length).toBe(0);
  });
});
