import { Flame } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";
import type { TabType } from "@/components/layout/BottomNavigation";

interface TrainingStreakCardProps {
  dogId: string;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export function TrainingStreakCard({ dogId, onTabChange, className = "" }: TrainingStreakCardProps) {
  const { dogSkills } = useSkills(dogId);
  
  // Calculate streak based on started_at dates (simplified version)
  const calculateStreak = (): number => {
    if (!dogTricks || dogTricks.length === 0) return 0;
    
    // Count tricks in learning or practicing status as indication of active training
    const activeTricks = dogTricks.filter(
      trick => trick.status === 'learning' || trick.status === 'practicing'
    );
    
    // Simple streak: if there are active tricks with recent started_at dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentActiveTricks = activeTricks.filter(trick => {
      if (!trick.started_at) return false;
      const startDate = new Date(trick.started_at);
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30; // Active within last 30 days
    });
    
    return recentActiveTricks.length;
  };
  
  const streak = calculateStreak();
  
  // Find last training date based on started_at
  const getLastTrainingDate = (): string => {
    if (!dogTricks || dogTricks.length === 0) return 'Never';
    
    let latestDate: Date | null = null;
    
    dogTricks.forEach(trick => {
      if (trick.started_at) {
        const startDate = new Date(trick.started_at);
        if (!latestDate || startDate > latestDate) {
          latestDate = startDate;
        }
      }
    });
    
    if (!latestDate) return 'Never';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(latestDate);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (compareDate.getTime() === yesterday.getTime()) return 'Yesterday';
    
    const daysAgo = Math.floor((today.getTime() - compareDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysAgo} days ago`;
  };
  
  const getMessage = (streak: number): string => {
    if (streak === 0) return 'Start your streak!';
    if (streak <= 2) return 'Keep going!';
    if (streak <= 6) return 'Great progress!';
    if (streak <= 13) return 'Amazing streak!';
    return 'Incredible dedication!';
  };
  
  const lastTraining = getLastTrainingDate();
  
  return (
    <button
      onClick={() => onTabChange('tricks')}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Streak</h3>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center my-4">
          <div className="flex items-center gap-2 mb-2">
            {streak > 0 && <Flame className="w-6 h-6 text-orange-500" />}
            <p className="text-2xl font-bold">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {getMessage(streak)}
          </p>
          <p className="text-xs text-muted-foreground">
            Last: {lastTraining}
          </p>
        </div>
      </div>
    </button>
  );
}
