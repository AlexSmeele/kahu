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
  ...generateHistoricalActivityRecords(MOCK_DOG_IDS.SUKI, 12, 3),
  ...generateHistoricalActivityRecords(MOCK_DOG_IDS.JETT, 19, 3),
];

const historicalMeals = [
  ...generateHistoricalMealRecords(MOCK_DOG_IDS.SUKI, '00000000-0000-0000-0000-000000000051', 200, 3),
  ...generateHistoricalMealRecords(MOCK_DOG_IDS.JETT, '00000000-0000-0000-0000-000000000052', 300, 3),
];

const historicalWeights = [
  ...generateHistoricalWeightRecords(MOCK_DOG_IDS.SUKI, 11.5, 3),
  ...generateHistoricalWeightRecords(MOCK_DOG_IDS.JETT, 17, 3),
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
  // Add 3 months of historical weight records
  ...historicalWeights,
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
        name: 'Breakfast'
      },
    ],
    special_instructions: 'Raw Food: Large meat cube or puck; Raw Food: Small tripe cubes',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Jett's nutrition plan
  {
    id: '00000000-0000-0000-0000-000000000052',
    dog_id: MOCK_DOG_IDS.JETT,
    food_type: 'dry',
    brand: 'Puppy Growth Formula',
    daily_amount: 2.5,
    feeding_times: 2,
    meal_schedule: [
      {
        time: '07:30',
        amount: 1.25,
        food_type: 'Dry Kibble',
        reminder_enabled: true,
        name: 'Breakfast'
      },
      {
        time: '17:30',
        amount: 1.25,
        food_type: 'Dry Kibble',
        reminder_enabled: true,
        name: 'Dinner'
      },
    ],
    special_instructions: 'High-protein puppy formula for growth. Add warm water to soften.',
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
    calories_burned: 85,
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
    calories_burned: 45,
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
    calories_burned: 95,
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
    calories_burned: 72,
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
    calories_burned: 70,
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
    calories_burned: 110,
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
    calories_burned: 65,
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
    calories_burned: 75,
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
    calories_burned: 60,
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
    calories_burned: 125,
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
    calories_burned: 80,
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
    calories_burned: 88,
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
    calories_burned: 82,
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
    calories_burned: 73,
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
    distance_km: 1.8,
    calories_burned: 120,
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
    calories_burned: 80,
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
    calories_burned: 145,
    start_time: '2025-10-21T09:00:00Z',
    end_time: '2025-10-21T09:30:00Z',
    tracking_method: 'manual',
    created_at: '2025-10-21T09:30:00Z',
    updated_at: '2025-10-21T09:30:00Z',
  },
  // Jett today
  {
    id: '00000000-0000-0000-0000-000000000063',
    dog_id: MOCK_DOG_IDS.JETT,
    activity_type: 'run',
    duration_minutes: 35,
    distance_km: 3.2,
    calories_burned: 280,
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
    calories_burned: 120,
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
    calories_burned: 220,
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
    notes: 'Large meat cube + small tripe cubes',
    created_at: '2025-10-22T08:35:00Z',
    updated_at: '2025-10-22T08:35:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000122',
    dog_id: MOCK_DOG_IDS.SUKI,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000051',
    meal_time: '08:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-21',
    completed_at: '2025-10-21T08:28:00Z',
    amount_given: 3,
    notes: null,
    created_at: '2025-10-21T08:28:00Z',
    updated_at: '2025-10-21T08:28:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000123',
    dog_id: MOCK_DOG_IDS.SUKI,
    nutrition_plan_id: '00000000-0000-0000-0000-000000000051',
    meal_time: '08:30',
    meal_name: 'Breakfast',
    scheduled_date: '2025-10-20',
    completed_at: '2025-10-20T08:32:00Z',
    amount_given: 3,
    notes: null,
    created_at: '2025-10-20T08:32:00Z',
    updated_at: '2025-10-20T08:32:00Z'
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
    amount_given: 1.25,
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
    amount_given: 1.25,
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
    amount_given: 1.25,
    notes: null,
    created_at: '2025-10-21T07:35:00Z',
    updated_at: '2025-10-21T07:35:00Z'
  },
  // Add 3 months of historical meal records
  ...historicalMeals,
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
  {
    id: 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
    name: 'Sit',
    category: 'Foundation',
    description: 'Teach your dog to sit on command',
    instructions: 'Hold a treat above their head and say "sit". When they sit, reward immediately.',
    difficulty_level: 1,
    estimated_time_weeks: 1,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000201',
    name: 'Down',
    category: 'Foundation',
    description: 'Get your dog to lie down on command',
    instructions: 'From a sit, lure with a treat to the ground. Say "down" and reward when they lie down.',
    difficulty_level: 1,
    estimated_time_weeks: 2,
    prerequisites: ['Sit'],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    name: 'Stay',
    category: 'Impulse Control',
    description: 'Teach your dog to remain in position',
    instructions: 'Start with short durations. Say "stay", step back, then return and reward.',
    difficulty_level: 2,
    estimated_time_weeks: 2,
    prerequisites: ['Sit'],
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000203',
    name: 'Come',
    category: 'Obedience',
    description: 'Reliable recall when called',
    instructions: 'Start close, say "come" enthusiastically, reward heavily when they reach you.',
    difficulty_level: 2,
    estimated_time_weeks: 3,
    prerequisites: [],
    created_at: new Date().toISOString(),
  },
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
