const STORAGE_KEYS = {
  LAST_ACCESS: 'mock_user_last_access',
  GENERATED_IDS: 'mock_generated_ids',
  GENERATION_STATUS: 'mock_generation_status',
} as const;

export interface GenerationStatus {
  lastGeneratedDate: string;
  historicalDataGenerated: boolean;
  totalEntriesGenerated: number;
}

/**
 * Get the last access date for the mock user
 */
export function getLastAccessDate(): Date | null {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_ACCESS);
  if (!stored) return null;
  return new Date(stored);
}

/**
 * Set the last access date for the mock user
 */
export function setLastAccessDate(date: Date): void {
  localStorage.setItem(STORAGE_KEYS.LAST_ACCESS, date.toISOString());
}

/**
 * Get all existing mock data IDs to avoid duplicates
 */
export function getExistingMockIds(): Set<string> {
  const stored = localStorage.getItem(STORAGE_KEYS.GENERATED_IDS);
  if (!stored) return new Set();
  
  try {
    const ids = JSON.parse(stored);
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

/**
 * Add a mock data ID to the registry
 */
export function addMockId(id: string): void {
  const existing = getExistingMockIds();
  existing.add(id);
  localStorage.setItem(STORAGE_KEYS.GENERATED_IDS, JSON.stringify([...existing]));
}

/**
 * Add multiple mock data IDs at once
 */
export function addMockIds(ids: string[]): void {
  const existing = getExistingMockIds();
  ids.forEach(id => existing.add(id));
  localStorage.setItem(STORAGE_KEYS.GENERATED_IDS, JSON.stringify([...existing]));
}

/**
 * Get the generation status
 */
export function getGenerationStatus(): GenerationStatus | null {
  const stored = localStorage.getItem(STORAGE_KEYS.GENERATION_STATUS);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Update the generation status
 */
export function setGenerationStatus(status: GenerationStatus): void {
  localStorage.setItem(STORAGE_KEYS.GENERATION_STATUS, JSON.stringify(status));
}

/**
 * Clear all mock data storage (useful for testing)
 */
export function clearMockDataStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.LAST_ACCESS);
  localStorage.removeItem(STORAGE_KEYS.GENERATED_IDS);
  localStorage.removeItem(STORAGE_KEYS.GENERATION_STATUS);
}

/**
 * Check if historical data has been generated
 */
export function hasHistoricalData(): boolean {
  const status = getGenerationStatus();
  return status?.historicalDataGenerated || false;
}
