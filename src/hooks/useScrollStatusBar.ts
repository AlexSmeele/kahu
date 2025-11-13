import { useEffect, useRef } from 'react';
import { useStatusBar } from '@/components/headers/StatusBarController';

interface UseScrollStatusBarOptions {
  /** Scroll threshold in pixels to trigger status bar style change */
  threshold?: number;
  /** Status bar style when above threshold (over hero) */
  styleAbove?: 'light' | 'dark' | 'auto';
  /** Status bar style when below threshold (over solid background) */
  styleBelow?: 'light' | 'dark' | 'auto';
  /** Background color to auto-detect style from when scrolled */
  backgroundColorBelow?: string;
  /** Enable/disable the scroll effect */
  enabled?: boolean;
}

/**
 * Hook to dynamically change status bar style based on scroll position
 * Useful for screens with hero images that need different status bar colors
 * 
 * @example
 * ```tsx
 * const scrollContainerRef = useScrollStatusBar({
 *   threshold: 200,
 *   styleAbove: 'light', // Light text over dark hero image
 *   styleBelow: 'dark',  // Dark text over white background
 * });
 * 
 * return <div ref={scrollContainerRef} className="overflow-y-auto">...</div>
 * ```
 */
export function useScrollStatusBar({
  threshold = 200,
  styleAbove = 'light',
  styleBelow = 'dark',
  backgroundColorBelow,
  enabled = true,
}: UseScrollStatusBarOptions = {}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { setStatusBar } = useStatusBar();

  useEffect(() => {
    if (!enabled) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      
      if (scrollTop > threshold) {
        // Scrolled past threshold - use "below" style (over solid background)
        setStatusBar({
          style: styleBelow,
          backgroundAtTop: backgroundColorBelow,
        });
      } else {
        // Above threshold - use "above" style (over hero image)
        setStatusBar({
          style: styleAbove,
        });
      }
    };

    // Set initial state
    handleScroll();

    // Listen to scroll events
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      // Reset to default on unmount
      setStatusBar({ style: 'auto' });
    };
  }, [enabled, threshold, styleAbove, styleBelow, backgroundColorBelow, setStatusBar]);

  return scrollContainerRef;
}