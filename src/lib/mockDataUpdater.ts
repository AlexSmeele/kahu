import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { MOCK_DATA_CONFIG } from './mockDataConfig';
import {
  getLastAccessDate,
  setLastAccessDate,
  getGenerationStatus,
  setGenerationStatus,
  hasHistoricalData,
} from './mockDataStorage';
import {
  generateMockDataForDateRange,
  insertGeneratedData,
} from './mockDataGenerator';
import { MOCK_DOG_IDS } from './mockData';

/**
 * Update mock data when the mock user logs in
 */
export async function updateMockDataOnLogin(userId: string): Promise<void> {
  logger.info('Checking if mock data needs updating');
  
  try {
    const now = new Date();
    const lastAccess = getLastAccessDate();
    
    // Check if we need to generate historical data (first time)
    if (!hasHistoricalData()) {
      await generateHistoricalData(userId);
    }
    
    // Check if we need to generate incremental updates
    if (lastAccess) {
      const daysSinceLastAccess = Math.floor(
        (now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastAccess > 0) {
        logger.info('Generating incremental mock data', { daysSinceLastAccess });
        await generateIncrementalData(userId, lastAccess, now);
      }
    }
    
    // Update last access date
    setLastAccessDate(now);
    
  } catch (error) {
    logger.error('Error updating mock data', error);
    // Don't throw - allow app to continue with existing data
  }
}

/**
 * Generate historical mock data (6 months)
 */
async function generateHistoricalData(userId: string): Promise<void> {
  logger.info('Generating historical mock data');
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - MOCK_DATA_CONFIG.historicalMonths);
  
  // Generate for both mock dogs
  const dogIds = [MOCK_DOG_IDS.SUKI, MOCK_DOG_IDS.JETT];
  
  for (const dogId of dogIds) {
    try {
      // Get dog info for weight
      const { data: dog } = await supabase
        .from('dogs')
        .select('weight')
        .eq('id', dogId)
        .single();
      
      const dogWeight = dog?.weight ? Number(dog.weight) : 25;
      
      // Generate data
      const generatedData = await generateMockDataForDateRange(
        startDate,
        endDate,
        dogId,
        userId,
        dogWeight
      );
      
      // Insert into database
      await insertGeneratedData(generatedData);
      
      logger.info('Historical data generated for dog', { dogId, entries: generatedData.totalEntries });
    } catch (error) {
      logger.error('Error generating historical data for dog', error, { dogId });
    }
  }
  
  // Update generation status
  setGenerationStatus({
    lastGeneratedDate: endDate.toISOString(),
    historicalDataGenerated: true,
    totalEntriesGenerated: 0, // Would track actual count
  });
  
  logger.info('Historical mock data generation complete');
}

/**
 * Generate incremental mock data for days since last access
 */
async function generateIncrementalData(
  userId: string,
  lastAccess: Date,
  now: Date
): Promise<void> {
  // Start from the day after last access
  const startDate = new Date(lastAccess);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  
  // Limit to prevent generating too much data at once (max 30 days)
  const maxDays = 30;
  const daysDiff = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysDiff > maxDays) {
    startDate.setTime(endDate.getTime() - (maxDays * 24 * 60 * 60 * 1000));
    logger.info('Limiting incremental generation to last 30 days');
  }
  
  // Generate for both mock dogs
  const dogIds = [MOCK_DOG_IDS.SUKI, MOCK_DOG_IDS.JETT];
  
  for (const dogId of dogIds) {
    try {
      // Get dog info
      const { data: dog } = await supabase
        .from('dogs')
        .select('weight')
        .eq('id', dogId)
        .single();
      
      const dogWeight = dog?.weight ? Number(dog.weight) : 25;
      
      // Generate data
      const generatedData = await generateMockDataForDateRange(
        startDate,
        endDate,
        dogId,
        userId,
        dogWeight
      );
      
      // Insert into database
      await insertGeneratedData(generatedData);
      
      logger.info('Incremental data generated for dog', { dogId, entries: generatedData.totalEntries });
    } catch (error) {
      logger.error('Error generating incremental data for dog', error, { dogId });
    }
  }
  
  logger.info('Incremental mock data generation complete');
}
