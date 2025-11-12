import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { Lock, CheckCircle2 } from 'lucide-react';

interface SkillCardProps {
  skill: {
    id: string;
    name: string;
    category?: string;
    difficulty?: number;
  };
  proficiencyLevel: 'basic' | 'generalized' | 'proofed';
  isUnlocked: boolean;
  dogTrick?: {
    id: string;
    proficiency_level?: 'basic' | 'generalized' | 'proofed';
    total_sessions: number;
  } | null;
  onClick: () => void;
}

export function SkillCard({ skill, proficiencyLevel, isUnlocked, dogTrick, onClick }: SkillCardProps) {
  // Determine proficiency display
  const proficiencyConfig = {
    basic: { 
      label: 'Basic', 
      color: 'from-blue-500 to-blue-600',
      badgeVariant: 'default' as const,
      ring: '33%' // 1/3 circle
    },
    generalized: { 
      label: 'Generalized', 
      color: 'from-purple-500 to-purple-600',
      badgeVariant: 'secondary' as const,
      ring: '66%' // 2/3 circle
    },
    proofed: { 
      label: 'Proofed', 
      color: 'from-amber-500 to-amber-600',
      badgeVariant: 'default' as const,
      ring: '100%' // full circle
    }
  };

  const config = proficiencyConfig[proficiencyLevel];
  const currentProficiency = dogTrick?.proficiency_level || 'basic';
  const isComplete = currentProficiency === proficiencyLevel;
  const isInProgress = dogTrick && !isComplete;
  const canLevelUp = isInProgress && dogTrick.total_sessions >= 5; // Simplified check

  // Get category color
  const categoryColors: Record<string, string> = {
    obedience: 'from-blue-500 to-blue-600',
    manners: 'from-green-500 to-green-600',
    safety: 'from-red-500 to-red-600',
    tricks: 'from-purple-500 to-purple-600',
  };
  
  const iconColor = skill.category ? categoryColors[skill.category] || 'from-gray-500 to-gray-600' : 'from-blue-500 to-blue-600';

  return (
    <Card 
      onClick={isUnlocked ? onClick : undefined}
      className={`relative overflow-hidden transition-all duration-200 aspect-[3/4] ${
        isUnlocked 
          ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]' 
          : 'opacity-60 cursor-not-allowed'
      } ${canLevelUp ? 'animate-pulse' : ''}`}
    >
      {/* Lock overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground px-4">Prerequisites not met</p>
          </div>
        </div>
      )}

      {/* Proficiency level bar at top */}
      <div className={`bg-gradient-to-br ${config.color} h-2 w-full`} />

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-3">
        {/* Completion badge */}
        {isComplete && (
          <div className="absolute top-3 right-3 z-10">
            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
          </div>
        )}

        {/* Icon Section with proficiency ring */}
        <div className="flex-1 flex items-center justify-center py-2">
          <div className="relative">
            {/* Proficiency ring */}
            <svg className="absolute -inset-1 w-[88px] h-[88px]" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="44"
                cy="44"
                r="40"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="44"
                cy="44"
                r="40"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className={`${
                  proficiencyLevel === 'basic' ? 'text-blue-500' :
                  proficiencyLevel === 'generalized' ? 'text-purple-500' :
                  'text-amber-500'
                }`}
                strokeDasharray={`${251 * (parseInt(config.ring) / 100)} 251`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Icon */}
            <div className={`w-20 h-20 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center shadow-sm relative z-10`}>
              <LucideIcons.Target className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-1.5 text-center pb-1">
          <h3 className="font-bold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
            {skill.name}
          </h3>
          
          {/* Proficiency badge */}
          <Badge variant={config.badgeVariant} className="text-xs">
            {config.label}
          </Badge>
          
          {/* Progress indicator */}
          {dogTrick && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
              {isComplete ? (
                <span className="text-green-600 font-medium">Mastered</span>
              ) : (
                <span>{dogTrick.total_sessions} sessions</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
