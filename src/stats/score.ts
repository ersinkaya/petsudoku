export interface ScoreParams {
  size: number;
  seconds: number;
  heartsLeft: number;
  hintsUsed: number;
  isWon: boolean;
}

export function calculateScore(params: ScoreParams): number {
  if (!params.isWon) {
    return 0;
  }

  // 1. Taban puan: N * 100
  const baseScore = params.size * 100;

  // 2. Süre bonusu: max(0, N * 60 - saniye)
  const timeBonus = Math.max(0, params.size * 60 - params.seconds);

  // 3. Kalp bonusu: kalan her kalp için 50 puan
  const heartBonus = Math.max(0, params.heartsLeft) * 50;

  // 4. İpucu cezası: kullanılan her ipucu için -40 puan
  const hintPenalty = Math.max(0, params.hintsUsed) * 40;

  const totalScore = baseScore + timeBonus + heartBonus - hintPenalty;
  return Math.max(0, totalScore);
}
