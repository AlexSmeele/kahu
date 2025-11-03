import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mock quiz data
const mockQuestions = [
  {
    id: "q1",
    question: "What is the average lifespan of a medium-sized dog?",
    options: ["5-8 years", "10-13 years", "15-18 years", "20+ years"],
    correctIndex: 1,
    explanation: "Most medium-sized dogs live 10-13 years, though this varies by breed and health care.",
  },
  {
    id: "q2",
    question: "How much should you budget monthly for a dog in New Zealand?",
    options: ["$50-100", "$150-300", "$400-600", "$800+"],
    correctIndex: 1,
    explanation: "A realistic monthly budget ranges from $150-$300, covering food, preventative care, and routine expenses.",
  },
  {
    id: "q3",
    question: "Which sign indicates a stressed dog?",
    options: ["Wagging tail", "Yawning and lip licking", "Play bow", "Relaxed body"],
    correctIndex: 1,
    explanation: "Yawning and lip licking are calming signals that often indicate stress or discomfort in dogs.",
  },
];

export default function GuideQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const question = mockQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctIndex;
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    if (index === question.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz complete - navigate to modules or show results
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
              {currentQuestion + 1}/{mockQuestions.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto pb-24">
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && handleAnswer(index)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showFeedback
                    ? index === question.correctIndex
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                      : 'border-border bg-background opacity-50'
                    : 'border-border hover:border-primary hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showFeedback && index === question.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {showFeedback && selectedAnswer === index && index !== question.correctIndex && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg ${
              isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
            }`}>
              <p className="font-semibold mb-2">
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
        </Card>

        {showFeedback && (
          <Button onClick={handleNext} className="w-full mt-6">
            {currentQuestion < mockQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </div>
    </main>
  );
}
