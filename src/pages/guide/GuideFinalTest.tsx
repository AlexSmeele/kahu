import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Award, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCertificate } from "@/hooks/useCertificate";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  order_index: number;
}

export default function GuideFinalTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCertificate } = useCertificate();
  
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinalTest();
  }, []);

  const fetchFinalTest = async () => {
    try {
      // Get the final test quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('quiz_type', 'final_test')
        .single();

      if (quizError) throw quizError;

      // Get questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      // Transform and validate questions data
      const transformedQuestions: Question[] = (questionsData || []).map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options as string[] : [],
        correct_index: q.correct_index,
        explanation: q.explanation,
        order_index: q.order_index,
      }));

      setQuestions(transformedQuestions);
    } catch (error) {
      logger.error('Error fetching final test', error);
      toast.error('Failed to load test questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
    setAnswers({ ...answers, [currentIndex]: index });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1] ?? null);
      setShowFeedback(!!answers[currentIndex + 1]);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    const correctAnswers = questions.filter((q, i) => answers[i] === q.correct_index).length;
    const scorePct = Math.round((correctAnswers / questions.length) * 100);
    setScore(scorePct);
    setCompleted(true);

    try {
      // Get quiz ID
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('quiz_type', 'final_test')
        .single();

      if (quiz && user) {
        // Save quiz attempt
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score_pct: scorePct,
          answers: answers,
        });

        // Create certificate if passed
        if (scorePct >= 80) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

          await createCertificate(scorePct, profile?.display_name || 'Dog Owner');
          toast.success('Congratulations! You passed!');
        } else {
          toast.error('You need 80% to pass. Please try again.');
        }
      }
    } catch (error) {
      logger.error('Error submitting test', error);
    }
  };

  if (loading) {
    return (
      <main className="content-frame bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading test...</div>
        </div>
      </main>
    );
  }

  if (completed) {
    const passed = score >= 80;
    return (
      <main className="content-frame bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">Test Complete</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="p-6 max-w-2xl mx-auto pb-24">
          <Card className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {passed ? (
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}
            </div>

            <h2 className="font-bold text-2xl mb-4">
              {passed ? 'Congratulations!' : 'Not Quite There Yet'}
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {passed 
                ? "You've successfully passed the final test!"
                : "You need 80% to pass. Review the modules and try again."}
            </p>

            <div className="p-6 bg-muted rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-2">Your Score</p>
              <p className="text-4xl font-bold text-primary">{score}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                {questions.filter((q, i) => answers[i] === q.correct_index).length} out of {questions.length} correct
              </p>
            </div>

            <div className="space-y-3">
              {passed ? (
                <Button className="w-full" onClick={() => navigate('/guide/certificate')}>
                  View Your Certificate
                </Button>
              ) : (
                <Button className="w-full" onClick={() => {
                  setStarted(false);
                  setCurrentIndex(0);
                  setAnswers({});
                  setSelectedAnswer(null);
                  setShowFeedback(false);
                  setCompleted(false);
                }}>
                  Try Again
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate('/guide/modules')}>
                Back to Modules
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="content-frame bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Test in progress
  return (
    <main className="content-frame bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => setStarted(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Question {currentIndex + 1}/{questions.length}</h1>
          <div className="w-16" />
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <div className="p-6 max-w-2xl mx-auto pb-24">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">{currentQuestion.question}</h3>
          
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = idx === currentQuestion.correct_index;
              const isSelected = selectedAnswer === idx;
              
              let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
              
              if (!showFeedback) {
                buttonClass += "border-border hover:border-primary hover:bg-primary/5";
              } else if (isCorrect) {
                buttonClass += "border-green-500 bg-green-500/10";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-500 bg-red-500/10";
              } else {
                buttonClass += "border-border opacity-50";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      showFeedback && isCorrect ? 'border-green-500 bg-green-500' :
                      showFeedback && isSelected && !isCorrect ? 'border-red-500 bg-red-500' :
                      'border-border'
                    }`}>
                      {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                      {showFeedback && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 ${
              selectedAnswer === currentQuestion.correct_index 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <p className="font-semibold mb-2">
                {selectedAnswer === currentQuestion.correct_index ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          {showFeedback && (
            <Button onClick={handleNext} className="w-full">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
            </Button>
          )}
        </Card>
      </div>
    </main>
  );
}
