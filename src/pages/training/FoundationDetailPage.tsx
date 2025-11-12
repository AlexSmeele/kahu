import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Book, Clock, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_FOUNDATION_TOPICS } from '@/lib/mockData';

export default function FoundationDetailPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const topic = useMemo(() => {
    return MOCK_FOUNDATION_TOPICS.find(t => t.id === topicId);
  }, [topicId]);

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Book className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Topic Not Found</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't find the foundation topic you're looking for.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const IconComponent = (LucideIcons as any)[topic.icon] || LucideIcons.Book;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold line-clamp-1 flex-1">{topic.name}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Hero Section */}
        <Card className={`bg-gradient-to-br ${topic.color}`}>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{topic.name}</h2>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Foundation Training
            </Badge>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About This Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {topic.description}
            </p>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Book className="w-4 h-4" />
              Lessons ({topic.subSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topic.subSessions.map((lesson, index) => (
              <Card
                key={lesson.id}
                className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => navigate(`/training/foundation/${topicId}/${lesson.id}/instructional`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Lesson Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold leading-tight mb-1">
                        {lesson.name}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {lesson.description}
                      </p>
                      {lesson.estimated_time_weeks && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>~{lesson.estimated_time_weeks} week{lesson.estimated_time_weeks > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 flex items-center">
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Quick Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Book className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Educational Content:</strong> These lessons provide essential knowledge and understanding. 
                  Take your time to read and absorb the information. You can revisit any lesson at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
