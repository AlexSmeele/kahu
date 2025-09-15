import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, ArrowRight, ArrowLeft, CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDogs, Dog, calculateAge } from '@/hooks/useDogs';
import { BreedAutocomplete } from '@/components/ui/breed-autocomplete';
import heroImage from '@/assets/hero-image.jpg';

interface DogOnboardingProps {
  onComplete: (dog: Dog) => void;
}

export function DogOnboarding({ onComplete }: DogOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    breed_id: null as string | null,
    birthday: null as Date | null,
    weight: '',
    gender: '' as 'male' | 'female' | '',
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

  const handleSubmit = async () => {
    if (!formData.breed_id) {
      // Handle case where breed is required but not set
      return;
    }
    
    setLoading(true);
    
    const dogData = {
      name: formData.name,
      breed_id: formData.breed_id,
      birthday: formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      gender: formData.gender || undefined,
    };

    const newDog = await addDog(dogData, photo || undefined);
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
        return formData.breed_id !== null && formData.gender !== '' && formData.birthday !== null;
      case 3:
        return true; // Summary step
      default:
        return false;
    }
  };

  if (step === 1) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in">
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

  if (step === 2) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in max-h-[calc(100vh-2rem)] overflow-y-auto">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              Tell us about {formData.name} 🎾
            </CardTitle>
            <p className="text-muted-foreground">
              Breed is required to provide personalized recommendations
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Gender *
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
                  Birthday *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.birthday && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birthday ? format(formData.birthday, "LLL d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex items-center justify-between p-2 border-b">
                      <Select
                        value={formData.birthday ? formData.birthday.getMonth().toString() : ""}
                        onValueChange={(value) => {
                          const currentDate = formData.birthday || new Date();
                          const newDate = new Date(currentDate);
                          newDate.setMonth(parseInt(value));
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {format(new Date(2000, i, 1), "LLL")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={formData.birthday ? formData.birthday.getFullYear().toString() : ""}
                        onValueChange={(value) => {
                          const currentDate = formData.birthday || new Date();
                          const newDate = new Date(currentDate);
                          newDate.setFullYear(parseInt(value));
                          setFormData(prev => ({ ...prev, birthday: newDate }));
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          {Array.from({ length: 25 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Calendar
                      mode="single"
                      selected={formData.birthday || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, birthday: date || null }))}
                      disabled={(date) => date > new Date() || date < new Date("1999-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Weight (kg) (optional)
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Photo (optional)
              </label>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Dog preview"
                    className="w-full h-32 object-cover rounded-lg"
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
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Upload a photo of {formData.name}</p>
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
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 btn-touch"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex-1 btn-primary hover-scale"
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
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in">
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
                {formData.birthday && (
                  <p><span className="font-medium">Age:</span> {calculateAge(format(formData.birthday, 'yyyy-MM-dd'))} years</p>
                )}
                {formData.weight && <p><span className="font-medium">Weight:</span> {formData.weight} kg</p>}
                {photo && <p><span className="font-medium">Photo:</span> Uploaded</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 btn-touch"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
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