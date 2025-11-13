# Phase 4: Visual & UX Testing Checklist

## Header Consistency Audit

### ✅ Header Height Consistency
- [ ] All screen headers have **identical heights** (including safe area)
- [ ] HeaderBar component used consistently across:
  - [ ] HomeScreen
  - [ ] TricksScreen (Training)
  - [ ] HealthScreen (Wellness)
  - [ ] ProfileScreen
- [ ] No custom header implementations bypassing HeaderBar

### ✅ Dog Dropdown Consistency
- [ ] Dog dropdown appears in **same position** on all screens
- [ ] Dropdown behavior identical across all screens:
  - [ ] Opens correctly
  - [ ] Shows all dogs
  - [ ] Updates selected dog globally
  - [ ] Persists selection across navigation

### ✅ Header Actions
- [ ] Profile button appears **only on Home screen** (top right)
- [ ] Clicker button appears **only on Training screen** (top right)
- [ ] No extra actions on Wellness screen
- [ ] Back buttons work correctly on detail pages

---

## Touch Target Validation

### Minimum Size Requirements
- **iOS**: 44x44 points minimum
- **Android**: 48x48 density-independent pixels (dp) minimum

### ✅ Interactive Elements Checklist
- [ ] **All buttons** meet 44x44pt minimum:
  - [ ] Back buttons
  - [ ] Dog dropdown avatar
  - [ ] Profile avatar
  - [ ] Clicker button
  - [ ] Navigation tabs
  - [ ] Quick action buttons
  - [ ] Card action buttons

- [ ] **Icons are 26px** as per design tokens:
  - [ ] ChevronLeft (back)
  - [ ] User (profile)
  - [ ] Radio (clicker)
  - [ ] Navigation icons

- [ ] **Adequate spacing** between interactive elements:
  - [ ] Minimum 8px gap between buttons
  - [ ] No cramped UI in headers
  - [ ] No overlapping touch areas

### Test on Smallest Device
Test all touch targets on **iPhone SE (4.7" screen)**:
- [ ] Header buttons accessible
- [ ] Navigation tabs not cramped
- [ ] Cards have clear tap targets
- [ ] Modals have accessible close buttons

---

## Clicker Button Integration

### ✅ Training Screen Header
- [ ] Clicker button **fits properly** in header
- [ ] Button text **"Clicker"** is legible
- [ ] Not truncated on small screens (iPhone SE)
- [ ] Proper styling matches HeaderBar design
- [ ] Opens clicker modal on tap

### ✅ Clicker Modal Functionality
- [ ] Modal opens correctly
- [ ] Audio plays on click
- [ ] Haptic feedback works (on native)
- [ ] Close button accessible
- [ ] Doesn't interfere with navigation

---

## Safe Area Visual Testing

### Enable Debug Mode
Set `debug={true}` in `SafeAreaProvider` (src/main.tsx):

```tsx
<SafeAreaProvider debug={true}>
```

### ✅ Visual Verification
- [ ] **Red overlay** shows top safe area (status bar/notch)
- [ ] **Blue overlay** shows bottom safe area (home indicator)
- [ ] **Green overlay** shows left safe area
- [ ] **Yellow overlay** shows right safe area

### ✅ Content Positioning
- [ ] No content renders **behind notch/Dynamic Island** (except backgrounds)
- [ ] Headers start **below** safe area top
- [ ] Bottom navigation respects **safe area bottom** (home indicator)
- [ ] Modals and drawers respect safe areas
- [ ] Full-screen overlays bleed to edges (backgrounds, hero images)

### Test on Multiple Device Sizes
- [ ] **iPhone SE** (no notch, small screen)
- [ ] **iPhone 13 Pro** (standard notch)
- [ ] **iPhone 15 Pro** (Dynamic Island)
- [ ] **Pixel 8 Pro** (hole-punch camera)
- [ ] **Galaxy S24 Ultra** (hole-punch camera)

---

## Navigation & Scroll Testing

### ✅ Tab Navigation
- [ ] Bottom tab bar always visible
- [ ] Active tab highlighted correctly
- [ ] Tab switches preserve scroll position
- [ ] Dog selection persists across tabs
- [ ] No flicker during tab changes

### ✅ Scroll Behavior
- [ ] Smooth 60fps scrolling
- [ ] Status bar updates on scroll (if implemented)
- [ ] No content jumps
- [ ] Scroll position restored on back navigation
- [ ] Pull-to-refresh works (if implemented)

### ✅ Back Button Navigation
- [ ] Works from all detail pages
- [ ] Returns to correct parent screen
- [ ] Restores scroll position
- [ ] Preserves dog selection
- [ ] No navigation loops

---

## Component Visual Consistency

### ✅ Card Styling
- [ ] All cards use consistent:
  - [ ] Border radius
  - [ ] Shadow/elevation
  - [ ] Padding
  - [ ] Background colors
- [ ] Cards have clear touch targets
- [ ] Hover states (desktop) work
- [ ] Active states (mobile) provide feedback

### ✅ Button Variants
- [ ] Primary buttons use gradient
- [ ] Secondary buttons use outline
- [ ] Ghost buttons have proper hover
- [ ] Destructive buttons use red color
- [ ] Disabled state clearly visible

### ✅ Typography
- [ ] Headings use correct font sizes
- [ ] Body text is legible (min 14px on mobile)
- [ ] Line heights provide breathing room
- [ ] Text contrast meets WCAG AA standards
- [ ] No text truncation unless intentional

---

## Dark Mode Testing

### ✅ Status Bar Adaptation
- [ ] Status bar text **light** in dark mode
- [ ] Status bar text **dark** in light mode
- [ ] Auto-detection works correctly
- [ ] No invisible text issues

### ✅ Component Theming
- [ ] All cards readable in dark mode
- [ ] Backgrounds have proper contrast
- [ ] Borders visible but subtle
- [ ] Icons adapt to theme
- [ ] Images/photos don't wash out

### ✅ No White-on-White or Black-on-Black
- [ ] No invisible text anywhere
- [ ] Check:
  - [ ] Headers
  - [ ] Cards
  - [ ] Modals
  - [ ] Buttons
  - [ ] Input fields
  - [ ] Dropdown menus

---

## Animation & Transitions

### ✅ Smooth Animations
- [ ] Page transitions smooth (no jank)
- [ ] Modal open/close animated
- [ ] Tab switches animated
- [ ] Scroll animations perform well
- [ ] No layout shift during animations

### ✅ Loading States
- [ ] Skeletons show while loading
- [ ] Spinners centered and sized correctly
- [ ] No content flash (FOUC)
- [ ] Smooth transition to loaded state

---

## Responsive Design

### Test on All Breakpoints
- [ ] **iPhone SE** (375px width)
- [ ] **iPhone 15 Pro** (393px width)
- [ ] **iPhone 15 Pro Max** (430px width)
- [ ] **Pixel 8 Pro** (412px width)
- [ ] **Tablet** (768px+ width, if applicable)

### ✅ Layout Adaptation
- [ ] Grid columns adjust for screen size
- [ ] Images scale appropriately
- [ ] Text doesn't overflow
- [ ] Buttons stack on narrow screens
- [ ] Adequate spacing maintained

---

## Accessibility Quick Check

### ✅ Screen Reader Support
- [ ] All interactive elements have **aria-labels**
- [ ] Images have descriptive **alt text**
- [ ] Forms have proper labels
- [ ] Error messages announced
- [ ] Focus order logical

### ✅ Keyboard Navigation (Desktop)
- [ ] Tab order makes sense
- [ ] Focus visible on all elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] No keyboard traps

---

## Edge Cases

### ✅ Empty States
- [ ] No dogs: Shows onboarding
- [ ] No tricks learned: Shows empty state
- [ ] No timeline events: Shows placeholder
- [ ] No notifications: Shows empty state

### ✅ Data Extremes
- [ ] Very long dog names (20+ characters)
- [ ] Very long breed names (30+ characters)
- [ ] 10+ dogs in dropdown
- [ ] 100+ timeline events (performance)
- [ ] Large images load correctly

### ✅ Network Conditions
- [ ] Loading states shown
- [ ] Error states handled gracefully
- [ ] Retry buttons work
- [ ] Offline mode (if applicable)

---

## Final Visual Polish

### ✅ Overall Consistency
- [ ] Design system tokens used throughout
- [ ] No hardcoded colors (use CSS variables)
- [ ] Consistent spacing (4px, 8px, 12px, 16px, 24px)
- [ ] Consistent border radius
- [ ] Consistent shadows

### ✅ Performance Feel
- [ ] App feels snappy
- [ ] No lag when navigating
- [ ] Images load progressively
- [ ] Animations at 60fps
- [ ] Memory usage reasonable

---

## Testing Tools

### Browser DevTools
- **Chrome DevTools**: `F12` → Device Toolbar
- **Responsive Design Mode**: `Cmd+Opt+M` (Mac) or `Ctrl+Shift+M` (Windows)
- **Lighthouse**: Run accessibility and performance audits

### Desktop Device Preview
- Use the device dropdown in Lovable preview
- Toggle between iPhone, Pixel, Galaxy models
- Test zoom levels (Fit, 100%, 75%, 50%)

### Real Device Testing
- Test on actual phones when possible
- Different screen sizes reveal different issues
- Touch behavior differs from mouse

---

## Sign-Off Checklist

Before marking Phase 4 complete:

- [ ] All header consistency issues resolved
- [ ] All touch targets meet minimum sizes
- [ ] Clicker button integration polished
- [ ] Safe area insets verified on all devices
- [ ] Dark mode fully functional
- [ ] No visual bugs on smallest device (iPhone SE)
- [ ] No visual bugs on largest device (iPhone 15 Pro Max)
- [ ] All animations smooth
- [ ] Performance acceptable
- [ ] Design system tokens used consistently

---

## Next Steps

After Phase 4 completion:
1. Proceed to **Phase 5**: Functional testing
2. Then **Phase 6**: Performance & error handling
3. Finally **Phase 7**: Accessibility & polish
