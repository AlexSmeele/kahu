import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MOCK_FOUNDATION_TOPICS, MOCK_TROUBLESHOOTING_TOPICS } from '@/lib/mockData';
import * as LucideIcons from 'lucide-react';

interface SubSessionModalData {
  name: string;
  instructions: string;
  description: string;
}

export default function TopicSubcategories() {
  const { type, topicId } = useParams<{ type: string; topicId: string }>();
  const navigate = useNavigate();
  const [selectedSubSession, setSelectedSubSession] = useState<SubSessionModalData | null>(null);

  // Find the topic from the appropriate data source
  const topics = type === 'foundation' ? MOCK_FOUNDATION_TOPICS : MOCK_TROUBLESHOOTING_TOPICS;
  const topic = topics.find(t => t.id === topicId);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Topic not found</p>
      </div>
    );
  }

  // Get icon component
  const IconComponent = (LucideIcons as any)[topic.icon] || LucideIcons.BookOpen;
  
  // Calculate progress (TODO: Track actual completion)
  const completedCount = 0;
  const totalCount = topic.subSessions.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleLessonClick = (subSession: any) => {
    setSelectedSubSession({
      name: subSession.name,
      instructions: subSession.instructions,
      description: subSession.description,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className={`relative bg-gradient-to-br ${topic.color} p-6 pb-8`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(type === 'foundation' ? '/?tab=tricks&section=foundations' : '/?tab=tricks&section=troubleshooting')}
          className="absolute top-4 left-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="pt-12 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconComponent className="w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-3">{topic.name}</h1>
          <p className="text-white/90 text-sm max-w-md mx-auto leading-relaxed">
            {topic.description}
          </p>

          {/* Progress Section */}
          <div className="mt-6 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span>Progress</span>
              <span className="font-semibold">{completedCount}/{totalCount} completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="p-4 space-y-2">
        {topic.subSessions.map((subSession, index) => {
          const isCompleted = false; // TODO: Track actual completion
          
          return (
            <Card
              key={subSession.id}
              onClick={() => handleLessonClick(subSession)}
              className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                {/* Completion Icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-muted-foreground">{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* Lesson Title */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight">{subSession.name}</h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sub-Session Detail Modal */}
      {selectedSubSession && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setSelectedSubSession(null)}
        >
          <div 
            className="bg-background rounded-t-3xl w-full max-h-[80vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedSubSession.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubSession(null)}
              >
                Close
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">{selectedSubSession.description}</p>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line">{selectedSubSession.instructions}</p>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Start Training Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
