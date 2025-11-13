import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, MessageCircle, Scale, Apple, StickyNote, Camera, Play, Trophy, Heart, Dumbbell, LucideIcon } from 'lucide-react';

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  gradient: string;
  iconColor?: string;
  priority?: boolean;      // Shows red ring for urgent actions
  comingSoon?: boolean;    // Disables button, shows "Coming Soon"
}

interface QuickActionFABProps {
  actions?: QuickAction[];
  theme?: 'light' | 'dark';
  // Legacy props for Home page
  onEmergency?: () => void;
  onLogWeight?: () => void;
  onLogMeal?: () => void;
  onHealthNote?: () => void;
  onAskAI?: () => void;
  onTakePhoto?: () => void;
}

// Default actions when no custom actions provided
const getDefaultActions = (props: QuickActionFABProps): QuickAction[] => [
  {
    icon: AlertTriangle,
    label: 'Emergency',
    onClick: props.onEmergency || (() => console.log('Emergency')),
    gradient: 'from-red-500 to-red-600',
    priority: true
  },
  {
    icon: MessageCircle,
    label: 'Ask AI Trainer',
    onClick: props.onAskAI || (() => console.log('Ask AI')),
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: Scale,
    label: 'Log Weight',
    onClick: props.onLogWeight || (() => console.log('Log Weight')),
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: Apple,
    label: 'Log Meal',
    onClick: props.onLogMeal || (() => console.log('Log Meal')),
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: StickyNote,
    label: 'Health Note',
    onClick: props.onHealthNote || (() => console.log('Health Note')),
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: Camera,
    label: 'Take Photo',
    onClick: props.onTakePhoto || (() => console.log('Take Photo')),
    gradient: 'from-emerald-500 to-emerald-600',
    comingSoon: true
  }
];

// Predefined action sets for different pages
export const trainingActions: QuickAction[] = [
  {
    icon: Play,
    label: 'Start Training',
    onClick: () => console.log('Start training'),
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: Trophy,
    label: 'Training Program',
    onClick: () => console.log('Training program'),
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    icon: Dumbbell,
    label: 'Practice Session',
    onClick: () => console.log('Practice session'),
    gradient: 'from-blue-500 to-blue-600'
  }
];

export const wellnessActions: QuickAction[] = [
  {
    icon: Heart,
    label: 'Health Check',
    onClick: () => console.log('Health check'),
    gradient: 'from-red-500 to-red-600'
  },
  {
    icon: Scale,
    label: 'Log Weight',
    onClick: () => console.log('Log weight'),
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: StickyNote,
    label: 'Health Note',
    onClick: () => console.log('Health note'),
    gradient: 'from-blue-500 to-blue-600'
  }
];

export function QuickActionFAB(props: QuickActionFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme = 'dark' } = props;
  
  // Use custom actions if provided, otherwise use default actions
  const actions = props.actions || getDefaultActions(props);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  const handleActionClick = (action: QuickAction) => {
    if (!action.comingSoon) {
      action.onClick();
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-[100px] right-6 z-50 flex flex-col items-end gap-3">
        {/* Action Items */}
        {isExpanded && [...actions].reverse().map((action, index) => {
          const Icon = action.icon;
          return (
            <div 
              key={action.label}
              className="flex items-center gap-3"
              style={{
                animation: 'emergeFAB 0.15s ease-out forwards',
                animationDelay: `${(actions.length - 1 - index) * 30}ms`,
                opacity: 0,
                transform: 'scale(0) translateY(60px)'
              }}
            >
              {/* Label pill */}
              <div className={`${
                theme === 'dark' 
                  ? 'bg-[#1a1a1a] border-white/10' 
                  : 'bg-white border-gray-200'
              } border px-4 py-2 rounded-full shadow-lg`}>
                <span className={`text-sm whitespace-nowrap ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {action.label}
                  {action.comingSoon && (
                    <span className={`ml-2 text-xs ${
                      theme === 'dark' ? 'text-white/40' : 'text-gray-400'
                    }`}>
                      (Coming Soon)
                    </span>
                  )}
                </span>
              </div>
              
              {/* Action button */}
              <button
                onClick={() => handleActionClick(action)}
                disabled={action.comingSoon}
                aria-label={action.label}
                className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center ${
                  action.priority 
                    ? `ring-2 ring-red-400 ring-offset-2 ${
                        theme === 'dark' ? 'ring-offset-[#1a1a1a]' : 'ring-offset-white'
                      }` 
                    : ''
                }`}
              >
                <Icon className="w-6 h-6 text-white" />
              </button>
            </div>
          );
        })}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Quick actions"
          aria-expanded={isExpanded}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        >
          {/* Background layer with transition */}
          <div 
            className={`absolute inset-0 rounded-full border transition-all duration-300 ${
              isExpanded 
                ? theme === 'dark'
                  ? 'bg-emerald-600/50 border-emerald-400/30' 
                  : 'bg-emerald-500/70 border-emerald-400/40'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500/20 shadow-emerald-500/30'
            }`}
          />
          
          {/* Icon with rotation */}
          <div className={`relative z-10 transition-transform duration-300 ${isExpanded ? 'rotate-45' : 'rotate-0'}`}>
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes emergeFAB {
          from {
            opacity: 0;
            transform: scale(0) translateY(60px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
