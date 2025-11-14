import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLessons } from "@/hooks/useLessons";
import { useGuideProgress } from "@/hooks/useGuideProgress";
import { LessonContent } from "@/components/guide/lessons/LessonContent";
import { supabase } from "@/integrations/supabase/client";

export default function GuideLessonPlayer() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { lessons, loading } = useLessons(moduleId || '');
  const { markLessonComplete } = useGuideProgress();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch quiz ID for this module
    const fetchQuizId = async () => {
      if (!moduleId) return;
      
      const { data } = await supabase
        .from('quizzes')
        .select('id')
        .eq('module_id', moduleId)
        .eq('quiz_type', 'module_quiz')
        .single();
      
      if (data) {
        setQuizId(data.id);
      }
    };
    
    fetchQuizId();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <main className="content-frame bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">No Lessons</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="p-6 max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">No lessons available for this module yet.</p>
        </div>
      </main>
    );
  }

  const currentLesson = lessons[currentLessonIndex];
  const progress = ((currentLessonIndex + 1) / lessons.length) * 100;

  const handleNext = async () => {
    // Mark current lesson as complete
    if (moduleId && currentLesson) {
      await markLessonComplete(moduleId, currentLesson.id);
    }

    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      // Navigate to quiz or back to modules
      if (quizId) {
        navigate(`/guide/quiz/${quizId}`);
      } else {
        navigate('/guide/modules');
      }
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">{currentLesson.title}</h1>
            <Button variant="ghost" onClick={() => navigate('/guide/modules')}>
              <span className="text-sm">Save & Exit</span>
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
        {/* Lesson Content */}
        <LessonContent content={currentLesson.content} />

        {/* Navigation */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handlePrevious}
            disabled={currentLessonIndex === 0}
          >
            Previous Lesson
          </Button>
          <Button className="flex-1" onClick={handleNext}>
            {currentLessonIndex === lessons.length - 1 ? 'Take Quiz' : 'Next Lesson'}
          </Button>
        </div>

        {/* Progress Note */}
        <p className="text-center text-sm text-muted-foreground">
          Lesson {currentLessonIndex + 1} of {lessons.length}
        </p>
      </div>
    </main>
  );
}
