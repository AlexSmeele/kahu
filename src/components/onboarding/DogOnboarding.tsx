import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useDogs, Dog } from '@/hooks/useDogs';
import heroImage from '@/assets/hero-image.jpg';

interface DogOnboardingProps {
  onComplete: (dog: Dog) => void;
}

export function DogOnboarding({ onComplete }: DogOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    gender: '' as 'male' | 'female' | '',
  });
  const [loading, setLoading] = useState(false);
  const { addDog } = useDogs();

  const handleSubmit = async () => {
    setLoading(true);
    
    const dogData = {
      name: formData.name,
      breed: formData.breed || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      gender: formData.gender || undefined,
    };

    const newDog = await addDog(dogData);
    if (newDog) {
      onComplete(newDog);
    }
    setLoading(false);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return true; // Optional information
      case 3:
        return true; // Summary step
      default:
        return false;
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)]">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to Kahu! 🐕
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
              onClick={() => setStep(2)}
              disabled={!isStepValid()}
              className="w-full btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)]">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              Tell us about {formData.name} 🎾
            </CardTitle>
            <p className="text-muted-foreground">
              This helps us personalize the training experience (optional)
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Breed
              </label>
              <Input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                placeholder="e.g., Golden Retriever, Mixed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Gender
              </label>
              <Select 
                value={formData.gender} 
                onValueChange={(value: 'male' | 'female') => 
                  setFormData(prev => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Age (years)
                </label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="2"
                  min="0"
                  max="30"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="25"
                  min="0"
                  max="200"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
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

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)]">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome, {formData.name}! 🎉
            </CardTitle>
            <p className="text-muted-foreground">
              Ready to start your training journey together?
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-foreground">Profile Summary:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium">Name:</span> {formData.name}</p>
                {formData.breed && <p><span className="font-medium">Breed:</span> {formData.breed}</p>}
                {formData.gender && <p><span className="font-medium">Gender:</span> {formData.gender}</p>}
                {formData.age && <p><span className="font-medium">Age:</span> {formData.age} years</p>}
                {formData.weight && <p><span className="font-medium">Weight:</span> {formData.weight} kg</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 btn-primary"
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