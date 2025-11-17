import { ArrowLeft, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFoundationModules } from '@/hooks/useFoundationModules';
import { EmptyState } from '@/components/ui/empty-state';

export default function FoundationModuleDetailPage() {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');

  const { getModuleById, isModuleCompleted, loading } = useFoundationModules();

  const module = moduleId ? getModuleById(moduleId) : undefined;
  const isCompleted = moduleId ? isModuleCompleted(moduleId) : false;

  const handleBack = () => {
    if (source === 'program') {
      navigate('/?tab=tricks&section=program');
    } else {
      navigate('/?tab=tricks&section=foundations');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Foundation Module</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="Module Not Found"
            description="The foundation module you're looking for could not be found."
            action={{
              label: "Go Back",
              onClick: handleBack
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      {/* Header */}
      <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{module.title}</h1>
            <p className="text-xs text-muted-foreground">{module.category}</p>
          </div>
          {isCompleted && (
            <CheckCircle2 className="h-6 w-6 text-success" />
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Hero Section */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="text-sm">
                {module.format}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{module.estimated_minutes} min</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Ideal Stage:</strong> {module.ideal_stage}
            </p>
          </Card>

          {/* Brief Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {module.brief_description}
            </p>
          </Card>

          {/* Detailed Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">About This Module</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {module.detailed_description}
            </p>
          </Card>

          {/* Quick Info */}
          <Card className="p-6 bg-accent/5 border-accent/20">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Educational Content
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This module provides essential knowledge for dog guardians. Complete the instructional guide to deepen your understanding and prepare for your journey with your dog.
            </p>
          </Card>

          {/* Bottom padding for safe area */}
          <div className="h-24" />
        </div>
      </div>

      {/* Fixed Footer Button */}
      <div className="safe-bottom p-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate(`/training/instructional/foundation-module/${moduleId}${source ? `?source=${source}` : ''}`)}
        >
          <BookOpen className="h-5 w-5 mr-2" />
          View Instructional Guide
        </Button>
      </div>
    </div>
  );
}
