import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { QuizQuestion } from "@/components/guide/quiz/QuizQuestion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function GuideQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { toast } = useToast();
  const { questions, loading } = useQuizQuestions(quizId || '');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  if (loading) {
    return (
      <main className="content-frame bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="content-frame bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">Quiz</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="p-6 max-w-2xl mx-auto">
          <p className="text-center text-muted-foreground">No questions available for this quiz.</p>
        </div>
      </main>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const options = Array.isArray(question.options) ? question.options : [];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    setAnswers([...answers, index]);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz complete - save attempt and navigate
      await saveQuizAttempt();
    }
  };

  const saveQuizAttempt = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate score
      const correctAnswers = answers.filter((answer, index) => 
        answer === questions[index].correct_index
      ).length;
      const scorePct = Math.round((correctAnswers / questions.length) * 100);

      // Save quiz attempt
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score_pct: scorePct,
          answers: answers,
        });

      if (error) throw error;

      toast({
        title: scorePct >= 80 ? "Quiz Passed!" : "Quiz Complete",
        description: `You scored ${scorePct}%. ${scorePct >= 80 ? 'Great job!' : 'Review the material and try again.'}`,
      });

      navigate('/guide/modules');
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      navigate('/guide/modules');
    }
  };

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">Module Quiz</h1>
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1}/{questions.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto pb-24">
        <QuizQuestion
          question={question.question}
          options={options}
          correctIndex={question.correct_index}
          explanation={question.explanation}
          selectedAnswer={selectedAnswer}
          showFeedback={showFeedback}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLastQuestion={currentQuestion === questions.length - 1}
        />
      </div>
    </main>
  );
}
