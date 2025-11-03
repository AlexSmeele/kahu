import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function GuideLessonPlayer() {
  const navigate = useNavigate();
  const { moduleId } = useParams();

  // TODO: Fetch actual module and lessons data
  const progress = 30;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">Module 1</h1>
            <Button variant="ghost" size="sm">
              Save & Exit
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Lesson Content */}
        <Card className="p-6">
          <h2 className="font-bold text-2xl mb-4">Understanding Dog Lifespan</h2>
          
          <div className="prose prose-sm max-w-none space-y-4">
            <p>
              Dogs are a long-term commitment. Most dogs live between 10-15 years, with some breeds living even longer. 
              This means you'll be responsible for their care, health, and happiness for over a decade.
            </p>

            <p>
              Consider where you'll be in 10-15 years. Will you be in the same home? Will your work situation change? 
              Are you prepared for the financial and time commitments throughout your dog's entire life?
            </p>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 my-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Key Takeaway
              </h3>
              <p className="text-sm">
                A dog is a 10-15+ year commitment. Make sure you're ready for this long-term responsibility 
                before bringing a dog into your life.
              </p>
            </div>

            <h3 className="font-semibold text-lg mt-6 mb-3">Life Stage Considerations</h3>
            <ul className="space-y-2">
              <li><strong>Puppy (0-1 year):</strong> Requires extensive training, socialization, and frequent vet visits</li>
              <li><strong>Adult (1-7 years):</strong> Active years with routine care and maintenance</li>
              <li><strong>Senior (7+ years):</strong> May need special diets, more frequent vet care, and mobility support</li>
            </ul>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" disabled>
            Previous Lesson
          </Button>
          <Button className="flex-1">
            Next Lesson
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Progress Note */}
        <p className="text-center text-sm text-muted-foreground">
          Lesson 1 of 4 • 5 minutes remaining
        </p>
      </div>
    </div>
  );
}
