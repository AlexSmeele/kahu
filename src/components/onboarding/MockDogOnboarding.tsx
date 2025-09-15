import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, ArrowRight, ArrowLeft, CalendarIcon, Upload, X, Check, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BreedAutocomplete } from '@/components/ui/breed-autocomplete';
import { CountryAutocomplete } from '@/components/ui/country-autocomplete';
import heroImage from '@/assets/hero-image.jpg';

interface MockDogOnboardingProps {
  onComplete: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
}

interface DogData {
  name: string;
  breed: string;
  breed_id: string | null;
  birthday: Date | null;
  weight: string;
  gender: 'male' | 'female' | '';
  photo?: File | null;
  photoPreview?: string | null;
}

// Mock function to calculate age (replicating the real one)
function calculateAge(birthday: string): string {
  const birthDate = new Date(birthday);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    // Get days in previous month
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Handle edge case for very young puppies (less than 1 month)
  if (years === 0 && months === 0) {
    if (days === 0) {
      return "Born today";
    } else if (days === 1) {
      return "1 day old";
    } else {
      return `${days} days old`;
    }
  }
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} old`;
  } else if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'} old`;
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function MockDogOnboarding({ onComplete }: MockDogOnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // User data
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
  });
  
  // Dogs data
  const [dogs, setDogs] = useState<DogData[]>([{
    name: '',
    breed: '',
    breed_id: null,
    birthday: null,
    weight: '',
    gender: '',
    photo: null,
    photoPreview: null,
  }]);
  
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const currentDog = dogs[currentDogIndex];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoPreview = e.target?.result as string;
        setDogs(prev => prev.map((dog, index) => 
          index === currentDogIndex 
            ? { ...dog, photo: file, photoPreview }
            : dog
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setDogs(prev => prev.map((dog, index) => 
      index === currentDogIndex 
        ? { ...dog, photo: null, photoPreview: null }
        : dog
    ));
  };

  const updateCurrentDog = (updates: Partial<DogData>) => {
    setDogs(prev => prev.map((dog, index) => 
      index === currentDogIndex 
        ? { ...dog, ...updates }
        : dog
    ));
  };

  const addAnotherDog = () => {
    setDogs(prev => [...prev, {
      name: '',
      breed: '',
      breed_id: null,
      birthday: null,
      weight: '',
      gender: '',
      photo: null,
      photoPreview: null,
    }]);
    setCurrentDogIndex(dogs.length);
    setStep(2); // Go back to dog info step for new dog
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    onComplete();
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return userData.firstName.trim() !== '' && userData.lastName.trim() !== '' && userData.email.trim() !== '' && userData.country.trim() !== '';
      case 2:
        return (currentDog.breed_id !== null || currentDog.breed.trim() !== '') && 
               currentDog.name.trim() !== '' && 
               currentDog.gender !== '' && 
               currentDog.birthday !== null;
      case 3:
        return true; // Add more dogs step
      case 4:
        return true; // Summary step
      default:
        return false;
    }
  };

  // Step 1: User Information
  if (step === 1) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to Kahu! 🐕
            </CardTitle>
            <p className="text-muted-foreground">
              Let's start with your information
            </p>
            <div className="mt-4 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                🔍 MOCK MODE - No data will be saved
              </p>
            </div>
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
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                type="text"
                value={userData.firstName}
                onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Your first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                value={userData.lastName}
                onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Your last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <CountryAutocomplete
                value={userData.country}
                onChange={(country) => setUserData(prev => ({ ...prev, country }))}
                placeholder="Start typing your country..."
                required
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

  // Step 2: Dog Information
  if (step === 2) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in max-h-[calc(100vh-2rem)] overflow-y-auto relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              {currentDogIndex === 0 ? "Tell us about your dog 🎾" : `Dog #${currentDogIndex + 1} 🐾`}
            </CardTitle>
            <p className="text-muted-foreground">
              All fields are required for personalized recommendations
            </p>
            <div className="mt-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                🔍 MOCK MODE - No data will be saved
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dogName">Dog's Name *</Label>
              <Input
                id="dogName"
                type="text"
                value={currentDog.name}
                onChange={(e) => updateCurrentDog({ name: e.target.value })}
                placeholder="Your dog's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed *</Label>
              <BreedAutocomplete
                value={currentDog.breed}
                onChange={(breed) => updateCurrentDog({ breed })}
                onBreedIdChange={(breedId) => updateCurrentDog({ breed_id: breedId })}
                placeholder="e.g., Golden Retriever, Mixed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={currentDog.gender} 
                onValueChange={(value: 'male' | 'female') => updateCurrentDog({ gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="z-[60] bg-popover">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !currentDog.birthday && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentDog.birthday ? format(currentDog.birthday, "LLL d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex items-center justify-between p-2 border-b">
                      <Select
                        value={currentDog.birthday ? currentDog.birthday.getMonth().toString() : ""}
                        onValueChange={(value) => {
                          const currentDate = currentDog.birthday || new Date();
                          const newDate = new Date(currentDate);
                          newDate.setMonth(parseInt(value));
                          updateCurrentDog({ birthday: newDate });
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
                        value={currentDog.birthday ? currentDog.birthday.getFullYear().toString() : ""}
                        onValueChange={(value) => {
                          const currentDate = currentDog.birthday || new Date();
                          const newDate = new Date(currentDate);
                          newDate.setFullYear(parseInt(value));
                          updateCurrentDog({ birthday: newDate });
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
                      selected={currentDog.birthday || undefined}
                      onSelect={(date) => updateCurrentDog({ birthday: date || null })}
                      disabled={(date) => date > new Date() || date < new Date("1999-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) (optional)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={currentDog.weight}
                  onChange={(e) => updateCurrentDog({ weight: e.target.value })}
                  placeholder="25"
                  min="0"
                  max="200"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo (optional)</Label>
              {currentDog.photoPreview ? (
                <div className="relative">
                  <img
                    src={currentDog.photoPreview}
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
                  <p className="text-sm text-muted-foreground mb-2">Upload a photo of {currentDog.name || 'your dog'}</p>
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

  // Step 3: Add More Dogs
  if (step === 3) {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-accent to-accent-hover rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Any more furry friends? 🐕‍🦺
            </CardTitle>
            <p className="text-muted-foreground">
              You can add multiple dogs to your profile
            </p>
            <div className="mt-4 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                🔍 MOCK MODE - No data will be saved
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-foreground">{dogs.length === 1 ? 'Dog Added' : 'Dogs Added'}:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {dogs.map((dog, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>• {dog.name || `Dog #${index + 1}`}</span>
                    {dog.breed && <span className="text-xs opacity-70">{dog.breed}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline"
                size="touch"
                onClick={addAnotherDog}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Dog
              </Button>
              
              <div className="flex gap-3">
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
                  className="flex-1 btn-primary hover-scale"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Final Summary
  if (step === 4) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-large)] animate-scale-in h-[calc(100vh-2rem)] flex flex-col relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardHeader className="text-center pb-4 flex-shrink-0">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome, {userData.firstName}! 🎉
            </CardTitle>
            <p className="text-muted-foreground">
              Ready to start your training journey together?
            </p>
            <div className="mt-4 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                🔍 MOCK MODE - No data will be saved
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-3 flex-1 min-h-0">
              <h3 className="font-medium text-foreground">Profile Summary:</h3>
              
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="border-b border-border pb-2">
                    <h4 className="text-sm font-medium text-foreground mb-1">Your Information:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><span className="font-medium">Name:</span> {userData.firstName} {userData.lastName}</p>
                      <p><span className="font-medium">Email:</span> {userData.email}</p>
                      <p><span className="font-medium">Country:</span> {userData.country}</p>
                    </div>
                  </div>

                  {/* Dogs Info */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">{dogs.length === 1 ? 'Your Dog' : 'Your Dogs'}:</h4>
                    <div className="text-sm text-muted-foreground space-y-3">
                      {dogs.map((dog, index) => (
                        <div key={index} className="border-l-2 border-primary/30 pl-3 space-y-1">
                          <p><span className="font-medium">Name:</span> {dog.name}</p>
                          {dog.breed && <p><span className="font-medium">Breed:</span> {dog.breed}</p>}
                          {dog.gender && <p><span className="font-medium">Gender:</span> {capitalizeFirst(dog.gender)}</p>}
                          {dog.birthday && (
                            <p><span className="font-medium">Age:</span> {calculateAge(format(dog.birthday, 'yyyy-MM-dd'))}</p>
                          )}
                          {dog.weight && <p><span className="font-medium">Weight:</span> {dog.weight} kg</p>}
                          {dog.photo && <p><span className="font-medium">Photo:</span> Uploaded</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-3 pt-4 flex-shrink-0">
              <Button 
                variant="outline"
                size="touch"
                onClick={() => setStep(3)}
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
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Simulating...
                  </>
                ) : (
                  <>
                    Complete Demo
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}