import { MessageCircle, Award, Heart, Apple, User, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = 'trainer' | 'tricks' | 'health' | 'nutrition' | 'marketplace' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuickAction: () => void;
  hideFab?: boolean;
}

const tabs = [
  { id: 'trainer' as TabType, label: 'Ask', icon: MessageCircle },
  { id: 'tricks' as TabType, label: 'Tricks', icon: Award },
  { id: 'health' as TabType, label: 'Health', icon: Heart },
  { id: 'nutrition' as TabType, label: 'Nutrition', icon: Apple },
  { id: 'marketplace' as TabType, label: 'Shop', icon: ShoppingBag },
  { id: 'profile' as TabType, label: 'Profile', icon: User },
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