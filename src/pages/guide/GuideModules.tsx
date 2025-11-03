import { ArrowLeft, Lock, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Heart, ArrowRight } from "lucide-react";
import { useModules } from "@/hooks/useModules";
import { useGuideProgress } from "@/hooks/useGuideProgress";
import { GuideNavigation } from "@/components/guide/GuideNavigation";

export default function GuideModules() {
  const navigate = useNavigate();
  const { modules, loading } = useModules();
  const { progress, overallProgress } = useGuideProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Course Modules</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
        {/* Navigation */}
        <GuideNavigation />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
            onClick={() => navigate('/guide/recommendations')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Breed Matches</h3>
                <p className="text-xs text-muted-foreground">Find your perfect breed</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
            onClick={() => navigate('/guide/progress')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">View Progress</h3>
                <p className="text-xs text-muted-foreground">Track your journey</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
            onClick={() => navigate('/guide/final-test')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Final Test</h3>
                <p className="text-xs text-muted-foreground">Earn certificate</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
        {/* Overall Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Your Progress</h2>
            <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-3">
            {Math.round(overallProgress) === 100 
              ? "Congratulations! You're ready for the final test." 
              : "Keep going! Every module brings you closer to certification."}
          </p>
        </Card>

        {/* Module List */}
        <div className="space-y-4">
          {modules.map((module, index) => {
            const moduleProgress = progress[module.id];
            const isUnlocked = index === 0 || progress[modules[index - 1].id]?.mastered;
            const completionPct = moduleProgress?.best_score_pct || 0;
            const isCompleted = moduleProgress?.mastered || false;

            return (
              <Card 
                key={module.id}
                className={`p-6 ${isUnlocked ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-50'}`}
                onClick={() => isUnlocked && navigate(`/guide/module/${module.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-primary/20 text-primary' 
                      : isUnlocked 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-muted/50 text-muted-foreground/50'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isUnlocked ? (
                      <span className="font-bold text-lg">{index + 1}</span>
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-base">{module.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        <span>{module.estimated_minutes} min</span>
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{completionPct}%</span>
                        </div>
                        <Progress value={completionPct} className="h-2" />
                      </div>
                    )}

                    {!isUnlocked && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Complete previous module to unlock
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Final Test Card */}
        <Card className={`p-6 ${overallProgress === 100 ? 'border-primary/50 bg-primary/5' : 'opacity-50'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              overallProgress === 100 ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground/50'
            }`}>
              {overallProgress === 100 ? (
                <span className="font-bold text-lg">✓</span>
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">Final Certification Test</h3>
              <p className="text-sm text-muted-foreground mb-4">
                25 comprehensive questions covering all modules. Pass with 80% to earn your certificate.
              </p>
              
              {overallProgress === 100 ? (
                <Button onClick={() => navigate('/guide/final-test')}>
                  Start Final Test
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Complete all modules to unlock the final test
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
