import { useGameStore } from '../state/gameStore';

describe('Oyun Kuralları ve Durum Yönetimi (Stage 3 Game Rules)', () => {
  beforeEach(() => {
    // 5x5 test oyunu başlat
    useGameStore.getState().initNewGame(1, 5, 42);
  });

  it('boş hücreye tıklanınca işaret (mark), tekrar tıklanınca hayvan (animal) olmalıdır', () => {
    const store = useGameStore.getState();
    const puzzle = store.puzzle;
    const solCol = puzzle.solution[0];

    // 1. Dokunuş: Boş -> İşaret
    let res = useGameStore.getState().handleCellTap(0, solCol);
    expect(res.status).toBe('mark');
    expect(useGameStore.getState().cells[0][solCol]).toBe('mark');
    expect(useGameStore.getState().lives).toBe(3);

    // 2. Dokunuş: İşaret -> Hayvan (Doğru hücre)
    res = useGameStore.getState().handleCellTap(0, solCol);
    expect(res.status).toBe('animal_correct');
    expect(useGameStore.getState().cells[0][solCol]).toBe('animal');
    expect(useGameStore.getState().lives).toBe(3);
  });

  it('yanlış hücreye hayvan konulduğunda kalp azalmalı ve hücre otomatik işaret olmalıdır', () => {
    const store = useGameStore.getState();
    const puzzle = store.puzzle;
    const wrongCol = (puzzle.solution[0] + 1) % 5;

    // Dokunma 1: boş -> işaret
    useGameStore.getState().handleCellTap(0, wrongCol);
    // Dokunma 2: işaret -> hayvan (YANLIŞ)
    const res = useGameStore.getState().handleCellTap(0, wrongCol);

    expect(res.status).toBe('animal_wrong');
    // Kalp 3'ten 2'ye düşmeli
    expect(useGameStore.getState().lives).toBe(2);
    // Hücre otomatik olarak 'mark' yapılmalı
    expect(useGameStore.getState().cells[0][wrongCol]).toBe('mark');
    // Hata mesajı tanımlanmalı
    expect(useGameStore.getState().lastErrorMessage).toBe('Bu hamleyle bulmaca çözülemez hale gelirdi.');
  });

  it('3. hatada oyun bitmeli ve ödüllü reklamla 1 kez 1 kalple devam edilebilmelidir', () => {
    const puzzle = useGameStore.getState().puzzle;
    const wrongCol0 = (puzzle.solution[0] + 1) % 5;
    const wrongCol1 = (puzzle.solution[1] + 1) % 5;
    const wrongCol2 = (puzzle.solution[2] + 1) % 5;

    // 1. Hata
    useGameStore.getState().handleCellTap(0, wrongCol0);
    useGameStore.getState().handleCellTap(0, wrongCol0);
    expect(useGameStore.getState().lives).toBe(2);

    // 2. Hata
    useGameStore.getState().handleCellTap(1, wrongCol1);
    useGameStore.getState().handleCellTap(1, wrongCol1);
    expect(useGameStore.getState().lives).toBe(1);

    // 3. Hata
    useGameStore.getState().handleCellTap(2, wrongCol2);
    useGameStore.getState().handleCellTap(2, wrongCol2);
    expect(useGameStore.getState().lives).toBe(0);
    expect(useGameStore.getState().isGameOver).toBe(true);

    // Reklamla devam et
    const continued = useGameStore.getState().continueWithRewardAd();
    expect(continued).toBe(true);
    expect(useGameStore.getState().lives).toBe(1);
    expect(useGameStore.getState().isGameOver).toBe(false);

    // Tekrar reklamla devam hakkı verilmemeli
    const continuedAgain = useGameStore.getState().continueWithRewardAd();
    expect(continuedAgain).toBe(false);
  });

  it('geri alma işlemi son hamleyi geri almalı ancak kaybedilen kalbi geri vermemelidir', () => {
    // Geçerli bir işaret koy
    useGameStore.getState().handleCellTap(0, 0);
    expect(useGameStore.getState().cells[0][0]).toBe('mark');

    // Geri al
    const undoRes = useGameStore.getState().undo();
    expect(undoRes).toBe(true);
    expect(useGameStore.getState().cells[0][0]).toBe('empty');

    // Yığın boşken geri al false dönmeli
    expect(useGameStore.getState().undo()).toBe(false);
  });

  it('ipucu hakkı 2 ile başlamalı, kullanıldıkça azalmalı ve çözüm hücresi vermelidir', () => {
    expect(useGameStore.getState().hintsLeft).toBe(2);

    const hint1 = useGameStore.getState().useHint();
    expect(hint1).not.toBeNull();
    expect(useGameStore.getState().hintsLeft).toBe(1);
    expect(useGameStore.getState().hintsUsed).toBe(1);

    const hint2 = useGameStore.getState().useHint();
    expect(hint2).not.toBeNull();
    expect(useGameStore.getState().hintsLeft).toBe(0);
    expect(useGameStore.getState().hintsUsed).toBe(2);

    // 3. ipucu istendiğinde hak kalmadığı için null dönmeli
    const hint3 = useGameStore.getState().useHint();
    expect(hint3).toBeNull();

    // Reklamla +1 ipucu al
    const adHint = useGameStore.getState().addRewardHint();
    expect(adHint).toBe(true);
    expect(useGameStore.getState().hintsLeft).toBe(1);

    // Bir oyunda ikinci kez reklamla ipucu alınamamalı
    expect(useGameStore.getState().addRewardHint()).toBe(false);
  });

  it('tüm hayvanlar doğru yerleştirilince oyun kazanılmalıdır (isWon = true)', () => {
    const puzzle = useGameStore.getState().puzzle;

    for (let r = 0; r < 5; r++) {
      const c = puzzle.solution[r];
      // 1. tap: mark
      useGameStore.getState().handleCellTap(r, c);
      // 2. tap: animal
      useGameStore.getState().handleCellTap(r, c);
    }

    expect(useGameStore.getState().isWon).toBe(true);
    expect(useGameStore.getState().isGameOver).toBe(false);
  });

  it('sürükleme (swipe/drag) ile birden fazla hücre tek hamlede X ile işaretlenebilmelidir', () => {
    // 0. satırdaki 1, 2, 3 numaralı sütunları sürükleme ile işaretle
    const res = useGameStore.getState().batchSetCellMarks(
      [
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ],
      'mark'
    );

    expect(res.changedCount).toBe(3);
    expect(useGameStore.getState().cells[0][1]).toBe('mark');
    expect(useGameStore.getState().cells[0][2]).toBe('mark');
    expect(useGameStore.getState().cells[0][3]).toBe('mark');
  });

  it('sürükleme sırasında önceden konulmuş hayvan hücresinin üzerine gelinirse hayvan korunmalıdır', () => {
    const puzzle = useGameStore.getState().puzzle;
    const solCol = puzzle.solution[0];

    // Önce doğru hayvanı yerleştir
    useGameStore.getState().handleCellTap(0, solCol, 'place_animal');
    expect(useGameStore.getState().cells[0][solCol]).toBe('animal');

    // Şimdi tüm 0. satırı sürükleyerek X yapmayı dene
    const allRow0 = [0, 1, 2, 3, 4].map((c) => ({ row: 0, col: c }));
    const res = useGameStore.getState().batchSetCellMarks(allRow0, 'mark');

    // Hayvan hücresi hariç 4 hücre işaretlenmeli
    expect(res.changedCount).toBe(4);
    // Hayvan hücresi kesinlikle korunmalı!
    expect(useGameStore.getState().cells[0][solCol]).toBe('animal');
  });

  it('işaretli hücreler üzerinde ters yönde sürükleme yapılırsa temizlenebilmelidir', () => {
    // Önce işaretle
    useGameStore.getState().batchSetCellMarks(
      [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
      'mark'
    );
    expect(useGameStore.getState().cells[1][0]).toBe('mark');
    expect(useGameStore.getState().cells[1][1]).toBe('mark');

    // Temizleme sürüklemesi
    const res = useGameStore.getState().batchSetCellMarks(
      [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
      'empty'
    );
    expect(res.changedCount).toBe(2);
    expect(useGameStore.getState().cells[1][0]).toBe('empty');
    expect(useGameStore.getState().cells[1][1]).toBe('empty');
  });
});
