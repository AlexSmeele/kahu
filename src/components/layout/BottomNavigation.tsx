import { Award, Heart, Apple, User, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = 'home' | 'tricks' | 'wellness' | 'nutrition' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuickAction: () => void;
  hideFab?: boolean;
}

const tabs = [
  { id: 'tricks' as TabType, label: 'Training', icon: Award },
  { id: 'home' as TabType, label: 'Home', icon: Home },
  { id: 'wellness' as TabType, label: 'Wellness', icon: Heart },
];

export function BottomNavigation({ activeTab, onTabChange, onQuickAction, hideFab = false }: BottomNavigationProps) {
  return (
    <>
      {/* Floating Action Button */}
      {!hideFab && (
        <button
          onClick={onQuickAction}
          className="fab"
          aria-label="Quick add"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn('tab-item', { active: isActive })}
                aria-label={tab.label}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}