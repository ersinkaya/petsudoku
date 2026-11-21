import { getPetProgression, PET_TIERS } from '../engine/petProgression';

describe('Pet Progression System', () => {
  test('starts at Level 1 (Yavru Dost) with 0 treats', () => {
    const info = getPetProgression(0);
    expect(info.level).toBe(1);
    expect(info.titleTr).toBe('Yavru Dost');
    expect(info.minTreats).toBe(0);
    expect(info.nextLevelTreats).toBe(10);
    expect(info.treatsRemaining).toBe(10);
    expect(info.progress).toBe(0);
    expect(info.isMaxLevel).toBe(false);
  });

  test('calculates correct progress within Level 1', () => {
    const info = getPetProgression(5);
    expect(info.level).toBe(1);
    expect(info.treatsRemaining).toBe(5);
    expect(info.progress).toBe(0.5);
    expect(info.isMaxLevel).toBe(false);
  });

  test('promotes to Level 2 (Neşeli Yoldaş) at 10 treats', () => {
    const info = getPetProgression(10);
    expect(info.level).toBe(2);
    expect(info.titleTr).toBe('Neşeli Yoldaş');
    expect(info.minTreats).toBe(10);
    expect(info.nextLevelTreats).toBe(25);
    expect(info.treatsRemaining).toBe(15);
    expect(info.progress).toBe(0);
    expect(info.isMaxLevel).toBe(false);
  });

  test('calculates progress within Level 2', () => {
    // Range 10 to 25 is 15 treats. At 16 treats: gained 6 / 15 = 0.4
    const info = getPetProgression(16);
    expect(info.level).toBe(2);
    expect(info.treatsRemaining).toBe(9);
    expect(info.progress).toBeCloseTo(0.4, 2);
  });

  test('promotes to Level 3 (Usta Pati) at 25 treats', () => {
    const info = getPetProgression(25);
    expect(info.level).toBe(3);
    expect(info.titleTr).toBe('Usta Pati');
    expect(info.minTreats).toBe(25);
    expect(info.nextLevelTreats).toBe(50);
    expect(info.treatsRemaining).toBe(25);
    expect(info.progress).toBe(0);
  });

  test('promotes to Level 4 (Efsanevi Yoldaş) at 50 treats and marks max level', () => {
    const info = getPetProgression(50);
    expect(info.level).toBe(4);
    expect(info.titleTr).toBe('Efsanevi Yoldaş');
    expect(info.minTreats).toBe(50);
    expect(info.nextLevelTreats).toBeNull();
    expect(info.treatsRemaining).toBe(0);
    expect(info.progress).toBe(1);
    expect(info.isMaxLevel).toBe(true);
  });

  test('handles large treat counts gracefully beyond max level', () => {
    const info = getPetProgression(250);
    expect(info.level).toBe(4);
    expect(info.isMaxLevel).toBe(true);
    expect(info.progress).toBe(1);
    expect(info.treatsRemaining).toBe(0);
  });

  test('handles negative or invalid treat counts gracefully', () => {
    const info = getPetProgression(-5 as any);
    expect(info.level).toBe(1);
    expect(info.currentTreats).toBe(0);
    expect(info.progress).toBe(0);
  });
});
