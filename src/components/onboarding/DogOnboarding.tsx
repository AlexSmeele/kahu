import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Upload, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDogs, Dog, calculateAge } from '@/hooks/useDogs';
import { BreedAutocomplete } from '@/components/ui/breed-autocomplete';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-image.jpg';
import logoIcon from '@/assets/logo-transparent.png';

interface DogOnboardingProps {
  onComplete: (dog: Dog) => void;
}

const TOTAL_STEPS = 9;

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
    known_commands: [] as string[],
    behavioral_goals: [] as string[],
    training_time_commitment: '',
    weight: '',
    is_shelter_dog: false,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    
    const dogData = {
      name: formData.name,
      breed_id: formData.breed_id,
      gender: formData.gender || undefined,
      age_range: formData.age_range || undefined,
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
      case 3: return formData.age_range !== '';
      case 4: return formData.breed_id !== null;
      case 5: return true; // Photo optional
      case 6: return true; // Commands optional
      case 7: return true; // Behavioral goals optional
      case 8: return formData.training_time_commitment !== '';
      case 9: return true; // Final details optional
      default: return false;
    }
  };

  const getProgressPercentage = () => (step / TOTAL_STEPS) * 100;

  // Step 1: Welcome & Name
  if (step === 1) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 1 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 mb-4 rounded-full overflow-hidden bg-primary">
              <img src={logoIcon} alt="Kahu Logo" className="w-full h-full object-cover block" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to Kahu!
            </CardTitle>
            <p className="text-muted-foreground">
              Let's start by getting to know your furry friend
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="w-full mb-6">
              <img 
                src={heroImage} 
                alt="Happy dog"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>

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
            </div>

            <Button 
              size="touch"
              onClick={() => setStep(2)}
              disabled={!isStepValid()}
              className="w-full btn-primary hover-scale"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Gender
  if (step === 2) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 2 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              What's {formData.name}'s gender?
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                className={cn(
                  "p-8 rounded-lg border-2 transition-all hover-scale",
                  formData.gender === 'male'
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="text-4xl mb-2">♂</div>
                <div className="font-medium">Male</div>
              </button>
              
              <button
                onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                className={cn(
                  "p-8 rounded-lg border-2 transition-all hover-scale",
                  formData.gender === 'female'
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/50"
                )}
              >
                <div className="text-4xl mb-2">♀</div>
                <div className="font-medium">Female</div>
              </button>
            </div>

            <div className="flex gap-3 pt-4">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Age Range
  if (step === 3) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 3 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              How old is {formData.name}?
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              {AGE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setFormData(prev => ({ ...prev, age_range: range.value }))}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all hover-scale text-left flex items-center gap-3",
                    formData.age_range === range.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{range.emoji}</span>
                  <span className="font-medium">{range.label}</span>
                  {formData.age_range === range.value && (
                    <Check className="w-5 h-5 ml-auto text-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Breed
  if (step === 4) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 4 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              What's {formData.name}'s breed?
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Get breed-based tips for faster and easier learning
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Breed *</Label>
              <BreedAutocomplete
                value={formData.breed}
                onChange={(breed) => setFormData(prev => ({ ...prev, breed }))}
                onBreedIdChange={(breedId) => setFormData(prev => ({ ...prev, breed_id: breedId }))}
                placeholder="e.g., Golden Retriever, Mixed"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
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
                disabled={!isStepValid()}
                className="flex-1 btn-primary"
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

  // Step 5: Photo Upload
  if (step === 5) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 5 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              Let's see that adorable face!
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload a photo of {formData.name} (optional)
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Dog preview"
                  className="w-full h-64 object-cover rounded-lg"
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
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a photo of {formData.name}
                </p>
                <Button type="button" variant="outline" asChild>
                  <label className="cursor-pointer">
                    Choose File
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

            <div className="flex gap-3 pt-4">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 6: Known Commands
  if (step === 6) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 6 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              Which commands does {formData.name} know?
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mark all that {formData.name} knows for sure!
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
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

            <div className="flex gap-3 pt-4">
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
                className="flex-1 btn-primary"
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

  // Step 7: Behavioral Goals
  if (step === 7) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Training goals 1/2</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              Which behavioral issues would you like to solve?
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {BEHAVIORAL_ISSUES.map((issue) => (
                <Badge
                  key={issue}
                  variant={formData.behavioral_goals.includes(issue) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm hover-scale"
                  onClick={() => toggleBehavioralGoal(issue)}
                >
                  {formData.behavioral_goals.includes(issue) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {issue}
                </Badge>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                size="touch"
                onClick={() => setStep(6)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                size="touch"
                onClick={() => setStep(8)}
                className="flex-1 btn-primary"
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

  // Step 8: Time Commitment
  if (step === 8) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Training goals 2/2</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              How much time can you spend training?
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Per day
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
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

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                size="touch"
                onClick={() => setStep(7)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                size="touch"
                onClick={() => setStep(9)}
                disabled={!isStepValid()}
                className="flex-1 btn-primary"
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

  // Step 9: Final Details & Summary
  if (step === 9) {
    const ageLabel = AGE_RANGES.find(r => r.value === formData.age_range)?.label || formData.age_range;
    
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="p-4 pb-0">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Step 9 of {TOTAL_STEPS}</p>
          </div>
          
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4 p-3">
              <img src={logoIcon} alt="Kahu Logo" className="w-full h-full object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome, {formData.name}!
            </CardTitle>
            <p className="text-muted-foreground">
              Just a few more optional details
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-4">
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
                <Label>Have you adopted {formData.name} from a shelter?</Label>
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
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 mt-6">
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

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                size="touch"
                onClick={() => setStep(8)}
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}