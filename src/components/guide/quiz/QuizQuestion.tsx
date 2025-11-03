import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedAnswer: number | null;
  showFeedback: boolean;
  onAnswer: (index: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function QuizQuestion({
  question,
  options,
  correctIndex,
  explanation,
  selectedAnswer,
  showFeedback,
  onAnswer,
  onNext,
  isLastQuestion,
}: QuizQuestionProps) {
  const isCorrect = selectedAnswer === correctIndex;

  return (
    <>
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-6">{question}</h2>

        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showFeedback && onAnswer(index)}
              disabled={showFeedback}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                showFeedback
                  ? index === correctIndex
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : selectedAnswer === index
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-border bg-background opacity-50'
                  : 'border-border hover:border-primary hover:bg-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showFeedback && index === correctIndex && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                {showFeedback && selectedAnswer === index && index !== correctIndex && (
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
            <p className="text-sm">{explanation}</p>
          </div>
        )}
      </Card>

      {showFeedback && (
        <Button onClick={onNext} className="w-full mt-6">
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </Button>
      )}
    </>
  );
}
