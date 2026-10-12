# 👾 Snack Goblin (Store Edition)

A high-polish, chaotic arcade mobile game built for **iOS (App Store)**, **Android (Google Play Store)**, and **Web (GitHub Pages / PWA)**.

Munch delicious junk food, dodge healthy veggies, build combo streaks, trigger Fever Mode, collect Snack Coins, and unlock awesome Goblin skins!

---

## 🌟 Key Features & Improvements

### 🎮 Gameplay & Mechanics
- **Delta-Time Physics Engine:** Frame-rate independent physics ensuring identical speed on 60Hz, 90Hz, and 120Hz ProMotion screens.
- **Expressive Goblin Character:** Dynamic canvas rendering with pointed goblin ears, blinking eyes that track falling food, mouth opening on snack proximity, and chewing squash-and-stretch animations.
- **🌶️ FEVER MODE (Goblin Rage):** Fill the Munch Meter or catch a Golden Taco to grow giant, become invincible, and devour vegetables for **+50 bonus points** each!
- **Power-Up Arsenal:**
  - 🛡️ **Shield:** Absorbs one vegetable hit safely.
  - ⭐ **2× Score Multiplier:** Doubles all points for 6 seconds.
  - 🧲 **Snack Magnet:** Magnetically attracts all nearby snacks directly into the goblin's mouth.
  - ❄️ **Veggie Freeze:** Freezes falling veggies in ice cubes, slowing them down by 75%.
  - 🌮 **Golden Taco:** Instantly ignites Fever Mode!
  - 🪙 **Snack Coins:** In-game currency saved persistently across sessions.
- **👕 Goblin Wardrobe (Skins Shop):**
  - **Munchy Green** (Classic joyful goblin)
  - **King Gobble** (Crown + 10% coin bonus perk)
  - **Chef Chomper** (Toque blanche chef hat + 20% wider mouth perk)
  - **Ninja Muncher** (Stealth mask & smoke dash trail)
  - **Cyber G-3000** (Neon visor & spark trail)
  - **Count Snackula** (Vampire cape + longer Fever Mode perk)
  - **Golden God Goblin** (Pure shimmering gold aura & star particles)
- **🏅 Achievements & Badges:** 8 persistent in-game quests with celebratory toasts and audio chimes.
- **⏸️ Pause & Interruption Handling:** Full pause modal; automatically pauses if phone screen locks or app is minimized.
- **📤 Native Share:** Web Share API & Capacitor Share integration to brag high scores with friends.

### 🎵 100% Procedural Audio Engine (Web Audio API)
- Zero external MP3/WAV files — works instantly offline with zero latency or CORS issues.
- **Arcade BGM:** Upbeat looping retro chiptune arpeggiator and bassline.
- **Dynamic SFX:** Crispy noise-filtered munch bites, coin chimes, rising combo scales, power-up fanfares, and defeat melodies.
- Independent **SFX**, **Music**, and **Haptics** toggles in the Settings modal.

### 📱 Mobile UI / UX & Store Readiness
- **Glassmorphism & Safe Areas:** Full notch and dynamic island support (`viewport-fit=cover`, `env(safe-area-inset-*)`).
- **PWA Ready:** `manifest.json`, high-res 512x512 app icons, standalone portrait display.
- **Legal Compliance:** In-app Privacy Policy modal complying with Apple and Google Play store requirements.
- **Resilient Global Leaderboard:** Firebase Firestore integration with seamless offline local fallback.

---

## 🛠️ Project Structure

```
snack-goblin/
├── android/                 # Native Android Studio project (Google Play)
├── ios/                     # Native Xcode project (Apple App Store)
├── docs/                    # Web assets & GitHub Pages build root
│   ├── assets/
│   │   ├── icon.png         # 512x512 App Icon
│   │   └── banner.png       # 16:9 Promotional Store Banner
│   ├── index.html           # Store-grade game markup & modals
│   ├── style.css            # Responsive arcade design system
│   ├── game.js              # Core game loop, synth audio, wardrobe & logic
│   └── manifest.json        # PWA configuration
├── capacitor.config.json    # Capacitor native app configuration
└── package.json             # NPM dependencies & scripts
```

---

## 🚀 How to Run & Build

### 1. Web / Local Testing
```bash
# Serve locally
npx -y serve docs -l 3000
```
Open `http://localhost:3000` in any browser or mobile device.

### 2. Syncing Native Mobile Assets
Whenever you make changes in `docs/`:
```bash
npm run sync
```

---

## 📱 Publishing to Mobile Stores

### 🍏 Apple App Store (iOS)
1. Ensure CocoaPods and Xcode are installed on macOS.
2. Open the project in Xcode:
   ```bash
   npm run ios
   ```
3. In Xcode:
   - Select your Team in **Signing & Capabilities**.
   - Set the Bundle Identifier (`com.sadiarumpa.snackgoblin`).
   - Archive the build: **Product > Archive**.
   - Distribute to **App Store Connect / TestFlight**.

### 🤖 Google Play Store (Android)
1. Open the project in Android Studio:
   ```bash
   npm run android
   ```
2. In Android Studio:
   - Select **Build > Generate Signed Bundle / APK**.
   - Choose **Android App Bundle (.aab)**.
   - Sign with your release keystore.
   - Upload the resulting `.aab` file to **Google Play Console**.
