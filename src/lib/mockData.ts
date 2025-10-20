// Mock data for dev mode bypass
// Based on data from alexsmeele@gmail.com account

export const MOCK_DOG_IDS = {
  SUKI: 'mock-dog-1',
  JETT: 'mock-dog-2',
};

export const REAL_DOG_IDS = {
  SUKI: 'b450a8fe-855c-4176-b9bc-8da19de0ec30',
  JETT: '00cec743-bb6f-4895-8f10-5c2adabf8d72',
};

export const MOCK_WEIGHT_RECORDS = [
  // Suki's weight records
  {
    id: 'mock-weight-1',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 12,
    date: '2025-09-05T13:36:00Z',
    notes: null,
    created_at: '2025-09-05T13:36:00Z',
    updated_at: '2025-09-05T13:36:00Z',
  },
  {
    id: 'mock-weight-2',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 12.5,
    date: '2025-05-05T13:46:00Z',
    notes: null,
    created_at: '2025-05-05T13:46:00Z',
    updated_at: '2025-05-05T13:46:00Z',
  },
  {
    id: 'mock-weight-3',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 11.5,
    date: '2024-09-05T13:46:00Z',
    notes: null,
    created_at: '2024-09-05T13:46:00Z',
    updated_at: '2024-09-05T13:46:00Z',
  },
  // Jett's weight records
  {
    id: 'mock-weight-4',
    dog_id: MOCK_DOG_IDS.JETT,
    weight: 19,
    date: '2025-09-05T14:25:00Z',
    notes: null,
    created_at: '2025-09-05T14:25:00Z',
    updated_at: '2025-09-05T14:25:00Z',
  },
  {
    id: 'mock-weight-5',
    dog_id: MOCK_DOG_IDS.JETT,
    weight: 11.5,
    date: '2024-02-05T13:35:00Z',
    notes: null,
    created_at: '2024-02-05T13:35:00Z',
    updated_at: '2024-02-05T13:35:00Z',
  },
];

export const MOCK_DOG_TRICKS = [
  // Suki learning Sit
  {
    id: 'mock-trick-1',
    dog_id: MOCK_DOG_IDS.SUKI,
    trick_id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    status: 'learning' as const,
    total_sessions: 1,
    started_at: '2025-09-14T22:02:59.353Z',
    mastered_at: null,
    created_at: '2025-09-14T22:02:59.353Z',
    updated_at: '2025-09-14T22:02:59.353Z',
    trick: {
      id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
      name: 'Sit',
      difficulty_level: 1,
      category: 'basic',
      description: 'Teach your dog to sit on command',
      instructions: 'Hold a treat above their head and say "sit"',
      estimated_time_weeks: 1,
      prerequisites: [],
      created_at: new Date().toISOString(),
    },
  },
  // Jett learning Sit
  {
    id: 'mock-trick-2',
    dog_id: MOCK_DOG_IDS.JETT,
    trick_id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    status: 'learning' as const,
    total_sessions: 2,
    started_at: '2025-09-04T21:24:15.329Z',
    mastered_at: null,
    created_at: '2025-09-04T21:24:15.329Z',
    updated_at: '2025-09-04T21:24:15.329Z',
    trick: {
      id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
      name: 'Sit',
      difficulty_level: 1,
      category: 'basic',
      description: 'Teach your dog to sit on command',
      instructions: 'Hold a treat above their head and say "sit"',
      estimated_time_weeks: 1,
      prerequisites: [],
      created_at: new Date().toISOString(),
    },
  },
];

export const MOCK_ACTIVITY_GOALS = [
  // Suki's activity goal
  {
    id: 'mock-goal-1',
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
    id: 'mock-goal-2',
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
  // Suki's nutrition plan
  {
    id: 'mock-nutrition-1',
    dog_id: MOCK_DOG_IDS.SUKI,
    food_type: 'mixed',
    brand: 'Raw Essentials',
    daily_amount: 3,
    feeding_times: 1,
    meal_schedule: [
      {
        time: '08:30',
        amount: 3,
        food_type: 'Raw Food',
        reminder_enabled: true,
      },
    ],
    special_instructions: 'Raw Food: Large meat cube or puck; Raw Food: Small tripe cubes',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_ACTIVITY_RECORDS: any[] = [];
export const MOCK_HEALTH_RECORDS: any[] = [];
export const MOCK_VACCINATION_RECORDS: any[] = [];
export const MOCK_GROOMING_SCHEDULES: any[] = [];
export const MOCK_HEALTH_CHECKUPS: any[] = [];
export const MOCK_MEAL_RECORDS: any[] = [];

export function isMockDogId(dogId: string): boolean {
  return dogId === MOCK_DOG_IDS.SUKI || dogId === MOCK_DOG_IDS.JETT;
}

export function isDevMode(userId?: string): boolean {
  return userId === 'dev-user-mock-id';
}
