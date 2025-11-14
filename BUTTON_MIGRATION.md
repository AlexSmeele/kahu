# Button Component Migration Guide

## Overview

The Kahu button component has been updated to align with the Kahu master design system. This guide covers breaking changes, migration steps, and new features.

## Breaking Changes

### 1. Size Prop: `default` → `md`

**Before:**
```tsx
<Button size="default">Click Me</Button>
```

**After:**
```tsx
<Button size="md">Click Me</Button>
```

**Note:** The `default` size still works (mapped to `md` internally) but is deprecated. Update to `md` for future compatibility.

### 2. Removed `touch` Size

The `touch` size has been removed. Use `lg` or `xl` for touch-optimized buttons.

**Before:**
```tsx
<Button size="touch">Touch Target</Button>
```

**After:**
```tsx
<Button size="lg">Touch Target</Button>
```

### 3. Variant Naming: `default` → `primary`

The primary variant is now explicitly named `primary`. The `default` variant still works as an alias for backward compatibility.

**Recommended Update:**
```tsx
// Old (still works)
<Button variant="default">Primary Action</Button>

// New (preferred)
<Button variant="primary">Primary Action</Button>
```

## Size Specifications

All button sizes now match the Kahu design system with specific pixel heights:

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| `xs` | 28px (h-7) | px-2 | 14px (text-xs) | Compact UI, tags, chips |
| `sm` | 36px (h-9) | px-3 | 14px (text-sm) | Secondary actions, toolbars |
| `md` | 44px (h-11) | px-4 | 16px (text-base) | **Default, primary actions** |
| `lg` | 52px (h-13) | px-6 | 18px (text-lg) | Touch targets, prominent CTAs |
| `xl` | 60px (h-15) | px-8 | 18px (text-lg) | Hero CTAs, onboarding |
| `icon` | 40px (h-10 w-10) | - | - | Icon-only buttons |

**Touch Target Guidance:**
- Minimum recommended size for touch interfaces: `md` (44px) or larger
- For mobile-first experiences, prefer `lg` (52px) or `xl` (60px)
- `xs` and `sm` should be avoided for primary touch targets

## Variant Specifications

### Primary (default)
**Purpose:** Main call-to-action buttons

```tsx
<Button variant="primary">Primary Action</Button>
```

**Styling:**
- Background: Emerald gradient
- Text: White
- Elevation: 2 (shadow-md)
- Hover: Scale 1.02, opacity 0.9
- Pressed: Scale 0.98

**Use Cases:** Submit forms, create/add actions, primary navigation

---

### Secondary
**Purpose:** Secondary actions with visual prominence

```tsx
<Button variant="secondary">Secondary Action</Button>
```

**Styling:**
- Background: Glass gradient with border
- Text: Primary color
- Elevation: 1
- Hover: Scale 1.02, elevation 2

**Use Cases:** Cancel actions, alternative options, secondary navigation

---

### Outline
**Purpose:** Emphasized actions without heavy visual weight

```tsx
<Button variant="outline">Outline Button</Button>
```

**Styling:**
- Background: Transparent
- Border: 1px emerald-500
- Text: Emerald-500
- Hover: Light emerald background, scale 1.02
- Pressed: Darker emerald background, scale 0.98

**Use Cases:** Filters, toggles, optional actions

---

### Ghost
**Purpose:** Subtle actions that blend with surrounding content

```tsx
<Button variant="ghost">Ghost Button</Button>
```

**Styling:**
- Background: Transparent
- Hover: Muted background, scale 1.02
- Pressed: Accent background, scale 0.98

**Use Cases:** Navigation items, menu items, inline actions

---

### Destructive
**Purpose:** Dangerous or irreversible actions

```tsx
<Button variant="destructive">Delete</Button>
```

**Styling:**
- Background: Destructive color (red)
- Text: White
- Elevation: 2
- Hover: Scale 1.02, opacity 0.9

**Use Cases:** Delete, remove, permanently disable

---

### Link
**Purpose:** Text-like actions without button appearance

```tsx
<Button variant="link">Link Button</Button>
```

**Styling:**
- Background: Transparent
- Text: Primary with underline on hover

**Use Cases:** Inline links, subtle navigation

## Gradient Variants

Four gradient variants are available for branded experiences:

### Gradient Emerald (Primary Brand)
```tsx
<Button variant="gradient-emerald">Emerald Action</Button>
```
**Use:** Primary brand actions, hero CTAs

### Gradient Amber (Warm/Alert)
```tsx
<Button variant="gradient-amber">Amber Action</Button>
```
**Use:** Important notifications, achievement unlocks

### Gradient Blue (Trust/Info)
```tsx
<Button variant="gradient-blue">Blue Action</Button>
```
**Use:** Informational actions, educational content

### Gradient Purple (Premium/Special)
```tsx
<Button variant="gradient-purple">Purple Action</Button>
```
**Use:** Premium features, special offers

## Interactive States

All interactive variants now include enhanced state feedback:

### Hover State
- Scale transform: `1.02` (2% larger)
- Opacity change (varies by variant)
- Elevation increase (where applicable)
- Smooth transition: 200ms

### Pressed/Active State
- Scale transform: `0.98` (2% smaller)
- Provides tactile feedback
- Smooth transition: 200ms

### Focus State
- Visible focus ring (2px)
- Ring color matches variant
- Offset for clarity
- WCAG AA compliant contrast

### Disabled State
- Opacity: 50%
- Pointer events disabled
- No hover/active effects

## Migration Checklist

### Step 1: Update Size Props
```bash
# Search for size="default"
grep -r 'size="default"' src/

# Search for size="touch"
grep -r 'size="touch"' src/
```

Replace:
- `size="default"` → `size="md"`
- `size="touch"` → `size="lg"` or `size="xl"`

### Step 2: Update Variant Props (Optional but Recommended)
```bash
# Search for variant="default"
grep -r 'variant="default"' src/
```

Replace:
- `variant="default"` → `variant="primary"` (optional, backward compatible)

### Step 3: Review Custom Styles
Check for custom `className` overrides that might conflict with new scale transforms:

```tsx
// Potential conflict
<Button className="transform scale-105">...</Button>

// Better approach: use size prop or create new variant
<Button size="lg">...</Button>
```

### Step 4: Test Touch Targets
Verify all buttons meet minimum 44px touch targets on mobile:

```tsx
// Too small for touch
<Button size="xs">Tap Me</Button> // ❌ 28px

// Good for touch
<Button size="md">Tap Me</Button> // ✅ 44px
<Button size="lg">Tap Me</Button> // ✅ 52px
```

### Step 5: Validate Dark Mode
Test all button variants in dark mode to ensure proper contrast and visibility.

### Step 6: Accessibility Check
- Verify focus states are visible
- Ensure sufficient color contrast (WCAG AA)
- Test keyboard navigation
- Validate screen reader announcements

## Component Examples

### Form Actions
```tsx
<div className="flex gap-3">
  <Button variant="primary" size="md" type="submit">
    Save Changes
  </Button>
  <Button variant="secondary" size="md" type="button">
    Cancel
  </Button>
</div>
```

### Card Actions
```tsx
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">
      Learn More
    </Button>
  </CardFooter>
</Card>
```

### Mobile Onboarding
```tsx
<div className="flex flex-col gap-4">
  <Button variant="gradient-emerald" size="xl">
    Get Started
  </Button>
  <Button variant="ghost" size="lg">
    Skip for Now
  </Button>
</div>
```

### Icon Buttons
```tsx
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

### Destructive Confirmation
```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <Button variant="secondary" size="md">
        Cancel
      </Button>
      <Button variant="destructive" size="md">
        Delete Forever
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## TypeScript Support

The button component is fully typed. Available types:

```typescript
type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "outline" 
  | "ghost" 
  | "destructive" 
  | "link"
  | "gradient-emerald"
  | "gradient-amber"
  | "gradient-blue"
  | "gradient-purple"
  | "default"; // deprecated, use "primary"

type ButtonSize = 
  | "xs" 
  | "sm" 
  | "md" 
  | "lg" 
  | "xl" 
  | "icon"
  | "default"; // deprecated, use "md"
```

## Design System Alignment

This update aligns the button component with the Kahu master design system:

- **Colors:** Uses design tokens from `design-system.json`
- **Typography:** Matches button typography roles (buttonSmall, button, buttonLarge)
- **Spacing:** Uses consistent padding and height values
- **States:** Implements hover, pressed, focus, and disabled states per design spec
- **Elevation:** Uses design system elevation scale (0-5)
- **Transitions:** Consistent 200ms duration with smooth easing

## CSS Variables Used

The button component uses these CSS variables from `src/index.css`:

```css
/* Typography */
--typography-button-small-size: 14px
--typography-button-size: 16px
--typography-button-large-size: 18px

/* State transforms */
--state-hover-scale: 1.02
--state-pressed-scale: 0.98
--state-hover-opacity: 0.9
--state-pressed-opacity: 0.95

/* Gradients */
--gradient-button-emerald
--gradient-button-amber
--gradient-button-blue
--gradient-button-purple

/* Glass effects */
--gradient-glass
```

## Tailwind Classes

Button variants use semantic Tailwind classes from `tailwind.config.ts`:

- Colors: `emerald-*`, `amber-*`, `blue-*`, `purple-*`
- Elevations: `elevation-1`, `elevation-2`
- Gradients: `bg-gradient-button-*`, `bg-gradient-glass`

## Performance Notes

- Scale transforms use hardware-accelerated CSS transforms
- Transitions are optimized with `transition-all duration-base`
- No layout shifts (transforms don't affect layout)
- Smooth 60fps animations on modern browsers

## Browser Support

- Chrome/Edge: Full support
- Safari: Full support (tested iOS Safari)
- Firefox: Full support
- Mobile browsers: Full support with optimized touch targets

## Common Issues

### Scale Transform Conflicts
**Issue:** Custom scale transforms override button states

**Solution:** Remove custom scale classes and use button sizes instead
```tsx
// Before
<Button className="scale-110">Large</Button>

// After
<Button size="lg">Large</Button>
```

### Touch Target Too Small
**Issue:** Button is too small for comfortable tapping

**Solution:** Use `md` (44px) or larger for touch interfaces
```tsx
// Before
<Button size="xs">Tap</Button> // 28px

// After
<Button size="md">Tap</Button> // 44px
```

### Focus Ring Not Visible
**Issue:** Custom styles override focus ring

**Solution:** Ensure custom className doesn't override focus-visible styles
```tsx
// Before
<Button className="focus:outline-none">Click</Button>

// After
<Button>Click</Button> // Uses built-in focus styles
```

## Need Help?

- Review the [Kahu master design system](https://github.com/AlexSmeele/kahu-master-system)
- Check `src/components/ui/button.tsx` for implementation details
- See `design-system.json` for design token values
- Test in the Storybook/preview environment before deploying

## Version History

- **v2.0.0** (Current): Aligned with Kahu master design system
  - Renamed `default` size to `md`
  - Removed `touch` size
  - Added scale transforms and enhanced states
  - Updated typography to use design tokens
  - Added gradient variants

- **v1.x**: Previous implementation (legacy)
