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
  'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852-basic': {
    trickId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    level: 'basic',
    stage: 'stage-003',
    prerequisite: null,
  },
  'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852-generalized': {
    trickId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852', level: 'basic' },
  },
  'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852-proofed': {
    trickId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { trickId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852', level: 'generalized' },
  },

  // Down progression
  'fffa5ef5-83e6-4839-92e1-e1badbd88887-basic': {
    trickId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
    level: 'basic',
    stage: 'stage-003',
    prerequisite: null,
  },
  'fffa5ef5-83e6-4839-92e1-e1badbd88887-generalized': {
    trickId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', level: 'basic' },
  },
  'fffa5ef5-83e6-4839-92e1-e1badbd88887-proofed': {
    trickId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { trickId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', level: 'generalized' },
  },

  // Stay progression
  'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b-basic': {
    trickId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
    level: 'basic',
    stage: 'stage-004',
    prerequisite: { trickId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', level: 'basic' },
  },
  'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b-generalized': {
    trickId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b', level: 'basic' },
  },
  'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b-proofed': {
    trickId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { trickId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b', level: 'generalized' },
  },

  // Come progression
  '25cafc44-6396-4c3a-b6de-d203656eac71-basic': {
    trickId: '25cafc44-6396-4c3a-b6de-d203656eac71',
    level: 'basic',
    stage: 'stage-004',
    prerequisite: null,
  },
  '25cafc44-6396-4c3a-b6de-d203656eac71-generalized': {
    trickId: '25cafc44-6396-4c3a-b6de-d203656eac71',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { trickId: '25cafc44-6396-4c3a-b6de-d203656eac71', level: 'basic' },
  },
  '25cafc44-6396-4c3a-b6de-d203656eac71-proofed': {
    trickId: '25cafc44-6396-4c3a-b6de-d203656eac71',
    level: 'proofed',
    stage: 'stage-007',
    prerequisite: { trickId: '25cafc44-6396-4c3a-b6de-d203656eac71', level: 'generalized' },
  },

  // Leave It progression
  '46950108-abb8-48e4-86c4-fd0367e514eb-basic': {
    trickId: '46950108-abb8-48e4-86c4-fd0367e514eb',
    level: 'basic',
    stage: 'stage-005',
    prerequisite: null,
  },
  '46950108-abb8-48e4-86c4-fd0367e514eb-generalized': {
    trickId: '46950108-abb8-48e4-86c4-fd0367e514eb',
    level: 'generalized',
    stage: 'stage-006',
    prerequisite: { trickId: '46950108-abb8-48e4-86c4-fd0367e514eb', level: 'basic' },
  },
  '46950108-abb8-48e4-86c4-fd0367e514eb-proofed': {
    trickId: '46950108-abb8-48e4-86c4-fd0367e514eb',
    level: 'proofed',
    stage: 'stage-007',
    prerequisite: { trickId: '46950108-abb8-48e4-86c4-fd0367e514eb', level: 'generalized' },
  },
};

export function getSkillKey(trickId: string, level: 'basic' | 'generalized' | 'proofed'): string {
  return `${trickId}-${level}`;
}

export function getSkillProgression(
  trickId: string,
  level: 'basic' | 'generalized' | 'proofed'
): SkillProgression | undefined {
  return SKILL_PROGRESSION_MAP[getSkillKey(trickId, level)];
}

// Practice contexts for skill generalization
export const PRACTICE_CONTEXTS: Record<string, string> = {
  'indoors': 'Inside home',
  'outdoors-yard': 'Backyard/garden',
  'outdoors-park': 'Park or open area',
  'public-quiet': 'Quiet public space',
  'public-busy': 'Busy public space',
  'around-people': 'Around other people',
  'around-dogs': 'Around other dogs',
};

// Distraction levels for proofing
export const DISTRACTION_LEVELS: Record<string, string> = {
  'none': 'No distractions',
  'mild': 'Mild distractions',
  'moderate': 'Moderate distractions',
  'high': 'High distractions',
};
