# Kahu Device Preview System

## Overview
The Device Preview system allows desktop users to view and test the Kahu app inside realistic phone frames with device switching capabilities, while automatically hiding all preview chrome on mobile devices.

## Architecture

### Components
- **DevicePreviewProvider** (`DevicePreviewProvider.tsx`): Context provider managing preview state (selected device, zoom, orientation, frame visibility)
- **ResponsiveShell** (`ResponsiveShell.tsx`): Top-level wrapper deciding frame vs full-screen rendering based on device detection
- **DeviceFrame** (`DeviceFrame.tsx`): Renders phone bezel with notch/hole-punch overlays
- **DeviceToolbar** (`DeviceToolbar.tsx`): Control panel for device/zoom selection
- **usePreviewShortcuts** (`usePreviewShortcuts.ts`): Keyboard shortcut handling

### Mobile Detection
Combines multiple heuristics to reliably detect mobile devices:
1. User-Agent string (`/Mobi|Android|iPhone|iPad|iPod/i`)
2. Pointer type (`window.matchMedia('(pointer: coarse)')`)
3. Screen width (`<= 480px`)
4. Touch support (`'ontouchstart' in window`)
5. Hostname-based override for `kahu.lovable.app`

### State Persistence
Desktop state persists to `localStorage` key `kahu.preview.v1`:
```json
{
  "selectedDeviceId": "iphone-15-pro",
  "zoom": 0.9,
  "orientation": "portrait"
}
```

## Usage

### Desktop Users
1. Open the app in a desktop browser
2. Use toolbar at the top to:
   - Select device from dropdown (iPhone 15 Pro, Pixel 8 Pro, etc.)
   - Adjust zoom level (Fit, 100%, 90%, 80%, 75%, 50%)
   - Toggle orientation (portrait ↔ landscape)
   - Toggle frame visibility (show/hide bezel)
3. Press **⌘/Ctrl+Shift+D** to toggle frame visibility via keyboard

### Mobile Users
Visit the app on a mobile device → automatically runs full-screen with no preview chrome.

## Device Presets

Current devices defined in `DevicePresets.ts`:
- **iPhone 15 Pro** (393×852, Dynamic Island)
- **iPhone 14/15 Plus** (428×926, Standard Notch)
- **iPhone SE (3rd Gen)** (375×667, No Notch)
- **Pixel 8 Pro** (412×915, Hole Punch)
- **Galaxy S24** (360×780, Hole Punch)
- **Responsive** (Fit Container)

### Adding New Devices
Edit `src/preview/DevicePresets.ts`:
```typescript
{
  id: 'new-device',
  name: 'New Device Name',
  width: 390,        // CSS pixels (portrait)
  height: 844,       // CSS pixels (portrait)
  cornerRadius: 40,  // Border radius in px
  notch: 'hole-punch', // 'none' | 'standard' | 'dynamic-island' | 'hole-punch'
  statusBarHeight: 24  // Status bar height in px
}
```

## Keyboard Shortcuts
- **⌘/Ctrl + Shift + D**: Toggle frame visibility (desktop only)

## Technical Details

### Zoom Calculation
The "Fit" zoom option automatically calculates the optimal scale to fit the selected device within the available viewport:
```typescript
const toolbarHeight = 120;
const availableWidth = window.innerWidth - 80;
const availableHeight = window.innerHeight - toolbarHeight - 40;

const widthScale = availableWidth / deviceWidth;
const heightScale = availableHeight / deviceHeight;

return Math.min(widthScale, heightScale, 1); // Never zoom in, only out
```

### Mobile Detection Logic
The system uses a comprehensive detection strategy that forces full-screen mode when:
- Device hostname is `kahu.lovable.app` AND user agent contains mobile identifiers
- User agent contains mobile/tablet identifiers OR
- Touch support is present AND (coarse pointer OR narrow screen)

### Analytics Exclusion
Preview toolbar is marked with `data-preview-ui="true"` to allow analytics filtering:
```typescript
if (element.closest('[data-preview-ui]')) return; // Ignore preview interactions
```

## Integration

The preview system wraps the entire app in `src/main.tsx`:
```typescript
<DevicePreviewProvider>
  <ResponsiveShell>
    <App />
  </ResponsiveShell>
</DevicePreviewProvider>
```

On mobile devices, `ResponsiveShell` renders only the app directly.
On desktop, it renders the toolbar and device frame around the app.

## Styling

Preview-specific styles are defined in `src/index.css`:
- `.mobile-shell`: Full-screen container for mobile
- `.desktop-preview-shell`: Preview mode container for desktop
- `.preview-background`: Grid-patterned background
- `.preview-toolbar`: Floating control panel
- `.device-frame-container`: Phone bezel wrapper
- `.frameless-container`: Frameless viewport container

## Constraints

1. **No App Modifications**: The preview system lives entirely outside the app viewport. The Kahu app code remains untouched.
2. **Web-Only**: Preview system is client-side only (no SSR support).
3. **localStorage Dependency**: State persistence requires localStorage availability (gracefully falls back if unavailable).
4. **Z-Index Management**: Toolbar uses `z-index: 9999` to stay above app content but doesn't interfere with app modals.

## Performance

- SVG-based bezel rendering (GPU-accelerated)
- CSS `transform: scale()` for zoom (hardware-accelerated)
- Memoized device calculations
- No layout thrashing

## Accessibility

- All toolbar controls are keyboard accessible (Tab navigation)
- ARIA labels on all interactive elements
- Focus visible styles on controls
- Screen reader compatible (toolbar doesn't interfere with app navigation)

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Safari**: Full support (tested with notch rendering)
- **Firefox**: Full support (backdrop-filter with fallback)
- **Mobile browsers**: Full support (preview chrome hidden, app runs natively)

## Future Enhancements

- Screenshot export functionality (currently disabled)
- Custom device creation
- Viewport rotation animations
- Multi-device comparison view
- URL-based device/zoom sharing
