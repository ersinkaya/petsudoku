/**
 * Platform-independent 32-bit Seeded RNG (Mulberry32).
 * Operates purely on 32-bit integers using bitwise ops and Math.imul
 * to ensure 100% deterministic results across all JS engines (V8, JSC, Hermes).
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 1;
  }

  /**
   * Return an unsigned 32-bit integer [0, 2^32 - 1].
   */
  public nextInt(): number {
    let z = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return (z ^ (z >>> 14)) >>> 0;
  }

  /**
   * Return an integer in [min, max] inclusive.
   */
  public nextRange(min: number, max: number): number {
    if (min >= max) return min;
    const range = ((max - min + 1) >>> 0);
    return min + ((this.nextInt() % range) >>> 0);
  }

  /**
   * Return a float in [0, 1).
   */
  public nextFloat(): number {
    return (this.nextInt() >>> 0) / 4294967296;
  }

  /**
   * Deterministic Fisher-Yates array shuffle (in-place).
   */
  public shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = (this.nextInt() % (i + 1)) >>> 0;
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  /**
   * Random sample from array.
   */
  public sample<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    const idx = (this.nextInt() % array.length) >>> 0;
    return array[idx];
  }
}
