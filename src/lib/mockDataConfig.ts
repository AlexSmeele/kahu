export const MOCK_DATA_CONFIG = {
  // Generate 3 months of historical data
  historicalMonths: 3,
  
  // Maximum entries per day (realistic limit)
  maxEntriesPerDay: 10,
  
  // Activity patterns
  activities: {
    perDay: { min: 3, max: 4 },
    types: ['walk', 'run', 'play', 'training'] as const,
    probabilities: {
      morning: 0.85,    // 85% chance of morning walk
      midday: 0.40,     // 40% chance of midday activity
      afternoon: 0.60,  // 60% chance of afternoon play
      evening: 0.90,    // 90% chance of evening walk
    },
    timeSlots: {
      morning: { start: 6, end: 9 },
      midday: { start: 11, end: 14 },
      afternoon: { start: 15, end: 17 },
      evening: { start: 18, end: 20 },
    },
    duration: {
      walk: { min: 25, max: 45 },
      run: { min: 15, max: 30 },
      play: { min: 15, max: 35 },
      training: { min: 10, max: 25 },
    },
    distance: {
      walk: { min: 2.0, max: 4.5 },
      run: { min: 3.0, max: 6.0 },
      play: { min: 0, max: 0.5 },
      training: { min: 0, max: 0.2 },
    },
  },
  
  // Meal patterns
  meals: {
    perDay: 2,
    times: [
      { hour: 7, minute: 30, variance: 30 },  // Breakfast 7:00-8:00
      { hour: 17, minute: 30, variance: 30 }, // Dinner 5:00-6:00
    ],
    missedProbability: 0.05, // 5% chance of missed meal
  },
  
  // Weight tracking
  weight: {
    frequencyDays: 7, // Weekly weigh-ins
    changeRange: { min: -0.3, max: 0.3 }, // kg per week
    seasonalVariation: 0.1, // Slight weight gain in winter
  },
  
  // Health checkups
  checkups: {
    frequencyDays: 14, // Bi-weekly home checkups
    bodyConditionRange: { min: 4, max: 6 }, // Normal range
    findingsProbability: 0.10, // 10% chance of concerns
  },
  
  // Grooming schedule
  grooming: {
    types: {
      bath: { min: 7, max: 10 },      // Every 7-10 days
      nails: { min: 12, max: 16 },    // Every 2 weeks
      teeth: { min: 3, max: 5 },      // Every 3-5 days
      ears: { min: 6, max: 8 },       // Weekly
    },
  },
  
  // Training sessions
  training: {
    sessionsPerWeek: { min: 2, max: 3 },
    durationMinutes: { min: 10, max: 25 },
    successRating: { min: 3, max: 5 }, // Improving over time
    weeksToMaster: { min: 3, max: 8 }, // Time to master a trick
  },
  
  // Vet visits
  vetVisits: {
    frequencyDays: 30, // Monthly visits
    types: ['checkup', 'vaccination', 'dental', 'grooming'],
  },
};

export type MockDataConfig = typeof MOCK_DATA_CONFIG;
