import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedBreedSelector } from "@/components/ui/enhanced-breed-selector";
import { BreedAutocomplete } from "@/components/ui/breed-autocomplete";
import { Camera, X, ArrowLeft, Check, ArrowRight, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import logoImage from "@/assets/logo-new.png";

interface MockDogOnboardingProps {
  onComplete: () => void;
}

interface DogData {
  name: string;
  gender: string;
  breed: string;
  breed_id: string | null;
  photo: File | null;
  photoPreview?: string;
  birthdayYear: string;
  birthdayMonth: string;
  birthdayDay: string;
  known_commands: string[];
  behavioral_goals: string[];
  training_time_commitment: string;
}

const TOTAL_STEPS = 7;

const AGE_RANGES = [
  { value: "puppy", label: "Puppy (0-1 year)", emoji: "🐶" },
  { value: "young", label: "Young (1-3 years)", emoji: "🦴" },
  { value: "adult", label: "Adult (3-7 years)", emoji: "🐕" },
  { value: "senior", label: "Senior (7-10 years)", emoji: "🦮" },
  { value: "elderly", label: "Elderly (10+ years)", emoji: "🐕‍🦺" },
];

const COMMANDS = [
  "Sit", "Stay", "Come", "Down", "Heel", "Leave it", "Drop it", "Wait"
];

const ADVANCED_COMMANDS = [
  "Place", "Fetch", "Roll over", "Play dead", "Speak", "Quiet", "Spin", "Shake", "Touch", "Back up", "Bow", "Crawl"
];

const BEHAVIORAL_ISSUES = [
  "Excessive barking",
  "Pulling on leash",
  "Jumping on people",
  "Separation anxiety",
  "Aggression towards other dogs",
  "Aggression towards people",
  "Fear or anxiety",
  "House training issues",
  "Destructive chewing",
  "Food guarding"
];

const TIME_COMMITMENTS = [
  { value: "5-10", label: "5-10 minutes per day" },
  { value: "10-20", label: "10-20 minutes per day" },
  { value: "20-30", label: "20-30 minutes per day" },
  { value: "30+", label: "30+ minutes per day" },
];

export function MockDogOnboarding({ onComplete }: MockDogOnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAdvancedCommands, setShowAdvancedCommands] = useState(false);
  
  const [dogData, setDogData] = useState<DogData>({
    name: '',
    gender: '',
    breed: '',
    breed_id: null,
    photo: null,
    photoPreview: '',
    birthdayYear: '',
    birthdayMonth: '',
    birthdayDay: '',
    known_commands: [],
    behavioral_goals: [],
    training_time_commitment: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDogData(prev => ({
          ...prev,
          photo: file,
          photoPreview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setDogData(prev => ({ ...prev, photo: null, photoPreview: '' }));
  };

  const toggleCommand = (command: string) => {
    setDogData(prev => ({
      ...prev,
      known_commands: prev.known_commands.includes(command)
        ? prev.known_commands.filter(c => c !== command)
        : [...prev.known_commands, command]
    }));
  };

  const toggleBehavioralGoal = (goal: string) => {
    setDogData(prev => ({
      ...prev,
      behavioral_goals: prev.behavioral_goals.includes(goal)
        ? prev.behavioral_goals.filter(g => g !== goal)
        : [...prev.behavioral_goals, goal]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    onComplete();
  };

  const isStepValid = () => {
    // Mock mode - allow skipping through without validation
    return true;
  };

  const getProgressPercentage = () => {
    return (step / TOTAL_STEPS) * 100;
  };

  // Step 1: Welcome & Name
  if (step === 1) {
    return (
       <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="px-6 pt-6 pb-4">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            MOCK MODE - No data will be saved
          </Badge>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
        <div className="text-center mb-6">
<img src={logoImage} alt="Kahu Logo" className="w-[83px] h-[83px] mx-auto mb-4 object-contain block" />
            <h1 className="text-3xl font-bold mb-2">Welcome to Kahu!</h1>
            <p className="text-muted-foreground">Let's start training your best friend</p>
          </div>

          <div className="space-y-2 mb-8">
            <Label htmlFor="dogName">What's your dog's name?</Label>
            <Input
              id="dogName"
              type="text"
              value={dogData.name}
              onChange={(e) => setDogData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Max, Luna, Charlie"
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              If you have more than one dog, you can add them next
            </p>
          </div>

          <div className="sticky bottom-0 left-0 right-0 pt-4">
            <Button
              size="lg"
              onClick={() => setStep(2)}
              disabled={!isStepValid()}
              className="w-full"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Gender & Photo
  if (step === 2) {
    const displayName = dogData.name.trim() || '[dog name]';
    
    return (
       <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="px-6 pt-6 pb-4">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            MOCK MODE
          </Badge>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Is {displayName} a boy or girl?</h1>
          </div>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={dogData.gender === 'male' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDogData(prev => ({ ...prev, gender: 'male' }))}
                className="h-32 flex flex-col gap-2"
              >
                <span className="text-5xl">♂</span>
                <span className="text-lg">Male</span>
              </Button>
              <Button
                variant={dogData.gender === 'female' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDogData(prev => ({ ...prev, gender: 'female' }))}
                className="h-32 flex flex-col gap-2"
              >
                <span className="text-5xl">♀</span>
                <span className="text-lg">Female</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Add a photo (optional)</Label>
              {dogData.photoPreview ? (
                <div className="relative">
                  <img
                    src={dogData.photoPreview}
                    alt="Dog preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Camera className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a photo of {displayName}
                  </p>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>
        
          <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep(3)}
              disabled={!isStepValid()}
              className="flex-1"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Age/Birthday & Breed Combined
  if (step === 3) {
    const displayName = dogData.name.trim() || '[dog name]';
    const pronoun = dogData.gender === 'male' ? 'he' : dogData.gender === 'female' ? 'she' : 'they';
    
    return (
       <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="px-6 pt-6 pb-4">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            MOCK MODE
          </Badge>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-28 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Tell us more about {displayName}</h1>
            <p className="text-muted-foreground">How old is {pronoun}?</p>
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
                    value={dogData.birthdayYear}
                    onChange={(e) => setDogData(prev => ({ ...prev, birthdayYear: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="number"
                    inputMode="numeric"
                    placeholder="MM"
                    value={dogData.birthdayMonth}
                    onChange={(e) => setDogData(prev => ({ ...prev, birthdayMonth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    type="number"
                    inputMode="numeric"
                    placeholder="DD"
                    value={dogData.birthdayDay}
                    onChange={(e) => setDogData(prev => ({ ...prev, birthdayDay: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                What breed is {dogData.gender === 'male' ? 'he' : dogData.gender === 'female' ? 'she' : displayName}?
              </label>
              <BreedAutocomplete
                value={dogData.breed}
                onChange={(breed) => setDogData(prev => ({ ...prev, breed }))}
                onBreedIdChange={(breedId) => setDogData(prev => ({ ...prev, breed_id: breedId }))}
                placeholder="Start typing breed name..."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Start typing to see matching breeds from our database
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // In mock mode, just a placeholder
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Custom/Mixed Breed
              </Button>
            </div>
          </div>
        </div>
        
          <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep(4)}
              disabled={!isStepValid()}
              className="flex-1"
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
    const displayName = dogData.name.trim() || '[dog name]';
    
    return (
       <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="px-6 pt-6 pb-4">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            MOCK MODE
          </Badge>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">What commands does {displayName} know?</h1>
            <p className="text-muted-foreground">Select all that apply</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-3">
              {COMMANDS.map((command) => (
                <div
                  key={command}
                  className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  onClick={() => toggleCommand(command)}
                >
                  <Checkbox
                    id={command}
                    checked={dogData.known_commands.includes(command)}
                    onCheckedChange={() => toggleCommand(command)}
                  />
                  <Label htmlFor={command} className="cursor-pointer flex-1">
                    {command}
                  </Label>
                </div>
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
                <div className="grid grid-cols-2 gap-3">
                  {ADVANCED_COMMANDS.map((command) => (
                    <div
                      key={command}
                      className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                      onClick={() => toggleCommand(command)}
                    >
                      <Checkbox
                        id={`adv-${command}`}
                        checked={dogData.known_commands.includes(command)}
                        onCheckedChange={() => toggleCommand(command)}
                      />
                      <Label htmlFor={`adv-${command}`} className="cursor-pointer flex-1">
                        {command}
                      </Label>
                    </div>
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
              size="lg"
              onClick={() => setStep(3)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep(5)}
              className="flex-1"
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="px-6 pt-6 pb-4">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            MOCK MODE
          </Badge>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Any behavioral issues to work on?</h1>
            <p className="text-muted-foreground">Select all that apply, or skip if none</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {BEHAVIORAL_ISSUES.map((issue) => (
                <Badge
                  key={issue}
                  variant={dogData.behavioral_goals.includes(issue) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm hover-scale"
                  onClick={() => toggleBehavioralGoal(issue)}
                >
                  {dogData.behavioral_goals.includes(issue) && (
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
              size="lg"
              onClick={() => setStep(4)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep(6)}
              className="flex-1"
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="px-6 pt-6 pb-4">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            MOCK MODE
          </Badge>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">How much time can you commit to training?</h1>
            <p className="text-muted-foreground">Be realistic - consistency is more important than duration</p>
          </div>

          <div className="space-y-3 mb-8">
            {TIME_COMMITMENTS.map((commitment) => (
              <Button
                key={commitment.value}
                variant={dogData.training_time_commitment === commitment.value ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDogData(prev => ({ ...prev, training_time_commitment: commitment.value }))}
                className="w-full justify-start h-14"
              >
                <span className="text-base">{commitment.label}</span>
              </Button>
            ))}
          </div>

        </div>
        
          <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(5)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep(7)}
              disabled={!isStepValid()}
              className="flex-1"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Summary & Complete
  if (step === 7) {
    const displayName = dogData.name.trim() || '[dog name]';
    
    return (
      <div className="relative h-full max-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col animate-fade-in overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="px-6 pt-6 pb-4">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            MOCK MODE - No data will be saved
          </Badge>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Great! Let's review</h1>
            <p className="text-muted-foreground">Here's what we know about {displayName}</p>
          </div>

          <div className="space-y-6 mb-8">
            {dogData.photoPreview && (
              <div className="w-full">
                <img
                  src={dogData.photoPreview}
                  alt={dogData.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {dogData.name || 'Not provided'}</p>
                  <p><span className="text-muted-foreground">Gender:</span> {dogData.gender ? dogData.gender.charAt(0).toUpperCase() + dogData.gender.slice(1) : 'Not provided'}</p>
                  <p><span className="text-muted-foreground">Birthday:</span> {
                    dogData.birthdayYear 
                      ? `${dogData.birthdayYear}${dogData.birthdayMonth ? `-${dogData.birthdayMonth.padStart(2, '0')}` : ''}${dogData.birthdayDay ? `-${dogData.birthdayDay.padStart(2, '0')}` : ''}`
                      : 'Not provided'
                  }</p>
                  <p><span className="text-muted-foreground">Breed:</span> {dogData.breed || 'Not provided'}</p>
                </div>
              </div>

              {dogData.known_commands.length > 0 && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold mb-2">Known Commands</h4>
                  <div className="flex flex-wrap gap-2">
                    {dogData.known_commands.map(cmd => (
                      <Badge key={cmd} variant="secondary">{cmd}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {dogData.behavioral_goals.length > 0 && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold mb-2">Training Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {dogData.behavioral_goals.map(goal => (
                      <Badge key={goal} variant="secondary">{goal}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {dogData.training_time_commitment && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold mb-2">Training Commitment</h4>
                  <p className="text-sm">{TIME_COMMITMENTS.find(t => t.value === dogData.training_time_commitment)?.label || 'Not provided'}</p>
                </div>
              )}
            </div>
          </div>

        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(6)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : (
                <>
                  Complete Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
