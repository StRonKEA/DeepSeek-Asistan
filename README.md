# 🔄 DeepSeek Asistan | Assistant

![Tampermonkey](https://img.shields.io/badge/Tampermonkey-%23F5C400.svg?style=for-the-badge&logo=Tampermonkey&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![DeepSeek](https://img.shields.io/badge/DeepSeek-1E293B?style=for-the-badge&logo=ai&logoColor=white)
![Version](https://img.shields.io/badge/version-1.5-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

DeepSeek platformu için geliştirilmiş, otomatik yeniden deneme ve devam etme özelliklerine sahip kullanışlı bir tarayıcı eklentisi.

A useful browser extension for the DeepSeek platform with automatic retry and continue features.

---

## 🌟 Özellikler | Features

### 🔄 Otomatik İşlemler | Automatic Operations
- **🔄 Otomatik Yeniden Deneme**: Sunucu meşgul hatası aldığınızda otomatik olarak yeniden dener
- **⏩ Otomatik Devam Et**: Devam et butonunu otomatik olarak tıklar
- **🔍 Akıllı Tarama**: Manuel tarama ile sayfadaki hataları ve butonları kontrol eder

### 📊 İstatistik ve Takip | Statistics & Tracking
- **📈 İstatistik Takibi**: Yeniden deneme ve devam etme sayılarını takip eder
- **📝 Gerçek Zamanlı Bildirimler**: Son işlemleri gerçek zamanlı olarak gösterir
- **🔄 İstatistik Sıfırlama**: Tüm istatistikleri tek tıklamayla sıfırlama

### 🎨 Kullanıcı Arayüzü | User Interface
- **✨ Modern Arayüz**: Glassmorphism tasarımı ile modern ve şık arayüz
- **📌 Sürükle ve Bırak**: Paneli ekranın istediğiniz yerine taşıyabilirsiniz
- **↕️ Küçültme Özelliği**: Paneli küçülterek alandan tasarruf edebilirsiniz
- **🌐 Çoklu Dil Desteği**: Türkçe ve İngilizce dil seçenekleri

### ⚙️ Teknik Özellikler | Technical Specifications
- **🔢 Maksimum Yeniden Deneme**: 5 | **Max Retries**: 5
- **⏱️ Yeniden Deneme Gecikmesi**: 2000ms | **Retry Delay**: 2000ms
- **🔄 Kontrol Aralığı**: 3000ms | **Check Interval**: 3000ms

---

## 🚀 Kurulum | Installation

### Gereksinimler | Requirements
- [Tampermonkey](https://www.tampermonkey.net/) veya benzeri bir userscript eklentisi

### Kurulum Adımları | Installation Steps
1. Tarayıcınıza Tampermonkey eklentisini kurun
2. Yeni script oluştur butonuna tıklayın
3. Aşağıdaki kodu tamamen kopyalayıp yapıştırın
4. Scripti kaydedin ve DeepSeek sayfasını yenileyin

*Install Tampermonkey extension, create a new script, paste the provided code, save and refresh DeepSeek page.*

---

## 🎮 Kullanım | How to Use

1. **DeepSeek sohbet sayfasını açın** | *Open DeepSeek chat page*
2. **Sağ üstte beliren DeepSeek Asistan panelini göreceksiniz** | *You'll see the panel at top right*
3. **▶ Başlat butonuna tıklayarak** otomatik izlemeyi etkinleştirin | *Click **▶ Start** to enable monitoring*
4. **🔍 Tara butonu ile** manuel olarak sayfayı tarayabilirsiniz | *Use **🔍 Scan** for manual scanning*
5. Panel dilini değiştirmek için **TR/EN butonunu** kullanın | *Use **TR/EN** button to change language*
6. Paneli taşımak için **⤴ Sürükle butonunu** kullanın | *Use **⤴ Drag** to move the panel*

---

## 📖 Kullanım Kılavuzu | User Guide

### Ana Kontroller | Main Controls
| Buton | Türkçe | English | Açıklama |
|-------|--------|---------|----------|
| ▶ | Başlat | Start | Otomatik izlemeyi başlatır |
| ⏹️ | Durdur | Stop | Otomatik izlemeyi durdurur |
| 🔍 | Tara | Scan | Manuel tarama yapar |
| ⏹️ | Durdur | Stop | Taramayı durdurur |
| 🔄 | Sıfırla | Reset | İstatistikleri sıfırlar |

### Panel Özellikleri | Panel Features
- **⤴ Sürükle**: Paneli istediğiniz yere taşıyın
- **−/+**: Paneli küçültün/büyütün
- **TR/EN**: Dil seçenekleri arasında geçiş yapın

### İstatistikler | Statistics
- **🔄 Yeniden Dene**: Toplam yeniden deneme sayısı
- **⏩ Devam Et**: Toplam devam etme sayısı
- **📋 Son İşlem**: En son yapılan işlem

---

## 🔧 Teknik Detaylar | Technical Details

### Desteklenen Siteler | Supported Sites
https://chat.deepseek.com/*
https://.deepseek.com/


### Tarayıcı Uyumluluğu | Browser Compatibility
- **Tampermonkey** (Chrome, Edge, Firefox, Safari)
- **Greasemonkey** (Firefox)
- **Violentmonkey** (Tüm major tarayıcılar | All major browsers)

### Kod Yapısı | Code Structure
```javascript
// Ana bileşenler | Main components
- Panel oluşturma ve yönetimi | Panel creation and management
- Otomatik tarama ve yeniden deneme | Automatic scanning and retry
- Manuel kontroller ve istatistikler | Manual controls and statistics
- Çoklu dil desteği | Multi-language support
- Sürükle-bırak özelliği | Drag and drop functionality

