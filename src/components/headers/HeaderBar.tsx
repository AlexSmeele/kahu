import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IOSStatusBar } from './IOSStatusBar';
import { DynamicIsland } from './DynamicIsland';
import { useDevicePreview } from '@/preview/DevicePreviewProvider';

interface HeaderBarProps {
  transparent?: boolean;
  elevated?: boolean;
  title?: string;
  onBack?: () => void;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  statusBarStyleOnSolid?: 'light' | 'dark';
  statusBarStyleOnTransparent?: 'light' | 'dark';
  className?: string;
}

export function HeaderBar({
  transparent = false,
  elevated = false,
  title,
  onBack,
  leftSlot,
  rightSlot,
  className,
}: HeaderBarProps) {
  // Detect if running on real mobile device vs desktop preview
  const { isMobileDevice } = useDevicePreview();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 transition-all duration-200',
        transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-md',
        elevated && 'shadow-md',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[10px]',
        'after:bg-gradient-to-b after:from-transparent after:to-background/10',
        'after:pointer-events-none',
        className
      )}
    >
      {/* Desktop preview: show simulated iOS status bar */}
      {!isMobileDevice && (
        <div className="relative h-[54px]">
          <DynamicIsland />
          <IOSStatusBar />
        </div>
      )}
      
      {/* Real mobile device: use native safe area */}
      {isMobileDevice && <div className="safe-top" />}

      <div className="px-5 pb-4 flex items-center justify-between gap-3">
        {/* Left Action */}
        <div className="flex-shrink-0">
          {leftSlot || (onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="w-11 h-11 rounded-full"
              aria-label="Go back"
            >
              <ChevronLeft className="w-[26px] h-[26px]" />
            </Button>
          ))}
        </div>

        {/* Title */}
        {title && (
          <h1 className="flex-1 text-2xl font-semibold truncate text-center">
            {title}
          </h1>
        )}

        {/* Right Action */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
