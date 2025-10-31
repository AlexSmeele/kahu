import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Bell, Clock, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NotificationPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationPreferencesModal = ({ open, onOpenChange }: NotificationPreferencesModalProps) => {
  const { preferences, updatePreferences, loading } = useNotificationPreferences();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = async () => {
    await updatePreferences(localPrefs);
    onOpenChange(false);
  };

  const togglePreference = (key: keyof typeof preferences, value: boolean) => {
    setLocalPrefs({ ...localPrefs, [key]: value });
  };

  const updateTimeValue = (key: string, value: string | number) => {
    setLocalPrefs({ ...localPrefs, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feeding & Nutrition */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Feeding & Nutrition</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feeding_reminders">Feeding Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified before meal times</p>
              </div>
              <Switch
                id="feeding_reminders"
                checked={localPrefs.feeding_reminders}
                onCheckedChange={(checked) => togglePreference('feeding_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bowl_cleaning_reminders">Bowl Cleaning Reminders</Label>
                <p className="text-xs text-muted-foreground">Alerts when bowls need cleaning</p>
              </div>
              <Switch
                id="bowl_cleaning_reminders"
                checked={localPrefs.bowl_cleaning_reminders}
                onCheckedChange={(checked) => togglePreference('bowl_cleaning_reminders', checked)}
              />
            </div>
          </Card>

          {/* Inventory Management */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Inventory Management</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="food_expiration_alerts">Food Expiration Alerts</Label>
                <p className="text-xs text-muted-foreground">Notify when food is expiring soon</p>
              </div>
              <Switch
                id="food_expiration_alerts"
                checked={localPrefs.food_expiration_alerts}
                onCheckedChange={(checked) => togglePreference('food_expiration_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                <p className="text-xs text-muted-foreground">Alert when food is running low</p>
              </div>
              <Switch
                id="low_stock_alerts"
                checked={localPrefs.low_stock_alerts}
                onCheckedChange={(checked) => togglePreference('low_stock_alerts', checked)}
              />
            </div>
          </Card>

          {/* Health & Wellness */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Health & Wellness</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="health_pattern_alerts">Health Pattern Alerts</Label>
                <p className="text-xs text-muted-foreground">Detect unusual patterns in health data</p>
              </div>
              <Switch
                id="health_pattern_alerts"
                checked={localPrefs.health_pattern_alerts}
                onCheckedChange={(checked) => togglePreference('health_pattern_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weight_check_reminders">Weight Check Reminders</Label>
                <p className="text-xs text-muted-foreground">Regular weight monitoring reminders</p>
              </div>
              <Switch
                id="weight_check_reminders"
                checked={localPrefs.weight_check_reminders}
                onCheckedChange={(checked) => togglePreference('weight_check_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vaccination_reminders">Vaccination Reminders</Label>
                <p className="text-xs text-muted-foreground">Upcoming vaccination alerts</p>
              </div>
              <Switch
                id="vaccination_reminders"
                checked={localPrefs.vaccination_reminders}
                onCheckedChange={(checked) => togglePreference('vaccination_reminders', checked)}
              />
            </div>
          </Card>

          {/* Timing Settings */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timing Settings
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="reminder_offset">Reminder Time (minutes before)</Label>
              <Input
                id="reminder_offset"
                type="number"
                min="0"
                max="120"
                value={localPrefs.reminder_time_offset_minutes}
                onChange={(e) => updateTimeValue('reminder_time_offset_minutes', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Get notified this many minutes before scheduled events
              </p>
            </div>
          </Card>

          {/* Quiet Hours */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Quiet Hours
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet_start">Start Time</Label>
                <Input
                  id="quiet_start"
                  type="time"
                  value={localPrefs.quiet_hours_start}
                  onChange={(e) => updateTimeValue('quiet_hours_start', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet_end">End Time</Label>
                <Input
                  id="quiet_end"
                  type="time"
                  value={localPrefs.quiet_hours_end}
                  onChange={(e) => updateTimeValue('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              No notifications will be sent during these hours
            </p>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
