import { useState } from "react";
import { ArrowLeft, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GuideFinalTest() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <main className="content-frame bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">Final Test</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="p-6 max-w-2xl mx-auto pb-24">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-primary" />
            </div>

            <h2 className="font-bold text-2xl mb-4">Final Certification Test</h2>
            
            <p className="text-muted-foreground mb-6">
              You're about to take the final test covering all modules. 
              This test includes 25 questions and you'll need 80% to pass.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Time</span>
                </div>
                <p className="font-bold text-lg">30-40 min</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">Pass Score</span>
                </div>
                <p className="font-bold text-lg">80%</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground text-left mb-8">
              <p>• Answer all questions to the best of your ability</p>
              <p>• You can review your answers before submitting</p>
              <p>• Once submitted, you'll receive your certificate if you pass</p>
            </div>

            <Button size="lg" className="w-full" onClick={() => setStarted(true)}>
              Start Test
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  // Test in progress - placeholder
  return (
    <main className="content-frame bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => setStarted(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Question 1/25</h1>
          <div className="text-sm text-muted-foreground">4 min</div>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto pb-24">
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            Test questions will be implemented in the next phase.
          </p>
        </Card>
      </div>
    </main>
  );
}
