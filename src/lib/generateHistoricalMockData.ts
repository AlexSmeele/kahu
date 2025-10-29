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

/**
 * Generate extensive historical mock data for the static mock data arrays
 * This generates data in-memory rather than inserting into the database
 */
export function generateHistoricalActivityRecords(
  dogId: string,
  dogWeight: number,
  months: number = 6
) {
  const records: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const random = new SeededRandom(getSeedForDate(currentDate, dogId, 'activity'));
    const config = MOCK_DATA_CONFIG.activities;
    
    // Morning walk (85%)
    if (random.boolean(config.probabilities.morning)) {
      const type = 'walk';
      const startTime = getTimeInSlot(currentDate, config.timeSlots.morning, random);
      const duration = random.int(config.duration[type].min, config.duration[type].max);
      const distance = random.range(config.distance[type].min, config.distance[type].max);
      
      records.push({
        id: `mock-activity-${currentDate.toISOString().split('T')[0]}-morning-${dogId}`,
        dog_id: dogId,
        activity_type: type,
        start_time: startTime.toISOString(),
        end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
        duration_minutes: duration,
        distance_km: Number(distance.toFixed(2)),
        calories_burned: calculateCalories(type, duration, distance, dogWeight),
        notes: generateActivityNotes(type, duration, distance, random),
        tracking_method: 'manual',
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      });
    }
    
    // Midday activity (40%)
    if (random.boolean(config.probabilities.midday)) {
      const type = random.choice(['play', 'run'] as const);
      const startTime = getTimeInSlot(currentDate, config.timeSlots.midday, random);
      const duration = random.int(config.duration[type].min, config.duration[type].max);
      const distance = random.range(config.distance[type].min, config.distance[type].max);
      
      records.push({
        id: `mock-activity-${currentDate.toISOString().split('T')[0]}-midday-${dogId}`,
        dog_id: dogId,
        activity_type: type,
        start_time: startTime.toISOString(),
        end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
        duration_minutes: duration,
        distance_km: Number(distance.toFixed(2)),
        calories_burned: calculateCalories(type, duration, distance, dogWeight),
        notes: generateActivityNotes(type, duration, distance, random),
        tracking_method: 'manual',
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      });
    }
    
    // Afternoon play (60%)
    if (random.boolean(config.probabilities.afternoon)) {
      const type = 'play';
      const startTime = getTimeInSlot(currentDate, config.timeSlots.afternoon, random);
      const duration = random.int(config.duration[type].min, config.duration[type].max);
      const distance = random.range(config.distance[type].min, config.distance[type].max);
      
      records.push({
        id: `mock-activity-${currentDate.toISOString().split('T')[0]}-afternoon-${dogId}`,
        dog_id: dogId,
        activity_type: type,
        start_time: startTime.toISOString(),
        end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
        duration_minutes: duration,
        distance_km: Number(distance.toFixed(2)),
        calories_burned: calculateCalories(type, duration, distance, dogWeight),
        notes: generateActivityNotes(type, duration, distance, random),
        tracking_method: 'manual',
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      });
    }
    
    // Evening walk (90%)
    if (random.boolean(config.probabilities.evening)) {
      const type = 'walk';
      const startTime = getTimeInSlot(currentDate, config.timeSlots.evening, random);
      const duration = random.int(config.duration[type].min, config.duration[type].max);
      const distance = random.range(config.distance[type].min, config.distance[type].max);
      
      records.push({
        id: `mock-activity-${currentDate.toISOString().split('T')[0]}-evening-${dogId}`,
        dog_id: dogId,
        activity_type: type,
        start_time: startTime.toISOString(),
        end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
        duration_minutes: duration,
        distance_km: Number(distance.toFixed(2)),
        calories_burned: calculateCalories(type, duration, distance, dogWeight),
        notes: generateActivityNotes(type, duration, distance, random),
        tracking_method: 'manual',
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return records;
}

export function generateHistoricalMealRecords(
  dogId: string,
  nutritionPlanId: string,
  dailyAmount: number,
  months: number = 6
) {
  const records: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const random = new SeededRandom(getSeedForDate(currentDate, dogId, 'meal'));
    const config = MOCK_DATA_CONFIG.meals;
    
    config.times.forEach((mealTime, index) => {
      if (random.boolean(config.missedProbability)) return;
      
      const mealDate = new Date(currentDate);
      const variance = random.int(-mealTime.variance, mealTime.variance);
      mealDate.setHours(mealTime.hour, mealTime.minute + variance, 0, 0);
      
      const mealName = index === 0 ? 'Breakfast' : 'Dinner';
      
      records.push({
        id: `mock-meal-${currentDate.toISOString().split('T')[0]}-${mealName.toLowerCase()}-${dogId}`,
        dog_id: dogId,
        nutrition_plan_id: nutritionPlanId,
        meal_name: mealName,
        meal_time: `${String(mealTime.hour).padStart(2, '0')}:${String(mealTime.minute).padStart(2, '0')}`,
        scheduled_date: currentDate.toISOString().split('T')[0],
        completed_at: mealDate.toISOString(),
        amount_given: Number((dailyAmount / 2).toFixed(1)),
        notes: generateMealNotes(random),
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      });
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return records;
}

export function generateHistoricalWeightRecords(
  dogId: string,
  startWeight: number,
  months: number = 6
) {
  const records: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  let currentDate = new Date(startDate);
  let currentWeight = startWeight;
  
  while (currentDate <= endDate) {
    if (isDayForActivity(currentDate, MOCK_DATA_CONFIG.weight.frequencyDays, 1)) {
      const random = new SeededRandom(getSeedForDate(currentDate, dogId, 'weight'));
      const change = random.range(
        MOCK_DATA_CONFIG.weight.changeRange.min,
        MOCK_DATA_CONFIG.weight.changeRange.max
      );
      
      currentWeight = Number((currentWeight + change).toFixed(2));
      
      records.push({
        id: `mock-weight-${currentDate.toISOString().split('T')[0]}-${dogId}`,
        dog_id: dogId,
        weight: currentWeight,
        date: currentDate.toISOString(),
        notes: null,
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return records;
}

export function generateHistoricalHealthCheckups(
  dogId: string,
  months: number = 6
) {
  const records: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isDayForActivity(currentDate, MOCK_DATA_CONFIG.checkups.frequencyDays, 3)) {
      const random = new SeededRandom(getSeedForDate(currentDate, dogId, 'checkup'));
      const findings = generateCheckupFindings(random);
      const bodyScore = random.int(
        MOCK_DATA_CONFIG.checkups.bodyConditionRange.min,
        MOCK_DATA_CONFIG.checkups.bodyConditionRange.max
      );
      
      records.push({
        id: `mock-checkup-${currentDate.toISOString().split('T')[0]}-${dogId}`,
        dog_id: dogId,
        checkup_date: currentDate.toISOString(),
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
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return records;
}
