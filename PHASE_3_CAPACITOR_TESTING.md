# Phase 3: Capacitor Integration Testing Guide

## Prerequisites

Before testing on native devices, ensure you have:

### For iOS Testing:
- **Mac computer** with macOS 12.0 or later
- **Xcode 14.0+** installed from the Mac App Store
- **iOS Simulator** (included with Xcode)
- **Apple Developer Account** (free tier works for simulator testing)

### For Android Testing:
- **Android Studio** installed (any OS: Windows, Mac, Linux)
- **Android SDK** with API Level 33+ installed
- **Android Emulator** configured in Android Studio
- **Java Development Kit (JDK) 17** installed

---

## Setup Instructions

### Step 1: Transfer Project to GitHub

1. In Lovable, click the **GitHub button** (top right)
2. Follow prompts to connect your GitHub account
3. Click **"Export to GitHub"** to create a new repository
4. Once exported, **clone the repository** to your local machine:
   ```bash
   git clone <your-repo-url>
   cd kahu
   ```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Add Native Platforms

#### For iOS:
```bash
npx cap add ios
npx cap update ios
```

#### For Android:
```bash
npx cap add android
npx cap update android
```

### Step 4: Build the Web App

```bash
npm run build
```

### Step 5: Sync Capacitor

This copies your built web app into the native projects:

```bash
npx cap sync
```

**Important**: Run `npx cap sync` every time you:
- Pull code changes from GitHub
- Update Capacitor plugins
- Rebuild the web app

---

## Testing on iOS Simulator

### Open Xcode:
```bash
npx cap open ios
```

### In Xcode:
1. Select a simulator from the device dropdown (top toolbar)
   - Recommended: **iPhone 15 Pro** or **iPhone 16 Pro**
2. Click the **Play button** (▶) or press `Cmd + R`
3. Wait for the app to build and launch

### What to Test:
- ✅ **Safe area insets** detect notch/Dynamic Island correctly
- ✅ **Status bar style** changes (light/dark text)
- ✅ **Status bar visibility** toggle works
- ✅ **HeaderBar** respects safe area padding
- ✅ **DogDropdown** and buttons have proper touch targets (44x44pt)
- ✅ **Scroll transitions** update status bar style smoothly
- ✅ No content renders **behind** the notch/island (except backgrounds)

### Common iOS Issues:
- **White screen on launch**: Check console logs in Xcode (`Cmd + Shift + Y`)
- **Status bar not updating**: Verify `Info.plist` has `UIViewControllerBasedStatusBarAppearance = NO`
- **Safe area wrong**: Check `viewport-fit=cover` in `index.html`

---

## Testing on Android Emulator

### Open Android Studio:
```bash
npx cap open android
```

### In Android Studio:
1. Wait for Gradle sync to complete
2. Click **Device Manager** (sidebar) and create/start an emulator
   - Recommended: **Pixel 8 Pro** or **Pixel 9 Pro**
3. Click the **Run button** (▶) or press `Shift + F10`
4. Wait for the app to build and launch

### What to Test:
- ✅ **Safe area insets** work correctly
- ✅ **Status bar control** (style changes)
- ✅ **HeaderBar** layout on different screen sizes
- ✅ **Touch targets** are adequate (48dp minimum on Android)
- ✅ **Navigation** and gestures work smoothly
- ✅ **Bottom navigation** doesn't overlap system nav bar

### Common Android Issues:
- **Build errors**: Check Android SDK version matches requirements
- **Blank screen**: Open Chrome DevTools: `chrome://inspect`
- **Status bar issues**: Android status bar behavior differs from iOS

---

## Testing Dynamic Status Bar Changes

### Test Scenario: Hero Image Screens

1. Navigate to a screen with a hero image (e.g., Training detail pages)
2. **Before scroll**: Status bar should use **light text** (visible over dark image)
3. **After scroll** (past ~200px): Status bar should switch to **dark text** (visible over white background)
4. Verify **no layout shift** occurs during transition
5. Test on both **iOS and Android**

### Debugging Status Bar:
- Add console logs in `StatusBarController.tsx`
- Check Capacitor console output in Xcode/Android Studio
- Verify CSS custom properties are set correctly

---

## Performance Testing

Test on lower-end devices or older simulators:
- **iOS**: iPhone SE (3rd Gen) simulator
- **Android**: Pixel 4a or older device

Monitor:
- **App launch time** (should be < 3 seconds)
- **Scroll performance** (should be 60fps)
- **Memory usage** (check Xcode Instruments / Android Profiler)
- **Battery drain** (Android Studio Energy Profiler)

---

## Running on Physical Devices

### iOS Physical Device:
1. Connect iPhone via USB
2. Trust the computer on the device
3. In Xcode, select your device from dropdown
4. Click Run (▶)
5. First time: Go to **Settings > General > Device Management** and trust your developer certificate

### Android Physical Device:
1. Enable **Developer Options** on device
2. Enable **USB Debugging**
3. Connect via USB
4. Allow USB debugging when prompted
5. In Android Studio, select your device and click Run

---

## Troubleshooting

### iOS Build Fails:
```bash
# Clean and rebuild
cd ios/App
rm -rf Pods/ Podfile.lock
pod install
cd ../..
npx cap sync ios
```

### Android Build Fails:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Status Bar Not Working:
- Verify `@capacitor/status-bar` is installed: `npm list @capacitor/status-bar`
- Check native permissions in `Info.plist` (iOS) or `AndroidManifest.xml`
- Restart app after changes

### Safe Area Issues:
- Check `index.html` has: `<meta name="viewport" content="viewport-fit=cover">`
- Verify CSS variables in `index.css` use `env(safe-area-inset-*)`
- Test on real device, not just simulator

---

## Next Steps After Testing

Once you've verified everything works on simulators/devices:

1. **Fix any issues** found during testing
2. **Commit changes** to GitHub
3. **Sync with Lovable**: Pull changes back into Lovable
4. Continue with **Phase 4** (Visual & UX improvements)

---

## Useful Commands Reference

```bash
# Build web app
npm run build

# Sync all changes to native platforms
npx cap sync

# Sync specific platform
npx cap sync ios
npx cap sync android

# Open in IDE
npx cap open ios
npx cap open android

# Run on connected device
npx cap run ios
npx cap run android

# Update Capacitor dependencies
npx cap update

# Check Capacitor doctor (diagnose issues)
npx cap doctor
```

---

## Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Status Bar Plugin Docs](https://capacitorjs.com/docs/apis/status-bar)
- [Capacitor Troubleshooting](https://capacitorjs.com/docs/basics/troubleshooting)
