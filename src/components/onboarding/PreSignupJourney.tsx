import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, X, BookOpen, Search, Check, ChevronRight } from 'lucide-react';
import { MockDogOnboarding } from './MockDogOnboarding';
import logoIcon from '@/assets/logo-transparent.png';

interface PreSignupJourneyProps {
  onComplete: () => void;
}

type UserType = 'owner' | 'prospective' | null;
type ProspectiveJourney = 'learn' | 'breed' | null;

interface LessonContent {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const dogOwnershipLessons: LessonContent[] = [
  {
    id: 'basics',
    title: 'Dog Ownership Basics',
    content: 'Owning a dog is a rewarding but significant responsibility. Dogs require daily care, exercise, training, and veterinary attention throughout their lives, which can span 10-15+ years.',
    keyPoints: [
      'Dogs need daily exercise and mental stimulation',
      'Regular vet visits are essential for health',
      'Training should start early and be consistent',
      'Budget for food, supplies, and medical care',
      'Dogs are social animals and need companionship'
    ]
  },
  {
    id: 'commitment',
    title: 'Time & Financial Commitment',
    content: 'Dogs require significant time and financial investment. Beyond the initial adoption fee, ongoing costs include food, veterinary care, grooming, and supplies.',
    keyPoints: [
      'Daily care: 2-4 hours including walks, feeding, play',
      'Annual costs: $1,000-$3,000+ depending on size and needs',
      'Emergency vet bills can be $1,000-$5,000+',
      'Grooming costs vary by breed',
      'Pet insurance can help with unexpected costs'
    ]
  },
  {
    id: 'preparation',
    title: 'Preparing Your Home',
    content: 'Before bringing a dog home, you need to puppy-proof your space and gather essential supplies.',
    keyPoints: [
      'Remove toxic plants and hazardous items',
      'Secure garbage cans and chemicals',
      'Set up a designated sleeping area',
      'Buy food, bowls, leash, collar, and toys',
      'Find a local veterinarian'
    ]
  }
];

const breedQuizQuestions: QuizQuestion[] = [
  {
    id: 'living',
    question: 'What best describes your living situation?',
    options: ['Apartment', 'House with small yard', 'House with large yard', 'Farm/Rural property'],
    correctAnswer: -1, // No correct answer, just data collection
    explanation: 'Different breeds have different space requirements.'
  },
  {
    id: 'activity',
    question: 'How active are you?',
    options: ['Low - prefer indoor activities', 'Moderate - occasional walks/hikes', 'Active - daily exercise routine', 'Very active - running, hiking, sports'],
    correctAnswer: -1,
    explanation: 'Your activity level should match your dog\'s exercise needs.'
  },
  {
    id: 'experience',
    question: 'What\'s your experience with dogs?',
    options: ['First-time owner', 'Some experience', 'Experienced owner', 'Very experienced/trainer'],
    correctAnswer: -1,
    explanation: 'Some breeds are better for beginners than others.'
  },
  {
    id: 'grooming',
    question: 'How much grooming are you willing to do?',
    options: ['Minimal - occasional brushing', 'Moderate - weekly grooming', 'High - daily brushing', 'Professional grooming regularly'],
    correctAnswer: -1,
    explanation: 'Coat type affects grooming requirements significantly.'
  }
];

export function PreSignupJourney({ onComplete }: PreSignupJourneyProps) {
  const [step, setStep] = useState<'initial' | 'journey-select' | 'lessons' | 'quiz' | 'recommendations' | 'mockflow'>('initial');
  const [userType, setUserType] = useState<UserType>(null);
  const [prospectiveJourney, setProspectiveJourney] = useState<ProspectiveJourney>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const handleInitialChoice = (type: UserType) => {
    setUserType(type);
    if (type === 'owner') {
      setStep('mockflow');
    } else {
      setStep('journey-select');
    }
  };

  const handleJourneyChoice = (journey: ProspectiveJourney) => {
    setProspectiveJourney(journey);
    if (journey === 'learn') {
      setStep('lessons');
    } else {
      setStep('quiz');
    }
  };

  const completeLesson = () => {
    const lessonId = dogOwnershipLessons[currentLesson].id;
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
    
    if (currentLesson < dogOwnershipLessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
    } else {
      setStep('mockflow');
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setQuizAnswers(newAnswers);

    if (currentQuestion < breedQuizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep('recommendations');
    }
  };

  const getBreedRecommendations = () => {
    // Simplified breed recommendations based on quiz answers
    const [living, activity, experience, grooming] = quizAnswers;
    
    if (living === 0) { // Apartment
      return ['French Bulldog', 'Cavalier King Charles Spaniel', 'Boston Terrier'];
    } else if (activity === 3) { // Very active
      return ['Border Collie', 'Australian Shepherd', 'German Shorthaired Pointer'];
    } else if (experience === 0) { // First-time owner
      return ['Labrador Retriever', 'Golden Retriever', 'Pug'];
    }
    return ['Mixed Breed', 'Cocker Spaniel', 'Beagle'];
  };

  if (step === 'mockflow') {
    return <MockDogOnboarding onComplete={onComplete} />;
  }

  // Initial step - owner vs prospective
  if (step === 'initial') {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex flex-col p-6 pt-20">
          <div className="text-center mb-12">
<img src={logoIcon} alt="Kahu Logo" className="mx-auto w-20 h-20 mb-6 object-contain block" />
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Welcome to Kahu!
            </h1>
            <p className="text-muted-foreground">
              Your journey to better dog care starts here
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Which best describes you?
            </p>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-auto p-6 text-left hover:bg-accent/50 transition-all"
              onClick={() => handleInitialChoice('owner')}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-semibold text-foreground">I am a dog owner</div>
                  <div className="text-sm text-muted-foreground">Get started with dog care management</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-auto p-6 text-left hover:bg-accent/50 transition-all"
              onClick={() => handleInitialChoice('prospective')}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-semibold text-foreground">I'm looking at getting a dog</div>
                  <div className="text-sm text-muted-foreground">Learn about dog ownership first</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Journey selection for prospective owners
  if (step === 'journey-select') {
    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('initial')}
          className="absolute top-4 left-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex flex-col p-6 pt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What would you like to do?
            </h2>
            <p className="text-muted-foreground">
              Choose your learning path
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-auto p-6 text-left hover:bg-accent/50 transition-all"
              onClick={() => handleJourneyChoice('learn')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Learn about dog ownership</div>
                    <div className="text-sm text-muted-foreground">Essential lessons for new owners</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-auto p-6 text-left hover:bg-accent/50 transition-all"
              onClick={() => handleJourneyChoice('breed')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Find the perfect dog breed</div>
                    <div className="text-sm text-muted-foreground">Take our breed matching quiz</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Lessons step
  if (step === 'lessons') {
    const lesson = dogOwnershipLessons[currentLesson];
    const progress = ((currentLesson + 1) / dogOwnershipLessons.length) * 100;

    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col overflow-y-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('journey-select')}
          className="absolute top-4 left-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex flex-col p-6 pt-20">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Lesson {currentLesson + 1} of {dogOwnershipLessons.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {lesson.title}
            </h2>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              {lesson.content}
            </p>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Key Points:</h4>
              <ul className="space-y-2">
                {lesson.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={completeLesson}
              className="w-full mt-auto"
              size="lg"
            >
              {currentLesson < dogOwnershipLessons.length - 1 ? (
                <>
                  Next Lesson
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Complete Learning Journey'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz step
  if (step === 'quiz') {
    const question = breedQuizQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / breedQuizQuestions.length) * 100;

    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('journey-select')}
          className="absolute top-4 left-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex flex-col p-6 pt-20">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestion + 1} of {breedQuizQuestions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Breed Matching Quiz
            </h2>
          </div>

          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-4 hover:bg-accent/50"
                  onClick={() => handleQuizAnswer(index)}
                >
                  {option}
                </Button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              {question.explanation}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Recommendations step
  if (step === 'recommendations') {
    const recommendations = getBreedRecommendations();

    return (
      <div className="h-full bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col overflow-y-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex flex-col p-6 pt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Your Breed Matches!
            </h2>
            <p className="text-muted-foreground">
              Based on your answers, these breeds might be perfect for you
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="space-y-3">
              {recommendations.map((breed, index) => (
                <div key={index} className="p-4 border rounded-lg bg-accent/20">
                  <h4 className="font-semibold text-foreground">{breed}</h4>
                  <p className="text-sm text-muted-foreground">
                    Great match for your lifestyle and experience level
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Remember: Every dog is unique! These are just starting points. 
                Meet dogs in person and consider adopting from local shelters.
              </p>
            </div>

            <Button
              onClick={() => setStep('mockflow')}
              className="w-full mt-auto"
              size="lg"
            >
              Continue to Kahu Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}