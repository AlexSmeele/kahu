-- Add notification preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "feeding_reminders": true,
  "bowl_cleaning_reminders": true,
  "food_expiration_alerts": true,
  "low_stock_alerts": true,
  "health_pattern_alerts": true,
  "weight_check_reminders": true,
  "vaccination_reminders": true,
  "reminder_time_offset_minutes": 15,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "07:00"
}'::jsonb;

COMMENT ON COLUMN public.profiles.notification_preferences IS 'User notification preferences for various alerts and reminders';