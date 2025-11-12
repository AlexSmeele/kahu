// Skill Progression Map - Defines when skills appear in the roadmap and their prerequisites

export interface SkillProgression {
  trickId: string;
  level: 'basic' | 'generalized' | 'proofed';
  stage: string;
  prerequisite: { trickId: string; level: 'basic' | 'generalized' | 'proofed' } | null;
}

// Maps skill ID + level to roadmap stage and prerequisite
export const SKILL_PROGRESSION_MAP: Record<string, SkillProgression> = {
  // Sit progression
  'sit-basic': {
    trickId: 'sit',
    level: 'basic',
    stage: 'stage-003',
    prerequisite: null,
  },
  'sit-generalized': {
    trickId: 'sit',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: 'sit', level: 'basic' },
  },
  'sit-proofed': {
    trickId: 'sit',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { trickId: 'sit', level: 'generalized' },
  },

  // Down progression
  'down-basic': {
    trickId: 'down',
    level: 'basic',
    stage: 'stage-003',
    prerequisite: null,
  },
  'down-generalized': {
    trickId: 'down',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: 'down', level: 'basic' },
  },
  'down-proofed': {
    trickId: 'down',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { trickId: 'down', level: 'generalized' },
  },

  // Stay progression
  'stay-basic': {
    trickId: 'stay',
    level: 'basic',
    stage: 'stage-004',
    prerequisite: { trickId: 'sit', level: 'basic' },
  },
  'stay-generalized': {
    trickId: 'stay',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: 'stay', level: 'basic' },
  },
  'stay-proofed': {
    trickId: 'stay',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { trickId: 'stay', level: 'generalized' },
  },

  // Come/Recall progression
  'come-basic': {
    trickId: 'come',
    level: 'basic',
    stage: 'stage-004',
    prerequisite: null,
  },
  'come-generalized': {
    trickId: 'come',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: 'come', level: 'basic' },
  },
  'come-proofed': {
    trickId: 'come',
    level: 'proofed',
    stage: 'stage-007',
    prerequisite: { trickId: 'come', level: 'generalized' },
  },

  // Leave it progression
  'leave-it-basic': {
    trickId: 'leave-it',
    level: 'basic',
    stage: 'stage-005',
    prerequisite: null,
  },
  'leave-it-generalized': {
    trickId: 'leave-it',
    level: 'generalized',
    stage: 'stage-006',
    prerequisite: { trickId: 'leave-it', level: 'basic' },
  },
  'leave-it-proofed': {
    trickId: 'leave-it',
    level: 'proofed',
    stage: 'stage-007',
    prerequisite: { trickId: 'leave-it', level: 'generalized' },
  },

  // Drop it progression
  'drop-it-basic': {
    trickId: 'drop-it',
    level: 'basic',
    stage: 'stage-005',
    prerequisite: null,
  },
  'drop-it-generalized': {
    trickId: 'drop-it',
    level: 'generalized',
    stage: 'stage-006',
    prerequisite: { trickId: 'drop-it', level: 'basic' },
  },
  'drop-it-proofed': {
    trickId: 'drop-it',
    level: 'proofed',
    stage: 'stage-007',
    prerequisite: { trickId: 'drop-it', level: 'generalized' },
  },
};

// Helper function to get skill key
export function getSkillKey(trickId: string, level: 'basic' | 'generalized' | 'proofed'): string {
  return `${trickId}-${level}`;
}

// Helper function to get progression for a skill
export function getSkillProgression(trickId: string, level: 'basic' | 'generalized' | 'proofed'): SkillProgression | undefined {
  return SKILL_PROGRESSION_MAP[getSkillKey(trickId, level)];
}

// Context options for practice sessions
export const PRACTICE_CONTEXTS = {
  indoor_controlled: 'Indoor - Controlled Environment',
  indoor_busy: 'Indoor - Busy/Active',
  outdoor_quiet: 'Outdoor - Quiet Area',
  outdoor_busy: 'Outdoor - Busy Area',
  different_locations: 'Different Locations',
  with_people: 'Around Other People',
  with_dogs: 'Around Other Dogs',
  with_mild_distractions: 'Mild Distractions',
  with_moderate_distractions: 'Moderate Distractions',
  with_high_distractions: 'High Distractions',
};

// Distraction level descriptions
export const DISTRACTION_LEVELS = {
  none: 'No Distractions',
  mild: 'Mild - Quiet background activity',
  moderate: 'Moderate - Noticeable distractions',
  high: 'High - Very tempting distractions',
};
