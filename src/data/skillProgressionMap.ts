// Skill Progression Map - Defines when skills appear in the roadmap and their prerequisites

export interface SkillProgression {
  skillId: string;
  level: 'basic' | 'generalized' | 'proofed';
  stage: string;
  prerequisite: { skillId: string; level: 'basic' | 'generalized' | 'proofed' } | null;
}

// Maps skill ID + level to roadmap stage and prerequisite
export const SKILL_PROGRESSION_MAP: Record<string, SkillProgression> = {
  // Sit progression
  'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852-basic': {
    skillId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    level: 'basic',
    stage: 'stage-003',
    prerequisite: null,
  },
  'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852-generalized': {
    skillId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { skillId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852', level: 'basic' },
  },
  'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852-proofed': {
    skillId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { skillId: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852', level: 'generalized' },
  },

  // Down progression
  'fffa5ef5-83e6-4839-92e1-e1badbd88887-basic': {
    skillId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
    level: 'basic',
    stage: 'stage-003',
    prerequisite: null,
  },
  'fffa5ef5-83e6-4839-92e1-e1badbd88887-generalized': {
    skillId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { skillId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', level: 'basic' },
  },
  'fffa5ef5-83e6-4839-92e1-e1badbd88887-proofed': {
    skillId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { skillId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', level: 'generalized' },
  },

  // Stay progression
  'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b-basic': {
    skillId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
    level: 'basic',
    stage: 'stage-004',
    prerequisite: { skillId: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', level: 'basic' },
  },
  'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b-generalized': {
    skillId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { skillId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b', level: 'basic' },
  },
  'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b-proofed': {
    skillId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
    level: 'proofed',
    stage: 'stage-006',
    prerequisite: { skillId: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b', level: 'generalized' },
  },

  // Come progression
  '25cafc44-6396-4c3a-b6de-d203656eac71-basic': {
    skillId: '25cafc44-6396-4c3a-b6de-d203656eac71',
    level: 'basic',
    stage: 'stage-004',
    prerequisite: null,
  },
  '25cafc44-6396-4c3a-b6de-d203656eac71-generalized': {
    skillId: '25cafc44-6396-4c3a-b6de-d203656eac71',
    level: 'generalized',
    stage: 'stage-005',
    prerequisite: { skillId: '25cafc44-6396-4c3a-b6de-d203656eac71', level: 'basic' },
  },
  '25cafc44-6396-4c3a-b6de-d203656eac71-proofed': {
    skillId: '25cafc44-6396-4c3a-b6de-d203656eac71',
    level: 'proofed',
    stage: 'stage-007',
    prerequisite: { skillId: '25cafc44-6396-4c3a-b6de-d203656eac71', level: 'generalized' },
  },

  // Leave It progression
  '46950108-abb8-48e4-86c4-fd0367e514eb-basic': {
    skillId: '46950108-abb8-48e4-86c4-fd0367e514eb',
    level: 'basic',
    stage: 'stage-005',
    prerequisite: null,
  },
  '46950108-abb8-48e4-86c4-fd0367e514eb-generalized': {
    skillId: '46950108-abb8-48e4-86c4-fd0367e514eb',
    level: 'generalized',
    stage: 'stage-006',
    prerequisite: { skillId: '46950108-abb8-48e4-86c4-fd0367e514eb', level: 'basic' },
  },
  '46950108-abb8-48e4-86c4-fd0367e514eb-proofed': {
    skillId: '46950108-abb8-48e4-86c4-fd0367e514eb',
    level: 'proofed',
    stage: 'stage-007',
    prerequisite: { skillId: '46950108-abb8-48e4-86c4-fd0367e514eb', level: 'generalized' },
  },

  // Heel progression
  '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7-basic': {
    skillId: '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7',
    level: 'basic',
    stage: 'stage-006',
    prerequisite: null,
  },
  '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7-generalized': {
    skillId: '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7',
    level: 'generalized',
    stage: 'stage-007',
    prerequisite: { skillId: '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7', level: 'basic' },
  },
  '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7-proofed': {
    skillId: '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7',
    level: 'proofed',
    stage: 'stage-008',
    prerequisite: { skillId: '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7', level: 'generalized' },
  },
};

export function getSkillKey(skillId: string, level: 'basic' | 'generalized' | 'proofed'): string {
  return `${skillId}-${level}`;
}

export function getSkillProgression(
  skillId: string,
  level: 'basic' | 'generalized' | 'proofed'
): SkillProgression | undefined {
  return SKILL_PROGRESSION_MAP[getSkillKey(skillId, level)];
}

// Practice contexts for skill generalization
export const PRACTICE_CONTEXTS: Record<string, string> = {
  home_indoor: 'Home (Indoor)',
  home_outdoor: 'Home (Outdoor/Yard)',
  neighborhood: 'Neighborhood Walk',
  park: 'Park',
  pet_store: 'Pet Store',
  vet_clinic: 'Vet Clinic',
  friend_home: "Friend's/Family Home",
  car: 'Car',
  busy_street: 'Busy Street',
};

// Distraction levels for skill proofing
export const DISTRACTION_LEVELS: Record<string, string> = {
  none: 'No Distractions',
  mild: 'Mild (Some noise/movement)',
  moderate: 'Moderate (People/dogs nearby)',
  high: 'High (Busy environment)',
};
