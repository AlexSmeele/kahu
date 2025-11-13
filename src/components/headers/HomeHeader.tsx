import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { IOSStatusBar } from "./IOSStatusBar";
import { DynamicIsland } from "./DynamicIsland";
import { useDevicePreview } from "@/preview/DevicePreviewProvider";

interface HomeHeaderProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
  userImage?: string;
  userName?: string;
  onProfileClick?: () => void;
  extraActions?: ReactNode;
}

export function HomeHeader({
  selectedDogId,
  onDogChange,
  userImage,
  userName,
  onProfileClick,
  extraActions,
}: HomeHeaderProps) {
  // Detect if running on real mobile device vs desktop preview
  const { isMobileDevice } = useDevicePreview();

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[10px] after:bg-gradient-to-b after:from-transparent after:to-background/10 after:pointer-events-none">
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
        {/* Dog Selector - Left */}
        <DogDropdown
          selectedDogId={selectedDogId}
          onDogChange={onDogChange}
          variant="inline"
        />

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {extraActions}
          
          {/* Profile Avatar */}
          {userImage && (
            <button
              onClick={onProfileClick}
              className="flex-shrink-0"
              aria-label="View profile"
            >
              <Avatar className="w-10 h-10 border-2 border-border shadow-sm">
                <AvatarImage src={userImage} alt={userName || "Profile"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {userName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
