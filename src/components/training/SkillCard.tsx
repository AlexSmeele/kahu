import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { Lock, CheckCircle2, Target, CheckCircle } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

interface SkillCardProps {
  skill: {
    id: string;
    name: string;
    description?: string;
    category?: string[];
    difficulty?: number;
  };
  proficiencyLevel: 'basic' | 'generalized' | 'proofed';
  isUnlocked: boolean;
  prerequisiteName?: string;
  minAgeWeeks?: number;
  dogTrick?: {
    id: string;
    proficiency_level?: 'basic' | 'generalized' | 'proofed';
    total_sessions: number;
  } | null;
  onClick: () => void;
}

export function SkillCard({ skill, proficiencyLevel, isUnlocked, prerequisiteName, minAgeWeeks, dogTrick, onClick }: SkillCardProps) {
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
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
  
  const primaryCategory = skill.category?.[0]?.toLowerCase();
  const iconColor = primaryCategory 
    ? categoryColors[primaryCategory] || 'from-gray-500 to-gray-600' 
    : 'from-blue-500 to-blue-600';

  // Description content for both HoverCard and Dialog
  const descriptionContent = (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-2">
        <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm leading-tight">{skill.name}</h4>
          <Badge variant={config.badgeVariant} className="text-xs mt-1">
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {skill.description}
      </p>

      {/* Prerequisites */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Prerequisites:</span>
        </div>
        {prerequisiteName ? (
          <p className="text-xs text-muted-foreground pl-5">
            Complete <span className="font-medium text-foreground">{prerequisiteName}</span>
          </p>
        ) : minAgeWeeks ? (
          <p className="text-xs text-muted-foreground pl-5">
            Available at {minAgeWeeks} weeks old
          </p>
        ) : (
          <p className="text-xs text-green-600 pl-5">
            None - Available now!
          </p>
        )}
      </div>

      {/* Proficiency Level */}
      <div className="flex items-center gap-1.5 text-xs pt-1">
        <Target className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Proficiency Level: <span className="font-medium text-foreground">{config.label}</span></span>
      </div>
    </div>
  );

  const cardContent = (
    <Card 
      onClick={isUnlocked ? onClick : !skill.description ? undefined : () => setMobileDialogOpen(true)}
      className={`relative overflow-hidden transition-all duration-200 aspect-[3/4] ${
        isUnlocked 
          ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]' 
          : skill.description 
            ? 'opacity-50 saturate-50 cursor-pointer active:scale-[0.98]'
            : 'opacity-50 saturate-50 cursor-not-allowed'
      } ${canLevelUp ? 'animate-pulse' : ''}`}
    >
      {/* Lock badge in corner */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <Lock className="w-4 h-4 text-white" />
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

  // For locked cards, wrap with both HoverCard (desktop) and Dialog (mobile)
  if (!isUnlocked && skill.description) {
    return (
      <>
        {/* Desktop: HoverCard on hover */}
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            {cardContent}
          </HoverCardTrigger>
          <HoverCardContent className="w-72 hidden md:block">
            {descriptionContent}
          </HoverCardContent>
        </HoverCard>

        {/* Mobile: Dialog on tap */}
        <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
          <DialogContent className="w-[90vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Locked Skill
              </DialogTitle>
            </DialogHeader>
            {descriptionContent}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return cardContent;
}
