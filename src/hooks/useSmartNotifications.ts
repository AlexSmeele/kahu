import { useEffect, useCallback } from 'react';
import { useNotificationPreferences } from './useNotificationPreferences';
import { useNotifications } from './useNotifications';
import { useFoodInventory } from './useFoodInventory';
import { useNutrition } from './useNutrition';
import { differenceInHours, parseISO, addMinutes, isBefore } from 'date-fns';

export const useSmartNotifications = (dogId?: string) => {
  const { preferences, isInQuietHours } = useNotificationPreferences();
  const { createNotification } = useNotifications();
  const { inventoryItems, getLowStockItems, getExpiringItems } = useFoodInventory(dogId);
  const { nutritionPlan } = useNutrition(dogId);

  const checkBowlCleaningReminders = useCallback(async () => {
    if (!preferences.bowl_cleaning_reminders || !nutritionPlan || isInQuietHours()) return;

    const now = new Date();

    // Check food bowl
    if (nutritionPlan.bowl_last_cleaned) {
      const lastCleaned = parseISO(nutritionPlan.bowl_last_cleaned);
      const hoursSinceClean = differenceInHours(now, lastCleaned);

      if (hoursSinceClean >= 24) {
        await createNotification(
          'bowl_cleaning',
          'Food Bowl Needs Cleaning',
          `It's been ${Math.floor(hoursSinceClean)} hours since the last cleaning. Time to wash the food bowl!`,
          'high',
          dogId,
          '/nutrition'
        );
      }
    }

    // Check water bowl
    if (nutritionPlan.water_bowl_last_cleaned) {
      const lastCleaned = parseISO(nutritionPlan.water_bowl_last_cleaned);
      const hoursSinceClean = differenceInHours(now, lastCleaned);

      if (hoursSinceClean >= 12) {
        await createNotification(
          'bowl_cleaning',
          'Water Bowl Needs Cleaning',
          `It's been ${Math.floor(hoursSinceClean)} hours since the last cleaning. Fresh water bowls are important!`,
          'normal',
          dogId,
          '/nutrition'
        );
      }
    }
  }, [preferences, nutritionPlan, isInQuietHours, dogId, createNotification]);

  const checkInventoryAlerts = useCallback(async () => {
    if (isInQuietHours() || !dogId) return;

    // Low stock alerts
    if (preferences.low_stock_alerts) {
      const lowStockItems = getLowStockItems();
      
      if (lowStockItems.length > 0) {
        await createNotification(
          'inventory',
          'Low Stock Alert',
          `${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} running low: ${lowStockItems.map(i => i.food_name).join(', ')}`,
          'normal',
          dogId,
          '/nutrition'
        );
      }
    }

    // Expiration alerts
    if (preferences.food_expiration_alerts) {
      const expiringItems = getExpiringItems(7); // 7 days
      
      if (expiringItems.length > 0) {
        await createNotification(
          'inventory',
          'Food Expiring Soon',
          `${expiringItems.length} item${expiringItems.length > 1 ? 's' : ''} expiring within 7 days`,
          'high',
          dogId,
          '/nutrition'
        );
      }
    }
  }, [preferences, inventoryItems, isInQuietHours, dogId, getLowStockItems, getExpiringItems, createNotification]);

  const checkFeedingReminders = useCallback(async () => {
    if (!preferences.feeding_reminders || !nutritionPlan?.meal_schedule || isInQuietHours()) return;

    const now = new Date();
    const offsetMinutes = preferences.reminder_time_offset_minutes;

    for (const meal of nutritionPlan.meal_schedule) {
      if (!meal.reminder_enabled) continue;

      // Parse meal time
      const [hours, minutes] = meal.time.split(':').map(Number);
      const mealTime = new Date(now);
      mealTime.setHours(hours, minutes, 0, 0);

      // Calculate reminder time
      const reminderTime = addMinutes(mealTime, -offsetMinutes);

      // Check if we should send reminder (within 5 minutes window)
      const diffInMinutes = Math.abs((now.getTime() - reminderTime.getTime()) / 60000);
      
      if (diffInMinutes <= 5 && isBefore(now, mealTime)) {
        await createNotification(
          'feeding',
          `${meal.name} Coming Up`,
          `Time to prepare ${meal.name} - ${meal.amount} cups of ${meal.food_type}`,
          'normal',
          dogId,
          '/nutrition',
          undefined,
          reminderTime
        );
      }
    }
  }, [preferences, nutritionPlan, isInQuietHours, dogId, createNotification]);

  // Run checks periodically
  useEffect(() => {
    if (!dogId) return;

    // Initial checks
    checkBowlCleaningReminders();
    checkInventoryAlerts();
    checkFeedingReminders();

    // Set up intervals
    const bowlInterval = setInterval(checkBowlCleaningReminders, 60 * 60 * 1000); // Every hour
    const inventoryInterval = setInterval(checkInventoryAlerts, 6 * 60 * 60 * 1000); // Every 6 hours
    const feedingInterval = setInterval(checkFeedingReminders, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearInterval(bowlInterval);
      clearInterval(inventoryInterval);
      clearInterval(feedingInterval);
    };
  }, [dogId, checkBowlCleaningReminders, checkInventoryAlerts, checkFeedingReminders]);

  return {
    checkBowlCleaningReminders,
    checkInventoryAlerts,
    checkFeedingReminders,
  };
};
