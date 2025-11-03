import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HouseholdStep } from "@/components/guide/onboarding/HouseholdStep";
import { HomeTypeStep } from "@/components/guide/onboarding/HomeTypeStep";
import { ScheduleStep } from "@/components/guide/onboarding/ScheduleStep";
import { ActivityLevelStep } from "@/components/guide/onboarding/ActivityLevelStep";
import { ExperienceStep } from "@/components/guide/onboarding/ExperienceStep";
import { BudgetStep } from "@/components/guide/onboarding/BudgetStep";
import { PreferencesStep } from "@/components/guide/onboarding/PreferencesStep";

interface LifestyleProfileData {
  household_adults: number;
  household_children: number;
  household_seniors: number;
  home_type: 'apartment' | 'house' | 'rural';
  outdoor_space: 'none' | 'small' | 'large';
  weekday_hours_away: number;
  weekend_hours_away: number;
  activity_level: 'low' | 'medium' | 'high';
  experience: 'first_time' | 'some' | 'experienced';
  allergies: boolean;
  budget_monthly_nzd: number;
  travel_frequency: 'rare' | 'sometimes' | 'often';
  preferences: {
    size: 'small' | 'medium' | 'large' | 'any';
    shedding: 'low' | 'medium' | 'high' | 'any';
    age: 'puppy' | 'adult' | 'senior' | 'any';
  };
  target_timeline_months?: number;
}

export default function GuideOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<LifestyleProfileData>({
    household_adults: 1,
    household_children: 0,
    household_seniors: 0,
    home_type: 'house',
    outdoor_space: 'small',
    weekday_hours_away: 8,
    weekend_hours_away: 2,
    activity_level: 'medium',
    experience: 'first_time',
    allergies: false,
    budget_monthly_nzd: 200,
    travel_frequency: 'rare',
    preferences: {
      size: 'any',
      shedding: 'any',
      age: 'any',
    },
  });

  const steps = [
    { component: HouseholdStep, title: "Your Household" },
    { component: HomeTypeStep, title: "Your Home" },
    { component: ScheduleStep, title: "Your Schedule" },
    { component: ActivityLevelStep, title: "Activity Level" },
    { component: ExperienceStep, title: "Experience" },
    { component: BudgetStep, title: "Budget" },
    { component: PreferencesStep, title: "Preferences" },
  ];

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/guide/intro');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('lifestyle_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
        });

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Let's start your learning journey.",
      });

      navigate('/guide/modules');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">{steps[currentStep].title}</h1>
            <div className="text-sm text-muted-foreground">
              {currentStep + 1}/{steps.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto">
        <CurrentStepComponent 
          data={profileData}
          setData={(updates: Partial<LifestyleProfileData>) => 
            setProfileData({ ...profileData, ...updates })
          }
        />
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={saving}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? (
              saving ? 'Saving...' : 'Complete'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
