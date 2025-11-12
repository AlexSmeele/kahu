/**
 * Persistent storage for selected dog ID
 * Prevents dog selection from reverting during navigation
 */

const STORAGE_KEY = 'app:selectedDogId';

/**
 * Get the stored selected dog ID from localStorage
 */
export function getStoredDogId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to read selected dog from localStorage:', error);
    return null;
  }
}

/**
 * Store the selected dog ID in localStorage
 */
export function setStoredDogId(dogId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, dogId);
  } catch (error) {
    console.error('Failed to store selected dog in localStorage:', error);
  }
}

/**
 * Clear the stored dog selection (called on logout)
 */
export function clearStoredDogId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear selected dog from localStorage:', error);
  }
}
