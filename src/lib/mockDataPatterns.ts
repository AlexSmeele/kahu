import { MOCK_DATA_CONFIG } from './mockDataConfig';

/**
 * Seeded random number generator for consistent mock data
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

/**
 * Generate a seed from a date for consistent daily patterns
 */
export function getSeedForDate(date: Date, dogId: string, type: string): number {
  const dateStr = date.toISOString().split('T')[0];
  let hash = 0;
  const str = `${dateStr}-${dogId}-${type}`;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash);
}

/**
 * Get time within a slot with variance
 */
export function getTimeInSlot(
  date: Date,
  slot: { start: number; end: number },
  random: SeededRandom
): Date {
  const result = new Date(date);
  const hour = random.range(slot.start, slot.end);
  const minute = random.int(0, 59);
  
  result.setHours(Math.floor(hour), minute, 0, 0);
  return result;
}

/**
 * Generate activity notes based on type and conditions
 */
export function generateActivityNotes(
  type: string,
  duration: number,
  distance: number,
  random: SeededRandom
): string {
  const walkNotes = [
    'Great walk around the neighborhood',
    'Enjoyed the fresh air',
    'Met some friendly dogs at the park',
    'Beautiful weather for a walk',
    'Nice leisurely pace today',
    'Explored a new route',
  ];
  
  const runNotes = [
    'High energy run this morning',
    'Great cardio workout',
    'Ran along the beach',
    'Kept a steady pace throughout',
    'Really needed to burn off some energy',
  ];
  
  const playNotes = [
    'Had a blast playing fetch',
    'Loved chasing the ball',
    'Played tug-of-war with favorite toy',
    'Great play session in the backyard',
    'Enjoyed some quality play time',
    'Lots of zoomies today!',
  ];
  
  const trainingNotes = [
    'Focused training session',
    'Working on new commands',
    'Great progress today',
    'Responsive and attentive',
    'Building on previous skills',
  ];
  
  let notes: string[];
  switch (type) {
    case 'run':
      notes = runNotes;
      break;
    case 'play':
      notes = playNotes;
      break;
    case 'training':
      notes = trainingNotes;
      break;
    default:
      notes = walkNotes;
  }
  
  return random.choice(notes);
}

/**
 * Generate meal notes
 */
export function generateMealNotes(random: SeededRandom): string | undefined {
  if (!random.boolean(0.3)) return undefined; // 70% no notes
  
  const notes = [
    'Ate everything quickly',
    'Good appetite today',
    'Took time to eat',
    'Very hungry today',
    'Enjoyed the meal',
    'Left a little bit',
  ];
  
  return random.choice(notes);
}

/**
 * Generate health checkup findings
 */
export function generateCheckupFindings(random: SeededRandom): {
  lumpsFound: boolean;
  lumpNotes?: string;
  earCondition: string;
  earNotes?: string;
  eyeCondition: string;
  eyeNotes?: string;
  skinCondition: string;
  skinNotes?: string;
  behaviorChanges?: string;
  overallNotes: string;
} {
  const lumpsFound = random.boolean(MOCK_DATA_CONFIG.checkups.findingsProbability);
  
  const earConditions = ['clear', 'clear', 'clear', 'slight_redness', 'clean'];
  const eyeConditions = ['clear', 'clear', 'clear', 'slight_discharge', 'bright'];
  const skinConditions = ['healthy', 'healthy', 'healthy', 'dry', 'good'];
  
  const overallNotes = [
    'Overall health looks great',
    'Everything looking normal',
    'Healthy and happy',
    'No concerns today',
    'In excellent condition',
  ];
  
  return {
    lumpsFound,
    lumpNotes: lumpsFound ? 'Small bump detected, monitoring' : undefined,
    earCondition: random.choice(earConditions),
    earNotes: undefined,
    eyeCondition: random.choice(eyeConditions),
    eyeNotes: undefined,
    skinCondition: random.choice(skinConditions),
    skinNotes: undefined,
    behaviorChanges: undefined,
    overallNotes: random.choice(overallNotes),
  };
}

/**
 * Calculate calories burned based on activity
 */
export function calculateCalories(
  type: string,
  durationMinutes: number,
  distanceKm: number,
  dogWeight: number
): number {
  // Rough estimation: base metabolic rate + activity multiplier
  const baseRate = dogWeight * 0.8; // calories per hour at rest
  
  let multiplier = 1;
  switch (type) {
    case 'walk':
      multiplier = 2.5;
      break;
    case 'run':
      multiplier = 4.0;
      break;
    case 'play':
      multiplier = 3.0;
      break;
    case 'training':
      multiplier = 2.0;
      break;
  }
  
  return Math.round((baseRate * multiplier * durationMinutes) / 60);
}

/**
 * Determine if it's a specific type of day (for scheduling)
 */
export function isDayForActivity(
  date: Date,
  frequencyDays: number,
  offset: number = 0
): boolean {
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return (daysSinceEpoch + offset) % frequencyDays === 0;
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Check if it's a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6;
}
