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

// Simple seeded random for historical data
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(Math.sin(hash));
}

// Generate historical vet visit records
export function generateHistoricalVetVisits(dogId: string, months: number = 3) {
  const visits: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const visitTypes = [
    { type: 'Annual Wellness', reason: 'Annual wellness examination' },
    { type: 'Vaccine Appointment', reason: 'Vaccination booster' },
    { type: 'Follow-up Visit', reason: 'Follow-up examination' },
    { type: 'Dental Cleaning', reason: 'Professional dental cleaning' },
  ];
  
  const veterinarians = ['Dr. Sarah Chen', 'Dr. Michael Roberts', 'Dr. Emily Thompson'];
  
  // Generate 1-2 vet visits over the period
  const numVisits = seededRandom(dogId + 'vet_count') < 0.5 ? 1 : 2;
  
  for (let i = 0; i < numVisits; i++) {
    const dayOffset = Math.floor(seededRandom(dogId + `vet_${i}`) * (months * 30));
    const visitDate = new Date(startDate);
    visitDate.setDate(visitDate.getDate() + dayOffset);
    
    const visitTypeIndex = Math.floor(seededRandom(dogId + `vet_type_${i}`) * visitTypes.length);
    const visitInfo = visitTypes[visitTypeIndex];
    const vetIndex = Math.floor(seededRandom(dogId + `vet_name_${i}`) * veterinarians.length);
    
    visits.push({
      id: `hist-vet-${dogId}-${i}`,
      dog_id: dogId,
      record_type: 'vet_visit',
      title: visitInfo.type,
      date: visitDate.toISOString().split('T')[0],
      veterinarian: veterinarians[vetIndex],
      reason: visitInfo.reason,
      description: `Routine ${visitInfo.type.toLowerCase()}`,
      notes: 'No concerns noted',
      created_at: visitDate.toISOString(),
      updated_at: visitDate.toISOString(),
    });
  }
  
  return visits;
}

// Generate historical grooming completion records
export function generateHistoricalGroomingRecords(dogId: string, months: number = 3) {
  const groomingRecords: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const groomingTypes = [
    { type: 'bath', frequency: 8, title: 'Bath' },
    { type: 'nails', frequency: 14, title: 'Nail Trim' },
    { type: 'ears', frequency: 7, title: 'Ear Cleaning' },
    { type: 'teeth', frequency: 4, title: 'Teeth Brushing' },
  ];
  
  groomingTypes.forEach((grooming) => {
    let currentDate = new Date(startDate);
    let recordIndex = 0;
    
    while (currentDate <= endDate) {
      const variance = Math.floor(seededRandom(dogId + grooming.type + recordIndex) * 2) - 1;
      currentDate.setDate(currentDate.getDate() + grooming.frequency + variance);
      
      if (currentDate <= endDate) {
        groomingRecords.push({
          id: `hist-groom-${dogId}-${grooming.type}-${recordIndex}`,
          dog_id: dogId,
          record_type: 'grooming',
          title: grooming.title,
          date: currentDate.toISOString().split('T')[0],
          description: `Completed ${grooming.title.toLowerCase()}`,
          notes: 'No issues',
          created_at: currentDate.toISOString(),
          updated_at: currentDate.toISOString(),
        });
      }
      
      recordIndex++;
    }
  });
  
  return groomingRecords;
}

// Generate historical vaccination records
export function generateHistoricalVaccinations(dogId: string, months: number = 3) {
  const vaccinations: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  // Common vaccine IDs from MOCK_VACCINES
  const vaccineIds = [
    '00000000-0000-0000-0000-000000000201', // Rabies
    '00000000-0000-0000-0000-000000000202', // DHPP
    '00000000-0000-0000-0000-000000000203', // Bordetella
  ];
  
  const veterinarians = ['Dr. Sarah Chen', 'Dr. Michael Roberts', 'Dr. Emily Thompson'];
  
  // Generate 1-2 vaccination records
  const numVaccinations = seededRandom(dogId + 'vacc_count') < 0.6 ? 1 : 2;
  
  for (let i = 0; i < numVaccinations; i++) {
    const dayOffset = Math.floor(seededRandom(dogId + `vacc_${i}`) * (months * 30));
    const adminDate = new Date(startDate);
    adminDate.setDate(adminDate.getDate() + dayOffset);
    
    const vaccineId = vaccineIds[Math.floor(seededRandom(dogId + `vacc_id_${i}`) * vaccineIds.length)];
    const vetIndex = Math.floor(seededRandom(dogId + `vacc_vet_${i}`) * veterinarians.length);
    
    const dueDate = new Date(adminDate);
    dueDate.setFullYear(dueDate.getFullYear() + 1);
    
    vaccinations.push({
      id: `hist-vacc-${dogId}-${i}`,
      dog_id: dogId,
      vaccine_id: vaccineId,
      administered_date: adminDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      veterinarian: veterinarians[vetIndex],
      batch_number: `BATCH${Math.floor(seededRandom(dogId + `batch_${i}`) * 10000)}`,
      notes: 'Vaccine administered without complications',
      created_at: adminDate.toISOString(),
      updated_at: adminDate.toISOString(),
    });
  }
  
  return vaccinations;
}

// Generate historical injury/incident records
export function generateHistoricalInjuries(dogId: string, months: number = 3) {
  const injuries: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  // Low probability of injuries (15% chance)
  if (seededRandom(dogId + 'injury_chance') > 0.15) {
    return injuries;
  }
  
  const incidentTypes = [
    { type: 'Minor Cut', description: 'Small cut on paw pad, cleaned and monitored' },
    { type: 'Upset Stomach', description: 'Mild gastrointestinal upset, resolved with bland diet' },
    { type: 'Sprain', description: 'Minor sprain from play, rest recommended' },
    { type: 'Skin Irritation', description: 'Small area of skin irritation, treated topically' },
  ];
  
  // Generate 0-2 incidents
  const numIncidents = seededRandom(dogId + 'injury_count') < 0.5 ? 1 : 2;
  
  for (let i = 0; i < numIncidents; i++) {
    const dayOffset = Math.floor(seededRandom(dogId + `injury_${i}`) * (months * 30));
    const incidentDate = new Date(startDate);
    incidentDate.setDate(incidentDate.getDate() + dayOffset);
    
    const incidentIndex = Math.floor(seededRandom(dogId + `injury_type_${i}`) * incidentTypes.length);
    const incident = incidentTypes[incidentIndex];
    
    injuries.push({
      id: `hist-injury-${dogId}-${i}`,
      dog_id: dogId,
      record_type: 'injury',
      title: incident.type,
      date: incidentDate.toISOString().split('T')[0],
      description: incident.description,
      notes: 'Resolved without veterinary intervention',
      created_at: incidentDate.toISOString(),
      updated_at: incidentDate.toISOString(),
    });
  }
  
  return injuries;
}

// Generate historical medical treatment records
export function generateHistoricalMedicalTreatments(dogId: string, months: number = 3) {
  const treatments: any[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const treatmentTypes = [
    { name: 'Flea & Tick Prevention', frequency: 4 },
    { name: 'Heartworm Prevention', frequency: 4 },
  ];
  
  treatmentTypes.forEach((treatment, treatmentIndex) => {
    let currentDate = new Date(startDate);
    let adminIndex = 0;
    
    while (currentDate <= endDate) {
      currentDate.setDate(currentDate.getDate() + (treatment.frequency * 7));
      
      if (currentDate <= endDate) {
        const nextDue = new Date(currentDate);
        nextDue.setDate(nextDue.getDate() + (treatment.frequency * 7));
        
        treatments.push({
          id: `hist-treatment-${dogId}-${treatmentIndex}-${adminIndex}`,
          dog_id: dogId,
          treatment_name: treatment.name,
          last_administered_date: currentDate.toISOString(),
          frequency_weeks: treatment.frequency,
          next_due_date: nextDue.toISOString().split('T')[0],
          notes: 'Monthly preventive care',
          created_at: currentDate.toISOString(),
          updated_at: currentDate.toISOString(),
        });
      }
      
      adminIndex++;
    }
  });
  
  return treatments;
}
