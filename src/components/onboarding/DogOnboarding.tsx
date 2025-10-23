import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Upload, X, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDogs, Dog, calculateAge } from '@/hooks/useDogs';
import { BreedAutocomplete } from '@/components/ui/breed-autocomplete';
import { EnhancedBreedSelector } from '@/components/ui/enhanced-breed-selector';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import logoIcon from '@/assets/logo-new.png';

interface DogOnboardingProps {
  onComplete: (dog: Dog) => void;
}

const TOTAL_STEPS = 7;

const AGE_RANGES = [
  { value: 'under_6m', label: 'Younger than 6 months', emoji: '🐕' },
  { value: '6_12m', label: '6 to 12 months', emoji: '🐕' },
  { value: '1_2y', label: '1 to 2 years', emoji: '🐕' },
  { value: '2_7y', label: '2 to 7 years', emoji: '🐶' },
  { value: 'over_7y', label: 'Over 7 years', emoji: '🐕‍🦺' }
];

const COMMANDS = [
  'Name', 'Sit', 'Down', 'Stay', 'Come', 'Leave it', 'High Five', 'None of the above'
];

const ADVANCED_COMMANDS = [
  'Heel', 'Place', 'Wait', 'Drop it', 'Fetch', 'Roll over', 'Play dead', 'Speak', 'Quiet', 'Spin', 'Shake', 'Touch'
];

const BEHAVIORAL_ISSUES = [
  'Barking', 'Walking Issues', 'Separation anxiety', 'Potty issues', 
  'Chewing', 'Biting', 'Jumping', 'Pulling on leash', 'Aggression', 
  'None of the above'
];

const TIME_COMMITMENTS = [
  { value: 'under_5min', label: 'Less than 5 min' },
  { value: '5_10min', label: '5-10 min' },
  { value: '10_20min', label: '10-20 min' },
  { value: 'over_20min', label: 'More than 20 min' }
];

export function DogOnboarding({ onComplete }: DogOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    breed_id: null as string | null,
    gender: '' as 'male' | 'female' | '',
    age_range: '',
    birthdayYear: '',
    birthdayMonth: '',
    birthdayDay: '',
    known_commands: [] as string[],
    behavioral_goals: [] as string[],
    training_time_commitment: '',
    weight: '',
    is_shelter_dog: false,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomBreedSelector, setShowCustomBreedSelector] = useState(false);
  const [showAdvancedCommands, setShowAdvancedCommands] = useState(false);
  const { addDog } = useDogs();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const toggleCommand = (command: string) => {
    setFormData(prev => ({
      ...prev,
      known_commands: prev.known_commands.includes(command)
        ? prev.known_commands.filter(c => c !== command)
        : [...prev.known_commands, command]
    }));
  };

  const toggleBehavioralGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      behavioral_goals: prev.behavioral_goals.includes(goal)
        ? prev.behavioral_goals.filter(g => g !== goal)
        : [...prev.behavioral_goals, goal]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.breed_id) return;
    
    setLoading(true);

    const birthday = (() => {
      const y = formData.birthdayYear?.trim();
      if (!y) return undefined;
      const m = (formData.birthdayMonth || '01').toString().padStart(2, '0');
      const d = (formData.birthdayDay || '01').toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();
    
    const dogData = {
      name: formData.name,
      breed_id: formData.breed_id,
      gender: formData.gender || undefined,
      birthday,
      known_commands: formData.known_commands,
      behavioral_goals: formData.behavioral_goals,
      training_time_commitment: formData.training_time_commitment || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      is_shelter_dog: formData.is_shelter_dog,
    };

    const newDog = await addDog(dogData, photo || undefined);
    if (newDog) {
      onComplete(newDog);
    }
    setLoading(false);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.name.trim() !== '';
      case 2: return formData.gender !== '';
      case 3: return !!formData.breed_id && formData.birthdayYear.trim() !== '';
      case 4: return true; // Commands optional
      case 5: return true; // Behavioral goals optional
      case 6: return formData.training_time_commitment !== '';
      case 7: return true; // Final details optional
      default: return false;
    }
  };

  const getProgressPercentage = () => (step / TOTAL_STEPS) * 100;

  // Step 1: Welcome & Name
  if (step === 1) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 1 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
<img src={logoIcon} alt="Kahu Logo" className="mx-auto w-[83px] h-[83px] mb-4 object-contain block" />
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to Kahu!
            </CardTitle>
            <p className="text-muted-foreground">
              Let's start by getting to know your furry friend
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-24">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                What's your dog's name? *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your dog's name"
                className="text-center text-lg font-medium"
              />
              <p className="text-xs text-muted-foreground">
                If you have more than one dog, you can add them next
              </p>
            </div>

            <div className="sticky bottom-0 left-0 right-0 pt-4">
              <Button 
                size="touch"
                onClick={() => setStep(2)}
                disabled={!isStepValid()}
                className="w-full btn-primary hover-scale"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Gender & Photo
  if (step === 2) {
    const displayName = formData.name.trim() || '[dog name]';
    
    return (
       <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button 
              variant="outline"
              size="touch"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              size="touch"
              onClick={() => setStep(3)}
              disabled={!isStepValid()}
              className="flex-1 btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Age Range
  if (step === 3) {
    const displayName = formData.name.trim() || '[dog name]';
    
    return (
        <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>
        
        <div className="flex-1 flex flex-col px-6 pb-28 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Tell us more about {displayName}</h1>
            <p className="text-muted-foreground">How old is {formData.gender === 'male' ? 'he' : formData.gender === 'female' ? 'she' : 'they'}?</p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    inputMode="numeric"
                    placeholder="YYYY"
                    value={formData.birthdayYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthdayYear: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="number"
                    inputMode="numeric"
                    placeholder="MM"
                    value={formData.birthdayMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthdayMonth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    type="number"
                    inputMode="numeric"
                    placeholder="DD"
                    value={formData.birthdayDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthdayDay: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                What breed is {formData.gender === 'male' ? 'he' : formData.gender === 'female' ? 'she' : displayName}?
              </label>
              <BreedAutocomplete
                value={formData.breed}
                onChange={(breed) => setFormData(prev => ({ ...prev, breed }))}
                onBreedIdChange={(breedId) => setFormData(prev => ({ ...prev, breed_id: breedId }))}
                placeholder="Start typing breed name..."
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Start typing to see matching breeds from our database
              </p>
              {showCustomBreedSelector ? (
                <EnhancedBreedSelector
                  value={formData.breed}
                  onBreedSelect={(breedId, isCustom, breedName) => {
                    setFormData(prev => ({ ...prev, breed: breedName, breed_id: breedId }));
                    setShowCustomBreedSelector(false);
                  }}
                  placeholder="Start typing breed name..."
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCustomBreedSelector(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Custom/Mixed Breed
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button 
              variant="outline"
              size="touch"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              size="touch"
              onClick={() => setStep(4)}
              disabled={!isStepValid()}
              className="flex-1 btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }


  // Step 4: Known Commands
  if (step === 4) {
    const displayName = formData.name.trim() || '[dog name]';
    
    return (
        <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>
        
        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Which commands does {displayName} know?</h1>
            <p className="text-muted-foreground">Mark all that {displayName} knows for sure!</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {COMMANDS.map((command) => (
                <Badge
                  key={command}
                  variant={formData.known_commands.includes(command) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm hover-scale"
                  onClick={() => toggleCommand(command)}
                >
                  {formData.known_commands.includes(command) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {command}
                </Badge>
              ))}
            </div>

            <Collapsible open={showAdvancedCommands} onOpenChange={setShowAdvancedCommands}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 hover:bg-accent/50"
                >
                  <span className="font-medium">Advanced Commands</span>
                  {showAdvancedCommands ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="flex flex-wrap gap-2">
                  {ADVANCED_COMMANDS.map((command) => (
                    <Badge
                      key={command}
                      variant={formData.known_commands.includes(command) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm hover-scale"
                      onClick={() => toggleCommand(command)}
                    >
                      {formData.known_commands.includes(command) && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {command}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button 
              variant="outline"
              size="touch"
              onClick={() => setStep(3)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              size="touch"
              onClick={() => setStep(5)}
              className="flex-1 btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Behavioral Goals
  if (step === 5) {
    return (
         <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Training goals 1/2</p>
        </div>
        
        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Which behavioral issues would you like to solve?</h1>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {BEHAVIORAL_ISSUES.map((issue) => (
                <Badge
                  key={issue}
                  variant={formData.behavioral_goals.includes(issue) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm hover-scale"
                  onClick={() => toggleBehavioralGoal(issue)}
                >
                  {formData.behavioral_goals.includes(issue) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {issue}
                </Badge>
              ))}
            </div>
          </div>

        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button 
              variant="outline"
              size="touch"
              onClick={() => setStep(4)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              size="touch"
              onClick={() => setStep(6)}
              className="flex-1 btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Time Commitment
  if (step === 6) {
    return (
         <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Training goals 2/2</p>
        </div>
        
        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">How much time can you spend training?</h1>
            <p className="text-muted-foreground">Per day</p>
          </div>

          <div className="space-y-3 mb-8">
            {TIME_COMMITMENTS.map((time) => (
              <button
                key={time.value}
                onClick={() => setFormData(prev => ({ ...prev, training_time_commitment: time.value }))}
                className={cn(
                  "w-full p-4 rounded-lg border-2 transition-all hover-scale text-center font-medium",
                  formData.training_time_commitment === time.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {time.label}
                {formData.training_time_commitment === time.value && (
                  <Check className="w-5 h-5 ml-2 inline text-primary" />
                )}
              </button>
            ))}
          </div>

        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button 
              variant="outline"
              size="touch"
              onClick={() => setStep(5)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              size="touch"
              onClick={() => setStep(7)}
              disabled={!isStepValid()}
              className="flex-1 btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Final Details & Summary
  if (step === 7) {
    const ageLabel = AGE_RANGES.find(r => r.value === formData.age_range)?.label || formData.age_range;
    const displayName = formData.name.trim() || '[dog name]';
    
    return (
      <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>
        
        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <img src={logoIcon} alt="Kahu Logo" className="mx-auto w-16 h-16 mb-4 object-contain block" />
            <h1 className="text-3xl font-bold mb-2">Welcome, {formData.name}!</h1>
            <p className="text-muted-foreground">Just a few more optional details</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) - optional</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="25"
                min="0"
                max="200"
                step="0.1"
              />
            </div>

            <div className="space-y-3">
              <Label>Have you adopted {displayName} from a shelter?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, is_shelter_dog: true }))}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all hover-scale font-medium",
                    formData.is_shelter_dog
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  Yes
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, is_shelter_dog: false }))}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all hover-scale font-medium",
                    !formData.is_shelter_dog
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  No
                </button>
              </div>
              {formData.is_shelter_dog && (
                <p className="text-xs text-muted-foreground">
                  Kahu's program for rescued dogs can help you bond better
                </p>
              )}
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-foreground">Profile Summary:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium">Name:</span> {formData.name}</p>
                {formData.breed && <p><span className="font-medium">Breed:</span> {formData.breed}</p>}
                {formData.gender && <p><span className="font-medium">Gender:</span> {formData.gender === 'male' ? 'Male' : 'Female'}</p>}
                {formData.age_range && <p><span className="font-medium">Age:</span> {ageLabel}</p>}
                {formData.weight && <p><span className="font-medium">Weight:</span> {formData.weight} kg</p>}
                {photo && <p><span className="font-medium">Photo:</span> Uploaded</p>}
                {formData.known_commands.length > 0 && (
                  <p><span className="font-medium">Known commands:</span> {formData.known_commands.join(', ')}</p>
                )}
                {formData.behavioral_goals.length > 0 && (
                  <p><span className="font-medium">Training goals:</span> {formData.behavioral_goals.join(', ')}</p>
                )}
                {formData.training_time_commitment && (
                  <p><span className="font-medium">Training time:</span> {TIME_COMMITMENTS.find(t => t.value === formData.training_time_commitment)?.label}</p>
                )}
              </div>
            </div>
          </div>

        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button 
              variant="outline"
              size="touch"
              onClick={() => setStep(6)}
              className="flex-1"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              size="touch"
              onClick={handleSubmit}
              className="flex-1 btn-primary hover-scale"
              disabled={loading}
            >
              {loading ? 'Creating...' : "Let's Start!"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}