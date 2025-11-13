import { Award, Heart, Apple, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = 'home' | 'tricks' | 'wellness' | 'nutrition' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'tricks' as TabType, label: 'Training', icon: Award },
  { id: 'home' as TabType, label: 'Home', icon: Home },
  { id: 'wellness' as TabType, label: 'Wellness', icon: Heart },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn('tab-item flex-1 basis-0', { active: isActive })}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}