import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { StatusBar, Style, Animation } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

type BarStyle = 'light' | 'dark' | 'auto';

interface StatusBarState {
  visible: boolean;
  style: BarStyle;
  animated: boolean;
  backgroundAtTop?: string;
}

interface StatusBarContextValue {
  setStatusBar: (opts: Partial<StatusBarState>) => void;
  state: StatusBarState;
}

const StatusBarContext = createContext<StatusBarContextValue | null>(null);

interface StatusBarControllerProps {
  visible?: boolean;
  style?: BarStyle;
  animated?: boolean;
  backgroundAtTop?: string;
  children?: ReactNode;
}

// Helper to determine if a background color is light or dark
function shouldUseLightContent(bgColor?: string): boolean {
  if (!bgColor) return false;
  
  // Remove # if present
  const hex = bgColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if background is dark (use light content)
  return luminance < 0.5;
}

export function StatusBarController({
  visible = true,
  style = 'auto',
  animated = true,
  backgroundAtTop,
  children,
}: StatusBarControllerProps) {
  const [state, setState] = useState<StatusBarState>({
    visible,
    style,
    animated,
    backgroundAtTop,
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const applyStatusBar = async () => {
      try {
        // Determine final style
        let finalStyle: Style = Style.Dark;
        if (state.style === 'light') {
          finalStyle = Style.Light;
        } else if (state.style === 'dark') {
          finalStyle = Style.Dark;
        } else if (state.style === 'auto' && state.backgroundAtTop) {
          finalStyle = shouldUseLightContent(state.backgroundAtTop) ? Style.Light : Style.Dark;
        }

        // Apply style
        await StatusBar.setStyle({ style: finalStyle });

        // Apply visibility
        if (state.visible) {
          await StatusBar.show({ animation: state.animated ? Animation.Fade : Animation.None });
        } else {
          await StatusBar.hide({ animation: state.animated ? Animation.Fade : Animation.None });
        }
      } catch (error) {
        console.error('Failed to update status bar:', error);
      }
    };

    applyStatusBar();
  }, [state]);

  const setStatusBar = (opts: Partial<StatusBarState>) => {
    setState(prev => ({ ...prev, ...opts }));
  };

  const value: StatusBarContextValue = {
    setStatusBar,
    state,
  };

  return (
    <StatusBarContext.Provider value={value}>
      {children}
    </StatusBarContext.Provider>
  );
}

export function useStatusBar() {
  const context = useContext(StatusBarContext);
  if (!context) {
    throw new Error('useStatusBar must be used within StatusBarController');
  }
  return context;
}
