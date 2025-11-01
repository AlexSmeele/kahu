import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA_CONFIG } from './mockDataConfig';
import {
  SeededRandom,
  getSeedForDate,
  getTimeInSlot,
  generateActivityNotes,
  generateMealNotes,
  generateCheckupFindings,
  calculateCalories,
  isDayForActivity,
  getDayOfWeek,
} from './mockDataPatterns';
import { addMockIds, getExistingMockIds } from './mockDataStorage';
import { logger } from './logger';

export interface GeneratedData {
  activities: any[];
  meals: any[];
  weights: any[];
  checkups: any[];
  grooming: any[];
  training: any[];
  totalEntries: number;
}

/**
 * Generate mock data for a date range
 */
export async function generateMockDataForDateRange(
  startDate: Date,
  endDate: Date,
  dogId: string,
  userId: string,
  dogWeight: number = 25
): Promise<GeneratedData> {
  logger.info('Generating mock data', { startDate, endDate, dogId });
  
  const existingIds = getExistingMockIds();
  const result: GeneratedData = {
    activities: [],
    meals: [],
    weights: [],
    checkups: [],
    grooming: [],
    training: [],
    totalEntries: 0,
  };
  
  let currentDate = new Date(startDate);
  let currentWeight = dogWeight;
  
  // Get nutrition plan for meal generation
  const { data: nutritionPlan } = await supabase
    .from('nutrition_plans')
    .select('*')
    .eq('dog_id', dogId)
    .eq('is_active', true)
    .single();
  
  while (currentDate <= endDate) {
    const dayEntries: any[] = [];
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Generate activities (3-4 per day)
    const activities = generateActivitiesForDay(currentDate, dogId, currentWeight);
    dayEntries.push(...activities);
    result.activities.push(...activities);
    
    // Generate meals (2 per day)
    if (nutritionPlan) {
      const meals = generateMealsForDay(currentDate, dogId, nutritionPlan);
      dayEntries.push(...meals);
      result.meals.push(...meals);
    }
    
    // Weekly weight record
    if (isDayForActivity(currentDate, MOCK_DATA_CONFIG.weight.frequencyDays, 1)) {
      const weight = generateWeightRecord(currentDate, dogId, currentWeight);
      currentWeight = weight.weight; // Update current weight
      dayEntries.push(weight);
      result.weights.push(weight);
    }
    
    // Bi-weekly health checkup
    if (isDayForActivity(currentDate, MOCK_DATA_CONFIG.checkups.frequencyDays, 3)) {
      const checkup = generateHealthCheckup(currentDate, dogId);
      dayEntries.push(checkup);
      result.checkups.push(checkup);
    }
    
    // Grooming sessions (varied schedule)
    const grooming = generateGroomingForDay(currentDate, dogId);
    dayEntries.push(...grooming);
    result.grooming.push(...grooming);
    
    // Training sessions (2-3 per week)
    const dayOfWeek = getDayOfWeek(currentDate);
    if ([1, 3, 5].includes(dayOfWeek)) { // Mon, Wed, Fri
      const training = generateTrainingSession(currentDate, dogId);
      if (training) {
        dayEntries.push(training);
        result.training.push(training);
      }
    }
    
    // Respect max entries per day
    const limitedEntries = dayEntries.slice(0, MOCK_DATA_CONFIG.maxEntriesPerDay);
    result.totalEntries += limitedEntries.length;
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  logger.info('Mock data generated', { totalEntries: result.totalEntries });
  return result;
}

/**
 * Generate activities for a single day
 */
function generateActivitiesForDay(date: Date, dogId: string, dogWeight: number): any[] {
  const random = new SeededRandom(getSeedForDate(date, dogId, 'activity'));
  const activities: any[] = [];
  const config = MOCK_DATA_CONFIG.activities;
  
  // Morning walk (85% probability)
  if (random.boolean(config.probabilities.morning)) {
    const type = 'walk';
    const startTime = getTimeInSlot(date, config.timeSlots.morning, random);
    const duration = random.int(config.duration[type].min, config.duration[type].max);
    const distance = random.range(config.distance[type].min, config.distance[type].max);
    
    activities.push({
      dog_id: dogId,
      activity_type: type,
      start_time: startTime.toISOString(),
      end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
      duration_minutes: duration,
      distance_km: Number(distance.toFixed(2)),
      calories_burned: calculateCalories(type, duration, distance, dogWeight),
      notes: generateActivityNotes(type, duration, distance, random),
      tracking_method: 'manual',
    });
  }
  
  // Midday activity (40% probability)
  if (random.boolean(config.probabilities.midday)) {
    const type = random.choice(['play', 'run'] as const);
    const startTime = getTimeInSlot(date, config.timeSlots.midday, random);
    const duration = random.int(config.duration[type].min, config.duration[type].max);
    const distance = random.range(config.distance[type].min, config.distance[type].max);
    
    activities.push({
      dog_id: dogId,
      activity_type: type,
      start_time: startTime.toISOString(),
      end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
      duration_minutes: duration,
      distance_km: Number(distance.toFixed(2)),
      calories_burned: calculateCalories(type, duration, distance, dogWeight),
      notes: generateActivityNotes(type, duration, distance, random),
      tracking_method: 'manual',
    });
  }
  
  // Afternoon play (60% probability)
  if (random.boolean(config.probabilities.afternoon)) {
    const type = 'play';
    const startTime = getTimeInSlot(date, config.timeSlots.afternoon, random);
    const duration = random.int(config.duration[type].min, config.duration[type].max);
    const distance = random.range(config.distance[type].min, config.distance[type].max);
    
    activities.push({
      dog_id: dogId,
      activity_type: type,
      start_time: startTime.toISOString(),
      end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
      duration_minutes: duration,
      distance_km: Number(distance.toFixed(2)),
      calories_burned: calculateCalories(type, duration, distance, dogWeight),
      notes: generateActivityNotes(type, duration, distance, random),
      tracking_method: 'manual',
    });
  }
  
  // Evening walk (90% probability)
  if (random.boolean(config.probabilities.evening)) {
    const type = 'walk';
    const startTime = getTimeInSlot(date, config.timeSlots.evening, random);
    const duration = random.int(config.duration[type].min, config.duration[type].max);
    const distance = random.range(config.distance[type].min, config.distance[type].max);
    
    activities.push({
      dog_id: dogId,
      activity_type: type,
      start_time: startTime.toISOString(),
      end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
      duration_minutes: duration,
      distance_km: Number(distance.toFixed(2)),
      calories_burned: calculateCalories(type, duration, distance, dogWeight),
      notes: generateActivityNotes(type, duration, distance, random),
      tracking_method: 'manual',
    });
  }
  
  return activities;
}

/**
 * Generate meals for a single day
 */
function generateMealsForDay(date: Date, dogId: string, nutritionPlan: any): any[] {
  const random = new SeededRandom(getSeedForDate(date, dogId, 'meal'));
  const meals: any[] = [];
  const config = MOCK_DATA_CONFIG.meals;
  
  const now = new Date();
  
  config.times.forEach((mealTime, index) => {
    // 5% chance of missed meal
    if (random.boolean(config.missedProbability)) return;
    
    const mealDate = new Date(date);
    const variance = random.int(-mealTime.variance, mealTime.variance);
    mealDate.setHours(mealTime.hour, mealTime.minute + variance, 0, 0);
    
    const mealName = index === 0 ? 'Breakfast' : 'Dinner';
    const amountGiven = nutritionPlan.daily_amount ? 
      Number((nutritionPlan.daily_amount / 2).toFixed(1)) : null;
    
    // Only set completed_at if the meal is in the past
    const completed_at = mealDate <= now ? mealDate.toISOString() : null;
    
    meals.push({
      dog_id: dogId,
      nutrition_plan_id: nutritionPlan.id,
      meal_name: mealName,
      meal_time: `${String(mealTime.hour).padStart(2, '0')}:${String(mealTime.minute).padStart(2, '0')}`,
      scheduled_date: date.toISOString().split('T')[0],
      completed_at: completed_at,
      amount_given: amountGiven,
      notes: generateMealNotes(random),
    });
  });
  
  return meals;
}

/**
 * Generate weight record
 */
function generateWeightRecord(date: Date, dogId: string, currentWeight: number): any {
  const random = new SeededRandom(getSeedForDate(date, dogId, 'weight'));
  const change = random.range(
    MOCK_DATA_CONFIG.weight.changeRange.min,
    MOCK_DATA_CONFIG.weight.changeRange.max
  );
  
  const newWeight = Number((currentWeight + change).toFixed(2));
  
  return {
    dog_id: dogId,
    weight: newWeight,
    date: date.toISOString(),
    notes: null,
  };
}

/**
 * Generate health checkup
 */
function generateHealthCheckup(date: Date, dogId: string): any {
  const random = new SeededRandom(getSeedForDate(date, dogId, 'checkup'));
  const findings = generateCheckupFindings(random);
  const bodyScore = random.int(
    MOCK_DATA_CONFIG.checkups.bodyConditionRange.min,
    MOCK_DATA_CONFIG.checkups.bodyConditionRange.max
  );
  
  return {
    dog_id: dogId,
    checkup_date: date.toISOString(),
    body_condition_score: bodyScore,
    lumps_found: findings.lumpsFound,
    lump_notes: findings.lumpNotes,
    ear_condition: findings.earCondition,
    ear_notes: findings.earNotes,
    eye_condition: findings.eyeCondition,
    eye_notes: findings.eyeNotes,
    skin_condition: findings.skinCondition,
    skin_notes: findings.skinNotes,
    behavior_changes: findings.behaviorChanges,
    overall_notes: findings.overallNotes,
  };
}

/**
 * Generate grooming for a day
 */
function generateGroomingForDay(date: Date, dogId: string): any[] {
  const grooming: any[] = [];
  
  // Bath (every 7-10 days)
  if (isDayForActivity(date, 8, 0)) {
    grooming.push({
      dog_id: dogId,
      grooming_type: 'bath',
      last_completed_at: date.toISOString(),
      frequency_days: 8,
      notes: 'Regular bath day',
    });
  }
  
  // Nail trim (every 14 days)
  if (isDayForActivity(date, 14, 2)) {
    grooming.push({
      dog_id: dogId,
      grooming_type: 'nails',
      last_completed_at: date.toISOString(),
      frequency_days: 14,
      notes: 'Trimmed nails',
    });
  }
  
  return grooming;
}

/**
 * Generate training session
 */
function generateTrainingSession(date: Date, dogId: string): any | null {
  const random = new SeededRandom(getSeedForDate(date, dogId, 'training'));
  
  // Get a trick to train (simplified - would normally query existing dog_tricks)
  const duration = random.int(
    MOCK_DATA_CONFIG.training.durationMinutes.min,
    MOCK_DATA_CONFIG.training.durationMinutes.max
  );
  
  const successRating = random.int(
    MOCK_DATA_CONFIG.training.successRating.min,
    MOCK_DATA_CONFIG.training.successRating.max
  );
  
  // Note: Would need actual trick_id from database
  // For now, skip training session generation to avoid foreign key issues
  return null;
}

/**
 * Insert generated data into Supabase
 */
export async function insertGeneratedData(data: GeneratedData): Promise<void> {
  logger.info('Inserting generated mock data into Supabase');
  
  try {
    // Insert activities in batches
    if (data.activities.length > 0) {
      const batches = chunkArray(data.activities, 100);
      for (const batch of batches) {
        await supabase.from('activity_records').insert(batch);
      }
      logger.info('Inserted activities', { count: data.activities.length });
    }
    
    // Insert meals in batches
    if (data.meals.length > 0) {
      const batches = chunkArray(data.meals, 100);
      for (const batch of batches) {
        await supabase.from('meal_records').insert(batch);
      }
      logger.info('Inserted meals', { count: data.meals.length });
    }
    
    // Insert weight records
    if (data.weights.length > 0) {
      await supabase.from('weight_records').insert(data.weights);
      logger.info('Inserted weights', { count: data.weights.length });
    }
    
    // Insert checkups
    if (data.checkups.length > 0) {
      await supabase.from('health_checkups').insert(data.checkups);
      logger.info('Inserted checkups', { count: data.checkups.length });
    }
    
    // Note: Grooming and training would be inserted here
    // Skipping for now due to schema complexity
    
    logger.info('Successfully inserted all mock data');
  } catch (error) {
    logger.error('Error inserting mock data', error);
    throw error;
  }
}

/**
 * Helper to chunk arrays for batch processing
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
