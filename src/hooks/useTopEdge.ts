import { useSafeArea } from '@/contexts/SafeAreaContext';

// Helper to determine if text should be light or dark based on background
function chooseBarStyle(bgColor?: string): 'light' | 'dark' {
  if (!bgColor) return 'dark';
  
  // Remove # if present
  const hex = bgColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return 'light' for dark backgrounds, 'dark' for light backgrounds
  return luminance < 0.5 ? 'light' : 'dark';
}

export function useTopEdge() {
  const { insets, contentTopPadding } = useSafeArea();

  return {
    insets,
    contentTopPadding,
    chooseBarStyle,
  };
}
