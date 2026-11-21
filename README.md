# 🐾 PetSudoku

> **PetSudoku**, klasik $N$-Queens matematik bulmacası ile Sudoku dinamiklerini sevimli evcil hayvanlarla harmanlayan, saf dedüktif mantığa dayalı modern bir mobil oyundur.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2058-black.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.88.1-61DAFB.svg)](https://reactnative.dev/)
[![Tests](https://img.shields.io/badge/Tests-30%2F30%20Passed-brightgreen.svg)]()

---

## 📲 İndirme ve Test Bağlantıları

- 🍏 **iOS (TestFlight):** [https://testflight.apple.com/join/AyhG6xfm](https://testflight.apple.com/join/AyhG6xfm)
- 🤖 **Android (Standalone APK):** [PetSudoku_v1.0.1.apk İndir](https://expo.dev/artifacts/eas/fKywW9KkR9PPKEz377ZlRatprG190ADz3rhEq3OT54U.apk)

---

## 🎮 Oyun Kuralları

Her tahta $N \times N$ ızgara ve $N$ renkli bölgeden oluşur ($N \in [5, 9]$):
1. **Her Satırda** tam 1 hayvan olmalıdır.
2. **Her Sütunda** tam 1 hayvan olmalıdır.
3. **Her Renkli Bölgede** tam 1 hayvan olmalıdır.
4. **8-Yönlü Komşuluk Yasağı:** İki hayvan yatay, dikey veya **çapraz** olarak asla birbirine temas edemez.
5. **3 Can Sistemi:** Hatalı hayvan yerleşimi 1 kalp götürür; `✕` koymak tamamen ücretsizdir.

---

## ✨ Öne Çıkan Özellikler

- **Parmakla Sürükleme (Drag-to-Mark):** Satır veya sütun boyunca parmağınızı kaydırarak saniyeler içinde tüm boş hücreleri `✕` ile işaretleyin veya silin (hayvanları korur, tek tıkla geri alınabilir, titreşimli geri bildirim verir).
- **Kural Tabanlı Dedüktif Mantık Çözücü:** 5 seviyeli dedüktif mantık teknikleri (Simple Elimination, Only in Region, Hidden Single, Naked Pair, Box-Line Reduction). Üretilen her seviyenin tek ve kesin çözümü vardır.
- **4 Adımlı Görsel Eğitim (Tutorial):** Yeni başlayanlar için interaktif rehber.
- **Rozet Vitrini:** 7 özel başarım rozeti (Kusursuz Patiler, Duru Zihin, Hızlı Pati, 3'lü Seri, 10'lu Seri, Tüm Boyutlar Ustası [5x5-9x9], Büyük Koleksiyoncu).
- **Ödül Kutlaması:** Seviye bitiminde interaktif hediye kutusu açma ve maskotun mamayı afiyetle yeme animasyonu.

---

## 🚀 Geliştirici Kılavuzu

### Kurulum
```bash
# Paketleri yükleme
npm install

# Yerel geliştirme sunucusu
npx expo start

# iOS Simülatöründe çalıştırma (Mac)
npx expo start --ios

# Android emülatöründe çalıştırma
npx expo start --android
```

### Testler ve Tip Kontrolü
```bash
# TypeScript kontrolü
npx tsc --noEmit

# Jest birim testleri (29 test)
npm test
```

### EAS Cloud Build
```bash
# Android APK derlemesi:
npx -y eas-cli build --platform android --profile preview

# iOS TestFlight derlemesi ve otomatik teslimat:
npx -y eas-cli build --platform ios --profile production --auto-submit
```

---

Detaylı teknik mimari ve algoritma dokümantasyonu için proje raporuna göz atabilirsiniz.
