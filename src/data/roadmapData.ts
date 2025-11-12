// Training Programs Roadmap - Chronological journey from pre-puppy to adult dog

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  ageRangeWeeks: { min: number; max: number | null }; // null means ongoing
  color: string;
  icon: string;
  topics: {
    id: string;
    type: 'foundation' | 'troubleshooting' | 'skill';
    level?: 'basic' | 'generalized' | 'proofed'; // For skills only
  }[];
}

export const TRAINING_ROADMAP: RoadmapStage[] = [
  {
    id: 'stage-001',
    title: 'Pre-Puppy Preparation',
    description: 'Get ready before your puppy arrives',
    ageRangeWeeks: { min: 0, max: 0 },
    color: 'from-blue-500 to-blue-600',
    icon: 'Home',
    topics: [
      { id: 'foundation-topic-001', type: 'foundation' }, // Preparing for Your New Dog
    ],
  },
  {
    id: 'stage-002',
    title: 'First Week Home (8 weeks)',
    description: 'Critical first days establishing routines and trust',
    ageRangeWeeks: { min: 8, max: 9 },
    color: 'from-purple-500 to-purple-600',
    icon: 'Calendar',
    topics: [
      { id: 'foundation-topic-002', type: 'foundation' }, // The First Days at Home
    ],
  },
  {
    id: 'stage-003',
    title: 'Weeks 2-4: Building Foundations',
    description: 'Crate training, house training, and settling in',
    ageRangeWeeks: { min: 9, max: 12 },
    color: 'from-amber-500 to-amber-600',
    icon: 'Box',
    topics: [
      { id: 'foundation-topic-003', type: 'foundation' }, // Crate & Alone-Time Training
      { id: 'foundation-topic-007', type: 'foundation' }, // House Training Mastery
      { id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852', type: 'skill', level: 'basic' }, // Sit
      { id: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', type: 'skill', level: 'basic' }, // Down
    ],
  },
  {
    id: 'stage-004',
    title: 'Weeks 4-16: Critical Socialization',
    description: 'Prime socialization window for confident adult behavior',
    ageRangeWeeks: { min: 12, max: 16 },
    color: 'from-emerald-500 to-emerald-600',
    icon: 'Users',
    topics: [
      { id: 'foundation-topic-004', type: 'foundation' }, // Puppy Socialization
      { id: 'foundation-topic-006', type: 'foundation' }, // Preventing & Managing Common Puppy Behaviors
      { id: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b', type: 'skill', level: 'basic' }, // Stay
      { id: '25cafc44-6396-4c3a-b6de-d203656eac71', type: 'skill', level: 'basic' }, // Come
    ],
  },
  {
    id: 'stage-005',
    title: 'Months 4-6: Foundation Life Skills',
    description: 'Essential obedience and self-control',
    ageRangeWeeks: { min: 16, max: 26 },
    color: 'from-cyan-500 to-cyan-600',
    icon: 'Award',
    topics: [
      { id: 'foundation-topic-005', type: 'foundation' }, // Foundation Life Skills
      { id: 'foundation-topic-008', type: 'foundation' }, // Leash Walking Foundations
      { id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852', type: 'skill', level: 'generalized' }, // Sit
      { id: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', type: 'skill', level: 'generalized' }, // Down
      { id: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b', type: 'skill', level: 'generalized' }, // Stay
      { id: '25cafc44-6396-4c3a-b6de-d203656eac71', type: 'skill', level: 'generalized' }, // Come
      { id: '46950108-abb8-48e4-86c4-fd0367e514eb', type: 'skill', level: 'basic' }, // Leave It
    ],
  },
  {
    id: 'stage-006',
    title: 'Months 6-12: Adolescence & Refinement',
    description: 'Navigate teenage phase and refine training',
    ageRangeWeeks: { min: 26, max: 52 },
    color: 'from-orange-500 to-orange-600',
    icon: 'Zap',
    topics: [
      { id: 'foundation-topic-009', type: 'foundation' }, // Core Obedience Commands
      { id: 'troubleshooting-topic-001', type: 'troubleshooting' }, // Understanding Behavior Problems
      { id: 'troubleshooting-topic-002', type: 'troubleshooting' }, // Excessive Barking
      { id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852', type: 'skill', level: 'proofed' }, // Sit
      { id: 'fffa5ef5-83e6-4839-92e1-e1badbd88887', type: 'skill', level: 'proofed' }, // Down
      { id: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b', type: 'skill', level: 'proofed' }, // Stay
      { id: '46950108-abb8-48e4-86c4-fd0367e514eb', type: 'skill', level: 'generalized' }, // Leave It
    ],
  },
  {
    id: 'stage-007',
    title: 'Year 1+: Advanced Training & Troubleshooting',
    description: 'Address challenges and continue learning',
    ageRangeWeeks: { min: 52, max: null },
    color: 'from-indigo-500 to-indigo-600',
    icon: 'Trophy',
    topics: [
      { id: 'foundation-topic-010', type: 'foundation' }, // Advanced Training Concepts
      { id: 'troubleshooting-topic-003', type: 'troubleshooting' }, // Leash Pulling
      { id: 'troubleshooting-topic-004', type: 'troubleshooting' }, // Jumping on People
      { id: 'troubleshooting-topic-005', type: 'troubleshooting' }, // Resource Guarding
      { id: 'troubleshooting-topic-006', type: 'troubleshooting' }, // Separation Anxiety
      { id: 'troubleshooting-topic-007', type: 'troubleshooting' }, // Fear & Anxiety
      { id: 'troubleshooting-topic-008', type: 'troubleshooting' }, // Dog Reactivity
      { id: 'troubleshooting-topic-009', type: 'troubleshooting' }, // Destructive Behavior
      { id: '25cafc44-6396-4c3a-b6de-d203656eac71', type: 'skill', level: 'proofed' }, // Come
      { id: '46950108-abb8-48e4-86c4-fd0367e514eb', type: 'skill', level: 'proofed' }, // Leave It
    ],
  },
];
