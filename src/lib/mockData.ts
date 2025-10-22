// Mock data for dev mode bypass
// Based on data from alexsmeele@gmail.com account

export const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export const MOCK_DOG_IDS = {
  SUKI: '00000000-0000-0000-0000-000000000011',
  JETT: '00000000-0000-0000-0000-000000000012',
};

export const REAL_DOG_IDS = {
  SUKI: 'b450a8fe-855c-4176-b9bc-8da19de0ec30',
  JETT: '00cec743-bb6f-4895-8f10-5c2adabf8d72',
};

export const MOCK_WEIGHT_RECORDS = [
  // Suki's weight records
  {
    id: '00000000-0000-0000-0000-000000000021',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 12,
    date: '2025-09-05T13:36:00Z',
    notes: null,
    created_at: '2025-09-05T13:36:00Z',
    updated_at: '2025-09-05T13:36:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000022',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 12.5,
    date: '2025-05-05T13:46:00Z',
    notes: null,
    created_at: '2025-05-05T13:46:00Z',
    updated_at: '2025-05-05T13:46:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000023',
    dog_id: MOCK_DOG_IDS.SUKI,
    weight: 11.5,
    date: '2024-09-05T13:46:00Z',
    notes: null,
    created_at: '2024-09-05T13:46:00Z',
    updated_at: '2024-09-05T13:46:00Z',
  },
  // Jett's weight records
  {
    id: '00000000-0000-0000-0000-000000000024',
    dog_id: MOCK_DOG_IDS.JETT,
    weight: 19,
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
    notes: null,
    created_at: '2024-02-05T13:35:00Z',
    updated_at: '2024-02-05T13:35:00Z',
  },
];

export const MOCK_DOG_TRICKS = [
  // Suki learning Sit
  {
    id: '00000000-0000-0000-0000-000000000031',
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
    id: '00000000-0000-0000-0000-000000000032',
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
  // Suki's nutrition plan
  {
    id: '00000000-0000-0000-0000-000000000051',
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

export const MOCK_ACTIVITY_RECORDS: any[] = [
  // Suki today walks
  {
    id: '00000000-0000-0000-0000-000000000061',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'walk',
    duration_minutes: 25,
    distance_km: 1.8,
    calories_burned: 120,
    start_time: '2025-10-22T08:30:00Z',
    end_time: '2025-10-22T08:55:00Z',
    tracking_method: 'manual',
    created_at: '2025-10-22T08:55:00Z',
    updated_at: '2025-10-22T08:55:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000062',
    dog_id: MOCK_DOG_IDS.SUKI,
    activity_type: 'play',
    duration_minutes: 15,
    distance_km: 0.3,
    calories_burned: 80,
    start_time: '2025-10-22T12:00:00Z',
    end_time: '2025-10-22T12:15:00Z',
    tracking_method: 'manual',
    created_at: '2025-10-22T12:15:00Z',
    updated_at: '2025-10-22T12:15:00Z',
  },
  // Jett today
  {
    id: '00000000-0000-0000-0000-000000000063',
    dog_id: MOCK_DOG_IDS.JETT,
    activity_type: 'run',
    duration_minutes: 30,
    distance_km: 3.2,
    calories_burned: 250,
    start_time: '2025-10-22T07:10:00Z',
    end_time: '2025-10-22T07:40:00Z',
    tracking_method: 'manual',
    created_at: '2025-10-22T07:40:00Z',
    updated_at: '2025-10-22T07:40:00Z',
  }
];
export const MOCK_HEALTH_RECORDS: any[] = [
  {
    id: '00000000-0000-0000-0000-000000000071',
    dog_id: MOCK_DOG_IDS.SUKI,
    record_type: 'vet_visit',
    title: 'Annual Wellness Exam',
    description: 'General check-up, dental check, vaccines reviewed',
    date: '2025-09-18',
    veterinarian: 'Dr. Smith',
    notes: 'Healthy, advised regular dental chews',
    created_at: '2025-09-18T10:00:00Z',
    updated_at: '2025-09-18T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000072',
    dog_id: MOCK_DOG_IDS.JETT,
    record_type: 'note',
    title: 'Diet Adjustment',
    description: 'Adjusted meal size due to increased activity',
    date: '2025-10-10',
    veterinarian: null,
    notes: 'Monitor weight trend over 2 weeks',
    created_at: '2025-10-10T09:00:00Z',
    updated_at: '2025-10-10T09:00:00Z',
  }
];
export const MOCK_VACCINATION_RECORDS: any[] = [
  {
    id: '00000000-0000-0000-0000-000000000081',
    dog_id: MOCK_DOG_IDS.SUKI,
    vaccine_id: '00000000-0000-0000-0000-000000000091',
    administered_date: '2025-06-15',
    due_date: '2026-06-15',
    veterinarian: 'Dr. Smith',
    notes: 'Booster in 12 months',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-06-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000082',
    dog_id: MOCK_DOG_IDS.SUKI,
    vaccine_id: '00000000-0000-0000-0000-000000000092',
    administered_date: '2024-07-01',
    due_date: '2027-07-01',
    veterinarian: 'Dr. Smith',
    notes: null,
    created_at: '2024-07-01T09:00:00Z',
    updated_at: '2024-07-01T09:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000083',
    dog_id: MOCK_DOG_IDS.JETT,
    vaccine_id: '00000000-0000-0000-0000-000000000091',
    administered_date: '2025-03-15',
    due_date: '2026-03-15',
    veterinarian: 'Dr. Lee',
    notes: 'Puppy series complete',
    created_at: '2025-03-15T11:30:00Z',
    updated_at: '2025-03-15T11:30:00Z'
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
    notes: 'Use sensitive-skin shampoo',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-10-10T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    dog_id: MOCK_DOG_IDS.SUKI,
    grooming_type: 'Nail Trim',
    frequency_days: 30,
    last_completed_at: '2025-09-20T09:00:00Z',
    next_due_date: '2025-10-20',
    notes: null,
    created_at: '2025-09-01T09:00:00Z',
    updated_at: '2025-09-20T09:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    dog_id: MOCK_DOG_IDS.JETT,
    grooming_type: 'Brush',
    frequency_days: 7,
    last_completed_at: '2025-10-18T08:00:00Z',
    next_due_date: '2025-10-25',
    notes: 'Use soft bristle brush',
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-10-18T08:00:00Z'
  }
];
export const MOCK_HEALTH_CHECKUPS: any[] = [
  {
    id: '00000000-0000-0000-0000-000000000111',
    dog_id: MOCK_DOG_IDS.SUKI,
    checkup_date: '2025-09-28T14:00:00Z',
    body_condition_score: 4,
    lumps_found: false,
    lump_notes: null,
    ear_condition: 'clean',
    ear_notes: null,
    eye_condition: 'clear',
    eye_notes: null,
    skin_condition: 'healthy',
    skin_notes: null,
    behavior_changes: 'None',
    overall_notes: 'Excellent condition',
    created_at: '2025-09-28T14:00:00Z',
    updated_at: '2025-09-28T14:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000112',
    dog_id: MOCK_DOG_IDS.JETT,
    checkup_date: '2025-10-05T10:30:00Z',
    body_condition_score: 5,
    lumps_found: false,
    lump_notes: null,
    ear_condition: 'normal',
    ear_notes: null,
    eye_condition: 'clear',
    eye_notes: null,
    skin_condition: 'slightly dry',
    skin_notes: 'Apply conditioner weekly',
    behavior_changes: 'More energetic',
    overall_notes: 'Healthy puppy',
    created_at: '2025-10-05T10:30:00Z',
    updated_at: '2025-10-05T10:30:00Z'
  }
];
export const MOCK_MEAL_RECORDS: any[] = [
  {
    id: '00000000-0000-0000-0000-000000000121',
    dog_id: MOCK_DOG_IDS.SUKI,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000051',
    meal_time: '08:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-22',
    completed_at: '2025-10-22T08:35:00Z',
    amount_given: 3,
    notes: null,
    created_at: '2025-10-22T08:35:00Z',
    updated_at: '2025-10-22T08:35:00Z'
  }
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
