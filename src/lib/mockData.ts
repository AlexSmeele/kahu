// Mock data for dev mode bypass
// Based on data from alexsmeele@gmail.com account

import { 
  generateHistoricalActivityRecords, 
  generateHistoricalMealRecords,
  generateHistoricalWeightRecords,
  generateHistoricalHealthCheckups,
  generateHistoricalVetVisits,
  generateHistoricalGroomingRecords,
  generateHistoricalVaccinations,
  generateHistoricalInjuries,
  generateHistoricalMedicalTreatments,
} from './generateHistoricalMockData';
import { calculateCalories } from './mockDataPatterns';

export const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export const MOCK_DOG_IDS = {
  SUKI: '00000000-0000-0000-0000-000000000011',
  JETT: '00000000-0000-0000-0000-000000000012',
};

export const REAL_DOG_IDS = {
  SUKI: 'b450a8fe-855c-4176-b9bc-8da19de0ec30',
  JETT: '00cec743-bb6f-4895-8f10-5c2adabf8d72',
};

// Generate extensive historical data (3 months) for both dogs
const historicalActivities = [
  ...generateHistoricalActivityRecords(MOCK_DOG_IDS.SUKI, 10, 3),
  ...generateHistoricalActivityRecords(MOCK_DOG_IDS.JETT, 16, 3),
];

const historicalMeals = [
  ...generateHistoricalMealRecords(MOCK_DOG_IDS.SUKI, '00000000-0000-0000-0000-000000000051', 1.5, 3), // 1.5 cups daily
  ...generateHistoricalMealRecords(MOCK_DOG_IDS.JETT, '00000000-0000-0000-0000-000000000052', 3.2, 3), // 3.2 cups daily
];

const historicalWeights = [
  ...generateHistoricalWeightRecords(MOCK_DOG_IDS.SUKI, 9.5, 3),
  ...generateHistoricalWeightRecords(MOCK_DOG_IDS.JETT, 15, 3),
];

const historicalCheckups = [
  ...generateHistoricalHealthCheckups(MOCK_DOG_IDS.SUKI, 3),
  ...generateHistoricalHealthCheckups(MOCK_DOG_IDS.JETT, 3),
];

const historicalVetVisits = [
  ...generateHistoricalVetVisits(MOCK_DOG_IDS.SUKI, 3),
  ...generateHistoricalVetVisits(MOCK_DOG_IDS.JETT, 3),
];

const historicalGrooming = [
  ...generateHistoricalGroomingRecords(MOCK_DOG_IDS.SUKI, 3),
  ...generateHistoricalGroomingRecords(MOCK_DOG_IDS.JETT, 3),
];

const historicalVaccinations = [
  ...generateHistoricalVaccinations(MOCK_DOG_IDS.SUKI, 3),
  ...generateHistoricalVaccinations(MOCK_DOG_IDS.JETT, 3),
];

const historicalInjuries = [
  ...generateHistoricalInjuries(MOCK_DOG_IDS.SUKI, 3),
  ...generateHistoricalInjuries(MOCK_DOG_IDS.JETT, 3),
];

const historicalTreatments = [
  ...generateHistoricalMedicalTreatments(MOCK_DOG_IDS.SUKI, 3),
  ...generateHistoricalMedicalTreatments(MOCK_DOG_IDS.JETT, 3),
];


export const MOCK_WEIGHT_RECORDS = [
  // Recent weight records
  {
    id: '00000000-0000-0000-0000-000000000021',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 10,
    date: '2025-09-05T13:36:00Z',
    notes: null,
    created_at: '2025-09-05T13:36:00Z',
    updated_at: '2025-09-05T13:36:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000022',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 10.2,
    date: '2025-05-05T13:46:00Z',
    notes: null,
    created_at: '2025-05-05T13:46:00Z',
    updated_at: '2025-05-05T13:46:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000023',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 9.8,
    date: '2024-09-05T13:46:00Z',
    notes: null,
    created_at: '2024-09-05T13:46:00Z',
    updated_at: '2024-09-05T13:46:00Z',
  },
  // Jett's weight records
  {
    id: '00000000-0000-0000-0000-000000000024',
    dog_id: MOCK_DOG_IDS.JETT,
    weight: 16,
    date: '2025-09-05T14:25:00Z',
    notes: null,
    created_at: '2025-09-05T14:25:00Z',
    updated_at: '2025-09-05T14:25:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000025',
    dog_id: MOCK_DOG_IDS.JETT,
    weight: 11.5,
    date: '2024-02-05T13:35:00Z',
    notes: 'Puppy weight at 2 months old',
    created_at: '2024-02-05T13:35:00Z',
    updated_at: '2024-02-05T13:35:00Z',
  },
  // Add 3 months of historical weight records
  ...historicalWeights,
];

// Define trick objects first
const TRICK_SIT = {
  id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
  name: 'Sit',
  category: 'Obedience',
  description: 'Dog sits on command',
  instructions: 'Hold treat above dog\'s nose, move it back, reward when bottom touches ground.',
  difficulty_level: 1,
  estimated_time_weeks: 1,
  prerequisites: [],
  priority_order: 1,
  created_at: new Date().toISOString(),
};

const TRICK_ZEN_SIT = {
  id: '93083768-8422-425d-9433-814151d08262',
  name: 'Zen Sit',
  category: 'Obedience',
  description: 'Dog sits calmly and waits without fidgeting.',
  instructions: 'Build on Sit. Reward longer durations of calm sitting. Add distractions gradually.',
  difficulty_level: 1,
  estimated_time_weeks: 1,
  prerequisites: ['Sit'],
  priority_order: 2,
  created_at: new Date().toISOString(),
};

const TRICK_DOWN = {
  id: 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
  name: 'Down (Lie Down)',
  category: 'Obedience',
  description: 'Dog lies down on command',
  instructions: 'From sit position, lower treat to ground between paws. Reward when dog lies down.',
  difficulty_level: 1,
  estimated_time_weeks: 2,
  prerequisites: ['Sit'],
  priority_order: 3,
  created_at: new Date().toISOString(),
};

const TRICK_ZEN_DOWN = {
  id: 'c77ce746-46c6-42dd-9017-98b044aa2bdc',
  name: 'Zen Down',
  category: 'Obedience',
  description: 'Dog lies down in a calm, relaxed state.',
  instructions: 'Build on Down. Reward relaxed body language. Increase duration and add distractions.',
  difficulty_level: 1,
  estimated_time_weeks: 1,
  prerequisites: ['Down (Lie Down)'],
  priority_order: 4,
  created_at: new Date().toISOString(),
};

const TRICK_WAIT = {
  id: 'd66490a3-4b59-4c7c-9d9c-b625a5ce4813',
  name: 'Wait',
  category: 'Obedience',
  description: 'Dog pauses and holds position briefly, different from Stay.',
  instructions: 'Similar to Stay but shorter duration. Dog waits at doors, before crossing streets. Release with "Okay".',
  difficulty_level: 1,
  estimated_time_weeks: 1,
  prerequisites: ['Sit'],
  priority_order: 5,
  created_at: new Date().toISOString(),
};

const TRICK_STAY = {
  id: 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
  name: 'Stay',
  category: 'Obedience',
  description: 'Dog remains in position until released',
  instructions: 'Start with down. Use hand signal. Step back. Return and reward. Gradually increase distance and duration.',
  difficulty_level: 2,
  estimated_time_weeks: 2,
  prerequisites: ['Down (Lie Down)'],
  priority_order: 6,
  created_at: new Date().toISOString(),
};

const TRICK_WRONG = {
  id: 'cd29e911-266e-4c43-a2d3-d92443827a86',
  name: 'Wrong',
  category: 'Foundation',
  description: 'Non-reward marker - indicates dog made wrong choice without punishment.',
  instructions: 'When dog makes wrong choice, say "Wrong" in neutral tone and withhold reward. Then redirect to correct behavior.',
  difficulty_level: 1,
  estimated_time_weeks: 1,
  prerequisites: [],
  priority_order: 7,
  created_at: new Date().toISOString(),
};

const TRICK_NO = {
  id: '417ad562-6d8b-4f17-bf2b-494674cb8524',
  name: 'No',
  category: 'Obedience',
  description: 'Inhibits unwanted behavior. Critical timing and tone.',
  instructions: 'IMPORTANT: Introduce only after solid foundation. Use firm but not harsh tone. Follow immediately with redirect to acceptable behavior. Never use harshly or frequently.',
  difficulty_level: 2,
  estimated_time_weeks: 2,
  prerequisites: ['Wrong'],
  priority_order: 8,
  created_at: new Date().toISOString(),
};

const TRICK_LEAVE_IT = {
  id: '46950108-abb8-48e4-86c4-fd0367e514eb',
  name: 'Leave It',
  category: 'Obedience',
  description: 'Dog ignores item or distraction on cue.',
  instructions: 'Cover treat with hand. Say "Leave it". Reward when dog stops trying. Progress to uncovered treats.',
  difficulty_level: 2,
  estimated_time_weeks: 2,
  prerequisites: ['Wait'],
  priority_order: 9,
  created_at: new Date().toISOString(),
};

const TRICK_OFF = {
  id: '1150e1a3-8e3e-4bc8-9d70-5d6b911d9951',
  name: 'Off',
  category: 'Obedience',
  description: 'Dog gets off furniture or stops jumping on people.',
  instructions: 'When dog jumps, turn away. Say "Off". Reward when four paws on ground. Consistent with all family.',
  difficulty_level: 1,
  estimated_time_weeks: 1,
  prerequisites: [],
  priority_order: 10,
  created_at: new Date().toISOString(),
};

const TRICK_MAT = {
  id: '0babf046-6a1f-4903-8a9c-554fd444e57d',
  name: 'On your mat/bed',
  category: 'Obedience',
  description: 'Dog goes to designated spot and settles.',
  instructions: 'Use mat or bed. Lure dog to spot. Say "Place" or "Bed". Reward. Build duration.',
  difficulty_level: 2,
  estimated_time_weeks: 2,
  prerequisites: ['Down (Lie Down)'],
  priority_order: 11,
  created_at: new Date().toISOString(),
};

const TRICK_HEEL = {
  id: '696f0107-fee1-4d23-8fa4-0a1dc4860c79',
  name: 'Heel',
  category: 'Obedience',
  description: 'Dog walks calmly beside handler at knee level.',
  instructions: 'Start in quiet area. Reward position at knee. Stop if dog pulls. Build duration and add distractions.',
  difficulty_level: 3,
  estimated_time_weeks: 3,
  prerequisites: ['Come / Recall'],
  priority_order: 12,
  created_at: new Date().toISOString(),
};

const TRICK_COME = {
  id: '25cafc44-6396-4c3a-b6de-d203656eac71',
  name: 'Come / Recall',
  category: 'Obedience',
  description: 'Dog comes to you when called',
  instructions: 'Say name followed by "come". Use excited tone. Reward heavily when dog arrives.',
  difficulty_level: 1,
  estimated_time_weeks: 3,
  prerequisites: [],
  priority_order: 13,
  created_at: new Date().toISOString(),
};

const TRICK_NICELY = {
  id: '9768bb43-d36a-44da-b0c2-90fbd7d4fb0a',
  name: 'Nicely',
  category: 'Obedience',
  description: 'Dog approaches people or things gently and calmly.',
  instructions: 'Use when dog gets excited. Reward calm, gentle behavior around people, food, toys. Consistent cue for self-control.',
  difficulty_level: 2,
  estimated_time_weeks: 2,
  prerequisites: ['Zen Sit', 'Wait'],
  priority_order: 14,
  created_at: new Date().toISOString(),
};

export const MOCK_DOG_TRICKS = [
  // All 14 priority tricks for Suki (prerequisites mastered, rest learning)
  {
    id: '00000000-0000-0000-0000-000000000031',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_SIT.id,
    status: 'learning' as const,
    total_sessions: 8,
    started_at: '2025-01-10T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_SIT,
  },
  {
    id: '00000000-0000-0000-0000-000000000032',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_ZEN_SIT.id,
    status: 'learning' as const,
    total_sessions: 5,
    started_at: '2025-01-15T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_ZEN_SIT,
  },
  {
    id: '00000000-0000-0000-0000-000000000033',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_DOWN.id,
    status: 'learning' as const,
    total_sessions: 6,
    started_at: '2025-01-16T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-16T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_DOWN,
  },
  {
    id: '00000000-0000-0000-0000-000000000034',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_ZEN_DOWN.id,
    status: 'learning' as const,
    total_sessions: 4,
    started_at: '2025-01-18T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-18T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_ZEN_DOWN,
  },
  {
    id: '00000000-0000-0000-0000-000000000035',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_WAIT.id,
    status: 'learning' as const,
    total_sessions: 7,
    started_at: '2025-01-17T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-17T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_WAIT,
  },
  {
    id: '00000000-0000-0000-0000-000000000036',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_STAY.id,
    status: 'learning' as const,
    total_sessions: 8,
    started_at: '2025-01-20T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-20T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_STAY,
  },
  {
    id: '00000000-0000-0000-0000-000000000037',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_WRONG.id,
    status: 'learning' as const,
    total_sessions: 4,
    started_at: '2025-01-18T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-18T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_WRONG,
  },
  {
    id: '00000000-0000-0000-0000-000000000038',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_NO.id,
    status: 'learning' as const,
    total_sessions: 3,
    started_at: '2025-01-22T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-22T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_NO,
  },
  {
    id: '00000000-0000-0000-0000-000000000039',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_LEAVE_IT.id,
    status: 'learning' as const,
    total_sessions: 5,
    started_at: '2025-01-23T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-23T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_LEAVE_IT,
  },
  {
    id: '00000000-0000-0000-0000-00000000003A',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_OFF.id,
    status: 'learning' as const,
    total_sessions: 4,
    started_at: '2025-01-24T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-24T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_OFF,
  },
  {
    id: '00000000-0000-0000-0000-00000000003B',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_MAT.id,
    status: 'learning' as const,
    total_sessions: 6,
    started_at: '2025-01-25T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-25T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_MAT,
  },
  {
    id: '00000000-0000-0000-0000-00000000003C',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_COME.id,
    status: 'learning' as const,
    total_sessions: 9,
    started_at: '2025-01-20T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-20T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_COME,
  },
  {
    id: '00000000-0000-0000-0000-00000000003D',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_HEEL.id,
    status: 'learning' as const,
    total_sessions: 7,
    started_at: '2025-01-28T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-28T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_HEEL,
  },
  {
    id: '00000000-0000-0000-0000-00000000003E',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: TRICK_NICELY.id,
    status: 'learning' as const,
    total_sessions: 5,
    started_at: '2025-01-28T10:00:00Z',
    mastered_at: null,
    created_at: '2025-01-28T10:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_NICELY,
  },
  // All 14 priority tricks for Jett (prerequisites mastered, rest learning)
  {
    id: '00000000-0000-0000-0000-000000000041',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_SIT.id,
    status: 'learning' as const,
    total_sessions: 7,
    started_at: '2025-01-12T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-12T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_SIT,
  },
  {
    id: '00000000-0000-0000-0000-000000000042',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_ZEN_SIT.id,
    status: 'learning' as const,
    total_sessions: 4,
    started_at: '2025-01-18T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-18T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_ZEN_SIT,
  },
  {
    id: '00000000-0000-0000-0000-000000000043',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_DOWN.id,
    status: 'learning' as const,
    total_sessions: 5,
    started_at: '2025-01-19T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-19T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_DOWN,
  },
  {
    id: '00000000-0000-0000-0000-000000000044',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_ZEN_DOWN.id,
    status: 'learning' as const,
    total_sessions: 3,
    started_at: '2025-01-18T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-18T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_ZEN_DOWN,
  },
  {
    id: '00000000-0000-0000-0000-000000000045',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_WAIT.id,
    status: 'learning' as const,
    total_sessions: 6,
    started_at: '2025-01-20T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-20T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_WAIT,
  },
  {
    id: '00000000-0000-0000-0000-000000000046',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_STAY.id,
    status: 'learning' as const,
    total_sessions: 7,
    started_at: '2025-01-20T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-20T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_STAY,
  },
  {
    id: '00000000-0000-0000-0000-000000000047',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_WRONG.id,
    status: 'learning' as const,
    total_sessions: 3,
    started_at: '2025-01-21T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-21T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_WRONG,
  },
  {
    id: '00000000-0000-0000-0000-000000000048',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_NO.id,
    status: 'learning' as const,
    total_sessions: 2,
    started_at: '2025-01-22T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-22T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_NO,
  },
  {
    id: '00000000-0000-0000-0000-000000000049',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_LEAVE_IT.id,
    status: 'learning' as const,
    total_sessions: 4,
    started_at: '2025-01-23T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-23T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_LEAVE_IT,
  },
  {
    id: '00000000-0000-0000-0000-00000000004A',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_OFF.id,
    status: 'learning' as const,
    total_sessions: 3,
    started_at: '2025-01-24T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-24T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_OFF,
  },
  {
    id: '00000000-0000-0000-0000-00000000004B',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_MAT.id,
    status: 'learning' as const,
    total_sessions: 5,
    started_at: '2025-01-25T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-25T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_MAT,
  },
  {
    id: '00000000-0000-0000-0000-00000000004C',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_COME.id,
    status: 'learning' as const,
    total_sessions: 8,
    started_at: '2025-01-22T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-22T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_COME,
  },
  {
    id: '00000000-0000-0000-0000-00000000004D',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_HEEL.id,
    status: 'learning' as const,
    total_sessions: 6,
    started_at: '2025-01-29T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-29T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_HEEL,
  },
  {
    id: '00000000-0000-0000-0000-00000000004E',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: TRICK_NICELY.id,
    status: 'learning' as const,
    total_sessions: 4,
    started_at: '2025-01-28T11:00:00Z',
    mastered_at: null,
    created_at: '2025-01-28T11:00:00Z',
    updated_at: new Date().toISOString(),
    trick: TRICK_NICELY,
  },
];

export const MOCK_ACTIVITY_GOALS = [
  // Suki's activity goal
  {
    id: '00000000-0000-0000-0000-000000000041',
    dog_id: MOCK_DOG_IDS.SUKI,
    target_minutes: 45,
    target_distance_km: 0,
    activity_level: 'low',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Jett's activity goal
  {
    id: '00000000-0000-0000-0000-000000000042',
    dog_id: MOCK_DOG_IDS.JETT,
    target_minutes: 60,
    target_distance_km: 0,
    activity_level: 'moderate',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_NUTRITION_PLANS = [
  // Suki's nutrition plan (Shiba Inu, 10kg, 10 years old, raw diet)
  {
    id: '00000000-0000-0000-0000-000000000051',
    dog_id: MOCK_DOG_IDS.SUKI,
    food_type: 'raw',
    diet_type: 'raw',
    brand: 'Raw Essentials',
    daily_amount: 1.5,
    daily_calories: 450,
    feeding_times: 2,
    meal_frequency: 2,
    meal_schedule: [
      {
        time: '07:30',
        amount: 0.75,
        food_type: 'Raw Food',
        reminder_enabled: true,
        name: 'Breakfast',
        components: [
          { name: 'Premium Beef Raw', amount: 0.5, unit: 'cups', category: 'raw' },
          { name: 'Green Tripe', amount: 0.15, unit: 'cups', category: 'raw' },
          { name: 'Vegetables Mix', amount: 0.1, unit: 'cups', category: 'raw' },
        ]
      },
      {
        time: '17:30',
        amount: 0.75,
        food_type: 'Raw Food',
        reminder_enabled: true,
        name: 'Dinner',
        components: [
          { name: 'Premium Beef Raw', amount: 0.5, unit: 'cups', category: 'raw' },
          { name: 'Green Tripe', amount: 0.15, unit: 'cups', category: 'raw' },
          { name: 'Vegetables Mix', amount: 0.1, unit: 'cups', category: 'raw' },
        ]
      },
    ],
    special_instructions: 'Raw Food: Large meat cube or puck; Raw Food: Small tripe cubes',
    bowl_last_cleaned: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    water_bowl_last_cleaned: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Jett's nutrition plan (Mini Aussie, 16kg, 2 years old, kibble)
  {
    id: '00000000-0000-0000-0000-000000000052',
    dog_id: MOCK_DOG_IDS.JETT,
    food_type: 'dry',
    diet_type: 'dry',
    brand: 'Royal Canin',
    daily_amount: 3,
    daily_calories: 950,
    feeding_times: 2,
    meal_frequency: 2,
    meal_schedule: [
      {
        time: '07:30',
        amount: 1.5,
        food_type: 'Dry Kibble',
        reminder_enabled: true,
        name: 'Breakfast',
        components: [
          { name: 'Royal Canin Puppy Formula', amount: 1.5, unit: 'cups', category: 'kibble' },
          { name: 'Chicken Broth', amount: 0.25, unit: 'cups', category: 'wet' },
        ]
      },
      {
        time: '17:30',
        amount: 1.5,
        food_type: 'Dry Kibble',
        reminder_enabled: true,
        name: 'Dinner',
        components: [
          { name: 'Royal Canin Puppy Formula', amount: 1.5, unit: 'cups', category: 'kibble' },
          { name: 'Chicken Broth', amount: 0.25, unit: 'cups', category: 'wet' },
        ]
      },
    ],
    special_instructions: 'High-protein puppy formula for growth. Add warm water to soften.',
    bowl_last_cleaned: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    water_bowl_last_cleaned: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_ACTIVITY_RECORDS: any[] = [
  // Recent manually defined activities for immediate context
  // Today - Multiple activities
  {
    id: '00000000-0000-0000-0000-000000000061',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 30,
    distance_km: 2.5,
    calories_burned: calculateCalories('walk', 30, 2.5, 10), // 100 cal
    start_time: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    notes: 'Morning walk around the park',
    tracking_method: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000062',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'play',
    duration_minutes: 20,
    calories_burned: calculateCalories('play', 20, 0, 10), // 80 cal
    start_time: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(16, 20, 0, 0)).toISOString(),
    notes: 'Fetch in the backyard',
    tracking_method: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Add 6 months of historical data
  ...historicalActivities,
  // Yesterday - 3 activities
  {
    id: '00000000-0000-0000-0000-000000000063',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 35,
    distance_km: 3.2,
    calories_burned: calculateCalories('walk', 35, 3.2, 10), // 117 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(7, 15, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(7, 50, 0, 0),
    notes: 'Long morning walk',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000064',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'run',
    duration_minutes: 15,
    distance_km: 1.8,
    calories_burned: calculateCalories('run', 15, 1.8, 10), // 80 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12, 30, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12, 45, 0, 0),
    notes: 'Quick run',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000065',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 25,
    distance_km: 2.0,
    calories_burned: calculateCalories('walk', 25, 2.0, 10), // 83 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(18, 0, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(18, 25, 0, 0),
    notes: 'Evening walk',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
  // 2 days ago
  {
    id: '00000000-0000-0000-0000-000000000066',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 40,
    distance_km: 3.5,
    calories_burned: calculateCalories('walk', 40, 3.5, 10), // 133 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(8, 0, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(8, 40, 0, 0),
    notes: 'Park visit',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000067',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'play',
    duration_minutes: 30,
    calories_burned: calculateCalories('play', 30, 0, 10), // 120 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(15, 30, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(16, 0, 0, 0),
    notes: 'Dog park playdate',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
  // 3 days ago
  {
    id: '00000000-0000-0000-0000-000000000068',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 28,
    distance_km: 2.3,
    calories_burned: calculateCalories('walk', 28, 2.3, 10), // 93 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(7, 45, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(8, 13, 0, 0),
    notes: 'Morning routine',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000069',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 22,
    distance_km: 1.8,
    calories_burned: calculateCalories('walk', 22, 1.8, 10), // 73 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(17, 30, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(17, 52, 0, 0),
    notes: 'Quick evening walk',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
  },
  // 4 days ago
  {
    id: '00000000-0000-0000-0000-00000000006A',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 45,
    distance_km: 4.0,
    calories_burned: calculateCalories('walk', 45, 4.0, 10), // 150 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 4)).setHours(8, 30, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 4)).setHours(9, 15, 0, 0),
    notes: 'Long weekend walk',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-00000000006B',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'play',
    duration_minutes: 35,
    calories_burned: calculateCalories('play', 35, 0, 10), // 140 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 4)).setHours(14, 0, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 4)).setHours(14, 35, 0, 0),
    notes: 'Agility training',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
  },
  // 5 days ago
  {
    id: '00000000-0000-0000-0000-00000000006C',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 32,
    distance_km: 2.7,
    calories_burned: calculateCalories('walk', 32, 2.7, 10), // 107 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 5)).setHours(7, 20, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 5)).setHours(7, 52, 0, 0),
    notes: 'Morning walk',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-00000000006D',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'run',
    duration_minutes: 18,
    distance_km: 2.1,
    calories_burned: calculateCalories('run', 18, 2.1, 10), // 96 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 5)).setHours(16, 30, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 5)).setHours(16, 48, 0, 0),
    notes: 'Jog around neighborhood',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
  },
  // 6 days ago
  {
    id: '00000000-0000-0000-0000-00000000006E',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 27,
    distance_km: 2.2,
    calories_burned: calculateCalories('walk', 27, 2.2, 10), // 90 cal
    start_time: new Date(new Date().setDate(new Date().getDate() - 6)).setHours(8, 10, 0, 0),
    end_time: new Date(new Date().setDate(new Date().getDate() - 6)).setHours(8, 37, 0, 0),
    notes: 'Regular walk',
    tracking_method: 'manual',
    created_at: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-00000000006F',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 25,
    distance_km: 1.8,
    calories_burned: calculateCalories('walk', 25, 1.8, 10), // 83 cal
    start_time: '2025-10-22T08:30:00Z',
    end_time: '2025-10-22T08:55:00Z',
    tracking_method: 'manual',
    notes: 'Morning walk around the park',
    created_at: '2025-10-22T08:55:00Z',
    updated_at: '2025-10-22T08:55:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000062',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'play',
    duration_minutes: 15,
    distance_km: 0.3,
    calories_burned: calculateCalories('play', 15, 0.3, 10), // 60 cal
    start_time: '2025-10-22T12:00:00Z',
    end_time: '2025-10-22T12:15:00Z',
    tracking_method: 'manual',
    notes: 'Fetch in the backyard',
    created_at: '2025-10-22T12:15:00Z',
    updated_at: '2025-10-22T12:15:00Z',
  },
  // Suki yesterday
  {
    id: '00000000-0000-0000-0000-000000000064',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 30,
    distance_km: 2.1,
    calories_burned: calculateCalories('walk', 30, 2.1, 10), // 100 cal
    start_time: '2025-10-21T09:00:00Z',
    end_time: '2025-10-21T09:30:00Z',
    tracking_method: 'manual',
    created_at: '2025-10-21T09:30:00Z',
    updated_at: '2025-10-21T09:30:00Z',
  },
  // Jett today (16kg dog)
  {
    id: '00000000-0000-0000-0000-000000000063',
    dog_id: MOCK_DOG_IDS.JETT,
    activity_type: 'run',
    duration_minutes: 35,
    distance_km: 3.2,
    calories_burned: calculateCalories('run', 35, 3.2, 16), // 299 cal
    start_time: '2025-10-22T07:10:00Z',
    end_time: '2025-10-22T07:45:00Z',
    tracking_method: 'manual',
    notes: 'Energetic morning run',
    created_at: '2025-10-22T07:45:00Z',
    updated_at: '2025-10-22T07:45:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000065',
    dog_id: MOCK_DOG_IDS.JETT,
    activity_type: 'play',
    duration_minutes: 20,
    distance_km: 0.5,
    calories_burned: calculateCalories('play', 20, 0.5, 16), // 128 cal
    start_time: '2025-10-22T16:30:00Z',
    end_time: '2025-10-22T16:50:00Z',
    tracking_method: 'manual',
    notes: 'Afternoon playtime',
    created_at: '2025-10-22T16:50:00Z',
    updated_at: '2025-10-22T16:50:00Z',
  },
  // Jett yesterday
  {
    id: '00000000-0000-0000-0000-000000000066',
    dog_id: MOCK_DOG_IDS.JETT,
    activity_type: 'walk',
    duration_minutes: 40,
    distance_km: 2.8,
    calories_burned: calculateCalories('walk', 40, 2.8, 16), // 213 cal
    start_time: '2025-10-21T08:00:00Z',
    end_time: '2025-10-21T08:40:00Z',
    tracking_method: 'manual',
    created_at: '2025-10-21T08:40:00Z',
    updated_at: '2025-10-21T08:40:00Z',
  }
];
export const MOCK_HEALTH_RECORDS: any[] = [
  ...historicalCheckups,
  ...historicalVetVisits,
  ...historicalGrooming,
  ...historicalInjuries,
  {
    id: '00000000-0000-0000-0000-000000000071',
    dog_id: MOCK_DOG_IDS.SUKI,
    record_type: 'vet_visit',
    title: 'Annual Wellness Exam',
    description: 'General check-up, dental check, vaccines reviewed',
    date: '2025-09-18',
    veterinarian: 'Dr. Sarah Smith',
    notes: 'Healthy, advised regular dental chews. Weight stable.',
    created_at: '2025-09-18T10:00:00Z',
    updated_at: '2025-09-18T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000072',
    dog_id: MOCK_DOG_IDS.SUKI,
    record_type: 'note',
    title: 'Ear Cleaning',
    description: 'Routine ear maintenance',
    date: '2025-10-01',
    veterinarian: null,
    notes: 'Clean and healthy, no issues found',
    created_at: '2025-10-01T15:00:00Z',
    updated_at: '2025-10-01T15:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000073',
    dog_id: MOCK_DOG_IDS.JETT,
    record_type: 'vet_visit',
    title: '6-Month Puppy Checkup',
    description: 'Developmental assessment and vaccine boosters',
    date: '2025-08-20',
    veterinarian: 'Dr. Michael Lee',
    notes: 'Growing well, very healthy puppy',
    created_at: '2025-08-20T11:00:00Z',
    updated_at: '2025-08-20T11:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000074',
    dog_id: MOCK_DOG_IDS.JETT,
    record_type: 'note',
    title: 'Diet Adjustment',
    description: 'Increased meal portions for growth phase',
    date: '2025-10-10',
    veterinarian: null,
    notes: 'Monitor weight trend over next 2 weeks',
    created_at: '2025-10-10T09:00:00Z',
    updated_at: '2025-10-10T09:00:00Z',
  }
];
export const MOCK_VACCINATION_RECORDS: any[] = [
  ...historicalVaccinations,
  {
    id: '00000000-0000-0000-0000-000000000081',
    dog_id: MOCK_DOG_IDS.SUKI,
    vaccine_id: '00000000-0000-0000-0000-000000000091',
    administered_date: '2025-06-15',
    due_date: '2026-06-15',
    veterinarian: 'Dr. Sarah Smith',
    batch_number: 'DHPP-2025-061',
    notes: 'Annual booster, tolerated well',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-06-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000082',
    dog_id: MOCK_DOG_IDS.SUKI,
    vaccine_id: '00000000-0000-0000-0000-000000000092',
    administered_date: '2024-07-01',
    due_date: '2027-07-01',
    veterinarian: 'Dr. Sarah Smith',
    batch_number: 'RAB-2024-071',
    notes: '3-year rabies vaccine',
    created_at: '2024-07-01T09:00:00Z',
    updated_at: '2024-07-01T09:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000083',
    dog_id: MOCK_DOG_IDS.JETT,
    vaccine_id: '00000000-0000-0000-0000-000000000091',
    administered_date: '2025-03-15',
    due_date: '2026-03-15',
    veterinarian: 'Dr. Michael Lee',
    batch_number: 'DHPP-2025-031',
    notes: 'Puppy series complete, first annual booster',
    created_at: '2025-03-15T11:30:00Z',
    updated_at: '2025-03-15T11:30:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000084',
    dog_id: MOCK_DOG_IDS.JETT,
    vaccine_id: '00000000-0000-0000-0000-000000000092',
    administered_date: '2024-12-28',
    due_date: '2025-12-28',
    veterinarian: 'Dr. Michael Lee',
    batch_number: 'RAB-2024-128',
    notes: 'First rabies vaccine - puppy',
    created_at: '2024-12-28T14:00:00Z',
    updated_at: '2024-12-28T14:00:00Z'
  }
];
export const MOCK_GROOMING_SCHEDULES: any[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    dog_id: MOCK_DOG_IDS.SUKI,
    grooming_type: 'Bath',
    frequency_days: 14,
    last_completed_at: '2025-10-10T10:00:00Z',
    next_due_date: '2025-10-24',
    notes: 'Use sensitive-skin oatmeal shampoo',
    how_to_video_url: '',
    how_to_guide: `**Preparation**
Gather all necessary supplies: dog shampoo, towels, brush, and treats. Choose a warm, comfortable space for grooming.

**Step 1: Brush First**
Before bathing, thoroughly brush your dog's coat to remove tangles and loose fur. This makes washing easier and more effective.

**Step 2: Water Temperature**
Use lukewarm water - not too hot or cold. Test the water on your wrist first to ensure it's comfortable.

**Step 3: Wet the Coat**
Thoroughly wet your dog's coat, starting from the neck and working backwards. Avoid getting water in their ears and eyes.

**Step 4: Apply Shampoo**
Apply dog-specific shampoo and work into a lather. Massage gently from head to tail, getting down to the skin.

**Step 5: Rinse Thoroughly**
Rinse completely until water runs clear. Leftover shampoo can cause skin irritation.

**Step 6: Dry Your Dog**
Use towels to remove excess water. You can use a pet-safe blow dryer on low heat, keeping it moving and at a safe distance.

**Step 7: Final Brush**
Once dry, brush again to prevent matting and distribute natural oils through the coat.

**Tips**
- Use positive reinforcement throughout
- Keep sessions calm and relaxed
- Check for any skin issues while grooming`,
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-10-10T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    dog_id: MOCK_DOG_IDS.SUKI,
    grooming_type: 'Nail Trim',
    frequency_days: 21,
    last_completed_at: '2025-10-05T09:00:00Z',
    next_due_date: '2025-10-26',
    notes: 'Use Dremel tool, she tolerates it better',
    how_to_video_url: '',
    how_to_guide: `**Preparation**
Use proper dog nail clippers (guillotine or scissor style) and have styptic powder ready in case of bleeding.

**Step 1: Get Your Dog Relaxed**
Choose a calm time when your dog is relaxed. Have treats ready for positive reinforcement.

**Step 2: Handle the Paws**
Gently hold your dog's paw and massage it. Get them comfortable with you touching their feet.

**Step 3: Identify the Quick**
On light-colored nails, you can see the pink quick inside. On dark nails, look for a small dark circle in the center of the nail as you trim.

**Step 4: Position the Clipper**
Hold the clipper at a 45-degree angle to the nail, cutting from top to bottom in a single smooth motion.

**Step 5: Trim Small Amounts**
Cut just the tip of the nail at first. It's better to trim less and do it more frequently.

**Step 6: Check Your Progress**
Look at the cut surface. If you see a dark spot in the center, you're getting close to the quick - stop there.

**Step 7: Smooth Sharp Edges**
Use a nail file or emery board to smooth any sharp edges after trimming.

**Tips**
- Trim nails every 3-4 weeks
- If you do cut the quick, apply styptic powder and apply pressure
- Consider doing one paw at a time if your dog gets anxious
- Always end with treats and praise`,
    created_at: '2025-09-01T09:00:00Z',
    updated_at: '2025-10-05T09:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    dog_id: MOCK_DOG_IDS.SUKI,
    grooming_type: 'Ear Cleaning',
    frequency_days: 30,
    last_completed_at: '2025-10-01T14:00:00Z',
    next_due_date: '2025-10-31',
    notes: 'Use ear cleaning solution',
    how_to_video_url: '',
    how_to_guide: `**Preparation**
Use a vet-approved ear cleaning solution and cotton balls or gauze. Never use cotton swabs inside the ear canal.

**Step 1: Inspect the Ears**
Check for redness, swelling, discharge, or foul odor. If present, consult your vet before cleaning.

**Step 2: Position Your Dog**
Have your dog sit or lie in a comfortable position where you can easily access their ears.

**Step 3: Apply Ear Cleaner**
Fill the ear canal with the cleaning solution as directed on the bottle. Don't be shy - it's designed to be used generously.

**Step 4: Massage the Base**
Gently massage the base of the ear for 20-30 seconds. You should hear a squishing sound.

**Step 5: Let Your Dog Shake**
Step back and let your dog shake their head. This helps bring debris up and out of the ear canal.

**Step 6: Wipe Away Debris**
Use cotton balls or gauze to gently wipe away the loosened debris from the outer ear and ear flap. Never push into the ear canal.

**Step 7: Dry the Outer Ear**
Gently dry the visible part of the ear with a clean, dry cotton ball.

**Tips**
- Clean ears after swimming or bathing
- Don't over-clean - once a week is usually sufficient for most dogs
- Watch for signs of ear infections between cleanings
- Some breeds with floppy ears may need more frequent cleaning`,
    created_at: '2025-09-01T14:00:00Z',
    updated_at: '2025-10-01T14:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    dog_id: MOCK_DOG_IDS.JETT,
    grooming_type: 'Brush',
    frequency_days: 3,
    last_completed_at: '2025-10-20T08:00:00Z',
    next_due_date: '2025-10-23',
    notes: 'Soft bristle brush, he loves it!',
    how_to_video_url: '',
    how_to_guide: `**Preparation**
Choose the right brush for your dog's coat type (slicker, bristle, or pin brush). Have treats ready for positive reinforcement.

**Step 1: Start When Relaxed**
Choose a time when your dog is calm and relaxed. Create a comfortable space for grooming.

**Step 2: Begin Gently**
Start with gentle strokes in the direction of hair growth. Begin at areas your dog enjoys being touched.

**Step 3: Work Systematically**
Brush in sections, starting from the head and working towards the tail. Don't forget the legs, chest, and belly.

**Step 4: Check for Tangles**
Feel for mats or tangles with your fingers. Work through them gently with the brush or a detangling comb.

**Step 5: Pay Attention to Problem Areas**
Focus on areas prone to matting: behind ears, under legs, and around the collar area.

**Step 6: Brush Against the Grain**
For thick coats, occasionally brush against hair growth to remove loose undercoat, then smooth down again.

**Step 7: Finish Smoothly**
End with smooth, long strokes in the direction of hair growth to give a polished look.

**Tips**
- Brush before bathing to prevent mats from tightening
- Regular brushing reduces shedding and distributes natural oils
- Make it a bonding experience with praise and treats
- Check for skin issues, ticks, or lumps while brushing`,
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-10-20T08:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000105',
    dog_id: MOCK_DOG_IDS.JETT,
    grooming_type: 'Bath',
    frequency_days: 10,
    last_completed_at: '2025-10-15T13:00:00Z',
    next_due_date: '2025-10-25',
    notes: 'Puppy shampoo, warm water',
    how_to_video_url: '',
    how_to_guide: `**Preparation**
Gather all necessary supplies: dog shampoo, towels, brush, and treats. Choose a warm, comfortable space for grooming.

**Step 1: Brush First**
Before bathing, thoroughly brush your dog's coat to remove tangles and loose fur. This makes washing easier and more effective.

**Step 2: Water Temperature**
Use lukewarm water - not too hot or cold. Test the water on your wrist first to ensure it's comfortable.

**Step 3: Wet the Coat**
Thoroughly wet your dog's coat, starting from the neck and working backwards. Avoid getting water in their ears and eyes.

**Step 4: Apply Shampoo**
Apply dog-specific shampoo and work into a lather. Massage gently from head to tail, getting down to the skin.

**Step 5: Rinse Thoroughly**
Rinse completely until water runs clear. Leftover shampoo can cause skin irritation.

**Step 6: Dry Your Dog**
Use towels to remove excess water. You can use a pet-safe blow dryer on low heat, keeping it moving and at a safe distance.

**Step 7: Final Brush**
Once dry, brush again to prevent matting and distribute natural oils through the coat.

**Tips**
- Use positive reinforcement throughout
- Keep sessions calm and relaxed
- Check for any skin issues while grooming`,
    created_at: '2025-10-01T13:00:00Z',
    updated_at: '2025-10-15T13:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000106',
    dog_id: MOCK_DOG_IDS.JETT,
    grooming_type: 'Nail Trim',
    frequency_days: 14,
    last_completed_at: '2025-10-12T10:00:00Z',
    next_due_date: '2025-10-26',
    notes: 'Getting better with patience',
    how_to_video_url: '',
    how_to_guide: `**Preparation**
Use proper dog nail clippers (guillotine or scissor style) and have styptic powder ready in case of bleeding.

**Step 1: Get Your Dog Relaxed**
Choose a calm time when your dog is relaxed. Have treats ready for positive reinforcement.

**Step 2: Handle the Paws**
Gently hold your dog's paw and massage it. Get them comfortable with you touching their feet.

**Step 3: Identify the Quick**
On light-colored nails, you can see the pink quick inside. On dark nails, look for a small dark circle in the center of the nail as you trim.

**Step 4: Position the Clipper**
Hold the clipper at a 45-degree angle to the nail, cutting from top to bottom in a single smooth motion.

**Step 5: Trim Small Amounts**
Cut just the tip of the nail at first. It's better to trim less and do it more frequently.

**Step 6: Check Your Progress**
Look at the cut surface. If you see a dark spot in the center, you're getting close to the quick - stop there.

**Step 7: Smooth Sharp Edges**
Use a nail file or emery board to smooth any sharp edges after trimming.

**Tips**
- Trim nails every 3-4 weeks
- If you do cut the quick, apply styptic powder and apply pressure
- Consider doing one paw at a time if your dog gets anxious
- Always end with treats and praise`,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-12T10:00:00Z'
  }
];
export const MOCK_HEALTH_CHECKUPS: any[] = [
  // Recent checkup - 3 days ago
  {
    id: '00000000-0000-0000-0000-000000000110',
    dog_id: MOCK_DOG_IDS.SUKI,
    checkup_date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    body_condition_score: 5,
    lumps_found: false,
    lump_notes: null,
    ear_condition: 'good',
    ear_notes: 'Clean and healthy',
    eye_condition: 'good',
    eye_notes: 'Clear, no discharge',
    skin_condition: 'good',
    skin_notes: 'No redness or irritation',
    behavior_changes: null,
    overall_notes: 'Regular weekly checkup, all good',
    created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000111',
    dog_id: MOCK_DOG_IDS.SUKI,
    checkup_date: '2025-10-15T14:00:00Z',
    body_condition_score: 4,
    lumps_found: false,
    lump_notes: null,
    ear_condition: 'clean',
    ear_notes: 'No discharge, healthy pink color',
    eye_condition: 'clear',
    eye_notes: 'Bright and alert',
    skin_condition: 'healthy',
    skin_notes: 'No dryness or irritation',
    behavior_changes: 'More playful than usual',
    overall_notes: 'Excellent overall condition, very healthy',
    created_at: '2025-10-15T14:00:00Z',
    updated_at: '2025-10-15T14:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000112',
    dog_id: MOCK_DOG_IDS.SUKI,
    checkup_date: '2025-10-08T10:00:00Z',
    body_condition_score: 4,
    lumps_found: false,
    lump_notes: null,
    ear_condition: 'normal',
    ear_notes: null,
    eye_condition: 'clear',
    eye_notes: null,
    skin_condition: 'normal',
    skin_notes: null,
    behavior_changes: 'None noted',
    overall_notes: 'Weekly check complete',
    created_at: '2025-10-08T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000113',
    dog_id: MOCK_DOG_IDS.JETT,
    checkup_date: '2025-10-18T10:30:00Z',
    body_condition_score: 5,
    lumps_found: false,
    lump_notes: null,
    ear_condition: 'normal',
    ear_notes: 'Clean, no odor',
    eye_condition: 'clear',
    eye_notes: 'Bright and curious',
    skin_condition: 'slightly dry',
    skin_notes: 'Apply conditioner weekly during bath',
    behavior_changes: 'Very energetic, typical puppy behavior',
    overall_notes: 'Healthy, active puppy developing well',
    created_at: '2025-10-18T10:30:00Z',
    updated_at: '2025-10-18T10:30:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000114',
    dog_id: MOCK_DOG_IDS.JETT,
    checkup_date: '2025-10-11T11:00:00Z',
    body_condition_score: 5,
    lumps_found: false,
    lump_notes: null,
    ear_condition: 'clean',
    ear_notes: null,
    eye_condition: 'clear',
    eye_notes: null,
    skin_condition: 'healthy',
    skin_notes: null,
    behavior_changes: 'None',
    overall_notes: 'Weekly check, all good',
    created_at: '2025-10-11T11:00:00Z',
    updated_at: '2025-10-11T11:00:00Z'
  },
  // Add 3 months of historical health checkups
  ...historicalCheckups,
];

// Function to generate future scheduled meals (next 7 days)
function generateFutureMealRecords(
  dogId: string,
  nutritionPlanId: string,
  nutritionPlan: any,
  days: number = 7
) {
  const records: any[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    nutritionPlan.meal_schedule?.forEach((meal: any, idx: number) => {
      records.push({
        id: `mock-meal-future-${dateStr}-${idx}-${dogId}`,
        dog_id: dogId,
        nutrition_plan_id: nutritionPlanId,
        meal_name: meal.name || 'Meal',
        meal_time: meal.time,
        scheduled_date: dateStr,
        completed_at: null,
        amount_given: null,
        amount_consumed: null,
        percentage_eaten: null,
        bowl_cleaned_before: null,
        eating_behavior: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  }
  
  return records;
}

export const MOCK_MEAL_RECORDS: any[] = [
  {
    id: 'mock-meal-2025-10-31-dinner-00000000-0000-0000-0000-000000000011',
    dog_id: MOCK_DOG_IDS.SUKI,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000051',
    meal_time: '17:30',
    meal_name: 'Dinner',
    scheduled_date: '2025-10-31',
    completed_at: '2025-10-31T17:45:00Z',
    amount_given: 0.75,
    amount_consumed: 0.72,
    percentage_eaten: 96,
    eating_behavior: 'eager',
    eating_speed: 'normal',
    food_temperature: 'room_temp',
    energy_level_after: 'normal',
    begged_before: true,
    begged_after: false,
    bowl_cleaned_before: true,
    vomited_after: false,
    notes: 'Very eager tonight, finished most of the meal',
    meal_components: [
      { name: 'Premium Beef Raw', brand: 'K9 Natural', amount: 0.5, unit: 'cups', category: 'raw' },
      { name: 'Green Tripe', brand: 'Ziwi Peak', amount: 0.15, unit: 'cups', category: 'raw' },
      { name: 'Salmon Oil', amount: 1, unit: 'pieces', category: 'supplements' },
      { name: 'Vegetables Mix', amount: 0.1, unit: 'cups', category: 'raw' },
    ],
    created_at: '2025-10-31T17:45:00Z',
    updated_at: '2025-10-31T17:45:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000121',
    dog_id: MOCK_DOG_IDS.SUKI,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000051',
    meal_time: '07:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-22',
    completed_at: '2025-10-22T07:35:00Z',
    amount_given: 0.75,
    meal_components: [
      { name: 'Lamb Chunks', brand: 'K9 Natural', amount: 0.5, unit: 'cups', category: 'raw' },
      { name: 'Beef Heart', amount: 0.15, unit: 'cups', category: 'raw' },
      { name: 'Vegetables Mix', amount: 0.1, unit: 'cups', category: 'raw' },
    ],
    notes: 'Large meat cube + small tripe cubes',
    created_at: '2025-10-22T07:35:00Z',
    updated_at: '2025-10-22T07:35:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000122',
    dog_id: MOCK_DOG_IDS.SUKI,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000051',
    meal_time: '07:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-21',
    completed_at: '2025-10-21T07:28:00Z',
    amount_given: 0.75,
    meal_components: [
      { name: 'Chicken Raw', brand: 'Ziwi Peak', amount: 0.5, unit: 'cups', category: 'raw' },
      { name: 'Pumpkin', amount: 0.15, unit: 'cups', category: 'wet' },
      { name: 'Fish Oil', amount: 1, unit: 'pieces', category: 'supplements' },
      { name: 'Vegetables Mix', amount: 0.1, unit: 'cups', category: 'raw' },
    ],
    notes: null,
    created_at: '2025-10-21T07:28:00Z',
    updated_at: '2025-10-21T07:28:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000123',
    dog_id: MOCK_DOG_IDS.SUKI,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000051',
    meal_time: '07:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-20',
    completed_at: '2025-10-20T07:32:00Z',
    amount_given: 0.75,
    notes: null,
    created_at: '2025-10-20T07:32:00Z',
    updated_at: '2025-10-20T07:32:00Z'
  },
  // Jett's meals
  {
    id: '00000000-0000-0000-0000-000000000124',
    dog_id: MOCK_DOG_IDS.JETT,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000052',
    meal_time: '07:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-22',
    completed_at: '2025-10-22T07:33:00Z',
    amount_given: 1.5,
    meal_components: [
      { name: 'Royal Canin Puppy Formula', brand: 'Royal Canin', amount: 1.5, unit: 'cups', category: 'kibble' },
      { name: 'Chicken Broth', amount: 0.25, unit: 'cups', category: 'wet' },
    ],
    notes: 'Added warm water',
    created_at: '2025-10-22T07:33:00Z',
    updated_at: '2025-10-22T07:33:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000125',
    dog_id: MOCK_DOG_IDS.JETT,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000052',
    meal_time: '17:30',
    meal_name: 'Dinner',
    scheduled_date: '2025-10-21',
    completed_at: '2025-10-21T17:28:00Z',
    amount_given: 1.5,
    notes: null,
    created_at: '2025-10-21T17:28:00Z',
    updated_at: '2025-10-21T17:28:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000126',
    dog_id: MOCK_DOG_IDS.JETT,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000052',
    meal_time: '07:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-21',
    completed_at: '2025-10-21T07:35:00Z',
    amount_given: 1.5,
    notes: null,
    created_at: '2025-10-21T07:35:00Z',
    updated_at: '2025-10-21T07:35:00Z'
  },
  // Add 3 months of historical meal records
  ...historicalMeals,
  // Add future scheduled meals (next 7 days) for timeline visibility
  ...generateFutureMealRecords(MOCK_DOG_IDS.SUKI, '00000000-0000-0000-0000-000000000051', MOCK_NUTRITION_PLANS[0], 7),
  ...generateFutureMealRecords(MOCK_DOG_IDS.JETT, '00000000-0000-0000-0000-000000000052', MOCK_NUTRITION_PLANS[1], 7),
];

export const MOCK_MEDICAL_TREATMENTS: any[] = [
  {
    id: '00000000-0000-0000-0000-000000000301',
    dog_id: MOCK_DOG_IDS.SUKI,
    treatment_name: 'Cytopoint',
    last_administered_date: '2025-09-15T10:00:00Z',
    frequency_weeks: 4,
    next_due_date: '2025-10-13',
    notes: 'For seasonal allergies',
    created_at: '2025-09-15T10:00:00Z',
    updated_at: '2025-09-15T10:00:00Z'
  },
  // Add 3 months of historical treatment records
  ...historicalTreatments,
];

export const MOCK_TRAINING_SESSIONS: any[] = [
  {
    id: '00000000-0000-0000-0000-000000000131',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    session_date: '2025-10-20T15:00:00Z',
    duration_minutes: 10,
    success_rating: 4,
    progress_status: 'learning',
    notes: 'Great focus today',
    created_at: '2025-10-20T15:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000132',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    session_date: '2025-10-19T14:30:00Z',
    duration_minutes: 12,
    success_rating: 5,
    progress_status: 'learning',
    notes: 'Quick learner! Very enthusiastic.',
    created_at: '2025-10-19T14:30:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000133',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    session_date: '2025-10-21T16:00:00Z',
    duration_minutes: 8,
    success_rating: 4,
    progress_status: 'learning',
    notes: 'Consistent performance',
    created_at: '2025-10-21T16:00:00Z'
  }
];

export const MOCK_TRICKS = [
  TRICK_SIT,
  TRICK_ZEN_SIT,
  TRICK_DOWN,
  TRICK_ZEN_DOWN,
  TRICK_WAIT,
  TRICK_STAY,
  TRICK_WRONG,
  TRICK_NO,
  TRICK_LEAVE_IT,
  TRICK_OFF,
  TRICK_MAT,
  TRICK_HEEL,
  TRICK_COME,
  TRICK_NICELY,
  {
    id: '00000000-0000-0000-0000-000000000204',
    name: 'Shake',
    category: 'Performance',
    description: 'Shake hands with your paw',
    instructions: 'Tap their paw, say "shake", and reward when they lift it.',
    difficulty_level: 1,
    estimated_time_weeks: 1,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000205',
    name: 'Spin',
    category: 'Performance',
    description: 'Spin in a circle',
    instructions: 'Lure in a circle with a treat, say "spin", reward after full rotation.',
    difficulty_level: 2,
    estimated_time_weeks: 1,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000206',
    name: 'Roll Over',
    category: 'Performance',
    description: 'Roll completely over on their side',
    instructions: 'From down position, lure over shoulder to complete roll. Reward generously.',
    difficulty_level: 3,
    estimated_time_weeks: 2,
    prerequisites: ['Down'],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000207',
    name: 'Play Dead',
    category: 'Performance',
    description: 'Lie still on their side',
    instructions: 'From down, lure to side position. Say "bang" and reward for staying still.',
    difficulty_level: 3,
    estimated_time_weeks: 2,
    prerequisites: ['Down', 'Stay'],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000208',
    name: 'High Five',
    category: 'Performance',
    description: 'Touch your hand with their paw up high',
    instructions: 'Build from shake by raising your hand higher. Reward paw contact.',
    difficulty_level: 2,
    estimated_time_weeks: 1,
    prerequisites: ['Shake'],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000209',
    name: 'Speak',
    category: 'Performance',
    description: 'Bark on command',
    instructions: 'Capture natural barking, say "speak", and reward immediately.',
    difficulty_level: 2,
    estimated_time_weeks: 2,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000210',
    name: 'Fetch',
    category: 'Practical',
    description: 'Retrieve and return an object',
    instructions: 'Throw toy, encourage return, reward for bringing it back to you.',
    difficulty_level: 3,
    estimated_time_weeks: 3,
    prerequisites: ['Come'],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000211',
    name: 'Leave It',
    category: 'Impulse Control',
    description: 'Ignore items on command',
    instructions: 'Place treat in closed hand. Say "leave it", reward when they stop trying to get it.',
    difficulty_level: 3,
    estimated_time_weeks: 2,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000212',
    name: 'Wait',
    category: 'Impulse Control',
    description: 'Pause before proceeding',
    instructions: 'Use at doorways. Say "wait", reward for staying, then release with "okay".',
    difficulty_level: 3,
    estimated_time_weeks: 3,
    prerequisites: ['Stay'],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000213',
    name: 'Weave',
    category: 'Body Control',
    description: 'Weave through your legs',
    instructions: 'Lure between legs in figure-8 pattern. Build speed gradually.',
    difficulty_level: 4,
    estimated_time_weeks: 3,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000214',
    name: 'Back Up',
    category: 'Body Control',
    description: 'Walk backwards on command',
    instructions: 'Step toward them saying "back". Reward backward steps.',
    difficulty_level: 3,
    estimated_time_weeks: 2,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
];

export const MOCK_VACCINES = [
  {
    id: '00000000-0000-0000-0000-000000000091',
    name: 'DHPP',
    vaccine_type: 'core',
    protects_against: 'Distemper, Hepatitis, Parainfluenza, Parvovirus',
    schedule_info: 'Booster annually after puppy series',
    booster_required: true,
    lifestyle_factors: []
  },
  {
    id: '00000000-0000-0000-0000-000000000092',
    name: 'Rabies',
    vaccine_type: 'core',
    protects_against: 'Rabies',
    schedule_info: '1-3 year depending on local regulations',
    booster_required: true,
    lifestyle_factors: []
  },
  {
    id: '00000000-0000-0000-0000-000000000093',
    name: 'Leptospirosis',
    vaccine_type: 'lifestyle',
    protects_against: 'Leptospira bacteria',
    schedule_info: 'Annual booster',
    booster_required: true,
    lifestyle_factors: ['outdoor', 'wildlife exposure']
  }
];

export function isMockDogId(dogId: string): boolean {
  return dogId === MOCK_DOG_IDS.SUKI || dogId === MOCK_DOG_IDS.JETT;
}

export function isDevMode(userId?: string): boolean {
  return userId === MOCK_USER_ID;
}
