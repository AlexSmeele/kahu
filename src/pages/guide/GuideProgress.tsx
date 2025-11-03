import { ArrowLeft, Award, TrendingUp, Calendar, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGuideProgress } from "@/hooks/useGuideProgress";

export default function GuideProgress() {
  const navigate = useNavigate();
  const { overallProgress, stats } = useGuideProgress();

  const badges = [
    { id: "started", name: "Getting Started", earned: true, icon: "🎯" },
    { id: "halfway", name: "Halfway There", earned: overallProgress >= 50, icon: "⭐" },
    { id: "almost", name: "Almost Done", earned: overallProgress >= 75, icon: "🔥" },
    { id: "completed", name: "Course Complete", earned: overallProgress === 100, icon: "🏆" },
  ];

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Your Progress</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto pb-24">
        {/* Overall Stats */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl">Overall Progress</h2>
            <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-4 mb-4" />
          <p className="text-sm text-muted-foreground">
            {overallProgress === 100 
              ? "Congratulations! You've completed the course." 
              : `Keep going! You're ${100 - overallProgress}% away from completion.`}
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Modules Completed</span>
            </div>
            <p className="font-bold text-2xl">{stats.modulesCompleted}/6</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Days Active</span>
            </div>
            <p className="font-bold text-2xl">{stats.daysActive}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs">Quiz Average</span>
            </div>
            <p className="font-bold text-2xl">{stats.quizAverage > 0 ? `${stats.quizAverage}%` : '--'}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs">Badges Earned</span>
            </div>
            <p className="font-bold text-2xl">{badges.filter(b => b.earned).length}/{badges.length}</p>
          </Card>
        </div>

        {/* Badges */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  badge.earned
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-muted/30 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm">{badge.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
