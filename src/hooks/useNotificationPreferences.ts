import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  feeding_reminders: boolean;
  bowl_cleaning_reminders: boolean;
  food_expiration_alerts: boolean;
  low_stock_alerts: boolean;
  health_pattern_alerts: boolean;
  weight_check_reminders: boolean;
  vaccination_reminders: boolean;
  reminder_time_offset_minutes: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  feeding_reminders: true,
  bowl_cleaning_reminders: true,
  food_expiration_alerts: true,
  low_stock_alerts: true,
  health_pattern_alerts: true,
  weight_check_reminders: true,
  vaccination_reminders: true,
  reminder_time_offset_minutes: 15,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.notification_preferences && typeof data.notification_preferences === 'object') {
        setPreferences({ ...DEFAULT_PREFERENCES, ...(data.notification_preferences as unknown as NotificationPreferences) });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    const newPreferences = { ...preferences, ...updates };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: 'Preferences Updated',
        description: 'Notification preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    }
  };

  const isInQuietHours = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = preferences.quiet_hours_start;
    const end = preferences.quiet_hours_end;

    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime < end;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    isInQuietHours,
    refetch: fetchPreferences,
  };
};
