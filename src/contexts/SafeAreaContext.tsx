import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SafeAreaContextValue {
  insets: SafeAreaInsets;
  contentTopPadding: number;
  debug: boolean;
}

const SafeAreaContext = createContext<SafeAreaContextValue | null>(null);

interface SafeAreaProviderProps {
  children: ReactNode;
  debug?: boolean;
}

export function SafeAreaProvider({ children, debug = false }: SafeAreaProviderProps) {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    // Read CSS environment variables for safe area insets
    const updateInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      const top = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0');
      const right = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0');
      const bottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0');
      const left = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0');

      setInsets({ top, right, bottom, left });
    };

    updateInsets();

    // Listen for orientation changes and window resizes
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  const value: SafeAreaContextValue = {
    insets,
    contentTopPadding: insets.top,
    debug,
  };

  return (
    <SafeAreaContext.Provider value={value}>
      {children}
      {debug && (
        <>
          <div 
            className="fixed top-0 left-0 right-0 bg-red-500/30 pointer-events-none z-[9999]"
            style={{ height: `${insets.top}px` }}
          />
          <div 
            className="fixed bottom-0 left-0 right-0 bg-blue-500/30 pointer-events-none z-[9999]"
            style={{ height: `${insets.bottom}px` }}
          />
          <div 
            className="fixed top-0 left-0 bottom-0 bg-green-500/30 pointer-events-none z-[9999]"
            style={{ width: `${insets.left}px` }}
          />
          <div 
            className="fixed top-0 right-0 bottom-0 bg-yellow-500/30 pointer-events-none z-[9999]"
            style={{ width: `${insets.right}px` }}
          />
        </>
      )}
    </SafeAreaContext.Provider>
  );
}

export function useSafeArea() {
  const context = useContext(SafeAreaContext);
  if (!context) {
    throw new Error('useSafeArea must be used within SafeAreaProvider');
  }
  return context;
}
