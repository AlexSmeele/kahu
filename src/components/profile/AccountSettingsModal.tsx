import { useState } from "react";
import { Settings, Bell, Shield, Palette, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    mealReminders: true,
    vetReminders: true,
    trainingTips: true,
    marketingEmails: false,
    
    // Privacy settings
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    
    // App settings
    theme: 'system',
    language: 'en',
    timezone: 'auto',
    
    // Training settings
    aiPersonality: 'friendly',
    difficultyLevel: 'intermediate',
    autoProgress: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[calc(100vh-4rem)] max-h-[600px] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Account Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-2">
            {/* Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Notifications</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle('emailNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Mobile app notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={() => handleToggle('pushNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Meal Reminders</Label>
                    <p className="text-sm text-muted-foreground">Feeding time notifications</p>
                  </div>
                  <Switch
                    checked={settings.mealReminders}
                    onCheckedChange={() => handleToggle('mealReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Vet Reminders</Label>
                    <p className="text-sm text-muted-foreground">Vaccination & appointment reminders</p>
                  </div>
                  <Switch
                    checked={settings.vetReminders}
                    onCheckedChange={() => handleToggle('vetReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Training Tips</Label>
                    <p className="text-sm text-muted-foreground">Daily training suggestions</p>
                  </div>
                  <Switch
                    checked={settings.trainingTips}
                    onCheckedChange={() => handleToggle('trainingTips')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Product updates & offers</p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={() => handleToggle('marketingEmails')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy & Security */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Privacy & Security</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Who can see your profile</p>
                  </div>
                  <Select value={settings.profileVisibility} onValueChange={(value) => handleSelect('profileVisibility', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
                  </div>
                  <Switch
                    checked={settings.dataSharing}
                    onCheckedChange={() => handleToggle('dataSharing')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help improve the app</p>
                  </div>
                  <Switch
                    checked={settings.analytics}
                    onCheckedChange={() => handleToggle('analytics')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* App Preferences */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="font-medium">App Preferences</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Theme</Label>
                    <p className="text-sm text-muted-foreground">App appearance</p>
                  </div>
                  <Select value={settings.theme} onValueChange={(value) => handleSelect('theme', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Language</Label>
                    <p className="text-sm text-muted-foreground">App language</p>
                  </div>
                  <Select value={settings.language} onValueChange={(value) => handleSelect('language', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Timezone</Label>
                    <p className="text-sm text-muted-foreground">Time display settings</p>
                  </div>
                  <Select value={settings.timezone} onValueChange={(value) => handleSelect('timezone', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="pst">PST</SelectItem>
                      <SelectItem value="est">EST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Training Settings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-medium">AI Training Assistant</h3>
                <Badge variant="outline" className="text-primary border-primary/30">Pro</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">AI Personality</Label>
                    <p className="text-sm text-muted-foreground">Training assistant style</p>
                  </div>
                  <Select value={settings.aiPersonality} onValueChange={(value) => handleSelect('aiPersonality', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="encouraging">Encouraging</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Difficulty Level</Label>
                    <p className="text-sm text-muted-foreground">Training recommendations</p>
                  </div>
                  <Select value={settings.difficultyLevel} onValueChange={(value) => handleSelect('difficultyLevel', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto Progress</Label>
                    <p className="text-sm text-muted-foreground">Automatically advance training levels</p>
                  </div>
                  <Switch
                    checked={settings.autoProgress}
                    onCheckedChange={() => handleToggle('autoProgress')}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <Button onClick={onClose} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}