import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeekLessons, useLessonCompletions } from '@/hooks/useTrainingPrograms';
import { useDogs } from '@/hooks/useDogs';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function TrainingLessonViewer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

  // We need to find the lesson - for now we'll use a workaround since we don't have direct lesson fetch
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { completeLesson, isLessonCompleted } = useLessonCompletions(dogs[0]?.id || null);

  const completed = lesson ? isLessonCompleted(lesson.id) : false;

  const handleComplete = async () => {
    if (!lesson || completed) return;
    
    setCompleting(true);
    try {
      await completeLesson(lesson.id, dogs[0]?.id || null, notes || null, rating);
      toast.success('Lesson completed!');
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      toast.error('Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'foundation': return 'bg-blue-500/10 text-blue-500';
      case 'skill': return 'bg-purple-500/10 text-purple-500';
      case 'troubleshooting': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const renderLessonContent = (content: any, lessonType: string) => {
    if (!content) return null;

    switch (lessonType) {
      case 'article':
        return (
          <div className="space-y-6">
            {content.sections && content.sections.map((section: any, idx: number) => (
              <div key={idx}>
                <h3 className="font-semibold text-lg mb-2">{section.heading}</h3>
                <div className="text-muted-foreground">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {content.tips && content.tips.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">💡 Tips:</h3>
                <ul className="space-y-1">
                  {content.tips.map((tip: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {content.importance && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Why This Matters:</h3>
                <p className="text-sm text-muted-foreground">{content.importance}</p>
              </div>
            )}
            {content.categories && (
              <div className="space-y-3">
                {content.categories.map((cat: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <h4 className="font-medium mb-2">{cat.name}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {cat.examples.map((ex: string, i: number) => (
                        <li key={i}>• {ex}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {content.guidelines && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">📋 Guidelines:</h3>
                <ul className="space-y-1">
                  {content.guidelines.map((guide: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {guide}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'exercise':
        return (
          <div className="space-y-6">
            {content.overview && (
              <div className="text-muted-foreground">
                <ReactMarkdown>{content.overview}</ReactMarkdown>
              </div>
            )}
            {content.goal && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">🎯 Goal:</h3>
                <p className="text-sm text-muted-foreground">{content.goal}</p>
              </div>
            )}
            {content.purpose && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">🎯 Purpose:</h3>
                <p className="text-sm text-muted-foreground">{content.purpose}</p>
              </div>
            )}
            {content.steps && (
              <div>
                <h3 className="font-semibold mb-3">Steps:</h3>
                <ol className="space-y-3">
                  {content.steps.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {content.protocol && (
              <div>
                <h3 className="font-semibold mb-3">Protocol:</h3>
                <ol className="space-y-3">
                  {content.protocol.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {content.technique && Array.isArray(content.technique) && (
              <div>
                <h3 className="font-semibold mb-3">Technique:</h3>
                <ol className="space-y-3">
                  {content.technique.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {content.body_parts && (
              <div className="space-y-3">
                {content.body_parts.map((part: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <h4 className="font-medium mb-2">{part.area}</h4>
                    <p className="text-sm text-muted-foreground">{part.technique}</p>
                  </div>
                ))}
              </div>
            )}
            {content.tips && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">💡 Tips:</h3>
                <ul className="space-y-1">
                  {content.tips.map((tip: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {content.common_mistakes && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">⚠️ Common Mistakes:</h3>
                <ul className="space-y-1">
                  {content.common_mistakes.map((mistake: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {mistake}</li>
                  ))}
                </ul>
              </div>
            )}
            {content.consistency_rules && (
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">🎯 Consistency Rules:</h3>
                <ul className="space-y-1">
                  {content.consistency_rules.map((rule: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-muted-foreground">Content type not supported yet</div>;
    }
  };

  // Simulated loading - in real app would fetch from DB
  if (loading) {
    return (
      <div className="content-frame bg-background">
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="content-frame bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-frame bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(lesson.category)}>
                {lesson.category}
              </Badge>
              {completed && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimated_minutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span className="capitalize">{lesson.lesson_type}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 pb-32 space-y-6">
        <Card className="p-6">
          {renderLessonContent(lesson.content, lesson.lesson_type)}
        </Card>

        {!completed && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Complete This Lesson</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rate this lesson (optional)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating && star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this lesson..."
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleComplete}
                disabled={completing}
              >
                {completing ? 'Completing...' : 'Mark as Complete'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
