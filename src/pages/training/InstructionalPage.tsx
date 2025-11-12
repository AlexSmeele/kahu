import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, ChevronLeft, ChevronRight, ArrowRight, CheckCircle, Lightbulb, ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTricks } from '@/hooks/useTricks';
import useEmblaCarousel from 'embla-carousel-react';
import { useToast } from '@/hooks/use-toast';

interface Step {
  number: number;
  title: string;
  content: string;
  tip?: string;
}

interface InstructionalPageProps {
  type: 'skill' | 'foundation' | 'troubleshooting';
}

function parseInstructionsToSteps(instructions: string): Step[] {
  if (!instructions?.trim()) return [];

  // Check if instructions are numbered (e.g., "1. Step one. 2. Step two.")
  const numberedMatch = instructions.match(/\d+\.\s/);
  
  if (numberedMatch) {
    const steps = instructions.split(/(?=\d+\.\s)/).filter(s => s.trim());
    return steps.map((step, idx) => {
      const content = step.replace(/^\d+\.\s/, '').trim();
      const { content: mainContent, tip } = extractTip(content);
      return {
        number: idx + 1,
        title: `Step ${idx + 1}`,
        content: mainContent,
        tip,
      };
    });
  }
  
  // Split by sentences (periods followed by space and capital letter or newlines)
  const sentences = instructions
    .split(/(?:\.\s+(?=[A-Z])|[\n\r]+)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // If only 1-2 sentences, treat as single step
  if (sentences.length <= 2) {
    const { content: mainContent, tip } = extractTip(instructions);
    return [{
      number: 1,
      title: 'Instructions',
      content: mainContent,
      tip,
    }];
  }
  
  // Each sentence becomes a step
  return sentences.map((sentence, idx) => {
    const fullSentence = sentence.endsWith('.') ? sentence : sentence + '.';
    const { content: mainContent, tip } = extractTip(fullSentence);
    return {
      number: idx + 1,
      title: `Step ${idx + 1}`,
      content: mainContent,
      tip,
    };
  });
}

function extractTip(content: string): { content: string; tip?: string } {
  const tipMatch = content.match(/(💡\s*Tip:|Tip:)\s*(.+?)(?:\.|$)/i);
  if (tipMatch) {
    return {
      content: content.replace(tipMatch[0], '').trim(),
      tip: tipMatch[2].trim(),
    };
  }
  return { content };
}

interface StepCardProps {
  step: Step;
}

function StepCard({ step }: StepCardProps) {
  return (
    <div className="embla__slide flex-[0_0_100%] min-w-0 px-4">
      <Card className="h-full flex flex-col">
        {/* Image/Video Placeholder */}
        <div className="aspect-video bg-muted/30 rounded-t-lg flex items-center justify-center border-b">
          <ImageIcon className="w-12 h-12 text-muted-foreground" />
          <span className="text-xs text-muted-foreground ml-2">
            Image coming soon
          </span>
        </div>
        
        {/* Step Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-3">
            {step.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {step.content}
          </p>
          
          {/* Tip Section */}
          {step.tip && (
            <div className="mt-auto bg-warning/10 border-l-4 border-warning p-3 rounded">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{step.tip}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

interface ProgressDotsProps {
  count: number;
  selected: number;
  onSelect: (index: number) => void;
}

function ProgressDots({ count, selected, onSelect }: ProgressDotsProps) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={cn(
            "h-2 rounded-full transition-all",
            idx === selected 
              ? "bg-primary w-6" 
              : "bg-muted-foreground/30 hover:bg-muted-foreground/60 w-2"
          )}
          aria-label={`Go to step ${idx + 1}`}
        />
      ))}
    </div>
  );
}

export default function InstructionalPage({ type }: InstructionalPageProps) {
  const { trickId } = useParams<{ trickId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tricks } = useTricks();
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false,
  });

  // Fetch content based on type
  const content = useMemo(() => {
    if (type === 'skill' && trickId) {
      return tricks.find(t => t.id === trickId);
    }
    // TODO: Add foundation/troubleshooting data fetching when implemented
    return null;
  }, [type, trickId, tricks]);

  const steps = useMemo(() => {
    if (!content?.instructions) return [];
    return parseInstructionsToSteps(content.instructions);
  }, [content]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  // Track current slide
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
      if (e.key === 'Escape') navigate(-1);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext, navigate]);

  const handleMarkComplete = () => {
    toast({
      title: "Lesson Complete! 🎉",
      description: "Great job! Keep up the learning.",
    });
    navigate(-1);
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Content Not Found</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't find the training content you're looking for.
        </p>
        <Button onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>No Instructions Available</AlertTitle>
          <AlertDescription>
            Instructional content is being prepared for this {type}.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Step {selectedIndex + 1} of {steps.length}
          </span>
          <ProgressDots
            count={steps.length}
            selected={selectedIndex}
            onSelect={scrollTo}
          />
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Carousel Content */}
      <div className="flex-1 overflow-hidden py-6">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-card p-4">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={scrollPrev}
            disabled={selectedIndex === 0}
            className="flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          {selectedIndex === steps.length - 1 ? (
            type === 'skill' ? (
              <Button
                size="lg"
                onClick={() => navigate(`/training/skill/${trickId}/session`)}
                className="flex-1"
              >
                Start Training Session
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleMarkComplete}
                className="flex-1"
              >
                Mark as Complete
                <CheckCircle className="w-4 h-4 ml-1" />
              </Button>
            )
          ) : (
            <Button
              size="lg"
              onClick={scrollNext}
              className="flex-1"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
